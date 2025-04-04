import { IsTaskPlugin, pluginGroups, RunStrategy, TaskInput } from "@certd/pipeline";
import { CertInfo } from "@certd/plugin-cert";
import { AbstractPlusTaskPlugin } from "@certd/plugin-plus";
import { UpyunAccess } from "../access.js";
import { createCertDomainGetterInputDefine, createRemoteSelectInputDefine } from "@certd/plugin-lib";
import { CertApplyPluginNames } from "@certd/plugin-cert";
import { optionsUtils } from "@certd/basic/dist/utils/util.options.js";
import { UpyunClient } from "../client.js";

@IsTaskPlugin({
  //命名规范，插件名称+功能（就是目录plugin-demo中的demo），大写字母开头，驼峰命名
  name: "UpyunDeployToCdn",
  title: "又拍云-部署证书到CDN/USS",
  icon: "svg:icon-upyun",
  desc:"支持又拍云CDN，又拍云云存储USS",
  //插件分组
  group: pluginGroups.cdn.key,
  needPlus: true,
  default: {
    //默认值配置照抄即可
    strategy: {
      runStrategy: RunStrategy.SkipWhenSucceed
    }
  }
})
//类名规范，跟上面插件名称（name）一致
export class UpyunDeployToCdn extends AbstractPlusTaskPlugin {
  //证书选择，此项必须要有
  @TaskInput({
    title: "域名证书",
    helper: "请选择前置任务输出的域名证书",
    component: {
      name: "output-selector",
      from: [...CertApplyPluginNames]
    }
    // required: true, // 必填
  })
  cert!: CertInfo;

  @TaskInput(createCertDomainGetterInputDefine({ props: { required: false } }))
  certDomains!: string[];
  //授权选择框
  @TaskInput({
    title: "Upyun授权",
    component: {
      name: "access-selector",
      type: "upyun" //固定授权类型
    },
    required: true //必填
  })
  accessId!: string;
  //

  @TaskInput(
    createRemoteSelectInputDefine({
      title: "加速域名",
      helper: "选择加速域名，可以手动输入",
      typeName: "UpyunDeployToCdn",
      action: UpyunDeployToCdn.prototype.onGetCdnList.name,
      watches: ["accessId"]
    })
  )
  cdnList!: string[];

  //插件实例化时执行的方法
  async onInstance() {
  }

  //插件执行方法
  async execute(): Promise<void> {
    const access = await this.accessService.getById<UpyunAccess>(this.accessId);

    const upyunClient = new UpyunClient({
      access,
      logger: this.logger,
      http: this.ctx.http
    });
    const cookie = await upyunClient.getLoginToken();
    this.logger.info(`登录成功`);
    const certId = await upyunClient.uploadCert(cookie, this.cert);
    this.logger.info(`上传证书成功：${certId}`);
    for (const item of this.cdnList) {
      this.logger.info(`开始部署证书：${item}`);
      const res = await upyunClient.doRequest({
        cookie: cookie,
        url: "https://console.upyun.com/api/https/migrate/domain",
        method: "POST",
        data: {
          crt_id: certId,
          domain_name: item
        }
      });
      this.logger.info(`部署成功：${JSON.stringify(res)}`);
    }

    this.logger.info("部署成功");
  }


  async onGetCdnList() {
    if (!this.accessId) {
      throw new Error("accessId不能为空");
    }
    const access = await this.accessService.getById<UpyunAccess>(this.accessId);

    const upyunClient = new UpyunClient({
      access,
      logger: this.logger,
      http: this.ctx.http
    });
    const cookie = await upyunClient.getLoginToken();
    const req = {
      cookie,
      url: "https://console.upyun.com/api/account/domains/?limit=15&business_type=file&security_cdn=false&websocket=false&key=&domain=",
      method: "GET",
      data: {}
    };
    const res = await upyunClient.doRequest(req);

    const domains = res.data?.domains;
    if (!domains || domains.length === 0) {
      throw new Error("没有找到加速域名");
    }
    const list = [];
    for (const domain of domains) {
      list.push({
        domain: domain.domain,
        bucket: domain.bucket_name
      });
    }

    const options = list.map((item: any) => {
      return {
        value: item.domain,
        label: `${item.domain}<${item.bucket}>`,
        domain: item.domain
      };
    });
    return optionsUtils.buildGroupOptions(options, this.certDomains);


  }
}

//实例化一下，注册插件
new UpyunDeployToCdn();

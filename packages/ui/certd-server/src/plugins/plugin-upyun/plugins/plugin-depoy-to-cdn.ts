import { IsTaskPlugin, pluginGroups, RunStrategy, TaskInput } from '@certd/pipeline';
import { CertInfo } from '@certd/plugin-cert';
import { AbstractPlusTaskPlugin } from '@certd/plugin-plus';
import { UpyunAccess } from '../access.js';
import {createCertDomainGetterInputDefine, createRemoteSelectInputDefine} from '@certd/plugin-lib';
import { CertApplyPluginNames} from '@certd/plugin-cert';
import {optionsUtils} from "@certd/basic/dist/utils/util.options.js";
@IsTaskPlugin({
  //命名规范，插件名称+功能（就是目录plugin-demo中的demo），大写字母开头，驼峰命名
  name: 'UpyunDeployToCdn',
  title: '又拍云-部署证书到CDN',
  icon: 'svg:icon-upyun',
  //插件分组
  group: pluginGroups.other.key,
  needPlus: true,
  default: {
    //默认值配置照抄即可
    strategy: {
      runStrategy: RunStrategy.SkipWhenSucceed,
    },
  },
})
//类名规范，跟上面插件名称（name）一致
export class UpyunDeployToCdn extends AbstractPlusTaskPlugin {
  //证书选择，此项必须要有
  @TaskInput({
    title: '域名证书',
    helper: '请选择前置任务输出的域名证书',
    component: {
      name: 'output-selector',
      from: [...CertApplyPluginNames],
    },
    // required: true, // 必填
  })
  cert!: CertInfo;

  @TaskInput(createCertDomainGetterInputDefine({ props: { required: false } }))
  certDomains!: string[];
  //授权选择框
  @TaskInput({
    title: 'Upyun授权',
    component: {
      name: 'access-selector',
      type: 'upyun', //固定授权类型
    },
    required: true, //必填
  })
  accessId!: string;
  //

  @TaskInput(
    createRemoteSelectInputDefine({
      title: 'CDN加速域名',
      helper: '选择CDN加速域名，可以手动输入',
      typeName: 'UpyunDeployToCdn',
      action: UpyunDeployToCdn.prototype.onGetCdnList.name,
      watches: ['accessId'],
    })
  )
  cdnList!: string[];

  //插件实例化时执行的方法
  async onInstance() {}

  //插件执行方法
  async execute(): Promise<void> {

    const cookie = await this.getLoginToken();
    this.logger.info(`登录成功`);
    const certId = await this.uploadCert(cookie);
    this.logger.info(`上传证书成功：${certId}`);
    for (const item of this.cdnList) {
      this.logger.info(`开始部署证书：${item}`);
      const res = await this.doRequest({
        cookie:cookie,
        url: 'https://console.upyun.com/api/https/migrate/domain',
        method: 'POST',
        data:{
          crt_id: certId,
          domain_name : item
        }
      })
      this.logger.info(`部署成功：${JSON.stringify(res)}`);
    }

    this.logger.info('部署成功');
  }

  async uploadCert(cookie:string){
    // https://console.upyun.com/api/https/certificate/
    const res = await this.doRequest({
      cookie:cookie,
      url: 'https://console.upyun.com/api/https/certificate/',
      method: 'POST',
      data:{
        certificate: this.cert.crt,
        private_key: this.cert.key
      }
    })

    return res.data.result.certificate_id
  }

  async getLoginToken(){
    const access = await this.accessService.getById<UpyunAccess>(this.accessId)
    const res = await this.http.request({
      url: 'https://console.upyun.com/accounts/signin/',
      method: 'POST',
      data:{
        username: access.username,
        password: access.password
      },
      logRes:false,
      returnResponse:true
    });
    if (res.data?.errors?.length>0) {
      throw new Error(JSON.stringify(res.data.msg));
    }
    const cookie = res.headers['set-cookie'];
    return cookie;
  }

  async doRequest(req:{
    cookie:string,
    url:string,
    method:string,
    data:any
  }){

    const res = await this.http.request({
      url: req.url,
      method: req.method,
      data:req.data,
      headers:{
        Cookie: req.cookie
      }
    })
    if (res.msg.errors.length>0) {
      throw new Error(JSON.stringify(res.msg));
    }
    return res
  }

  async onGetCdnList() {
    if(!this.accessId){
      throw new Error('accessId不能为空');
    }

    const cookie = await this.getLoginToken();
    const req = {
      cookie,
      url: 'https://console.upyun.com/api/v2/buckets/?bucket_name=&with_domains=true&business_type=file&perPage=100&page=1&tag=all&state=all&type=ucdn&security_cdn=false',
      method: 'GET',
      data:{}
    }
    const res = await this.doRequest(req);

    const buckets = res.data?.buckets;
    if(!buckets || buckets.length === 0){
      throw new Error('没有找到CDN加速域名');
    }
    const list= []
    for (const item of buckets) {
      for (const domain of item.domains) {
        list.push({
          domain:domain.domain,
          bucket:item.bucket_name
        });
      }
    }

    const options = list.map((item: any) => {
      return {
        value: item.domain,
        label: `${item.domain}<${item.bucket}>`,
        domain: item.domain,
      };
    });
    return optionsUtils.buildGroupOptions(options, this.certDomains);


  }
}
//实例化一下，注册插件
new UpyunDeployToCdn();

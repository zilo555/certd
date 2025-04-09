import yaml from "js-yaml";
const CertOutputs = [
  "CertApply",
  "CertApplyLego",
  "CertApplyUpload"
];

export function getDefaultAccessPlugin() {
  const metadata = {
    username: {
      title: "用户名",
      required: true,
      encrypt: false
    },
    password: {
      title: "密码",
      required: true,
      encrypt: true
    }
  };

  const script = `const { BaseAccess } = await import("@certd/pipeline")
return class DemoAccess extends BaseAccess {
username;
password;
}
`;
  return {
    metadata:yaml.dump(metadata),
    content: script
  };
}

export function getDefaultDeployPlugin() {
  const metadata = {
    cert: {
      title: "前置任务证书",
      component: {
        name: "output-selector",
        from: [...CertOutputs]
      },
      required: true
    },
    certDomains: {
      title: "当前证书域名",
      component: {
        name: "cert-domains-getter"
      },
      mergeScript: `
        return {
          component:{
              inputKey: ctx.compute(({form})=>{
                return form.cert
              }),
          }
        }
        `,
      required: true
    },
    accessId: {
      title: "Access授权",
      helper: "xxxx的授权",
      component: {
        name: "access-selector",
        type: "aliyun"
      },
      required: true
    },
    key1: {
      title: "输入示例1",
      required: false
    },
    key2: {
      title: "可选项",
      component: {
        name: "a-select",
        vMode: "value",
        options: [
          { value: "1", label: "选项1" },
          { value: "2", label: "选项2" }
        ]
      },
      required: false
    }
  };

  const script = `
const { AbstractTaskPlugin } = await import("@certd/pipeline")
return class DemoTask extends AbstractTaskPlugin {
  cert;
  certDomains;
  accessId;
  key1;
  key2;
  async execute(){
    const access = await this.accessService.getById(this.accessId)

    this.logger.info("cert:",this.cert);
    this.logger.info("certDomains:",this.certDomains);
    this.logger.info("access:",access);
    this.logger.info("key1:",this.key1);
    this.logger.info("key2:",this.key2);
    //开始你的部署任务
    const res = await this.ctx.http.request({url:"xxxxxx"})
    if(res.error){
      //抛出异常，终止任务，否则将被判定为执行成功
      throw new Error("部署失败:"+res.message)
    }
    //必须使用this.logger打印日志
    this.logger.info("执行成功")
  }
}
`
  return {
    metadata: yaml.dump(metadata),
    content: script
  };
}

export function getDefaultDnsPlugin() {
  const metadata = `accessType: aliyun #授权类型名称`

  const script = `
const { AbstractDnsProvider } = await import("@certd/pipeline")
return class DemoDnsProvider extends AbstractDnsProvider {
  // 创建dns解析记录，用于验证域名所有权
  async createRecord(options) {
    /**
     * fullRecord: '_acme-challenge.test.example.com',
     * value: 一串uuid
     * type: 'TXT',
     * domain: 'example.com'
     */
    const { fullRecord, value, type, domain } = options;
    const access = this.ctx.access
    this.logger.info('添加域名解析：', fullRecord, value, type, domain);
    // const record = await sdk.createRecord() // 调用对应的接口创建解析记录

    //返回解析记录，用于后面清理
    return record
  }

  /**
   *  删除dns解析记录,清理申请痕迹
   * @param options
   */
  async removeRecord(options) {
    const { fullRecord, value } = options.recordReq;
    const record = options.recordRes;  // createRecord接口返回的record
    const access = this.ctx.access
    this.logger.info('删除域名解析：', fullRecord, value);
    if (!record) {
      this.logger.info('record为空，不执行删除');
      return;
    }
    const recordId = record.id;
    // 这里调用删除txt dns解析记录接口
    // sdk.removeRecord(recordId)
    this.logger.info("删除域名解析成功");
  }
}

`

  return {
    metadata: metadata,
    content: script
  }
}

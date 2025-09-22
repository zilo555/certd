import { IsTaskPlugin, pluginGroups, RunStrategy, Step, TaskInput, TaskOutput } from "@certd/pipeline";
import type { CertInfo } from "../acme.js";
import { CertReader } from "../cert-reader.js";
import { CertApplyBaseConvertPlugin } from "../base-convert.js";
import dayjs from "dayjs";

export { CertReader };
export type { CertInfo };
@IsTaskPlugin({
  name: "CertApplyUpload",
  icon: "ph:certificate",
  title: "商用证书托管",
  group: pluginGroups.cert.key,
  desc: "手动上传自定义证书后，自动部署（每次证书有更新，都需要手动上传一次）",
  default: {
    strategy: {
      runStrategy: RunStrategy.AlwaysRun,
    },
  },
  shortcut: {
    certUpdate: {
      title: "更新证书",
      icon: "ion:upload",
      action: "onCertUpdate",
      form: {
        columns: {
          crt: {
            title: "证书",
            type: "text",
            form: {
              component: {
                name: "pem-input",
                vModel: "modelValue",
                textarea: {
                  rows: 4,
                  placeholder: "-----BEGIN CERTIFICATE-----\n...\n...\n-----END CERTIFICATE-----",
                },
              },
              rules: [{ required: true, message: "此项必填" }],
              col: { span: 24 },
            },
          },
          key: {
            title: "私钥",
            type: "text",
            form: {
              component: {
                name: "pem-input",
                vModel: "modelValue",
                textarea: {
                  rows: 4,
                  placeholder: "-----BEGIN PRIVATE KEY-----\n...\n...\n-----END PRIVATE KEY----- ",
                },
              },
              rules: [{ required: true, message: "此项必填" }],
              col: { span: 24 },
            },
          },
        },
      },
    },
  },
})
export class CertApplyUploadPlugin extends CertApplyBaseConvertPlugin {
  @TaskInput({
    title: "手动上传证书",
    component: {
      name: "cert-info-updater",
      vModel: "modelValue",
    },
    helper: "手动上传证书",
    order: -9999,
    required: true,
    mergeScript: `
    return {
      component:{
        on:{
          updated(scope){
            scope.form.input.domains = scope.$event?.domains
          }
        }
      }
    }
    `,
  })
  uploadCert!: CertInfo;

  @TaskOutput({
    title: "证书MD5",
    type: "certMd5",
  })
  certMd5?: string;

  async onInstance() {
    this.accessService = this.ctx.accessService;
    this.logger = this.ctx.logger;
    this.userContext = this.ctx.userContext;
    this.lastStatus = this.ctx.lastStatus as Step;
  }
  async onInit(): Promise<void> {}

  async getCertFromStore() {
    let certReader = null;
    try {
      this.logger.info("读取上次证书");
      certReader = await this.readLastCert();
    } catch (e) {
      this.logger.warn("读取cert失败：", e);
    }
    if (certReader == null) {
      certReader = new CertReader(this.uploadCert);
    }
    if (!certReader.expires || certReader.expires < new Date().getTime()) {
      throw new Error("证书已过期，停止部署，请重新上传证书");
    }

    return certReader;
  }

  async execute(): Promise<string | void> {
    let certReader = await this.getCertFromStore();
    const crtMd5 = this.ctx.utils.hash.md5(certReader.cert.crt);

    const leftDays = dayjs(certReader.expires).diff(dayjs(), "day");
    this.logger.info(`证书过期时间${dayjs(certReader.expires).format("YYYY-MM-DD HH:mm:ss")},剩余${leftDays}天`);

    if (!this.ctx.inputChanged) {
      this.logger.info("输入参数无变化");
      const lastCrtMd5 = this.lastStatus?.status?.output?.certMd5;
      this.logger.info("证书MD5", crtMd5);
      this.logger.info("上次证书MD5", lastCrtMd5);
      if (lastCrtMd5 === crtMd5) {
        this.logger.info("证书无变化，跳过");
        //输出证书MD5
        this.certMd5 = crtMd5;
        await this.output(certReader, false);
        return "skip";
      }
      this.logger.info("证书有变化，重新部署");
    } else {
      this.logger.info("输入参数有变化，重新部署");
    }

    certReader = new CertReader(this.uploadCert);
    this.clearLastStatus();
    //输出证书MD5
    this.certMd5 = this.ctx.utils.hash.md5(certReader.cert.crt);
    const newLeftDays = dayjs(certReader.expires).diff(dayjs(), "day");
    this.logger.info(`新证书过期时间${dayjs(certReader.expires).format("YYYY-MM-DD HH:mm:ss")},剩余${newLeftDays}天`);

    await this.output(certReader, true);

    //必须output之后执行
    await this.emitCertApplySuccess();
    return;
  }

  async onCertUpdate(data: any) {
    const certReader = new CertReader(data);
    return {
      input: {
        uploadCert: {
          crt: data.crt,
          key: data.key,
        },
        domains: certReader.getAllDomains(),
      },
    };
  }
}

new CertApplyUploadPlugin();

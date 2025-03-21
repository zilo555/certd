import { IsTaskPlugin, pluginGroups, RunStrategy, Step, TaskInput, TaskOutput } from "@certd/pipeline";
import type { CertInfo } from "../acme.js";
import { CertReader } from "../cert-reader.js";
import { CertApplyBaseConvertPlugin } from "../base-convert.js";
export * from "./d.js";
import dayjs from "dayjs";
import { ICertApplyUploadService } from "./d";
export { CertReader };
export type { CertInfo };
@IsTaskPlugin({
  name: "CertApplyUpload",
  icon: "ph:certificate",
  title: "证书手动上传",
  group: pluginGroups.cert.key,
  desc: "在证书仓库手动上传后触发部署证书",
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
  certInfoId!: string;

  @TaskOutput({
    title: "证书MD5",
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
    const certApplyUploadService: ICertApplyUploadService = await this.ctx.serviceGetter.get("CertApplyUploadService");

    const certInfo = await certApplyUploadService.getCertInfo({
      certId: Number(this.certInfoId),
      userId: this.pipeline.userId,
    });

    const certReader = new CertReader(certInfo);
    if (!certReader.expires && certReader.expires < new Date().getTime()) {
      throw new Error("证书已过期，停止部署，请重新上传证书");
    }

    return certReader;
  }

  async execute(): Promise<string | void> {
    const certReader = await this.getCertFromStore();
    const crtMd5 = this.ctx.utils.hash.md5(certReader.cert.crt);

    const leftDays = dayjs(certReader.expires).diff(dayjs(), "day");
    this.logger.info(`证书过期时间${dayjs(certReader.expires).format("YYYY-MM-DD HH:mm:ss")},剩余${leftDays}天`);
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
    this.clearLastStatus();
    //输出证书MD5
    this.certMd5 = crtMd5;
    await this.output(certReader, true);
    return;
  }

  async onCertUpdate(data: any) {
    const certApplyUploadService = await this.ctx.serviceGetter.get("CertApplyUploadService");

    const res = await certApplyUploadService.updateCert({
      certId: this.certInfoId,
      userId: this.ctx.user.id,
      cert: {
        crt: data.crt,
        key: data.key,
      },
    });

    return {
      input: {
        domains: res.domains,
      },
    };
  }
}

new CertApplyUploadPlugin();

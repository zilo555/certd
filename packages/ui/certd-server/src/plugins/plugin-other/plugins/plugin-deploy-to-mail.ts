import {AbstractTaskPlugin, FileItem, IsTaskPlugin, pluginGroups, RunStrategy, TaskInput} from '@certd/pipeline';
import {CertInfo, CertReader} from "@certd/plugin-cert";
import dayjs from "dayjs";

@IsTaskPlugin({
  name: 'DeployCertToMailPlugin',
  title: '邮件发送证书',
  icon: 'ri:rest-time-line',
  desc: '通过邮件发送证书',
  group: pluginGroups.other.key,
  showRunStrategy:false,
  default: {
    strategy: {
      runStrategy: RunStrategy.SkipWhenSucceed,
    },
  },
})
export class DeployCertToMailPlugin extends AbstractTaskPlugin {

  @TaskInput({
    title: '域名证书',
    helper: '请选择前置任务输出的域名证书',
    component: {
      name: 'output-selector',
      from: [":cert:"],
    },
    required: true,
  })
  cert!: CertInfo;

  @TaskInput({
    title: '证书压缩文件',
    helper: '请选择前置任务输出的域名证书压缩文件',
    component: {
      name: 'output-selector',
      from: [":certZip:"],
    },
    required: true,
  })
  certZip!: FileItem;

  @TaskInput({
    title: '接收邮箱',
    component: {
      name: 'EmailSelector',
      vModel: 'value',
      mode:"tags",
    },
    required: true,
  })
  email!: string[];

  @TaskInput({
    title: '备注',
    component: {
      name: 'a-input',
      vModel: 'value',
    },
    required: false,
  })
  remark!: string;

  async onInstance() {}
  async execute(): Promise<void> {

    this.logger.info(`开始发送邮件`);
    const certReader = new CertReader(this.cert)
    const mainDomain = certReader.getMainDomain();
    const domains = certReader.getAllDomains().join(',');
    const title = `证书申请成功【${mainDomain}】`;
    const html = `
        <div>
          <p>证书申请成功</p>
          <p>域名：${domains}</p>
          <p>证书有效期：${dayjs(certReader.expires).format("YYYY-MM-DD HH:mm:ss")}</p>
          <p>备注：${this.remark||""}</p>
        </div>
      `;
    const file = this.certZip
    if (!file) {
      throw new Error('证书压缩文件还未生成，重新运行证书任务');
    }
    await this.ctx.emailService.send({
      subject:title,
      html: html,
      receivers: this.email,
      attachments: [
        {
          filename: file.filename,
          path: file.path,
        },
      ],
    })


  }
}
new DeployCertToMailPlugin();

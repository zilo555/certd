import { AbstractTaskPlugin, IsTaskPlugin, pluginGroups, RunStrategy, TaskInput, TaskOutput } from "@certd/pipeline";
import { GithubAccess } from "../access.js";

@IsTaskPlugin({
  //命名规范，插件类型+功能（就是目录plugin-demo中的demo），大写字母开头，驼峰命名
  name: "GithubCheckRelease",
  title: "Github-检查Release版本",
  desc:"检查最新Release版本并推送消息",
  icon: "ion:logo-github",
  //插件分组
  group: pluginGroups.other.key,
  needPlus: false,
  default: {
    //默认值配置照抄即可
    strategy: {
      runStrategy: RunStrategy.AlwaysRun
    }
  }
})
//类名规范，跟上面插件名称（name）一致
export class GithubCheckRelease extends AbstractTaskPlugin {
  //授权选择框
  @TaskInput({
    title: "Github授权",
    component: {
      name: "access-selector",
      type: "github" //固定授权类型
    },
    required: true //必填
  })
  accessId!: string;


  @TaskInput({
    title: "仓库名称",
    helper:"owner/name，比如 certd/certd",
    required:true,
  })
  repoName!: string;

  @TaskInput({
    title: "通知渠道",
    component:{
        name:"notification-selector",
        select:{
          mode:"tags"
        }
    },
    required:true,
  })
  notificationIds!: number[];

  @TaskOutput({
    title: "最后版本",
  })
  lastVersion?: string;


  //插件实例化时执行的方法
  async onInstance() {
  }

  //插件执行方法
  async execute(): Promise<void> {
    const access = await this.getAccess<GithubAccess>(this.accessId);

    const res = await access.getRelease({repoName:this.repoName})

    const lastVersion = this.ctx.lastStatus?.status?.output?.lastVersion;

    if(res.tag_name == null || res.tag_name ==lastVersion){
      this.logger.info(`暂无更新，${res.tag_name}`);
      return
    }
    //有更新
    this.logger.info(`有更新,${lastVersion}->${res.tag_name}`)
    this.lastVersion = res.tag_name;

    //发送通知
    for (const notificationId of this.notificationIds) {
      await this.ctx.notificationService.send({
        id: notificationId,
        useDefault: false,
        useEmail:false,
        logger: this.logger,
        body: {
          title: `${this.repoName} 新版本 ${this.lastVersion} 发布`,
          content: `${res.body}\n\n >Certd：不止证书自动化，插件解锁无限可能！`,
          url: `https://github.com/${this.repoName}/releases/tag/${this.lastVersion}`,
        }
      })
    }


  }

}

new GithubCheckRelease();

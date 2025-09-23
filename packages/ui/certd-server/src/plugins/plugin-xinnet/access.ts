import { IsAccess, AccessInput, BaseAccess } from "@certd/pipeline";
import { XinnetClient } from "@certd/plugin-plus";

/**
 * 这个注解将注册一个授权配置
 * 在certd的后台管理系统中，用户可以选择添加此类型的授权
 */
@IsAccess({
  name: "xinnet",
  title: "新网授权",
  icon: "arcticons:dns-changer-3",
  desc: ""
})
export class XinnetAccess extends BaseAccess {

  /**
   * 授权属性配置
   */
  @AccessInput({
    title: "用户名",
    component: {
      placeholder: "手机号"
    },
    required: true,
    encrypt: true
  })
  username = "";

  @AccessInput({
    title: "域名登录密码",
    component: {
      name: "a-input-password",
      vModel: "value",
      placeholder: "域名密码"
    },
    helper: "您可以在此处[重置域名管理密码](https://domain.xinnet.com/#domain/manage/domain_manage_pwd)",
    required: true,
    encrypt: true
  })
  password = "";

  @AccessInput({
    title: "测试",
    component: {
      name: "api-test",
      action: "TestRequest"
    },
    helper: "点击测试接口是否正常"
  })
  testRequest = true;

  async onTestRequest() {

    const client = new XinnetClient({
      access: this,
      logger: this.ctx.logger,
      http: this.ctx.http
    });

    await client.getDomainList({ pageNo: 1, pageSize: 1 });

    return "ok";
  }

}

new XinnetAccess();

// import { IsAccess, AccessInput, BaseAccess } from "@certd/pipeline";
// import { XinnetClient } from "@certd/plugin-plus";

// /**
//  * 这个注解将注册一个授权配置
//  * 在certd的后台管理系统中，用户可以选择添加此类型的授权
//  */
// @IsAccess({
//   name: "xinnetagent",
//   title: "新网授权（代理方式）",
//   icon: "lsicon:badge-new-filled",
//   desc: ""
// })
// export class XinnetAccess extends BaseAccess {

//   /**
//    * 授权属性配置
//    */
//   @AccessInput({
//     title: "代理账号",
//     component: {
//       placeholder: "代理账号，如：agent0001"
//     },
//     required: true,
//     encrypt: false
//   })
//   username = "";

//   @AccessInput({
//     title: "API密钥",
//     component: {
//       name: "a-input-password",
//       vModel: "value",
//       placeholder: "API密钥"
//     },
//     required: true,
//     encrypt: true
//   })
//   apikey = "";

//   @AccessInput({
//     title: "测试",
//     component: {
//       name: "api-test",
//       action: "TestRequest"
//     },
//     helper: "点击测试接口是否正常"
//   })
//   testRequest = true;

//   async onTestRequest() {

//     // const client = new XinnetClient({
//     //   access: this,
//     //   logger: this.ctx.logger,
//     //   http: this.ctx.http
//     // });

//     await client.getDomainList({ pageNo: 1, pageSize: 1 });

//     return "ok";
//   }


//   getCacheKey () {
//     let hashStr = ""
//     for (const key in this) {
//       if (Object.prototype.hasOwnProperty.call(this, key)) {
//         const element = this[key];
//         hashStr += element;
//       }
//     }
//     const hashCode = this.ctx.utils.hash.sha256(hashStr);
//     return `xinnet-${hashCode}`;
//   }

// }

// new XinnetAccess();

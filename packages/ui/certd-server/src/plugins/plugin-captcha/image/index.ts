import { AddonInput, BaseAddon, IsAddon } from "@certd/lib-server";
import crypto from 'crypto';
import { ICaptchaAddon } from "../api.js";
@IsAddon({
  addonType:"captcha",
  name: 'image',
  title: '图片验证码',
  desc: '',
})
export class ImageCaptcha extends BaseAddon implements ICaptchaAddon{




  async onValidate(data?:any) {


  }

  // 生成签名
// Generate signature
   hmac_sha256_encode(value, key){
    var hash = crypto.createHmac("sha256", key)
      .update(value, 'utf8')
      .digest('hex');
    return hash;
  }


// 发送post请求, 响应json数据如：{"result": "success", "reason": "", "captcha_args": {}}
// Send a post request and respond to JSON data, such as: {result ":" success "," reason ":" "," captcha_args ": {}}
  async  doRequest(datas, url){
    var options = {
      url: url,
      method: "POST",
      params: datas,
      timeout: 5000
    };
    const result = await this.ctx.http.request(options);
    return result;
  }

 async  getClientParams(): Promise<any> {
    return {
      captchaId: this.captchaId,
    }
  }


}

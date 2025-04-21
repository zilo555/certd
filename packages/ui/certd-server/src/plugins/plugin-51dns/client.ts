import { createAxiosService, HttpClient, ILogger } from "@certd/basic";
import { Dns51Access } from "./access.js";

export class Dns51Client {
  logger: ILogger;
  access: Dns51Access;
  http: HttpClient;
  cryptoJs: any;
  isLogined = false;
  _token = "";

  constructor(options: {
    logger: ILogger;
    access: Dns51Access;
  }) {
    this.logger = options.logger;
    this.access = options.access;

    this.http = createAxiosService({
      logger: this.logger
    });

  }


  aes(val: string) {
    if (!this.cryptoJs) {
      throw new Error("crypto-js not init");
    }
    const CryptoJS = this.cryptoJs;
    var k = CryptoJS.enc.Utf8.parse("1234567890abcDEF");
    var iv = CryptoJS.enc.Utf8.parse("1234567890abcDEF");
    return CryptoJS.AES.encrypt(val, k, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding
    }).toString();
  }


  async init() {
    if (this.cryptoJs) {
      return;
    }
    const CryptoJSModule = await import("crypto-js");
    this.cryptoJs = CryptoJSModule.default;

  }

  async login() {
    if (this.isLogined) {
      return;
    }
    await this.init();
    const res = await this.http.request({
      url: "https://www.51dns.com/login.html",
      method: "get",
      withCredentials: true,
      logRes:false,
      returnResponse:true
    });

    //提取 var csrfToken = "ieOfM21eDd9nWJv3OZtMJF6ogDsnPKQHJ17dlMck";
    const _token = res.data.match(/var csrfToken = "(.*?)"/)[1];
    this.logger.info("_token:", _token);
    this._token = _token;
    var obj = {
      "email_or_phone": this.aes("18603046467"),
      "password": this.aes("JiDian1Zu"),
      "type": this.aes("account"),
      "redirectTo": "https://www.51dns.com/domain",
      "_token": _token
    };
    const res2 = await this.http.request({
      url: "https://www.51dns.com/login",
      method: "post",
      data: {
        ...obj
      },
      withCredentials: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      logRes:false,
      returnResponse:true,
    });


    // 提取 <span class="user_email">182****43522</span><br>
    // console.log(res2.headers)
    // console.log(res2.data)
    const username = res2.data.match(/<span class="user_email">(.*?)<\/span>/)[1];

    this.logger.info("登录成功：username:", username);
    this.isLogined = true;
  }

  async getDomainId(domain: string) {
    await this.login();

    const res = await this.http.request({
      url: `https://www.51dns.com/domain?domain=${domain}&status=`,
      method: "get",
      withCredentials: true,
      logRes:false,
      returnResponse:true
    });

    // 提取 <a target="_blank" href="https://www.51dns.com/domain/record/193341603"
    //                                        class="color47">certd.top</a>
    const regex = new RegExp(`<a target="_blank" href="https://www.51dns.com/domain/record/(.*?)".*${domain}<\/a>`, "g");
    const matched = res.data.match(regex);
    if (!matched || matched.length === 0) {
      throw new Error(`域名${domain}不存在`);
    }
    return matched[1];

  }

  async createRecord(param: { domain: string, data: any; domainId: void; host: string; ttl: number; type: string }) {
    const { domain, data, host,  type } = param;
    const domainId = await this.getDomainId(domain);
    const url = "https://www.51dns.com/domain/storenNewRecord";
    const req = {
      _token: this._token,
      domain_id: parseInt(domainId),
      record: host,
      type: type,
      value: data,
      ttl: 300,
      view_id: 0
    };
    const res = await this.http.request({
      url,
      method: "post",
      data: req,
      withCredentials: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    /*
    {
    "status": 200,
    "msg": "\u6b63\u786e",
    "data": {
        "record": "1111",
        "type": "TXT",
        "value": "2222",
        "mx": "-",
        "ttl": "300",
        "view_id": "0",
        "id": 601019779,
        "domain_id": "193341603",
        "trecord": "1111",
        "view_name": "\u9ed8\u8ba4"
    }
}
     */
    if(res.status !== 200){
      throw new Error(`创建域名解析失败：${res.msg}`);
    }
    const id = res.data.id;
    return {
      id,
      domainId
    };

  }

  async deleteRecord(param: { domainId: number; id: number }) {
      const url ="https://www.51dns.com/domain/operateRecord"
      /*
      type: delete
ids[0]: 601019779
domain_id: 193341603
_token: ieOfM21eDd9nWJv3OZtMJF6ogDsnPKQHJ17dlMck
       */
    const body = {
      type: "delete",
      ids: [param.id],
      domain_id: param.domainId,
      _token: this._token
    }
    const res = await this.http.request({
      url,
      method: "post",
      data: body,
      withCredentials: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    if(res.status !== 200){
      throw new Error(`删除域名解析失败：${res.msg}`);
    }

  }
}

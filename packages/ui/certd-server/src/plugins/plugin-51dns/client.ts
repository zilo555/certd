import {createAxiosService, HttpClient, ILogger} from "@certd/basic";
import {Dns51Access} from "./access.js";

export class Dns51Client {
  logger: ILogger;
  access: Dns51Access;
  http: HttpClient;
  cryptoJs: any;
  isLogined = false;
  _token = "";
  _cookie = "";

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
      logRes: false,
      returnResponse: true,
      headers: {
        // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36',
        'Origin': 'https://www.51dns.com',
        'Referer': 'https://www.51dns.com',
      },
    });
    let setCookie = res.headers['set-cookie']
    let cookie = setCookie.map((item: any) => {
      return item.split(';')[0]
    }).join(';')


    //提取 var csrfToken = "ieOfM21eDd9nWJv3OZtMJF6ogDsnPKQHJ17dlMck";
    const _token = res.data.match(/var csrfToken = "(.*?)"/)[1];
    this.logger.info("_token:", _token);
    this._token = _token;
    var obj = {
      "email_or_phone": this.aes(this.access.username),
      "password": this.aes(this.access.password),
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
      logRes: false,
      returnResponse: true,
      headers: {
        'Origin': 'https://www.51dns.com',
        'Referer': 'https://www.51dns.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    this.logger.info("return headers:", JSON.stringify(res2.headers))
    if (res2.data.code == 0) {
      setCookie = res2.headers['set-cookie']
      this._cookie = setCookie.map((item: any) => {
        return item.split(';')[0]
      }).join(';')
      this.logger.info("cookie:", this._cookie)
      this.logger.info("登录成功")
    } else {
      throw new Error("登录失败:", res2.data)
    }


    const res3 = await this.http.request({
      url: 'https://www.51dns.com/domain',
      method: 'get',
      withCredentials: true,
      logRes: false,
      returnResponse: true,
      headers: {
        // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36',
        'Origin': 'https://www.51dns.com',
        'Referer': 'https://www.51dns.com/login.html',
        'Cookie': this._cookie,
      }
    })

    const success2 = res3.data.includes('<span class="nav-title">DNS解析</span>')

    if (!success2) {
      throw new Error("检查登录失败")
    }
    this.logger.info("检查登录成功")

    this.isLogined = true;
  }

  async getDomainId(domain: string) {
    await this.login();

    const res = await this.http.request({
      url: `https://www.51dns.com/domain?domain=${domain}&status=`,
      method: "get",
      withCredentials: true,
      logRes: false,
      returnResponse: true,
      headers: this.getRequestHeaders()
    });

    // 提取 <a target="_blank" href="https://www.51dns.com/domain/record/193341603"
    //                                        class="color47">certd.top</a>
    const regExp = new RegExp(`<a target="_blank" href="https://www.51dns.com/domain/record/(\\d+)"[^>]*>${domain}<\\/a>`, "i");
    const matched = res.data.match(regExp);
    if (!matched || matched.length < 1) {
      throw new Error(`域名${domain}不存在`);
    }
    const domainId = matched[1];
    this.logger.info(`域名${domain}的id为${domainId}`)
    return parseInt(domainId);
  }

  private getRequestHeaders() {
    return {
      'Origin': 'https://www.51dns.com',
      'Referer': 'https://www.51dns.com',
      'Cookie': this._cookie
    };
  }

  async createRecord(param: { domain: string, data: any; domainId: number; host: string; ttl: number; type: string }) {
    const {domain, data, host, type} = param;
    const domainId = await this.getDomainId(domain);
    const url = "https://www.51dns.com/domain/storenNewRecord";
    const req = {
      _token: this._token,
      domain_id: domainId,
      record: host,
      type: type,
      value: data,
      ttl: 300,
      mx:"",
      view_id: 0
    };
    this.logger.info("req:", JSON.stringify(req))
    const res = await this.http.request({
      url,
      method: "post",
      data: req,
      withCredentials: true,
      headers: {
        ...this.getRequestHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (res.status !== 200) {
      throw new Error(`创建域名解析失败：${res.msg}`);
    }
    const id = res.data.id;
    return {
      id,
      domainId
    };

  }

  async deleteRecord(param: { domainId: number; id: number }) {
    const url = "https://www.51dns.com/domain/operateRecord"
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
        ...this.getRequestHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if (res.status !== 200) {
      throw new Error(`删除域名解析失败：${res.msg}`);
    }

  }
}

import { VolcengineAccess } from "./access.js";
import { http, HttpClient, ILogger } from "@certd/basic";
import querystring from "querystring";

export type VolcengineOpts = {
  access: VolcengineAccess
  logger: ILogger
  http: HttpClient
}

export type VolcengineReq = {
  method?: string;
  path?: string;
  headers?: any;
  body?: any;
  query?: any;
  service?: string, // 替换为实际服务名称
  region?: string,   // 替换为实际区域名称
}

export class VolcengineClient {
  opts: VolcengineOpts;

  constructor(opts: VolcengineOpts) {
    this.opts = opts;
  }

  // // 生成签名函数
  // async createSignedRequest(req: VolcengineReq) {
  //   if (!req.body) {
  //     req.body = {};
  //   }
  //   const bodyStr = JSON.stringify(req.body);
  //   const { method, path, body, query } = req;
  //   const crypto = await import("crypto");
  //   const config = {
  //     accessKeyId: this.opts.access.accessKeyId,
  //     secretKey: this.opts.access.secretAccessKey,
  //     service: req.service || "dns", // 默认服务名称为 dns
  //     region: req.region || "cn-beijing", // 默认区域名称为 cn-beijing
  //     endpoint: "https://open.volcengineapi.com"
  //   };
  //
  //   // 1. 生成时间戳
  //   const now = new Date();
  //   // 20201103T104027Z
  //   const timestamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  //
  //   // 2. 处理查询参数
  //   const sortedQuery = Object.keys(query || {})
  //     .sort()
  //     .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
  //     .join("&");
  //
  //   // 3. 构造规范请求
  //   const canonicalRequest = [
  //     method.toUpperCase(),
  //     path || "/",
  //     sortedQuery,
  //     `content-type:application/json\nhost:${new URL(config.endpoint).host}`,
  //     "content-type;host",
  //     crypto.createHash("sha256").update(bodyStr).digest("hex")
  //   ].join("\n");
  //
  //   // 4. 生成签名字符串
  //   const date = now.toISOString().substring(0, 10).replace(/-/g, "");
  //   const credentialScope = `${date}/${config.region}/${config.service}/request`;
  //
  //   const stringToSign = [
  //     "HMAC-SHA256",
  //     timestamp,
  //     credentialScope,
  //     crypto.createHash("sha256").update(canonicalRequest).digest("hex")
  //   ].join("\n");
  //
  //   // 5. 计算签名
  //   const sign = (key: Buffer, msg: string) => crypto.createHmac("sha256", key).update(msg).digest();
  //
  //   const kDate = sign(Buffer.from(`HMAC${config.secretKey}`, "utf8"), date);
  //   const kRegion = sign(kDate, config.region);
  //   const kService = sign(kRegion, config.service);
  //   const kSigning = sign(kService, "request");
  //   const signature = crypto.createHmac("sha256", kSigning)
  //     .update(stringToSign)
  //     .digest("hex");
  //
  //   // 6. 构造请求头
  //   const headers = {
  //     "Content-Type": "application/json",
  //     Host: new URL(config.endpoint).host,
  //     "X-Date": timestamp,
  //     Authorization: `HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=content-type;host, Signature=${signature}`
  //   };
  //
  //   return {
  //     method,
  //     url: `${config.endpoint}${path || ""}${sortedQuery ? `?${sortedQuery}` : ""}`,
  //     headers,
  //     data: body
  //   };
  // }
  //
  // async doRequest(req: VolcengineReq) {
  //   const requestConfig = await this.createSignedRequest(req);
  //   try {
  //     const res = await this.opts.http.request(requestConfig);
  //     if (res?.ResponseMetadata?.Error) {
  //       throw new Error(JSON.stringify(res.ResponseMetadata.Error));
  //     }
  //     return res;
  //   } catch (e) {
  //     if (e?.response?.ResponseMetadata.Error) {
  //       throw new Error(JSON.stringify(e.response.ResponseMetadata.Error));
  //     }
  //     throw e;
  //   }
  // }


  async doRequest(req: VolcengineReq) {
    const {Signer} =await import('@volcengine/openapi') ;

// http request data
    const openApiRequestData: any = {
      region: req.region,
      method: req.method,
      // [optional] http request url query
      params: {
        ...req.query,
      },
      // http request headers
      headers: {
        "Content-Type": "application/json",
      },
      // [optional] http request body
      body: req.body,
    }

    const signer = new Signer(openApiRequestData, req.service);

// sign
    signer.addAuthorization({accessKeyId:this.opts.access.accessKeyId, secretKey:this.opts.access.secretAccessKey});

// Print signed headers
    console.log(openApiRequestData.headers);


    const url = `https://open.volcengineapi.com/?${querystring.stringify(req.query)}`
    const res = await http.request({
      url: url,
      method: req.method,
      headers: openApiRequestData.headers,
      data:req.body
    });

    if (res?.ResponseMetadata?.Error) {
      throw new Error(JSON.stringify(res.ResponseMetadata.Error));
    }
    return res
  }


  // 列出域名解析记录
  async findDomain(domain: string) {
    const req: VolcengineReq = {
      method: "POST",
      region: "cn-beijing",
      service: "dns",
      query: {
        Action: "ListZones",
        Version: "2018-08-01",
      },
      body:{
        Key: domain,
        SearchMode: "exact"
      }
    };

    return this.doRequest(req);
  }
}


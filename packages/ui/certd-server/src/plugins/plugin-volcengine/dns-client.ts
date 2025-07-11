import {http} from "@certd/basic";
import querystring from "querystring";
import {VolcengineOpts} from "./ve-client.js";


export type VolcengineReq = {
  method?: string;
  path?: string;
  headers?: any;
  body?: any;
  query?: any;
  service?: string, // 替换为实际服务名称
  region?: string,   // 替换为实际区域名称
}

export class VolcengineDnsClient {
  opts: VolcengineOpts;

  constructor(opts: VolcengineOpts) {
    this.opts = opts;
  }


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

    try{
      const res = await http.request({
        url: url,
        method: req.method,
        headers: openApiRequestData.headers,
        data:req.body
      });
      if (res?.ResponseMetadata?.Error) {
        const err = new Error(JSON.stringify(res.ResponseMetadata.Error));
        // @ts-ignore
        err.detail = res.ResponseMetadata.Error;
        throw err
      }
      return res
    }catch (e) {
      if(e.response){
        const err = new Error(JSON.stringify(e.response.data.ResponseMetadata.Error));
        // @ts-ignore
        err.detail = e.response.data.ResponseMetadata.Error;
        throw err
      }
    }



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


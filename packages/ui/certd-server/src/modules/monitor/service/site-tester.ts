import { logger, safePromise, utils } from "@certd/basic";
import { merge } from "lodash-es";
import https from "https";
import { PeerCertificate } from "tls";
// import { TCPClient } from "dns2";

export type SiteTestReq = {
  host: string; // 只用域名部分
  port?: number;
  method?: string;
  retryTimes?: number;
  ipAddress?: string;

  dnsServer?: string[];
};

export type SiteTestRes = {
  certificate?: PeerCertificate;
};

export class SiteTester {
  async test(req: SiteTestReq): Promise<SiteTestRes> {
    logger.info("测试站点:", JSON.stringify(req));
    const maxRetryTimes = req.retryTimes == null ? 3 : req.retryTimes;
    let tryCount = 0;
    let result: SiteTestRes = {};
    while (true) {
      try {
        result = await this.doTestOnce(req);
        return result;
      } catch (e) {
        tryCount++;
        if (tryCount > maxRetryTimes) {
          logger.error(`测试站点出错，已超过最大重试次数（${maxRetryTimes}）`, e.message);
          throw e;
        }
        //指数退避
        const time = 2 ** tryCount;
        logger.error(`测试站点出错，${time}s后重试(${tryCount}/${maxRetryTimes})`, e);
        await utils.sleep(time * 1000);
      }
    }
  }

  async doTestOnce(req: SiteTestReq): Promise<SiteTestRes> {
    const options: any = merge(
      {
        port: 443,
        method: "GET",
        rejectUnauthorized: false
      },
      req
    );

    if (req.ipAddress) {
      //使用固定的ip
      const ipAddress = req.ipAddress;
      options.headers = {
        host: options.host,
        //sni
        servername: options.host
      };
      options.host = ipAddress;
    }

    // let dnsClients = [];
    // if (req.dnsServer && req.dnsServer.length > 0) {
    //   for (let dns of req.dnsServer) {
    //     const dnsClient = TCPClient({ dns });
    //     dnsClients.push(dnsClient);
    //   }
    // }

    // async function customLookup(hostname, options, callback) {
    //   for (let client of dnsClients) {
    //     try {
    //       const result = await client.resolve(hostname, options);
    //       return callback(null, result);
    //     } catch (e) {
    //       this.logger.error(e);
    //     }
    //   }
    //   try {
    //     // 使用自定义DNS解析
    //     const response = await dnsClients
    //     const address = response.answers[0].address;
    //     callback(null, address, 4);
    //   } catch (err) {
    //     // 解析失败时回退到系统DNS
    //     require('dns').lookup(hostname, options, callback);
    //   }
    // }

    options.agent = new https.Agent({ keepAlive: false });

    // 创建 HTTPS 请求
    const requestPromise = safePromise((resolve, reject) => {
      const req = https.request(options, res => {
        // 获取证书
        // @ts-ignore
        const certificate = res.socket.getPeerCertificate();
        // logger.info('证书信息', certificate);
        if (certificate.subject == null) {
          logger.warn("证书信息为空");
          resolve({
            certificate: null
          });
        }
        resolve({
          certificate
        });
        res.socket.end();
        // 关闭响应
        res.destroy();
      });

      req.on("error", e => {
        reject(e);
      });
      req.end();
    });

    return await requestPromise;
  }
}

export const siteTester = new SiteTester();

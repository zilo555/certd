import { AbstractDnsProvider, CreateRecordOptions, IsDnsProvider, RemoveRecordOptions } from "@certd/plugin-cert";
import { XinnetAccess } from "./access.js";
import { XinnetClient } from "@certd/plugin-plus";

export type XinnetRecord = {
  id: number;
  domainId: number,
};

// 这里通过IsDnsProvider注册一个dnsProvider
@IsDnsProvider({
  name: 'xinnet',
  title: '新网',
  desc: '新网域名解析',
  icon: 'arcticons:dns-changer-3',
  // 这里是对应的 cloudflare的access类型名称
  accessType: 'xinnet',
  order:7,
})
export class XinnetProvider extends AbstractDnsProvider<XinnetRecord> {
  access!: XinnetAccess;

  client!:XinnetClient;
  async onInstance() {
    //一些初始化的操作
    // 也可以通过ctx成员变量传递context
    this.access = this.ctx.access as XinnetAccess;
  }

  /**
   * 创建dns解析记录，用于验证域名所有权
   */
  async createRecord(options: CreateRecordOptions): Promise<XinnetRecord> {
    /**
     * fullRecord: '_acme-challenge.test.example.com',
     * value: 一串uuid
     * type: 'TXT',
     * domain: 'example.com'
     */
    // const { fullRecord,hostRecord, value, type, domain } = options;
    // this.logger.info('添加域名解析：', fullRecord, value, type, domain);

    // const client = new XinnetClient({
    //   logger: this.logger,
    //   access: {
    //     domain: "",
    //     password: this.access.password
    //   },
    //   http: this.http
    // });



    // const domainId = await this.client.getDomainId(domain);
    // this.logger.info('获取domainId成功:', domainId);
    //
    // const res = await this.client.createRecord({
    //   domain: domain,
    //   domainId: domainId,
    //   type: 'TXT',
    //   host: hostRecord,
    //   data: value,
    //   ttl: 300,
    // })
    // return {
    //   id: res.id,
    //   domainId: domainId,
    // };

    return 1 as any
  }


  /**
   *  删除dns解析记录,清理申请痕迹
   * @param options
   */
  async removeRecord(options: RemoveRecordOptions<XinnetRecord>): Promise<void> {
    //   const { fullRecord, value } = options.recordReq;
    //   const record = options.recordRes;
    //   this.logger.info('删除域名解析：', fullRecord, value);
    //   if (!record) {
    //     this.logger.info('record为空，不执行删除');
    //     return;
    //   }
    //   //这里调用删除txt dns解析记录接口
    //   /**
    //    * 请求示例
    //    * DELETE /api/record?id=85371689655342080 HTTP/1.1
    //    * Authorization: Basic {token}
    //    * 请求参数
    //    */
    //   const {id,domainId} = record
    //   await this.client.deleteRecord({
    //     id,
    //     domainId
    //   })
    //   this.logger.info(`删除域名解析成功:fullRecord=${fullRecord},id=${id}`);
    // }
  }
}

//实例化这个provider，将其自动注册到系统中
new XinnetProvider();

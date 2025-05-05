import { HttpClient, ILogger, utils } from "@certd/basic";
import { IAccess, Registrable } from "@certd/pipeline";

export type DnsProviderDefine = Registrable & {
  accessType: string;
  icon?: string;
};

export type CreateRecordOptions = {
  domain: string;
  fullRecord: string;
  hostRecord: string;
  type: string;
  value: any;
};
export type RemoveRecordOptions<T> = {
  recordReq: CreateRecordOptions;
  // 本次创建的dns解析记录，实际上就是createRecord接口的返回值
  recordRes: T;
};

export type DnsProviderContext = {
  access: IAccess;
  logger: ILogger;
  http: HttpClient;
  utils: typeof utils;
  domainParser: IDomainParser;
};

export interface IDnsProvider<T = any> {
  onInstance(): Promise<void>;
  createRecord(options: CreateRecordOptions): Promise<T>;
  removeRecord(options: RemoveRecordOptions<T>): Promise<void>;
  setCtx(ctx: DnsProviderContext): void;
  //中文域名是否需要punycode转码，如果返回True，则使用punycode来添加解析记录，否则使用中文域名添加解析记录
  usePunyCode(): boolean;
}

export interface ISubDomainsGetter {
  getSubDomains(): Promise<string[]>;
}

export interface IDomainParser {
  parse(fullDomain: string): Promise<string>;
}

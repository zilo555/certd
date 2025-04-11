import { CreateRecordOptions, DnsProviderContext, DnsProviderDefine, IDnsProvider, RemoveRecordOptions } from "./api.js";
import { dnsProviderRegistry } from "./registry.js";
import { Decorator } from "@certd/pipeline";
import { HttpClient, ILogger } from "@certd/basic";

export abstract class AbstractDnsProvider<T = any> implements IDnsProvider<T> {
  ctx!: DnsProviderContext;
  http!: HttpClient;
  logger!: ILogger;

  setCtx(ctx: DnsProviderContext) {
    this.ctx = ctx;
    this.logger = ctx.logger;
    this.http = ctx.http;
  }

  async parseDomain(fullDomain: string) {
    return await this.ctx.domainParser.parse(fullDomain);
  }

  abstract createRecord(options: CreateRecordOptions): Promise<T>;

  abstract onInstance(): Promise<void>;

  abstract removeRecord(options: RemoveRecordOptions<T>): Promise<void>;
}

export async function createDnsProvider(opts: { dnsProviderType: string; context: DnsProviderContext }): Promise<IDnsProvider> {
  const { dnsProviderType, context } = opts;
  const dnsProviderPlugin = dnsProviderRegistry.get(dnsProviderType);
  const DnsProviderClass = dnsProviderPlugin.target;
  const dnsProviderDefine = dnsProviderPlugin.define as DnsProviderDefine;
  if (dnsProviderDefine.deprecated) {
    context.logger.warn(dnsProviderDefine.deprecated);
  }
  // @ts-ignore
  const dnsProvider: IDnsProvider = new DnsProviderClass();

  Decorator.inject(dnsProviderDefine.autowire, dnsProvider, context);
  dnsProvider.setCtx(context);
  await dnsProvider.onInstance();
  return dnsProvider;
}

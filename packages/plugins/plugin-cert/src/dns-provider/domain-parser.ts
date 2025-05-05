import { IDomainParser, ISubDomainsGetter } from "./api";
//@ts-ignore
import psl from "psl";
import { logger, utils } from "@certd/basic";

export class DomainParser implements IDomainParser {
  subDomainsGetter: ISubDomainsGetter;
  constructor(subDomainsGetter: ISubDomainsGetter) {
    this.subDomainsGetter = subDomainsGetter;
  }

  parseDomainByPsl(fullDomain: string) {
    const parsed = psl.parse(fullDomain) as psl.ParsedDomain;
    if (parsed.error) {
      throw new Error(`解析${fullDomain}域名失败:` + JSON.stringify(parsed.error));
    }
    return parsed.domain as string;
  }

  async parse(fullDomain: string) {
    logger.info(`查找主域名:${fullDomain}`);
    const cacheKey = `domain_parse:${fullDomain}`;
    const value = utils.cache.get(cacheKey);
    if (value) {
      logger.info(`从缓存获取到主域名:${fullDomain}->${value}`);
      return value;
    }
    // try {
    //   const mainDomain = await resolveDomainBySoaRecord(fullDomain);
    //   if (mainDomain) {
    //     utils.cache.set(cacheKey, mainDomain, {
    //       ttl: 2 * 60 * 1000,
    //     });
    //     logger.info(`获取到主域名:${fullDomain}->${mainDomain}`);
    //     return mainDomain;
    //   }
    // } catch (e) {
    //   logger.error("从SOA获取主域名失败", e.message);
    // }

    const subDomains = await this.subDomainsGetter.getSubDomains();
    if (subDomains && subDomains.length > 0) {
      for (const subDomain of subDomains) {
        if (fullDomain.endsWith(subDomain)) {
          //找到子域名托管
          utils.cache.set(cacheKey, subDomain, {
            ttl: 2 * 60 * 1000,
          });
          logger.info(`获取到子域名托管域名:${fullDomain}->${subDomain}`);
          return subDomain;
        }
      }
    }

    const res = this.parseDomainByPsl(fullDomain);
    logger.info(`从psl获取主域名:${fullDomain}->${res}`);
    return res;
  }
}

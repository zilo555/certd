import { IDomainParser, ISubDomainsGetter } from "./api";
//@ts-ignore
import psl from "psl";

export class DomainParser implements IDomainParser {
  subDomainsGetter: ISubDomainsGetter;
  constructor(subDomainsGetter: ISubDomainsGetter) {
    this.subDomainsGetter = subDomainsGetter;
  }

  parseDomain(fullDomain: string) {
    const parsed = psl.parse(fullDomain) as psl.ParsedDomain;
    if (parsed.error) {
      throw new Error(`解析${fullDomain}域名失败:` + JSON.stringify(parsed.error));
    }
    return parsed.domain as string;
  }

  async parse(fullDomain: string) {
    const subDomains = await this.subDomainsGetter.getSubDomains();
    if (subDomains && subDomains.length > 0) {
      for (const subDomain of subDomains) {
        if (fullDomain.endsWith(subDomain)) {
          //找到子域名托管
          return subDomain;
        }
      }
    }

    return this.parseDomain(fullDomain);
  }
}

import { LocalCache } from '@certd/basic';
import dnsSdk from 'dns'
const dns = dnsSdk.promises

export class DnsCustom{
  resolver: any;

  constructor(dnsServers:string[]) {
    const resolver = new dns.Resolver();
    resolver.setServers(dnsServers);
    this.resolver = resolver;
  }
  async resolve(hostname:string,options:any):Promise<string[]>{
    // { family: undefined, hints: 0, all: true }

    const cnames = await this.resolver.resolveCname(hostname)
    let cnameIps = []
    // deep
    if (cnames && cnames.length > 0) {
      for (let cname of cnames) {
        const cnameIp = await this.resolve(cname,options)
        if (cnameIp && cnameIp.length > 0) {
          cnameIps.push(...cnameIp)
        }
      }
    }
    let v4 = []
    let v6 = []

    const {family, all} = options
    if(family === 6 && !all){
      v6= await this.resolver.resolve6(hostname)
    }
    if(family === 4 && !all){
      v4 = await this.resolver.resolve4(hostname)
    }

    if(all){
       v4 = await this.resolver.resolve4(hostname)
       v6 = await this.resolver.resolve6(hostname)
    }

    return [...v4,...v6,...cnameIps]
  }

  async resolve4(hostname:string,options:any):Promise<string[]>{
    return await this.resolver.resolve4(hostname,options)
  }
  async resolve6(hostname:string,options:any):Promise<string[]>{
    return await this.resolver.resolve6(hostname,options)
  }
  async resolveAny(hostname:string,options:any):Promise<string[]>{
    return await this.resolver.resolveAny(hostname,options)
  }

  async resolveCname(hostname:string,options:any):Promise<string[]>{
    return await this.resolver.resolveCname(hostname,options)
  }


}

export class DnsContainer{
  bucket: LocalCache<DnsCustom> = new LocalCache()

  constructor() {}
  getDns(server:string[]){
    const key = server.join(',')
    let dns = this.bucket.get(key)
    if (dns){
      return dns
    }
    dns = new DnsCustom(server)
    this.bucket.set(key,dns)
    return dns
  }
}

export const dnsContainer = new DnsContainer()

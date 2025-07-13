import {IServiceGetter} from "@certd/pipeline";
import {Inject, Provide, Scope, ScopeEnum} from "@midwayjs/core";
import {SubDomainService} from "../sub-domain-service.js";
import {AccessGetter, AccessService} from "@certd/lib-server";
import {CnameProxyService} from "./cname-proxy-service.js";
import {NotificationGetter} from "./notification-getter.js";
import {NotificationService} from "../notification-service.js";
import {CnameRecordService} from "../../../cname/service/cname-record-service.js";
import {SubDomainsGetter} from './sub-domain-getter.js'
import {DomainVerifierGetter} from "./domain-verifier-getter.js";
import {Context} from "@midwayjs/koa";
import {DomainService} from "../../../cert/service/domain-service.js";

export class TaskServiceGetter implements IServiceGetter{
  private userId: number;
  private ctx : Context;
  constructor(userId:number,ctx:Context) {
    this.userId = userId;
    this.ctx = ctx
  }
  async get<T>(serviceName: string): Promise<T> {

    if(serviceName === 'subDomainsGetter'){
      return await this.getSubDomainsGetter() as T
    } if (serviceName === 'accessService') {
      return await this.getAccessService() as T
    } else if (serviceName === 'cnameProxyService') {
      return await this.getCnameProxyService() as T
    } else if (serviceName === 'notificationService') {
      return await this.getNotificationService() as T
    } else if (serviceName === 'domainVerifierGetter') {
      return await this.getDomainVerifierGetter() as T
    }else{
      throw new Error(`service ${serviceName} not found`)
    }
  }

  async getSubDomainsGetter(): Promise<SubDomainsGetter> {
    const subDomainsService = await  this.ctx.requestContext.getAsync("subDomainService")
    return new SubDomainsGetter(this.userId, subDomainsService)
  }

  async getAccessService(): Promise<AccessGetter> {
    const accessService:AccessService = await  this.ctx.requestContext.getAsync("accessService")
    return new AccessGetter(this.userId, accessService.getById.bind(accessService));
  }

  async getCnameProxyService(): Promise<CnameProxyService> {
    const cnameRecordService:CnameRecordService = await  this.ctx.requestContext.getAsync("cnameRecordService")
    return new CnameProxyService(this.userId, cnameRecordService.getWithAccessByDomain.bind(cnameRecordService));
  }

  async getNotificationService(): Promise<NotificationGetter> {
    const notificationService:NotificationService = await  this.ctx.requestContext.getAsync("notificationService")
    return new NotificationGetter(this.userId, notificationService);
  }

  async getDomainVerifierGetter(): Promise<DomainVerifierGetter> {
    const domainService:DomainService = await  this.ctx.requestContext.getAsync("domainService")
    return new DomainVerifierGetter(this.userId, domainService);
  }
}
export type TaskServiceCreateReq = {
  userId: number;
}

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class TaskServiceBuilder  {
  @Inject()
  ctx: Context;

  create(req:TaskServiceCreateReq){
    const userId = req.userId;
    return new TaskServiceGetter(userId,this.ctx)
  }
}





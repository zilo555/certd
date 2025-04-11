import {IServiceGetter} from "@certd/pipeline";
import {Inject, Provide, Scope, ScopeEnum} from "@midwayjs/core";
import {SubDomainService, SubDomainsGetter} from "./sub-domain-service.js";
import {AccessGetter, AccessService} from "@certd/lib-server";
import {CnameProxyService} from "./cname-proxy-service.js";
import {NotificationGetter} from "./notification-getter.js";
import {NotificationService} from "./notification-service.js";
import {CnameRecordService} from "../../cname/service/cname-record-service.js";

export class TaskServiceGetter implements IServiceGetter{
  serviceContainer:Record<string, any>;
  constructor(serviceContainer:Record<string, any>) {
    this.serviceContainer = serviceContainer;
  }
  async get<T>(serviceName: string): Promise<T> {
    const ret = this.serviceContainer[serviceName] as T;
    if(!ret){
      throw new Error(`service ${serviceName} not found`)
    }
    return ret
  }
}
export type TaskServiceCreateReq = {
  userId: number;
}

export type TaskServiceContainer = {
  subDomainsGetter:SubDomainsGetter;
  accessService: AccessGetter;
  cnameProxyService: CnameProxyService;
  notificationService: NotificationGetter;
}

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class TaskServiceBuilder  {

  @Inject()
  subDomainService: SubDomainService;
  @Inject()
  accessService: AccessService;
  @Inject()
  cnameRecordService: CnameRecordService;
  @Inject()
  notificationService: NotificationService;


  create(req:TaskServiceCreateReq){

    const userId = req.userId;
    const accessGetter = new AccessGetter(userId, this.accessService.getById.bind(this.accessService));
    const cnameProxyService = new CnameProxyService(userId, this.cnameRecordService.getWithAccessByDomain.bind(this.cnameRecordService));
    const notificationGetter = new NotificationGetter(userId, this.notificationService);

    const serviceContainer:TaskServiceContainer = {
      subDomainsGetter:new SubDomainsGetter(req.userId, this.subDomainService),
      accessService: accessGetter,
      cnameProxyService:cnameProxyService,
      notificationService:notificationGetter
    }
    return new TaskServiceGetter(serviceContainer)
  }
}

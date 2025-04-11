import {Inject, Provide, Scope, ScopeEnum} from '@midwayjs/core';
import {BaseService, SysSettingsService} from '@certd/lib-server';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {Repository} from 'typeorm';
import {SubDomainEntity} from '../entity/sub-domain.js';
import {EmailService} from '../../basic/service/email-service.js';
import {ISubDomainsGetter} from "@certd/plugin-cert";

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class SubDomainService extends BaseService<SubDomainEntity> {
  @InjectEntityModel(SubDomainEntity)
  repository: Repository<SubDomainEntity>;

  @Inject()
  emailService: EmailService;

  @Inject()
  sysSettingsService: SysSettingsService;

  //@ts-ignore
  getRepository() {
    return this.repository;
  }

  async getListByUserId(userId:number):Promise<string[]>{
    if (!userId) {
      return [];
    }
    const list = await this.find({
      where: {
        userId,
        disabled: false,
      },
    });

    return list.map(item=>item.domain);
  }

}




export class SubDomainsGetter implements ISubDomainsGetter {
  userId: number;
  subDomainService: SubDomainService;

  constructor(userId: number, subDomainService: SubDomainService) {
    this.userId = userId;
    this.subDomainService = subDomainService;
  }

  async getSubDomains() {
    return await this.subDomainService.getListByUserId(this.userId)
  }

}

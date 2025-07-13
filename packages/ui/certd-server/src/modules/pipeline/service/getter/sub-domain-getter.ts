import {ISubDomainsGetter} from "@certd/plugin-cert";
import {SubDomainService} from "../service/sub-domain-service.js";

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

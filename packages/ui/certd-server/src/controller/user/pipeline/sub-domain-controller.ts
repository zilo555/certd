import {ALL, Body, Controller, Inject, Post, Provide, Query} from '@midwayjs/core';
import {Constants, CrudController} from '@certd/lib-server';
import {SubDomainService, SubDomainsGetter} from "../../../modules/pipeline/service/sub-domain-service.js";
import {DomainParser} from '@certd/plugin-cert/dist/dns-provider/domain-parser.js';

/**
 * 子域名托管
 */
@Provide()
@Controller('/api/pi/subDomain')
export class SubDomainController extends CrudController<SubDomainService> {
  @Inject()
  service: SubDomainService;

  getService() {
    return this.service;
  }

  @Post('/parseDomain', { summary: Constants.per.authOnly })
  async parseDomain(@Body("fullDomain") fullDomain:string) {
    const userId = this.getUserId()
    const subDomainGetter = new SubDomainsGetter(userId, this.service)
    const domainParser = new DomainParser(subDomainGetter)
    const domain = await domainParser.parse(fullDomain)
    return this.ok(domain);
  }


  @Post('/page', { summary: Constants.per.authOnly })
  async page(@Body(ALL) body) {
    body.query = body.query ?? {};
    delete body.query.userId;
    const buildQuery = qb => {
      qb.andWhere('user_id = :userId', { userId: this.getUserId() });
    };
    const res = await this.service.page({
      query: body.query,
      page: body.page,
      sort: body.sort,
      buildQuery,
    });
    return this.ok(res);
  }

  @Post('/list', { summary: Constants.per.authOnly })
  async list(@Body(ALL) body) {
    body.query = body.query ?? {};
    body.query.userId = this.getUserId();
    return super.list(body);
  }

  @Post('/add', { summary: Constants.per.authOnly })
  async add(@Body(ALL) bean) {
    bean.userId = this.getUserId();
    return super.add(bean);
  }

  @Post('/update', { summary: Constants.per.authOnly })
  async update(@Body(ALL) bean) {
    await this.service.checkUserId(bean.id, this.getUserId());
    delete bean.userId;
    return super.update(bean);
  }
  @Post('/info', { summary: Constants.per.authOnly })
  async info(@Query('id') id: number) {
    await this.service.checkUserId(id, this.getUserId());
    return super.info(id);
  }

  @Post('/delete', { summary: Constants.per.authOnly })
  async delete(@Query('id') id: number) {
    await this.service.checkUserId(id, this.getUserId());
    return super.delete(id);
  }

  @Post('/batchDelete', { summary: Constants.per.authOnly })
  async batchDelete(@Body('ids') ids: number[]) {
    await this.service.batchDelete(ids, this.getUserId());
    return this.ok({});
  }
}

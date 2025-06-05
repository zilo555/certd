import { ALL, Body, Controller, Inject, Post, Provide, Query } from "@midwayjs/core";
import { Constants, CrudController } from "@certd/lib-server";
import { AuthService } from "../../../modules/sys/authority/service/auth-service.js";
import { SiteIpService } from "../../../modules/monitor/service/site-ip-service.js";
import { SiteInfoService } from "../../../modules/monitor/index.js";

/**
 */
@Provide()
@Controller('/api/monitor/site/ip')
export class SiteInfoController extends CrudController<SiteIpService> {
  @Inject()
  service: SiteIpService;
  @Inject()
  authService: AuthService;
  @Inject()
  siteInfoService: SiteInfoService;

  getService(): SiteIpService {
    return this.service;
  }

  @Post('/page', { summary: Constants.per.authOnly })
  async page(@Body(ALL) body: any) {
    body.query = body.query ?? {};
    body.query.userId = this.getUserId();
    const res = await this.service.page({
      query: body.query,
      page: body.page,
      sort: body.sort,
    });
    return this.ok(res);
  }

  @Post('/list', { summary: Constants.per.authOnly })
  async list(@Body(ALL) body: any) {
    body.query = body.query ?? {};
    body.query.userId = this.getUserId();
    return await super.list(body);
  }

  @Post('/add', { summary: Constants.per.authOnly })
  async add(@Body(ALL) bean: any) {
    bean.userId = this.getUserId();
    bean.from = "manual"
    const res = await this.service.add(bean);
    const siteEntity = await this.siteInfoService.info(bean.siteId);
    if(!siteEntity.disabled){
      const {domain,  httpsPort} = siteEntity;
      this.service.check(res.id,domain,  httpsPort);
    }
    return this.ok(res);
  }

  @Post('/update', { summary: Constants.per.authOnly })
  async update(@Body(ALL) bean) {
    await this.service.checkUserId(bean.id, this.getUserId());
    delete bean.userId;
    await this.service.update(bean);
    const siteEntity = await this.siteInfoService.info(bean.siteId);
    if(!siteEntity.disabled){
      const {domain,  httpsPort} = siteEntity;
      this.service.check(siteEntity.id,domain,  httpsPort);
    }
    return this.ok();
  }
  @Post('/info', { summary: Constants.per.authOnly })
  async info(@Query('id') id: number) {
    await this.service.checkUserId(id, this.getUserId());
    return await super.info(id);
  }

  @Post('/delete', { summary: Constants.per.authOnly })
  async delete(@Query('id') id: number) {
    const entity = await this.service.info(id);
    await this.service.checkUserId(id, this.getUserId());

    const res = await super.delete(id);
    await this.service.updateIpCount(entity.siteId)
    return res
  }

  @Post('/check', { summary: Constants.per.authOnly })
  async check(@Body('id') id: number) {
    await this.service.checkUserId(id, this.getUserId());
    const entity = await this.service.info(id);
    const siteEntity = await this.siteInfoService.info(entity.siteId);
    const domain = siteEntity.domain;
    const port = siteEntity.httpsPort;
    this.service.check(id,domain,port);
    return this.ok();
  }

  @Post('/checkAll', { summary: Constants.per.authOnly })
  async checkAll(@Body('siteId') siteId: number) {
    const userId = this.getUserId();
    await this.siteInfoService.checkUserId(siteId, userId);
    const siteEntity = await this.siteInfoService.info(siteId);
    await this.service.checkAll(siteEntity);
    return this.ok();
  }

  @Post('/sync', { summary: Constants.per.authOnly })
  async sync(@Body('siteId') siteId: number) {
    const userId = this.getUserId();
    const entity = await this.siteInfoService.info(siteId)
    if(entity.userId != userId){
      throw new Error('无权限')
    }
    await this.service.sync(entity);
    return this.ok();
  }

  @Post('/import', { summary: Constants.per.authOnly })
  async doImport(@Body(ALL) body: any) {
    const userId = this.getUserId();
    await this.service.doImport({
      text:body.text,
      userId,
      siteId:body.siteId
    })
    return this.ok();
  }


}

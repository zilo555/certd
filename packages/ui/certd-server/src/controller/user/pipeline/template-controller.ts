import {ALL, Body, Controller, Inject, Post, Provide, Query} from '@midwayjs/core';
import {Constants, CrudController} from '@certd/lib-server';
import { TemplateService } from '../../../modules/pipeline/service/template-service.js';

/**
 * 流水线模版
 */
@Provide()
@Controller('/api/pi/template')
export class TemplateController extends CrudController<TemplateService> {
  @Inject()
  service: TemplateService;

  getService() {
    return this.service;
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
    await this.service.batchDelete([id], this.getUserId());
    return this.ok({});
  }

  @Post('/batchDelete', { summary: Constants.per.authOnly })
  async batchDelete(@Body('ids') ids: number[]) {
    await this.service.batchDelete(ids, this.getUserId());
    return this.ok({});
  }

  @Post('/detail', { summary: Constants.per.authOnly })
  async detail(@Query('id') id: number) {
    const detail = await this.service.detail(id, this.getUserId());
    return this.ok(detail);
  }
  @Post('/createPipelineByTemplate', { summary: Constants.per.authOnly })
  async createPipelineByTemplate(@Body(ALL) body: any) {
    body.userId = this.getUserId();
    const res = await this.service.createPipelineByTemplate(body);
    return this.ok(res);
  }
}

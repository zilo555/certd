import {Inject, Provide, Scope, ScopeEnum} from '@midwayjs/core';
import {BaseService, SysSettingsService} from '@certd/lib-server';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {Repository} from 'typeorm';
import { TemplateEntity } from '../entity/template.js';
import { PipelineService } from './pipeline-service.js';

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class TemplateService extends BaseService<TemplateEntity> {
  @InjectEntityModel(TemplateEntity)
  repository: Repository<TemplateEntity>;

  @Inject()
  pipelineService: PipelineService;

  @Inject()
  sysSettingsService: SysSettingsService;

  //@ts-ignore
  getRepository() {
    return this.repository;
  }

  async detail(id: number, userId: number) {
    const info = await this.info(id)
    if (!info) {
      throw new Error('模板不存在');
    }
    if (info.userId !== userId) {
      throw new Error('无权限');
    }
    const pipeline = await this.pipelineService.info(info.pipelineId);

    return {
      template:info,
      pipeline: JSON.parse(pipeline.content),
    }
  }
}


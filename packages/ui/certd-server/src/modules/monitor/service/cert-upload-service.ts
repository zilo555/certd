import { Inject, Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { BaseService, CommonException } from "@certd/lib-server";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { CertInfoEntity } from "../entity/cert-info.js";
import { logger } from "@certd/basic";
import { CertInfo, CertReader } from "@certd/plugin-cert";
import { PipelineService } from "../../pipeline/service/pipeline-service.js";
import { CertInfoService } from "./cert-info-service.js";
import { PipelineEntity } from "../../pipeline/entity/pipeline.js";
import { nanoid } from "nanoid";

export type UploadCertReq = {
  id?: number;
  certReader: CertReader;
  fromType?: string;
  userId?: number;
};

export type UpdateCertReq = {
  id: number;
  cert: CertInfo;
  userId?: number;
};

export type CreateUploadPipelineReq = {
  cert: CertInfo;
  userId: number;
  pipeline?:{
    input?:any;
    notifications?:any[]
  }
};

@Provide("CertUploadService")
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class CertUploadService extends BaseService<CertInfoEntity> {
  @InjectEntityModel(CertInfoEntity)
  repository: Repository<CertInfoEntity>;

  @Inject()
  pipelineService: PipelineService;
  @Inject()
  certInfoService: CertInfoService;

  //@ts-ignore
  getRepository() {
    return this.repository;
  }


  /**
   * 更新证书，触发流水线
   * @param req
   */
  async updateCert(req: UpdateCertReq) {

    const certInfoEntity = await this.certInfoService.info(req.id);
    if (!certInfoEntity) {
      throw new CommonException("cert not found");
    }
    if(certInfoEntity.fromType !== 'upload') {
      throw new CommonException("cert can't be custom upload");
    }
    await this.uploadCert(this.repository.manager,{
      id: req.id,
      fromType: 'upload',
      userId: req.userId,
      certReader: new CertReader(req.cert)
    })

    if (certInfoEntity.pipelineId) {
      logger.info( `触发流水线部署：${certInfoEntity.pipelineId}`)
      await this.pipelineService.trigger(certInfoEntity.pipelineId)
    }
  }

  async createUploadCertPipeline(body:CreateUploadPipelineReq) {
    const {  userId, cert  } = body;

    if (!cert) {
      throw new CommonException("cert can't be empty");
    }
    const certReader =  new CertReader(cert)
    return await this.transaction(async (tx:EntityManager)=>{
      const newCertInfo = await this.uploadCert(tx,{
        certReader: certReader,
        fromType: 'upload',
        userId
      });

      const pipelineTitle = certReader.getAllDomains()[0] +"上传证书自动部署";
      const notifications = body.pipeline?.notifications ||[];
      if(notifications.length === 0){
        notifications.push({
          type: "custom",
          when: ["error", "turnToSuccess", "success"],
          notificationId: 0,
          title: "默认通知",
        });
      }

      let pipeline = {
        title: pipelineTitle,
        runnableType: "pipeline",
        stages: [
          {
            id: nanoid(10),
            title: "上传证书解析阶段",
            maxTaskCount: 1,
            runnableType: "stage",
            tasks: [
              {
                id: nanoid(10),
                title: "上传证书解析任务",
                runnableType: "task",
                steps: [
                  {
                    id: nanoid(10),
                    title: "上传证书解析",
                    runnableType: "step",
                    input: {
                      certInfoId: newCertInfo.id,
                      domains: newCertInfo.domains.split(','),
                      ...body.pipeline?.input
                    },
                    strategy: {
                      runStrategy: 0, // 正常执行
                    },
                    type: "CertApplyUpload",
                  },
                ],
              },
            ],
          },
        ],
        triggers:[],
        notifications,
      }
      const newPipeline = await tx.getRepository(PipelineEntity).save({
        userId,
        title: pipelineTitle,
        type:"cert",
        from:"cert_upload",
        content: JSON.stringify(pipeline),
        keepHistory:20,
      })

      newCertInfo.pipelineId = newPipeline.id;
      await tx.getRepository(CertInfoEntity).save({
        id: newCertInfo.id,
        pipelineId: newPipeline.id
      });

      return {
        id:newCertInfo.id,
        pipelineId: newPipeline.id
      }

    })

  }

  private async uploadCert(tx:EntityManager,req: UploadCertReq) {
    const bean = new CertInfoEntity();
    const { id, fromType,userId, certReader } = req;
    if (id) {
      bean.id = id;
    } else {
      bean.fromType = fromType;
      bean.userId = userId
    }
    const certInfo = certReader.toCertInfo();
    bean.certInfo = JSON.stringify(certInfo);
    bean.applyTime = new Date().getTime();
    const domains = certReader.detail.domains.altNames;
    bean.domains = domains.join(',');
    bean.domain = domains[0];
    bean.domainCount = domains.length;
    bean.expiresTime = certReader.expires;
    bean.certProvider = certReader.detail.issuer.commonName;


    await tx.getRepository(CertInfoEntity).save(bean);
    return bean;
  }

}

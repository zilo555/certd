import { Inject, Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { CodeException, Constants } from "@certd/lib-server";
import { CertInfoEntity } from "../entity/cert-info.js";
import { utils } from "@certd/basic";
import { PipelineService } from "../../pipeline/service/pipeline-service.js";
import { UserSettingsService } from "../../mine/service/user-settings-service.js";
import { UserEmailSetting } from "../../mine/service/models.js";
import { PipelineEntity } from "../../pipeline/entity/pipeline.js";
import { CertInfoService } from "../service/cert-info-service.js";
import { DomainService } from "../../cert/service/domain-service.js";
import { DomainVerifierGetter } from "../../pipeline/service/getter/domain-verifier-getter.js";


@Provide("CertInfoFacade")
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class CertInfoFacade  {

  @Inject()
  pipelineService: PipelineService;

  @Inject()
  certInfoService: CertInfoService ;

  @Inject()
  domainService: DomainService

  @Inject()
  userSettingsService : UserSettingsService

  async getCertInfo(req: { domains?: string; certId?: number; userId: number,autoApply?:boolean }) {
    const { domains, certId, userId } = req;
    if (certId) {
      return await this.certInfoService.getCertInfoById({ id: certId, userId });
    }
    const domainArr = domains.split(',');

    const matchedList = await this.certInfoService.getMatchCertList({domains:domainArr,userId})
    let matched: CertInfoEntity = null
    if (matchedList.length === 0 ) {
      if(req.autoApply === true){
        //自动申请，先创建自动申请流水线
        const pipeline:PipelineEntity = await this.createAutoPipeline({domains:domainArr,userId})
        await this.triggerApplyPipeline({pipelineId:pipeline.id})
      }else{
        throw new CodeException(Constants.res.openCertNotFound);
      }
    }
    matched = null;
    for (const item of matchedList) {
      if (item.expiresTime>0 && item.expiresTime < new Date().getTime()) {
        matched = item;
        break
      }
    }
    if (!matched) {
      if(req.autoApply === true){
        //如果没有找到有效期内的证书，则自动触发一次申请
        const first = matchedList[0]
        await this.triggerApplyPipeline({pipelineId:first.pipelineId})
        return
      }else{
        throw new CodeException(Constants.res.openCertNotFound);
      }
    }

    return await this.certInfoService.getCertInfoById({ id: matched.id, userId: userId });
  }

  async createAutoPipeline(req:{domains:string[],userId:number}){

    const verifierGetter = new DomainVerifierGetter(req.userId, this.domainService)

    const allDomains = []
    for (const item of req.domains) {
      allDomains.push(item.replaceAll("*.",""))
    }
    const verifiers = await verifierGetter.getVerifiers(allDomains)
    for (const item of allDomains) {
      if (!verifiers[item]){
        throw new CodeException({
          ...Constants.res.openDomainNoVerifier,
          message:`域名${item}没有配置校验方式，请先在域名管理页面配置`,
          data:{
            domain:item
          }
        });
      }
    }

    const userEmailSetting = await this.userSettingsService.getSetting<UserEmailSetting>(req.userId,UserEmailSetting)
    if(!userEmailSetting.list){
      throw new CodeException(Constants.res.openEmailNotFound)
    }
    const email = userEmailSetting.list[0]

    return await this.pipelineService.createAutoPipeline({
      domains: req.domains,
      email,
      userId: req.userId,
      from:"OpenAPI"
    })

  }

  async triggerApplyPipeline(req:{pipelineId:number}){
    //查询流水线状态
    const status = await this.pipelineService.getStatus(req.pipelineId)
    if (status != 'running') {
      await this.pipelineService.trigger(req.pipelineId)
      await utils.sleep(1000)
    }
    throw new CodeException({
      ...Constants.res.openCertApplying,
      data:{
        pipelineId:req.pipelineId
      }
    });
  }


}

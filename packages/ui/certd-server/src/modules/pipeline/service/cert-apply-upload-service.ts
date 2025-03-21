import {ICertApplyUploadService} from "@certd/plugin-cert";
import {IMidwayContext, Inject, Provide} from "@midwayjs/core";
import {CertInfoService} from "../../monitor/index.js";
import {CertUploadService} from "../../monitor/service/cert-upload-service.js";

@Provide("CertApplyUploadService")
export class CertApplyUploadService implements ICertApplyUploadService {
  @Inject()
  ctx : IMidwayContext

  async getCertInfo(opts: { certId: number; userId: number; })  {
    const certInfoService = this.ctx.getApp().getApplicationContext().get<CertInfoService>("CertInfoService")
    const { certId, userId } = opts;
    return await certInfoService.getCertInfo({
      certId,
      userId: Number(userId),
    });
  };
  async updateCert(opts: { certId: any; userId: any; cert: any; }){
    const certUploadService =  this.ctx.getApp().getApplicationContext().get<CertUploadService>("CertUploadService")
    return await certUploadService.updateCert({
      id:opts.certId,
      userId:opts.userId,
      cert:opts.cert
    });
  }

}

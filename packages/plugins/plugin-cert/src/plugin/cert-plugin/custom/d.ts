import { CertInfo } from "../acme";
export interface ICertApplyUploadService {
  getCertInfo: (opts: { certId: number; userId: number }) => Promise<any>;
  updateCert: (opts: { certId: number; cert: CertInfo; userId: number }) => Promise<any>;
}

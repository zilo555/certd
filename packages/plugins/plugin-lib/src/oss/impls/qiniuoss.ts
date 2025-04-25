import { QiniuAccess, QiniuClient, QiniuOssAccess } from "../../qiniu/index.js";
import { BaseOssClient, OssClientRemoveByOpts, OssFileItem } from "../api.js";

export default class QiniuOssClientImpl extends BaseOssClient<QiniuOssAccess> {
  client: QiniuClient;
  async init() {
    const qiniuAccess = await this.ctx.accessService.getById<QiniuAccess>(this.access.accessId);
    this.client = new QiniuClient({
      access: qiniuAccess,
      logger: this.logger,
      http: this.ctx.utils.http,
    });
  }

  async download(fileName: string, savePath: string): Promise<void> {
    const path = this.join(this.rootDir, fileName);
    await this.client.downloadFile(this.access.bucket, path, savePath);
  }
  async listDir(dir: string): Promise<OssFileItem[]> {
    const path = this.join(this.rootDir, dir);
    const res = await this.client.listDir(this.access.bucket, path);
    return res.items.map(item => {
      return {
        path: item.name,
        size: item.fsize,
        lastModified: item.putTime,
      };
    });
  }
  async upload(filePath: string, fileContent: Buffer) {
    const path = this.join(this.rootDir, filePath);
    await this.client.uploadFile(this.access.bucket, path, fileContent);
  }

  async remove(filePath: string) {
    const path = this.join(this.rootDir, filePath);
    await this.client.removeFile(this.access.bucket, path);
  }
}

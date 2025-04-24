import dayjs from "dayjs";
import { TencentAccess, TencentCosAccess, TencentCosClient } from "../../tencent/index.js";
import { BaseOssClient, OssClientRemoveByOpts, OssFileItem } from "../api.js";

export default class TencentOssClientImpl extends BaseOssClient<TencentCosAccess> {
  client: TencentCosClient;

  join(...strs: string[]) {
    const str = super.join(...strs);
    if (str.startsWith("/")) {
      return str.substring(1);
    }
    return str;
  }
  async init() {
    const access = await this.ctx.accessService.getById<TencentAccess>(this.access.accessId);
    this.client = new TencentCosClient({
      access: access,
      logger: this.logger,
      region: this.access.region,
      bucket: this.access.bucket,
    });
  }
  async download(filePath: string, savePath: string): Promise<void> {
    const key = this.join(this.rootDir, filePath);
    await this.client.downloadFile(key, savePath);
  }

  async listDir(dir: string): Promise<OssFileItem[]> {
    const dirKey = this.join(this.rootDir, dir) + "/";
    // @ts-ignore
    const res: any[] = await this.client.listDir(dirKey);
    return res.map(item => {
      return {
        path: item.Key,
        size: item.Size,
        lastModified: dayjs(item.LastModified).valueOf(),
      };
    });
  }
  async upload(filePath: string, fileContent: Buffer) {
    const key = this.join(this.rootDir, filePath);
    await this.client.uploadFile(key, fileContent);
  }

  async remove(filePath: string) {
    const key = this.join(this.rootDir, filePath);
    await this.client.removeFile(key);
  }
}

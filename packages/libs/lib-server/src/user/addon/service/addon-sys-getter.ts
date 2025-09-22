import { IAccessService } from '@certd/pipeline';
import { AddonService } from './addon-service.js';

export class AddonSysGetter implements IAccessService {
  addonService: AddonService;
  constructor(addonService: AddonService) {
    this.addonService = addonService;
  }

  async getById<T = any>(id: any) {
    return await this.addonService.getById(id, 0);
  }

  async getCommonById<T = any>(id: any) {
    return await this.addonService.getById(id, 0);
  }
}

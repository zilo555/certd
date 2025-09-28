import { Inject, Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { http, logger, utils } from "@certd/basic";
import { TaskServiceBuilder } from "./getter/task-service-getter.js";
import { AddonService, newAddon, PermissionException, ValidateException } from "@certd/lib-server";

/**
 * Addon
 */
@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class AddonGetterService  {

  @Inject()
  taskServiceBuilder: TaskServiceBuilder;
  @Inject()
  addonService: AddonService;


  async getAddonById(id: any, checkUserId: boolean, userId?: number): Promise<any> {
    const serviceGetter = this.taskServiceBuilder.create({
      userId
    });
    const ctx = {
      http,
      logger,
      utils,
      serviceGetter
    }

    if (!id) {
      //使用图片验证码
      return await newAddon("captcha", "image", {}, ctx);
    }
    const entity = await this.addonService.info(id);
    if (entity == null) {
      //使用图片验证码
      return await newAddon("captcha", "image", {}, ctx);
    }
    if (checkUserId) {
      if (userId == null) {
        throw new ValidateException("userId不能为空");
      }
      if (userId !== entity.userId) {
        throw new PermissionException("您对该Addon无访问权限");
      }
    }

    const setting = JSON.parse(entity.setting ?? "{}");
    const input = {
      id: entity.id,
      ...setting
    };

    return await newAddon(entity.addonType, entity.type, input, ctx);
  }

  async getById(id: any, userId: number): Promise<any> {
    return await this.getAddonById(id, true, userId);
  }

}

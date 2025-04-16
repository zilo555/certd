import { Inject, Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { UserSettingsService } from "./user-settings-service.js";
import { UserTwoFactorSetting } from "./models.js";
import { utils } from "@certd/basic";
import { UserService } from "../../sys/authority/service/user-service.js";

/**
 * 授权
 */
@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class TwoFactorService {
  @Inject()
  userSettingsService: UserSettingsService;
  @Inject()
  userService: UserService;


  async getAuthenticatorQrCode(userId: any) {
    const setting = await this.userSettingsService.getSetting<UserTwoFactorSetting>(userId, UserTwoFactorSetting);

    const authenticator = setting.authenticator;
    if (!authenticator.secret) {
      authenticator.secret = utils.id.simpleNanoId(16);
      await this.userSettingsService.saveSetting(userId, setting);
    }

    const user = await this.userService.info(userId);
    const username = user.username;
    const secret = authenticator.secret;
    const qrcodeContent = `otpauth://totp/Certd:${username}?secret=${secret}&issuer=Certd`;

    //生成qrcode base64
    const qrcode = await import("qrcode");
    return await qrcode.toDataURL(qrcodeContent);

  }

  async saveAuthenticator(req: { userId: any; verifyCode: any }) {
    const userId = req.userId;
    const { authenticator } = await import("otplib");
    const tfSetting = await this.userSettingsService.getSetting<UserTwoFactorSetting>(userId, UserTwoFactorSetting);

    const setting = tfSetting.authenticator;
    if (!setting.secret) {
      throw new Error("secret is required");
    }
    const secret = setting.secret;
    const token = req.verifyCode;

    const isValid = authenticator.verify({ token, secret });
    if (!isValid) {
      throw new Error("authenticator 校验错误");
    }

    //校验成功，保存开启状态
    setting.enabled = true;
    setting.verified = true;

    await this.userSettingsService.saveSetting(userId, setting);
  }
}

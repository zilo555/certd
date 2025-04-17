import { BaseSettings } from "@certd/lib-server";

export type TwoFactorAuthenticator = {
  enabled: boolean;
  secret?: string;
  type?: string;
  verified?:boolean;
}

export class UserTwoFactorSetting extends BaseSettings {
  static __title__ = "用户多重认证设置";
  static __key__ = "user.two.factor";

  authenticator: TwoFactorAuthenticator = {
    enabled:false,
    verified:false,
  };

}



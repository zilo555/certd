import { addonRegistry, BaseController, Constants, SysInstallInfo, SysSettingsService } from "@certd/lib-server";
import { ALL, Body, Controller, Inject, Post, Provide } from "@midwayjs/core";
import { AddonGetterService } from "../../../modules/pipeline/service/addon-getter-service.js";
import { IOauthProvider } from "../../../plugins/plugin-oauth/api.js";
import { LoginService } from "../../../modules/login/service/login-service.js";
import { CodeService } from "../../../modules/basic/service/code-service.js";
import { UserService } from "../../../modules/sys/authority/service/user-service.js";
import { UserEntity } from "../../../modules/sys/authority/entity/user.js";
import { simpleNanoId } from "@certd/basic";
import { OauthBoundService } from "../../../modules/login/service/oauth-bound-service.js";
import { OauthBoundEntity } from "../../../modules/login/entity/oauth-bound.js";

/**
 */
@Provide()
@Controller('/api/oauth')
export class ConnectController extends BaseController {

  @Inject()
  addonGetterService: AddonGetterService;
  @Inject()
  sysSettingsService: SysSettingsService;
  @Inject()
  loginService: LoginService;
  @Inject()
  codeService: CodeService;
  @Inject()
  userService: UserService;

  @Inject()
  oauthBoundService: OauthBoundService;



  private async getOauthProvider(type: string) {
    const publicSettings = await this.sysSettingsService.getPublicSettings()
    if (!publicSettings?.oauthEnabled) {
      throw new Error("OAuth功能未启用");
    }
    const setting = publicSettings?.oauthProviders?.[type || ""]
    if (!setting) {
      throw new Error(`未配置该OAuth类型:${type}`);
    }

    const addon = await this.addonGetterService.getAddonById(setting.addonId, true, 0);
    if (!addon) {
      throw new Error("初始化OAuth插件失败");
    }
    return addon as IOauthProvider;
  }

  @Post('/login', { summary: Constants.per.guest })
  public async login(@Body(ALL) body: { type: string }) {

    const addon = await this.getOauthProvider(body.type);
    const installInfo = await this.sysSettingsService.getSetting<SysInstallInfo>(SysInstallInfo);
    const bindUrl = installInfo?.bindUrl || "";
    //构造登录url
    const redirectUrl = `${bindUrl}#/oauth/callback/${body.type}`;
    const loginUrl = await addon.buildLoginUrl({ redirectUri: redirectUrl });
    return this.ok({loginUrl});
  }
  @Post('/callback', { summary: Constants.per.guest })
  public async callback(@Body(ALL) body: any) {
    //处理登录回调
    const addon = await this.getOauthProvider(body.type);
    const tokenRes = await addon.onCallback({
      code: body.code,
      state: body.state,
    });

    const userInfo = tokenRes.userInfo;

    const openId = userInfo.openId;

    const loginRes = await this.loginService.loginByOpenId({ openId, type: body.type });
    if (loginRes == null) {
      // 用户还未绑定，让用户选择绑定已有账号还是自动注册新账号
      const validationCode = await this.codeService.setValidationValue({
        type: body.type,
        userInfo,
      });
      return this.ok({
        bindRequired: true,
        validationCode,
      });
    }

    //返回登录成功token
    return this.ok(loginRes);
  }

  @Post('/bind', { summary: Constants.per.loginOnly })
  public async bind(@Body(ALL) body: any) {
    //需要已登录
    const userId = this.getUserId();
    const validationValue = this.codeService.getValidationValue(body.validationCode);
    if (!validationValue) {
      throw new Error("校验码错误");
    }

    await this.oauthBoundService.bind({
      userId,
      type: body.type,
      openId: validationValue.openId,
    });
    return this.ok(1);
  }

  @Post('/autoRegister', { summary: Constants.per.guest })
  public async autoRegister(@Body(ALL) body: { validationCode: string, type: string }) {

    const validationValue = this.codeService.getValidationValue(body.validationCode);
    if (!validationValue) {
      throw new Error("第三方认证授权已过期");
    }
    const userInfo = validationValue.userInfo;
    const oauthType = validationValue.type;
    let newUser = new UserEntity()
    newUser.username = `${oauthType}:_${userInfo.nickName}_${simpleNanoId(6)}`;
    newUser.avatar = userInfo.avatar;
    newUser.nickName = userInfo.nickName;

    newUser = await this.userService.register("username", newUser, async (txManager) => {
      const oauthBound : OauthBoundEntity = new OauthBoundEntity()
      oauthBound.userId = newUser.id;
      oauthBound.type = oauthType;
      oauthBound.openId = userInfo.openId;
      await txManager.save(oauthBound);
    });

    const loginRes = await this.loginService.generateToken(newUser);
    return this.ok(loginRes);
  }

  @Post('/unbind', { summary: Constants.per.loginOnly })
  public async unbind(@Body(ALL) body: any) {
    //需要已登录
    const userId = this.getUserId();
    await this.oauthBoundService.unbind({
      userId,
      type: body.type,
    });
    return this.ok(1);
  }

  @Post('/providers', { summary: Constants.per.guest })
  public async providers() {
    const list = addonRegistry.getDefineList("oauth");
    return this.ok(list);
  }

}

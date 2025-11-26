import { AddonService, BaseController, Constants, newAddon, SysInstallInfo, SysOauthSetting, SysSettingsService } from "@certd/lib-server";
import { ALL, Body, Controller, Get, Inject, Post, Provide, Query } from "@midwayjs/core";
import { IOauthProvider } from "../../../plugins/plugin-oauth/api.js";
import { AddonGetterService } from "../../../modules/pipeline/service/addon-getter-service.js";

/**
 */
@Provide()
@Controller('/api/connect')
export class ConnectController extends BaseController {

  @Inject()
  addonGetterService: AddonGetterService;
  @Inject()
  sysSettingsService: SysSettingsService;

  private async getOauthProvider(type:string){
    const oauthSetting = await this.sysSettingsService.getSetting<SysOauthSetting>(SysOauthSetting);
    const setting = oauthSetting?.oauths?.[type||""]
    if (!setting) {
      throw new Error(`未配置该OAuth类型:${type}`);
    }

    const addon = await this.addonGetterService.getAddonById(setting.addonId, true, 0);
    if(!addon) {
      throw new Error("初始化OAuth插件失败");
    }
    return addon as IOauthProvider;
  }

  @Post('/login', { summary: Constants.per.guest })
  public async login(@Query(ALL) body: {type:string}) {

    const addon = await this.getOauthProvider(body.type);
    const installInfo = await this.sysSettingsService.getSetting<SysInstallInfo>(SysInstallInfo);
    const bindUrl = installInfo?.bindUrl || "";
    //构造登录url
    const redirectUrl = `${bindUrl}#/auth/callback/${body.type}`;
    const loginUrl = await addon.buildLoginUrl({ redirectUri: redirectUrl});
    return this.ok(loginUrl);
  }
  @Post('/callback', { summary: Constants.per.guest })
  public async callback(@Query(ALL) body: any) {
    //处理登录回调
    const addon = await this.getOauthProvider(body.type);
    const tokenRes = await addon.onCallback({
      code: body.code,
      redirectUri: body.redirectUri,
      state: body.state,
    });

    const userInfo = tokenRes.userInfo;

    


    return this.ok(tokenRes);
  }

  @Post('/bind', { summary: Constants.per.guest })
  public async bind(@Body(ALL) body: any) {
    const autoRegister = body.autoRegister || false;
    const bindInfo = body.bind || {};
    //处理登录回调
    return this.ok(1);
  }
  
}

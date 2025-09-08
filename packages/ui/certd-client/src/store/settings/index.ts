import { defineStore } from "pinia";
import { Modal, notification } from "ant-design-vue";
import * as _ from "lodash-es";
import * as basicApi from "./api.basic";
import { AppInfo, HeaderMenus, PlusInfo, SiteEnv, SiteInfo, SuiteSetting, SysInstallInfo, SysPublicSetting } from "./api.basic";
import { useUserStore } from "../user";
import { mitter } from "/@/utils/util.mitt";
import { env } from "/@/utils/util.env";
import { updatePreferences } from "/@/vben/preferences";
import { useTitle } from "@vueuse/core";
import { utils } from "/@/utils";
import { cloneDeep, merge } from "lodash-es";
import { useI18n } from "/src/locales";
export interface SettingState {
  skipReset?: boolean; // 注销登录时，不清空此store的状态
  sysPublic?: SysPublicSetting;
  installInfo?: {
    siteId: string;
    installTime?: number;
    bindUserId?: number;
    bindUrl?: string;
    accountServerBaseUrl?: string;
    appKey?: string;
  };
  siteInfo: SiteInfo;
  plusInfo?: PlusInfo;
  siteEnv?: SiteEnv;
  headerMenus?: HeaderMenus;
  inited?: boolean;
  suiteSetting?: SuiteSetting;
  app: {
    version?: string;
    time?: number;
    deltaTime?: number;
  };
  productInfo: {
    notice?: string;
    plus: {
      name: string;
      price: number;
      price3: number;
      tooltip?: string;
    };
    comm: {
      name: string;
      price: number;
      price3: number;
      tooltip?: string;
    };
    app?: {
      minVersion?: string;
      minVersionTip?: string;
    };
  };
}

const defaultSiteInfo: SiteInfo = {
  title: env.TITLE || "Certd",
  slogan: env.SLOGAN || "让你的证书永不过期",
  logo: env.LOGO || "/static/images/logo/logo.svg",
  loginLogo: env.LOGIN_LOGO || "/static/images/logo/rect-block.svg",
  licenseTo: "",
  licenseToUrl: "",
};
export const useSettingStore = defineStore({
  id: "app.setting",
  state: (): SettingState => ({
    skipReset: true,
    plusInfo: {
      isPlus: false,
      vipType: "free",
      isComm: false,
    },
    sysPublic: {
      registerEnabled: false,
      managerOtherUserPipeline: false,
      icpNo: env.ICP_NO || "",
    },
    installInfo: {
      siteId: "",
      bindUserId: null,
      bindUrl: "",
      accountServerBaseUrl: "",
      appKey: "",
    },
    siteInfo: defaultSiteInfo,
    siteEnv: {
      agent: {
        enabled: undefined,
        contactText: "",
        contactLink: "",
      },
    },
    headerMenus: {
      menus: [],
    },
    suiteSetting: { enabled: false },
    inited: false,
    app: {
      version: "",
      time: 0,
      deltaTime: 0,
    },
    productInfo: {
      notice: "",
      plus: {
        name: "专业版",
        price: 29.9,
        price3: 89.9,
      },
      comm: {
        name: "商业版",
        price: 399,
        price3: 899,
      },
      app: {
        minVersion: "",
        minVersionTip: "",
      },
    },
  }),
  getters: {
    getSysPublic(): SysPublicSetting {
      return this.sysPublic;
    },
    getInstallInfo(): SysInstallInfo {
      return this.installInfo;
    },
    isPlus(): boolean {
      return this.plusInfo?.isPlus && this.plusInfo?.expireTime > new Date().getTime();
    },
    isComm(): boolean {
      return this.plusInfo?.isComm && this.plusInfo?.expireTime > new Date().getTime();
    },
    isAgent(): boolean {
      return this.siteEnv?.agent?.enabled === true;
    },
    isCommOrAgent() {
      return this.isComm || this.isAgent;
    },
    vipLabel(): string {
      const { t } = useI18n();
      const vipLabelMap: any = {
        free: t("vip.label.free"),
        plus: t("vip.label.plus"),
        comm: t("vip.label.comm"),
      };
      return vipLabelMap[this.plusInfo?.vipType || "free"];
    },
    getHeaderMenus(): any[] {
      // @ts-ignore
      let menus = this.headerMenus?.menus || [];
      menus = cloneDeep(menus);
      return utils.tree.treeMap(menus, (menu: any) => {
        return {
          ...menu,
          name: menu.title,
          path: menu.path ?? "/" + menu.title,
          meta: {
            title: menu.title,
            icon: menu.icon,
            link: menu.path,
            order: 99999,
          },
        };
      });
    },
    isSuiteEnabled(): boolean {
      // @ts-ignore
      return this.suiteSetting?.enabled === true;
    },
  },
  actions: {
    checkPlus() {
      if (!this.isPlus) {
        notification.warn({
          message: "此为专业版功能，请先升级到专业版",
        });
        throw new Error("此为专业版功能，请升级到专业版");
      }
    },
    async loadSysSettings() {
      const allSettings = await basicApi.loadAllSettings();
      _.merge(this.sysPublic, allSettings.sysPublic || {});
      _.merge(this.installInfo, allSettings.installInfo || {});
      _.merge(this.siteEnv, allSettings.siteEnv || {});
      _.merge(this.plusInfo, allSettings.plusInfo || {});
      _.merge(this.headerMenus, allSettings.headerMenus || {});
      _.merge(this.suiteSetting, allSettings.suiteSetting || {});
      //@ts-ignore
      this.initSiteInfo(allSettings.siteInfo || {});
      this.initAppInfo(allSettings.app || {});
    },
    initAppInfo(appInfo: AppInfo) {
      this.app.time = appInfo.time;
      this.app.version = appInfo.version;
      this.app.deltaTime = new Date().getTime() - this.app.time;
    },
    initSiteInfo(siteInfo: SiteInfo) {
      //@ts-ignore
      if (this.isComm) {
        if (siteInfo.logo) {
          siteInfo.logo = `api/basic/file/download?key=${siteInfo.logo}`;
        }
        if (siteInfo.loginLogo) {
          siteInfo.loginLogo = `api/basic/file/download?key=${siteInfo.loginLogo}`;
        }
      }
      this.siteInfo = _.merge({}, defaultSiteInfo, siteInfo);

      if (this.siteInfo.logo) {
        updatePreferences({
          logo: {
            source: this.siteInfo.logo,
          },
        });
      }
      if (this.siteInfo.title) {
        updatePreferences({
          app: {
            name: this.siteInfo.title,
          },
        });
        useTitle(this.siteInfo.title);
      }
    },
    getBaseUrl() {
      let url = window.location.href;
      //只要hash前面的部分
      url = url.split("#")[0];
      return url;
    },
    async doBindUrl() {
      const url = this.getBaseUrl();
      await basicApi.bindUrl({ url });
      await this.loadSysSettings();
    },
    async checkUrlBound() {
      const userStore = useUserStore();
      const settingStore = useSettingStore();
      if (!userStore.isAdmin) {
        return;
      }

      const bindUrl = this.installInfo.bindUrl;

      if (!bindUrl) {
        //绑定url
        await this.doBindUrl();
      } else {
        //检查当前url 是否与绑定的url一致
        const url = window.location.href;
        if (!url.startsWith(bindUrl)) {
          Modal.confirm({
            title: "URL地址有变化",
            content: "以后都用这个新地址访问本系统吗？",
            onOk: async () => {
              await this.doBindUrl();
            },
            okText: "是的，继续",
            cancelText: "不是，回到原来的地址",
            onCancel: () => {
              window.location.href = bindUrl;
            },
          });
        }
      }
    },
    async loadProductInfo() {
      try {
        const productInfo = await basicApi.getProductInfo();
        merge(this.productInfo, productInfo);
      } catch (e) {
        console.error(e);
      }
    },
    async init() {
      await this.loadSysSettings();
    },
    async initOnce() {
      if (this.inited) {
        return;
      }
      await this.init();
      this.loadProductInfo();
      this.inited = true;
    },
  },
});

mitter.on("app.login", async () => {
  await useSettingStore().init();
});

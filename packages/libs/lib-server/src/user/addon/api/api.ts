import { HttpClient, ILogger, utils } from "@certd/basic";
import {upperFirst} from "lodash-es";
import { FormItemProps, PluginRequestHandleReq, Registrable } from "@certd/pipeline";


export type AddonRequestHandleReqInput<T = any> = {
  id?: number;
  title?: string;
  addon: T;
};

export type AddonRequestHandleReq<T = any> = {
  addonType: string;
} &PluginRequestHandleReq<AddonRequestHandleReqInput<T>>;

export type AddonInputDefine = FormItemProps & {
  title: string;
  required?: boolean;
};
export type AddonDefine = Registrable & {
  addonType: string;
  needPlus?: boolean;
  input?: {
    [key: string]: AddonInputDefine;
  };
  showTest?: boolean;
};

export type AddonInstanceConfig = {
  id: number;
  addonType: string;
  type: string;
  name: string;
  userId: number;
  setting: {
    [key: string]: any;
  };
};



export interface IAddon {
  ctx: AddonContext;
  [key: string]: any;
}

export type AddonContext = {
  http: HttpClient;
  logger: ILogger;
  utils: typeof utils;
};

export abstract class BaseAddon implements IAddon {
  define!: AddonDefine;
  ctx!: AddonContext;
  http!: HttpClient;
  logger!: ILogger;



  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onInstance() {}
  setCtx(ctx: AddonContext) {
    this.ctx = ctx;
    this.http = ctx.http;
    this.logger = ctx.logger;
  }
  setDefine = (define:AddonDefine) => {
    this.define = define;
  };

  async onRequest(req:AddonRequestHandleReq) {
    if (!req.action) {
      throw new Error("action is required");
    }

    let methodName = req.action;
    if (!req.action.startsWith("on")) {
      methodName = `on${upperFirst(req.action)}`;
    }

    // @ts-ignore
    const method = this[methodName];
    if (method) {
      // @ts-ignore
      return await this[methodName](req.data);
    }
    throw new Error(`action ${req.action} not found`);
  }

}


export interface IAddonGetter {
  getById<T = any>(id: any): Promise<T>;
  getCommonById<T = any>(id: any): Promise<T>;
}

import { Inject, Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { BaseService, PageReq } from "@certd/lib-server";
import { PluginEntity } from "../entity/plugin.js";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";
import { isComm } from "@certd/plus-core";
import { BuiltInPluginService } from "../../pipeline/service/builtin-plugin-service.js";
import { merge } from "lodash-es";
import { accessRegistry, pluginRegistry } from "@certd/pipeline";
import { dnsProviderRegistry } from "@certd/plugin-cert";
import { logger } from "@certd/basic";
import yaml from "js-yaml";
import { getDefaultAccessPlugin, getDefaultDeployPlugin, getDefaultDnsPlugin } from "./default-plugin.js";


@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class PluginService extends BaseService<PluginEntity> {
  @InjectEntityModel(PluginEntity)
  repository: Repository<PluginEntity>;

  @Inject()
  builtInPluginService: BuiltInPluginService;

  //@ts-ignore
  getRepository() {
    return this.repository;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async page(pageReq: PageReq<PluginEntity>) {

    if (pageReq.query.type && pageReq.query.type !== "builtIn") {
      return await super.page(pageReq);
    }

    const builtInList = await this.getBuiltInEntityList();
    return {
      records: builtInList,
      total: builtInList.length,
      offset: 0,
      limit: 99999
    };
  }

  async getEnabledBuildInGroup() {
    const groups = this.builtInPluginService.getGroups();
    for (const key in groups) {
      const group = groups[key];
      group.plugins.forEach(item => {
        delete item.input;
      });
    }

    if (!isComm()) {
      return groups;
    }
    const list = await this.list({
      query: {
        type: "builtIn",
        disabled: true
      }
    });
    const disabledNames = list.map(it => it.name);
    for (const key in groups) {
      const group = groups[key];
      if (!group.plugins) {
        continue;
      }
      group.plugins = group.plugins.filter(it => !disabledNames.includes(it.name));
    }
    return groups;
  }

  async getEnabledBuiltInList(): Promise<any> {
    const builtInList = this.builtInPluginService.getList();
    if (!isComm()) {
      return builtInList;
    }

    const list = await this.list({
      query: {
        type: "builtIn",
        disabled: true
      }
    });
    const disabledNames = list.map(it => it.name);

    return builtInList.filter(it => !disabledNames.includes(it.name));
  }

  async getBuiltInEntityList() {
    const builtInList = this.builtInPluginService.getList();
    const list = await this.list({
      query: {
        type: "builtIn"
      }
    });

    const records: PluginEntity[] = [];

    for (const item of builtInList) {
      let record = list.find(it => it.name === item.name);
      if (!record) {
        record = new PluginEntity();
        record.disabled = false;
      }
      merge(record, {
        name: item.name,
        title: item.title,
        type: "builtIn",
        icon: item.icon,
        desc: item.desc,
        group: item.group
      });
      records.push(record);
    }
    return records;
  }

  async setDisabled(opts: { id?: number; name?: string; type: string; disabled: boolean }) {
    const { id, name, type, disabled } = opts;
    if (!type) {
      throw new Error("参数错误: type 不能为空");
    }
    if (id > 0) {
      //update
      await this.repository.update({ id }, { disabled });
      return;
    }

    if (name && type === "builtIn") {
      const pluginEntity = new PluginEntity();
      pluginEntity.name = name;
      pluginEntity.type = type;
      pluginEntity.disabled = disabled;
      await this.repository.save(pluginEntity);
      return;
    }
    throw new Error("参数错误: id 和 name 必须有一个");
  }

  async getDefineByType(type: string) {
    return this.builtInPluginService.getByType(type);
  }

  /**
   * 新增
   * @param param 数据
   */
  async add(param: any) {

    const old = await this.repository.findOne({
      where: {
        name: param.name,
        author: param.author
      }
    })

    if (old) {
      throw new Error(`插件${param.author}/${param.name}已存在`);
    }

    let plugin:any = {}
    if (param.pluginType === "access") {
      plugin = getDefaultAccessPlugin()
    }else if (param.pluginType === "deploy") {
      plugin = getDefaultDeployPlugin()
    }else if (param.pluginType === "dnsProvider") {
      plugin = getDefaultDnsPlugin()
    }else{
      throw new Error(`插件类型${param.pluginType}不支持`);
    }

    return  await super.add({
      ...param,
      ...plugin
    });
  }

  async compile(code: string) {
    const ts = await import("typescript")
    return ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.ESNext }
    }).outputText;
  }

  async getPluginTarget(pluginName: string) {
    //获取插件类实例对象
    let author = undefined;
    let name = "";
    if (pluginName.includes("/")) {
      const arr = pluginName.split("/");
      author = arr[0];
      name = arr[1];
    } else {
      name = pluginName;
    }
    const info = await this.find({
      where: {
        name: name,
        author: author
      }
    });
    if (info && info.length > 0) {
      const plugin = info[0];

      try{
        const AsyncFunction = Object.getPrototypeOf(async () => {
        }).constructor;
        // const script = await this.compile(plugin.content);
        const script = plugin.content
        const getPluginClass = new AsyncFunction(script);
        const pluginClass = await getPluginClass({ logger: logger });
        return new pluginClass();
      }catch (e) {
        logger.error("实例化插件失败:",e)
        throw e
      }

    }
    throw new Error(`插件${pluginName}不存在`);
  }

  /**
   * 从数据库加载插件
   */
  async registerFromDb() {
    const res = await this.list({
      buildQuery: ((bq) => {
        bq.andWhere("type != :type", {
          type: "builtIn"
        });
      })
    });

    for (const item of res) {
      await this.registerPlugin(item);
    }
  }

  async registerPlugin(plugin: PluginEntity) {
    const metadata = yaml.load(plugin.metadata);
    const item = {
      ...plugin,
      ...metadata
    };
    delete item.metadata;
    delete item.content;
    if (item.author) {
      item.name = item.author + "/" + item.name;
    }
    let registry = null;
    if (item.pluginType === "access") {
      registry = accessRegistry;
    } else if (item.pluginType === "plugin") {
      registry = pluginRegistry;
    } else if (item.pluginType === "dnsProvider") {
      registry = dnsProviderRegistry;
    } else {
      logger.warn(`插件${item.name}类型错误:${item.pluginType}`);
      return;
    }

    registry.register(item.name, {
      define: item,
      target: () => {
        return this.getPluginTarget(item.name);
      }
    });
  }

}

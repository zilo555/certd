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

    if(pageReq.query.type && pageReq.query.type !=='builtIn'){
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

  async getPluginTarget(pluginName: string){
    //获取插件类实例对象
    let author = undefined;
    let name = '';
    if(pluginName.includes('/')){
      const arr = pluginName.split('/');
      author = arr[0];
      name = arr[1];
    }else {
      name = pluginName;
    }
    const info = await this.find({
      where: {
        name: name,
        author: author
      }
    });
    if (info.length > 0) {
      const plugin = info[0];
      const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
      const getPluginClass =  new AsyncFunction(plugin.content);
      return await getPluginClass();
    }
  }
  /**
   * 从数据库加载插件
   */
  async registerFromDb() {
    const res = await this.list({
      buildQuery: ((bq) => {
        bq.andWhere( "type != :type", {
          type: 'builtIn'
        })
      })
    });



    for (const item of res) {
      const pluginName = item.author ? item.author +"/"+ item.name : item.name;
      let registry = null
      if(item.pluginType === 'access'){
        registry = accessRegistry;
      }else if (item.pluginType === 'plugin'){
        registry = pluginRegistry;
      }else if (item.pluginType === 'dnsProvider'){
        registry = dnsProviderRegistry
      }else {
        logger.warn(`插件${pluginName}类型错误:${item.pluginType}`)
        continue
      }

      registry.register(pluginName, {
        define:item,
        target: ()=>{
          return this.getPluginTarget(pluginName);
        }
      });
    }
  }
}

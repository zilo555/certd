import { defineStore } from "pinia";
import * as api from "./api.plugin";
import { DynamicType, FormItemProps } from "@fast-crud/fast-crud";

interface PluginState {
  group?: PluginGroups;
}

export type PluginGroup = {
  key: string;
  title: string;
  desc?: string;
  order: number;
  icon: string;
  plugins: any[];
};

export type PluginDefine = {
  name: string;
  title: string;
  desc?: string;
  shortcut: any;
  input: {
    [key: string]: DynamicType<FormItemProps>;
  };
  output: {
    [key: string]: any;
  };
};

export class PluginGroups {
  groups!: { [key: string]: PluginGroup };
  map!: { [key: string]: PluginDefine };
  constructor(groups: { [key: string]: PluginGroup }) {
    this.groups = groups;
    this.initGroup(groups);
    this.initMap();
  }

  private initGroup(groups: { [p: string]: PluginGroup }) {
    const all: PluginGroup = {
      key: "all",
      title: "全部",
      order: 0,
      plugins: [],
      icon: "material-symbols:border-all-rounded",
    };
    for (const key in groups) {
      all.plugins.push(...groups[key].plugins);
    }
    this.groups = {
      all,
      ...groups,
    };
  }

  initMap() {
    const map: { [key: string]: PluginDefine } = {};
    for (const key in this.groups) {
      const group = this.groups[key];
      for (const plugin of group.plugins) {
        map[plugin.name] = plugin;
      }
    }
    this.map = map;
  }

  getGroups() {
    return this.groups;
  }

  get(name: string) {
    return this.map[name];
  }

  getPreStepOutputOptions({ pipeline, currentStageIndex, currentTaskIndex, currentStepIndex, currentTask }: any) {
    const steps = this.collectionPreStepOutputs({
      pipeline,
      currentStageIndex,
      currentTaskIndex,
      currentStepIndex,
      currentTask,
    });
    const options: any[] = [];
    for (const step of steps) {
      const stepDefine = this.get(step.type);
      for (const key in stepDefine?.output) {
        options.push({
          value: `step.${step.id}.${key}`,
          label: `${stepDefine.output[key].title}【from：${step.title}】`,
          type: step.type,
        });
      }
    }
    return options;
  }

  collectionPreStepOutputs({ pipeline, currentStageIndex, currentTaskIndex, currentStepIndex, currentTask }: any) {
    const steps: any[] = [];
    // 开始放step
    for (let i = 0; i < currentStageIndex; i++) {
      const stage = pipeline.stages[i];
      for (const task of stage.tasks) {
        for (const step of task.steps) {
          steps.push(step);
        }
      }
    }
    //当前阶段之前的task
    const currentStage = pipeline.stages[currentStageIndex];
    for (let i = 0; i < currentTaskIndex; i++) {
      const task = currentStage.tasks[i];
      for (const step of task.steps) {
        steps.push(step);
      }
    }
    //放当前任务下的step
    for (let i = 0; i < currentStepIndex; i++) {
      const step = currentTask.steps[i];
      steps.push(step);
    }
    return steps;
  }
}

export const usePluginStore = defineStore({
  id: "app.plugin",
  state: (): PluginState => ({
    group: null,
  }),
  actions: {
    async reload() {
      const groups = await api.GetGroups({});
      this.group = new PluginGroups(groups);
    },
    async init() {
      if (!this.group) {
        await this.reload();
      }
      return this.group;
    },
    async getGroups(): Promise<PluginGroups> {
      await this.init();
      return this.group as PluginGroups;
    },
    async clear() {
      this.group = null;
    },
    async getList(): Promise<PluginDefine[]> {
      await this.init();
      return this.group.groups.all.plugins;
    },
    async getPluginDefine(name: string): Promise<PluginDefine> {
      await this.init();
      return this.group.get(name);
    },
    async getPluginConfig(query: any) {
      return await api.GetPluginConfig(query);
    },
  },
});

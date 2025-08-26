<template>
  <div class="plugin-config flex">
    <div class="origin-metadata w-50%">
      <div class="block-title">
        插件原始参数配置
        <div class="helper">1111</div>
      </div>
      <div class="p-10">
        <code-editor id="origin" v-model:model-value="originMetadata" style="height: 60vh" language="yaml" :disabled="true"></code-editor>
      </div>
    </div>
    <div class="template-props w-50%">
      <div class="block-title">
        自定义配置
        <div class="helper">1</div>
      </div>
      <div class="p-10">
        <code-editor id="config" v-model:model-value="pluginMetadata" style="height: 60vh" language="yaml" @save="doSave"></code-editor>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as api from "./api";
import { usePluginStore } from "/@/store/plugin";
import yaml from "js-yaml";
import { cloneDeep, get, set } from "lodash-es";
const route = useRoute();
const templateId = route.query.templateId as string;

const router = useRouter();
const pluginStore = usePluginStore();
const props = defineProps<{
  plugin: any;
}>();

const pluginMetadata = ref<string>("");
const currentPlugin = ref();
const originMetadata = computed(() => {
  if (!currentPlugin.value) {
    return;
  }
  const input = cloneDeep(currentPlugin.value.input);
  const newInputs: any = {};
  const picks = ["title", "helper", "component.options"];

  for (const key in input) {
    const value = input[key];
    const newInput: any = {};
    newInputs[key] = newInput;
    for (const pickKey of picks) {
      const v = get(value, pickKey);
      if (v) {
        set(newInput, pickKey, v);
      }
    }
  }
  return yaml.dump(newInputs);
});

async function loadPluginSetting() {
  currentPlugin.value = await pluginStore.getPluginDefine(props.plugin.name);

  const setting = props.plugin.sysSetting;
  if (setting) {
    const settingJson = JSON.parse(setting);
    const metadataYaml = yaml.dump(settingJson.metadata);
    pluginMetadata.value = metadataYaml;
  }
}

onMounted(async () => {
  await loadPluginSetting();
});

function doSave() {
  const metadata = yaml.load(pluginMetadata.value);
  api.savePluginSetting({
    id: props.plugin.id,
    metadata: metadata,
  });
}
</script>

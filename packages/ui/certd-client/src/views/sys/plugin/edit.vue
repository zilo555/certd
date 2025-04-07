<template>
  <fs-page class="page-plugin-edit">
    <template #header>
      <div class="title">
        插件编辑
        <span class="sub">
          <span class="name">{{ plugin.title }} 【{{ plugin.author }}/{{ plugin.name }}】 </span>
        </span>
      </div>
      <div class="more">
        <a-button type="primary" :loading="saveLoading" @click="doSave">保存</a-button>
      </div>
    </template>
    <div class="pi-plugin-editor">
      <div class="metadata">
        <a-tabs type="card">
          <a-tab-pane key="editor" tab="元数据"> </a-tab-pane>
        </a-tabs>
        <div class="metadata-body">
          <code-editor id="metadata" v-model:model-value="plugin.metadata" language="yaml"></code-editor>
        </div>
      </div>
      <div class="script">
        <a-tabs type="card">
          <a-tab-pane key="script" tab="脚本"> </a-tab-pane>
        </a-tabs>
        <code-editor id="content" v-model:model-value="plugin.content" language="javascript"></code-editor>
      </div>
    </div>
  </fs-page>
</template>
<script lang="ts" setup>
import { onMounted, provide, ref } from "vue";
import { useRoute } from "vue-router";
import * as api from "./api";
import yaml from "js-yaml";

const CertApplyPluginNames = ["CertApply", "CertApplyLego", "CertApplyUpload"];
defineOptions({
  name: "SysPluginEdit",
});
const route = useRoute();

const plugin = ref<any>({});

async function getPlugin() {
  const id = route.query.id;
  const pluginObj = await api.GetObj(id);
  if (!pluginObj.metadata) {
    pluginObj.metadata = yaml.dump({
      input: [
        {
          key: "cert",
          title: "前置任务生成的证书",
          component: {
            name: "output-selector",
            from: [...CertApplyPluginNames],
          },
        },
      ],
      output: [],
    });
  } else {
    pluginObj.metadata = "";
  }
  plugin.value = pluginObj;
}
getPlugin();
onMounted(async () => {});

provide("get:plugin", () => {
  return plugin;
});

const saveLoading = ref(false);
function doSave() {
  saveLoading.value = true;
  try {
    // api.Save(plugin.value);
  } finally {
    saveLoading.value = false;
  }
}
</script>

<style lang="less">
.page-plugin-edit {
  .pi-plugin-editor {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    padding: 20px;
    .fs-editor-code {
      height: 100%;
      flex: 1;
    }

    .metadata {
      width: 600px;
      max-width: 50%;
      margin-right: 20px;
      display: flex;
      flex-direction: column;
      height: 100%;
      .metadata-body {
        height: 100%;
        flex: 1;
      }

      .metadata-editor {
        height: 100%;
        flex: 1;
        .ant-tabs-content {
          height: 100%;
        }
      }
      .metadata-source {
        height: 100%;
      }
    }
    .script {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }
}
</style>

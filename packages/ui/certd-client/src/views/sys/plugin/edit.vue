<template>
  <fs-page class="page-plugin-edit">
    <template #header>
      <div class="title">
        插件编辑
        <span class="sub">
          <span class="name">{{ plugin.title }} 【{{ plugin.author }}/{{ plugin.name }}】 </span>
        </span>
      </div>
    </template>
    <div class="pi-plugin-editor">
      <div class="metadata">
        <a-tabs v-model:active-key="metadataActive" type="card">
          <a-tab-pane key="editor" tab="元数据"> </a-tab-pane>
          <a-tab-pane key="source" tab="yaml"> </a-tab-pane>
        </a-tabs>
        <div class="metadata-body">
          <a-tabs v-if="metadataActive === 'editor'" class="metadata-editor" tab-position="left" type="card">
            <a-tab-pane key="input" tab="输入">
              <plugin-input></plugin-input>
            </a-tab-pane>
            <a-tab-pane key="output" tab="输出"></a-tab-pane>
            <a-tab-pane key="dependLibs" tab="第三方依赖"></a-tab-pane>
            <a-tab-pane key="dependPlugins" tab="插件依赖"></a-tab-pane>
          </a-tabs>

          <div v-if="metadataActive === 'source'" class="metadata-source">
            <fs-editor-code v-model="plugin.metadata" language="yaml"></fs-editor-code>
          </div>
        </div>
      </div>
      <div class="script">
        <a-tabs type="card">
          <a-tab-pane key="script" tab="脚本"> </a-tab-pane>
        </a-tabs>
        <fs-editor-code v-model="plugin.content" language="javascript"></fs-editor-code>
      </div>
    </div>
  </fs-page>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import * as api from "./api";
import PluginInput from "/@/views/sys/plugin/components/plugin-input.vue";
defineOptions({
  name: "SysPluginEdit",
});
const route = useRoute();

const plugin = ref<any>({});

const metadataActive = ref("editor");
async function getPlugin() {
  const id = route.query.id;
  plugin.value = await api.GetObj(id);
}

onMounted(async () => {
  await getPlugin();
});
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
      overflow-y: hidden;
    }

    .metadata {
      width: 500px;
      margin-right: 20px;
      display: flex;
      flex-direction: column;
      height: 100%;
      .metadata-body {
        height: 100%;
        flex: 1;
        overflow-y: hidden;
      }

      .metadata-editor {
        height: 100%;
        flex: 1;
        overflow-y: hidden;
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

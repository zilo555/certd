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
        <a-button class="mr-1" type="primary" :loading="saveLoading" @click="doSave">保存</a-button>
        <a-button type="primary" @click="doTest">测试运行</a-button>
      </div>
    </template>
    <div class="pi-plugin-editor">
      <div class="base">
        <a-tabs type="card">
          <a-tab-pane key="base" tab="插件信息"> </a-tab-pane>
        </a-tabs>
        <div class="base-body">
          <fs-form ref="baseFormRef" v-bind="formOptionsRef"></fs-form>
        </div>
      </div>
      <div class="metadata">
        <a-tabs type="card">
          <a-tab-pane key="editor" tab="元数据"> </a-tab-pane>
        </a-tabs>
        <div class="metadata-body">
          <code-editor id="metadata" v-model:model-value="plugin.metadata" language="yaml" @save="doSave"></code-editor>
        </div>
      </div>
      <div class="script">
        <a-tabs type="card">
          <a-tab-pane key="script" tab="脚本"> </a-tab-pane>
        </a-tabs>
        <div class="script-body">
          <code-editor id="content" v-model:model-value="plugin.content" language="javascript" @save="doSave"></code-editor>
        </div>
      </div>
    </div>
  </fs-page>
</template>
<script lang="ts" setup>
import { onMounted, provide, ref, Ref } from "vue";
import { useRoute } from "vue-router";
import * as api from "./api";
import { notification } from "ant-design-vue";
import createCrudOptions from "./crud";
import { useColumns } from "@fast-crud/fast-crud";
import yaml from "js-yaml";

const CertApplyPluginNames = ["CertApply", "CertApplyLego", "CertApplyUpload"];
defineOptions({
  name: "SysPluginEdit",
});
const route = useRoute();

const plugin = ref<any>({});
const formOptionsRef: Ref = ref();
const baseFormRef: Ref = ref({});
function initFormOptions() {
  const formCrudOptions = createCrudOptions({
    crudExpose: {},
    context: {},
  });

  const { buildFormOptions } = useColumns();

  const formOptions = buildFormOptions(formCrudOptions.crudOptions, {});

  formOptions.col = {
    span: 24,
  };
  formOptions.labelCol = {
    style: {
      width: "100px",
    },
  };
  formOptionsRef.value = formOptions;
}
initFormOptions();

async function getPlugin() {
  const id = route.query.id;
  const pluginObj = await api.GetObj(id);
  plugin.value = pluginObj;

  const baseFrom = {
    ...pluginObj,
  };
  if (baseFrom.extra) {
    baseFrom.extra = yaml.load(baseFrom.extra);
  }
  delete baseFrom.metadata;
  delete baseFrom.content;
  baseFormRef.value.setFormData(baseFrom);
}

onMounted(async () => {
  getPlugin();
});

provide("get:plugin", () => {
  return plugin;
});

function validate() {
  try {
    yaml.load(plugin.value.metadata);
  } catch (e: any) {
    const message = `元数据校验失败:${e.message}`;
    notification.error({
      message,
    });

    throw new Error(message);
  }
}

const saveLoading = ref(false);
async function doSave() {
  validate();
  saveLoading.value = true;
  const baseForm = baseFormRef.value.getFormData();
  const form = {
    ...plugin.value,
    ...baseForm,
  };
  if (form.extra) {
    form.extra = yaml.dump(form.extra);
  }
  try {
    await api.UpdateObj(form);
    notification.success({
      message: "保存成功",
    });
  } finally {
    saveLoading.value = false;
  }
}

async function doTest() {
  await doSave();
  const result = await api.DoTest({
    id: plugin.value.id,
    input: {},
  });
  notification.success({
    message: "测试已开始",
    description: result,
  });
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

    .base {
      width: 400px;
      max-width: 30%;
      margin-right: 20px;
      display: flex;
      flex-direction: column;
      height: 100%;
      .base-body {
        flex: 1;
        overflow: auto;
      }
    }

    .metadata {
      width: 600px;
      max-width: 30%;
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
      .script-body {
        flex: 1;
      }
    }
  }
}
</style>

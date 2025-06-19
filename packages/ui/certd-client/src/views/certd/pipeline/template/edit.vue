<template>
  <div class="page-template-edit">
    <div class="base"></div>
    <div class="props flex p-10">
      <div class="task-list w-50%">
        <div class="block-title">原始任务参数</div>
        <a-collapse>
          <a-collapse-panel v-for="step of steps" class="step-item" :header="step.title">
            <div class="step-inputs flex flex-wrap">
              <div v-for="(input, key) of step.input" :key="key" class="hover:bg-gray-100 p-5 w-full xl:w-[50%]">
                <div class="flex flex-between" :title="input.define.helper">
                  <div class="flex flex-1 overflow-hidden mr-5">
                    <span style="min-width: 140px" class="bas">
                      <a-tag color="green">{{ input.define.title }}</a-tag>
                    </span>
                    <span :title="input.value" class="ellipsis flex-1 text-nowrap">= {{ input.value }}</span>
                  </div>
                  <fs-button v-if="!templateProps.input?.[key]" size="small" type="primary" icon="ion:add" title="添加为模版变量" @click="addToProps(step.id, key, input)"></fs-button>
                  <fs-button v-else size="small" danger icon="ion:close" title="删除模版变量" @click="removeToProps(step.id, key)" />
                </div>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <div class="template-props w-50%">
        <div class="block-title">模版变量</div>
        <div class="p-10">
          <fs-form v-bind="templateFormOptions"></fs-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from "vue";
import { useRoute } from "vue-router";
import { templateApi } from "./api";
import { eachSteps } from "../utils";
import { usePluginStore } from "/@/store/plugin";

const route = useRoute();
const templateId = route.query.templateId as string;

type TemplateDetail = {
  template: any;
  pipeline: any;
};
const templateProps: Ref = ref({
  input: {},
});
const detail: Ref<TemplateDetail> = ref();
async function getTemplateDetail() {
  const res = await templateApi.GetDetail(parseInt(templateId));
  detail.value = res;
  templateProps.value = JSON.parse(res.template.content ?? "{}");
}

const pluginStore = usePluginStore();

onMounted(async () => {
  await pluginStore.init();
  await getTemplateDetail();
});

const steps = computed(() => {
  if (!detail.value) {
    return [];
  }

  const list: any[] = [];
  eachSteps(detail.value.pipeline, (step: any) => {
    const plugin = pluginStore.getPluginDefineSync(step.type);
    if (!plugin) {
      return;
    }

    const inputs: any = {};
    for (const key in plugin.input) {
      const input: any = plugin.input[key];
      if (input.template === false || input.component?.name === "output-selector") {
        continue;
      }
      inputs[key] = {
        value: step.input[key],
        define: plugin.input[key],
      };
    }
    list.push({
      id: step.id,
      title: step.title,
      type: step.type,
      input: inputs,
    });
  });

  return list;
});

const templateFormOptions = computed(() => {
  const columns: any = {};
  for (const key in templateProps.value.input) {
    const input = templateProps.value.input[key];
    columns[key] = {
      title: input.define.title,
      type: "text",
      value: input.value,
      ...input.define,
    };
  }
  return {
    columns,
    labelCol: {
      style: {
        width: "120px",
      },
    },
  };
});

function addToProps(stepId: string, key: any, input: { value: any; define: any }) {
  if (!templateProps.value.input) {
    templateProps.value.input = {};
  }
  inputKey = stepId + "." + key;
  templateProps.value.input[inputKey] = input;
}

function removeToProps(stepId: string, key: any) {
  inputKey = stepId + "." + key;
  delete templateProps.value.input[inputKey];
}
</script>

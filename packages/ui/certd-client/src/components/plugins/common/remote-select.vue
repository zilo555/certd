<template>
  <div class="remote-select">
    <div class="flex flex-row">
      <a-select class="remote-select-input" show-search :filter-option="filterOption" :options="optionsRef" :value="value" v-bind="attrs" @click="onClick" @update:value="emit('update:value', $event)">
        <template #dropdownRender="{ menuNode: menu }">
          <template v-if="search">
            <div class="flex w-full" style="padding: 4px 8px">
              <a-input ref="inputRef" v-model:value="searchKeyRef" class="flex-1" allow-clear placeholder="查询关键字" @keydown.enter="doSearch" />
              <a-button class="ml-2" :loading="loading" type="text" @click="doSearch">
                <template #icon>
                  <search-outlined />
                </template>
                查询
              </a-button>
            </div>
            <div v-if="hasError" class="helper p-2" :class="{ error: hasError }">
              {{ message }}
            </div>
            <a-divider style="margin: 4px 0" />
          </template>
          <v-nodes :vnodes="menu" />

          <div v-if="pager" class="pager text-center p-5">
            <a-pagination v-model:current="pagerRef.current" simple :total="pagerRef.total" :page-size="pagerRef.limit" />
          </div>
        </template>
      </a-select>
      <div class="ml-5">
        <fs-button :loading="loading" title="刷新选项" icon="ion:refresh-outline" @click="refreshOptions"></fs-button>
      </div>
    </div>
    <div class="helper" :class="{ error: hasError }">
      {{ message }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { ComponentPropsType, doRequest } from "/@/components/plugins/lib";
import { defineComponent, inject, ref, useAttrs, watch, Ref } from "vue";
import { PluginDefine } from "@certd/pipeline";

defineOptions({
  name: "RemoteSelect",
});

const VNodes = defineComponent({
  props: {
    vnodes: {
      type: Object,
      required: true,
    },
  },
  render() {
    return this.vnodes;
  },
});

const props = defineProps<
  {
    watches: string[];
    search?: boolean;
    pager?: boolean;
  } & ComponentPropsType
>();

const emit = defineEmits<{
  "update:value": any;
}>();

const attrs = useAttrs();

const getCurrentPluginDefine: any = inject("getCurrentPluginDefine");
const getScope: any = inject("get:scope");
const getPluginType: any = inject("get:plugin:type");

const searchKeyRef = ref("");
const optionsRef = ref([]);
const message = ref("");
const hasError = ref(false);
const loading = ref(false);
const pagerRef: Ref = ref({
  current: 1,
});
const getOptions = async () => {
  if (loading.value) {
    return;
  }

  if (!getCurrentPluginDefine) {
    return;
  }

  const define: PluginDefine = getCurrentPluginDefine()?.value;
  if (!define) {
    return;
  }
  const pluginType = getPluginType();
  const { form } = getScope();
  const input = pluginType === "plugin" ? form.input : form;

  for (let key in define.input) {
    const inWatches = props.watches.includes(key);
    const inputDefine = define.input[key];
    if (inWatches && inputDefine.required) {
      const value = input[key];
      if (value == null || value === "") {
        console.log("remote-select required", key);
        return;
      }
    }
  }

  message.value = "";
  hasError.value = false;
  loading.value = true;
  optionsRef.value = [];

  const offset = (pagerRef.value.current - 1) * (pagerRef.value.limit ?? 100);
  try {
    const res = await doRequest(
      {
        type: pluginType,
        typeName: form.type,
        action: props.action,
        input,
        data: {
          searchKey: props.search ? searchKeyRef.value : "",
          offset: offset,
          limit: pagerRef.value.limit,
        },
      },
      {
        onError(err: any) {
          hasError.value = true;
          message.value = `获取选项出错：${err.message}`;
        },
        showErrorNotify: false,
      }
    );
    const list = res?.list || res || [];
    if (list.length > 0) {
      message.value = "获取数据成功，请从下拉框中选择";
    }
    optionsRef.value = list;
    pagerRef.value.total = list.length;
    if (props.pager) {
      if (res.offset != null) {
        pagerRef.value.offset = res.offset ?? 0;
      }
      if (res.limit != null) {
        pagerRef.value.limit = res.limit ?? 100;
      }
      if (res.total != null) {
        pagerRef.value.total = res.total ?? list.length;
      }
      const { offset, limit } = pagerRef.value;
      pagerRef.value.current = offset % limit === 0 ? offset / limit + 1 : offset / limit;
    }

    return res;
  } finally {
    loading.value = false;
  }
};

const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0 || String(option.value).toLowerCase().indexOf(input.toLowerCase());
};

async function onClick() {
  if (optionsRef.value?.length === 0) {
    await refreshOptions();
  }
}

async function refreshOptions() {
  await getOptions();
}

async function doSearch() {
  pagerRef.value.current = 1;
  await refreshOptions();
}

watch(
  () => {
    const pluginType = getPluginType();
    const { form, key } = getScope();
    const input = pluginType === "plugin" ? form.input : form;
    const watches = {};
    for (const key of props.watches) {
      watches[key] = input[key];
    }
    return {
      form: watches,
      key,
    };
  },
  async (value, oldValue) => {
    const { form } = value;
    const oldForm = oldValue.form;
    let changed = oldForm == null || optionsRef.value.length == 0;
    for (const key of props.watches) {
      if (form[key] != oldForm[key]) {
        changed = true;
        break;
      }
    }
    if (changed) {
      await getOptions();
    }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="less"></style>

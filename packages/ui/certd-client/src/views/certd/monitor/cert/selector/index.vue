<template>
  <div class="cert-info-selector w-full">
    <div class="flex-o w-full">
      <fs-table-select
        ref="tableSelectRef"
        class="flex-0"
        :model-value="modelValue"
        :dict="optionsDictRef"
        :create-crud-options="createCrudOptions"
        :crud-options-override="{
          search: { show: false },
          table: {
            scroll: {
              x: 540,
            },
          },
        }"
        :show-current="false"
        :show-select="false"
        :dialog="{ width: 960 }"
        :destroy-on-close="false"
        height="400px"
        @update:model-value="onChange"
        @dialog-closed="doRefresh"
        @selected-change="onSelectedChange"
      />
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { inject, ref, Ref, watch } from "vue";
import { message } from "ant-design-vue";
import createCrudOptions from "../crud";
import { dict } from "@fast-crud/fast-crud";
import { certInfoApi } from "../api";

defineOptions({
  name: "CertInfoSelector",
});

const props = defineProps<{
  modelValue?: number | string;
  type?: string;
  placeholder?: string;
  size?: string;
  disabled?: boolean;
}>();

const onChange = async (value: number) => {
  await emitValue(value);
};

const emit = defineEmits(["update:modelValue", "selectedChange", "change"]);

const tableSelectRef = ref();

const optionsDictRef = dict({
  value: "id",
  label: "domain",
  getNodesByValues: async (values: any[]) => {
    return await certInfoApi.GetOptionsByIds(values);
  },
});

// async function openTableSelectDialog() {
//   await tableSelectRef.value.open({});
//   await tableSelectRef.value.crudExpose.openAdd({});
// }

const target: Ref<any> = ref({});

function clear() {
  if (props.disabled) {
    return;
  }
  emitValue(null);
}

async function emitValue(value: any) {
  target.value = optionsDictRef.dataMap[value];
  if (value !== 0 && pipeline?.value && target && pipeline.value.userId !== target.value.userId) {
    message.error("对不起，您不能修改他人流水线的证书仓库ID");
    return;
  }
  emit("change", value);
  emit("update:modelValue", value);
}

function onSelectedChange(value: any) {
  if (value && value.length > 0) {
    emit("selectedChange", value[0]);
  } else {
    emit("selectedChange", null);
  }
}

// watch(
//   () => {
//     return props.modelValue;
//   },
//   async value => {
//     await optionsDictRef.loadDict();
//     target.value = optionsDictRef.dataMap[value];
//     emit("selectedChange", target.value);
//   },
//   {
//     immediate: true,
//   }
// );

//当不在pipeline中编辑时，可能为空
const pipeline = inject("pipeline", null);

async function doRefresh() {
  await optionsDictRef.reloadDict();
}
</script>
<style lang="less">
.cert-info-selector {
  width: 100%;
}
</style>

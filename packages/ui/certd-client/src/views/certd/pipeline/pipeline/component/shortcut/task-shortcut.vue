<template>
  <a-tooltip :title="title">
    <div class="task-shortcut" :title="title" @click="openDialog">
      <fs-icon :icon="icon" v-bind="attrs"></fs-icon>
    </div>
  </a-tooltip>
</template>
<script setup lang="ts">
import { doRequest } from "/@/components/plugins/lib";
import { ref, useAttrs } from "vue";
import { useFormWrapper } from "@fast-crud/fast-crud";
import { notification } from "ant-design-vue";

defineOptions({
  name: "TaskShortcut",
});
const { openCrudFormDialog } = useFormWrapper();
const props = defineProps<{
  icon: string;
  title: string;
  action: string;
  form: any;
  input: any;
  pluginName: string;
}>();

const attrs = useAttrs();

const loading = ref(false);

async function openDialog() {
  function createCrudOptions() {
    return {
      crudOptions: {
        columns: props.form.columns,
        form: {
          wrapper: {
            title: props.title,
            saveRemind: false,
          },
          afterSubmit() {
            notification.success({ message: "操作成功" });
          },
          async doSubmit({ form }: any) {
            return await doPluginFormSubmit(form);
          },
        },
      },
    };
  }
  const { crudOptions } = createCrudOptions();
  await openCrudFormDialog({ crudOptions });
}

const doPluginFormSubmit = async (formData: any) => {
  if (loading.value) {
    return;
  }

  loading.value = true;
  try {
    const res = await doRequest({
      type: "plugin",
      typeName: props.pluginName,
      action: props.action,
      input: props.input,
      data: formData,
    });
    return res;
  } finally {
    loading.value = false;
  }
};
</script>
<style lang="less">
.task-shortcut {
  width: 25px;
  height: 25px;
  border: 1px solid #e3e3e3;
  border-radius: 0 0 6px 6px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-top: 0;
  &:hover {
    background: #fff;
    border-color: #38a0fb;
  }
}
</style>

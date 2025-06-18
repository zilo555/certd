<template>
  <fs-button icon="mdi:format-list-group" type="link" text="修改定时" @click="openFormDialog"></fs-button>
</template>
<script setup lang="ts">
import * as api from "../api";
import { useFormWrapper } from "@fast-crud/fast-crud";

const props = defineProps<{
  selectedRowKeys: any[];
}>();

const emit = defineEmits<{
  change: any;
}>();
async function batchUpdateRequest(form: any) {
  await api.BatchUpdateTrigger(props.selectedRowKeys, {
    title: "定时触发",
    type: "timer",
    props: form.props,
  });
  emit("change");
}

const { openCrudFormDialog } = useFormWrapper();

async function openFormDialog() {
  const crudOptions: any = {
    columns: {
      "props.cron": {
        title: "定时",
        form: {
          component: {
            name: "cron-editor",
            vModel: "modelValue",
          },
          rules: [{ required: true, message: "请选择定时Cron" }],
        },
      },
    },
    form: {
      mode: "edit",
      //@ts-ignore
      async doSubmit({ form }) {
        await batchUpdateRequest(form);
      },
      col: {
        span: 22,
      },
      labelCol: {
        style: {
          width: "100px",
        },
      },
      wrapper: {
        title: "批量修改定时",
        width: 600,
      },
    },
  } as any;
  await openCrudFormDialog({ crudOptions });
}
</script>

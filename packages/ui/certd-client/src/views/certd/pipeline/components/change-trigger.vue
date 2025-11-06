<template>
  <fs-button icon="mdi:format-list-group" class="need-plus" type="link" :text="t('certd.editSchedule')" @click="openFormDialog"></fs-button>
</template>

<script setup lang="ts">
import { useFormWrapper } from "@fast-crud/fast-crud";
import * as api from "../api";
import { useSettingStore } from "/@/store/settings";
import { useI18n } from "/src/locales";
const { t } = useI18n();

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

const settingStore = useSettingStore();

async function openFormDialog() {
  settingStore.checkPlus();
  const crudOptions: any = {
    columns: {
      "props.cron": {
        title: t("certd.schedule"),
        form: {
          component: {
            name: "cron-editor",
            vModel: "modelValue",
          },
          rules: [{ required: true, message: t("certd.selectCron") }],
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
        title: t("certd.batchEditSchedule"),
        width: 600,
      },
    },
  } as any;
  await openCrudFormDialog({ crudOptions });
}
</script>

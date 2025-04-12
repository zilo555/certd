<template>
  <fs-form-wrapper v-if="formWrapperOptions" ref="formWrapperRef" />
</template>

<script lang="ts" setup>
import { useColumns } from "@fast-crud/fast-crud";
import createCrudOptions from "./crud.jsx";
import { ref } from "vue";
import { merge } from "lodash-es";
import { PluginGroup, usePluginStore } from "/@/store/plugin";
import { createNotificationApi } from "/@/views/certd/notification/api";

defineOptions({
  name: "PiCertdForm",
});

const formWrapperRef = ref();
const formWrapperOptions = ref();
const doSubmitRef = ref();
const pluginStore = usePluginStore();
async function buildFormOptions() {
  const pluginGroup = await pluginStore.getGroups();
  const pluginGroups: { [key: string]: PluginGroup } = pluginGroup.groups;
  const certPluginGroup = pluginGroups.cert;

  const certPlugins = [];
  for (const plugin of certPluginGroup.plugins) {
    const detail: any = await pluginStore.getPluginDefine(plugin.name);
    certPlugins.push(detail);
  }

  // 自定义表单配置
  const { buildFormOptions } = useColumns();
  //使用crudOptions结构来构建自定义表单配置
  let { crudOptions } = createCrudOptions(certPlugins, formWrapperRef);

  const formOptions = buildFormOptions(
    merge(crudOptions, {
      form: {
        async doSubmit({ form }: any) {
          // 创建certd 的pipeline
          await doSubmitRef.value({ form });

          if (form.email) {
            //创建一个默认的邮件通知
            const notificationApi = createNotificationApi();
            await notificationApi.GetOrCreateDefault({ email: form.email });
          }
        },
      },
    }) as any
  );

  formWrapperOptions.value = formOptions;
}
buildFormOptions();
function open(doSubmit: any) {
  doSubmitRef.value = doSubmit;
  formWrapperRef.value.open(formWrapperOptions.value);
}

defineExpose({
  open,
});
</script>

<style scoped></style>

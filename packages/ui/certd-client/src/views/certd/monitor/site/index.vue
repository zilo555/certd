<template>
  <fs-page>
    <template #header>
      <div class="title flex items-center">
        {{ t("certd.monitor.title") }}
        <div class="sub flex-1">
          <div>
            {{ t("certd.monitor.description") }}
            <router-link to="/certd/monitor/setting">{{ t("certd.monitor.settingLink") }}</router-link>
          </div>
          <div class="flex items-center">
            {{ t("certd.monitor.limitInfo") }}
            <vip-button class="ml-5" mode="nav"></vip-button>
          </div>
        </div>
      </div>
    </template>
    <fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
  </fs-page>
</template>

<script lang="ts" setup>
import { onActivated, onMounted } from "vue";
import { useFs } from "@fast-crud/fast-crud";
import createCrudOptions from "./crud";
import { siteInfoApi } from "./api";
import { Modal, notification } from "ant-design-vue";
import { useI18n } from "/src/locales";

const { t } = useI18n();
defineOptions({
  name: "SiteCertMonitor",
});
const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions, context: {} });

// 页面打开后获取列表数据
onMounted(() => {
  crudExpose.doRefresh();
});
onActivated(() => {
  crudExpose.doRefresh();
});
</script>

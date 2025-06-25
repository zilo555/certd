<template>
  <fs-page class="page-cert">
    <template #header>
      <div class="title">{{ t("certd.myPipelines") }}</div>
    </template>
    <fs-crud ref="crudRef" v-bind="crudBinding">
      <div v-if="selectedRowKeys.length > 0" class="batch-actions">
        <div class="batch-actions-inner">
          <span>{{ t("certd.selectedCount", { count: selectedRowKeys.length }) }}</span>
          <fs-button icon="ion:trash-outline" class="color-red" type="link" :text="t('certd.batchDelete')" @click="batchDelete"></fs-button>
          <fs-button icon="icon-park-outline:replay-music" class="need-plus" type="link" :text="t('certd.batchForceRerun')" @click="batchRerun"></fs-button>
          <change-group class="color-green" :selected-row-keys="selectedRowKeys" @change="batchFinished"></change-group>
          <change-notification class="color-green" :selected-row-keys="selectedRowKeys" @change="batchFinished"></change-notification>
          <change-trigger class="color-green" :selected-row-keys="selectedRowKeys" @change="batchFinished"></change-trigger>
        </div>
      </div>
      <template #actionbar-right> </template>
      <template #form-bottom>
        <div>{{ t("certd.applyCertificate") }}</div>
      </template>
    </fs-crud>
  </fs-page>
</template>


<script lang="ts" setup>
import { onActivated, onMounted, ref } from "vue";
import { dict, useFs } from "@fast-crud/fast-crud";
import createCrudOptions from "./crud";
import PiCertdForm from "./certd-form/index.vue";
import ChangeGroup from "./components/change-group.vue";
import ChangeTrigger from "./components/change-trigger.vue";
import { Modal, notification } from "ant-design-vue";
import * as api from "./api";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import ChangeNotification from "/@/views/certd/pipeline/components/change-notification.vue";

defineOptions({
  name: "PipelineManager",
});

const groupDictRef = dict({
  url: "/pi/pipeline/group/all",
  value: "id",
  label: "name",
});
const selectedRowKeys = ref([]);
const context: any = {
  groupDictRef,
  selectedRowKeys,
};
const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions, context });

// 页面打开后获取列表数据
onMounted(() => {
  crudExpose.doRefresh();
});

onActivated(async () => {
  await groupDictRef.reloadDict();
  await crudExpose.doRefresh();
});

function batchFinished() {
  crudExpose.doRefresh();
  selectedRowKeys.value = [];
}
function batchDelete() {
  Modal.confirm({
    title: "确认删除",
    content: "确定要删除选中的数据吗？",
    async onOk() {
      await api.BatchDelete(selectedRowKeys.value);
      notification.success({ message: "删除成功" });
      await crudExpose.doRefresh();
      selectedRowKeys.value = [];
    },
  });
}

function batchRerun() {
  Modal.confirm({
    title: "确认强制重新运行吗",
    content: "确定要强制重新运行选中流水线吗？(20条一批执行)",
    async onOk() {
      await api.BatchRerun(selectedRowKeys.value);
      notification.success({ message: "任务已提交" });
      await crudExpose.doRefresh();
      selectedRowKeys.value = [];
    },
  });
}
</script>
<style lang="less">
.batch-actions {
  position: absolute;
  z-index: 100;
  line-height: 40px;
  display: flex;
  align-items: center;
  height: 37.86px;
  width: 100%;
  overflow: hidden;
  margin-top: 1px;
  padding-left: 48px;
  pointer-events: none;

  .batch-actions-inner {
    pointer-events: auto;
    display: flex;
    align-items: center;
    width: 100%;
    background-color: #fafafa;
    padding-left: 10px;
  }
}
</style>

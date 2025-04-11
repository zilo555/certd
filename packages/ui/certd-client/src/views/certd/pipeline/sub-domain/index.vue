<template>
  <fs-page class="page-cert">
    <template #header>
      <div class="title">
        子域名托管
        <span class="sub"> 当你的域名设置了子域名托管，需要在此处创建记录，否则申请证书将失败 </span>
      </div>
    </template>
    <fs-crud ref="crudRef" v-bind="crudBinding">
      <template #pagination-left>
        <a-tooltip title="批量删除">
          <fs-button icon="DeleteOutlined" @click="handleBatchDelete"></fs-button>
        </a-tooltip>
      </template>
    </fs-crud>
  </fs-page>
</template>

<script lang="ts" setup>
import { onActivated, onMounted } from "vue";
import { useFs } from "@fast-crud/fast-crud";
import createCrudOptions from "./crud";
import { message, Modal } from "ant-design-vue";
import { DeleteBatch } from "./api";

defineOptions({
  name: "CnameRecord",
});
const { crudBinding, crudRef, crudExpose, context } = useFs({ createCrudOptions });

const selectedRowKeys = context.selectedRowKeys;
const handleBatchDelete = () => {
  if (selectedRowKeys.value?.length > 0) {
    Modal.confirm({
      title: "确认",
      content: `确定要批量删除这${selectedRowKeys.value.length}条记录吗`,
      async onOk() {
        await DeleteBatch(selectedRowKeys.value);
        message.info("删除成功");
        crudExpose.doRefresh();
        selectedRowKeys.value = [];
      },
    });
  } else {
    message.error("请先勾选记录");
  }
};

// 页面打开后获取列表数据
onMounted(() => {
  crudExpose.doRefresh();
});
onActivated(async () => {
  await crudExpose.doRefresh();
});
</script>
<style lang="less"></style>

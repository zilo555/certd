<template>
  <fs-page>
    <template #header>
      <div class="title flex items-center">
        站点证书监控
        <div class="sub flex-1">
          <div>每天0点，检查网站证书的过期时间，并发出提醒;</div>
          <div class="flex items-center">基础版限制1条，专业版无限制，当前<vip-button class="ml-5" mode="nav"></vip-button>，点击升级</div>
        </div>
      </div>
      <div class="more">
        <a-button type="primary" @click="checkAll">检查全部</a-button>
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
import { useSettingStore } from "/@/store/modules/settings";
defineOptions({
  name: "SiteCertMonitor"
});
const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions, context: {} });
const settingStore = useSettingStore();
function checkAll() {
  Modal.confirm({
    title: "确认",
    content: "确认触发检查全部站点证书吗?",
    onOk: async () => {
      await siteInfoApi.CheckAll();
      notification.success({
        message: "检查任务已提交",
        description: "请稍后刷新页面查看结果"
      });
    }
  });
}

// 页面打开后获取列表数据
onMounted(() => {
  crudExpose.doRefresh();
});
onActivated(() => {
  crudExpose.doRefresh();
});
</script>

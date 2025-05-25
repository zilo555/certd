<template>
  <fs-page class="page-user-settings page-site-monitor-setting">
    <template #header>
      <div class="title">站点监控设置</div>
    </template>
    <div class="user-settings-form settings-form">
      <a-form :model="formState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off">
        <a-form-item label="通知渠道" :name="['notificationId']">
          <div class="flex">
            <NotificationSelector v-model="formState.notificationId" />
          </div>
          <div class="helper">设置通知渠道</div>
        </a-form-item>
        <a-form-item label=" " :colon="false" :wrapper-col="{ span: 16 }">
          <loading-button type="primary" html-type="button" :click="doSave">保存</loading-button>
        </a-form-item>
      </a-form>
    </div>
  </fs-page>
</template>

<script setup lang="tsx">
import { reactive } from "vue";
import * as api from "./api";
import { UserSiteMonitorSetting } from "./api";
import { notification } from "ant-design-vue";
import { merge } from "lodash-es";
import { useSettingStore } from "/src/store/settings";
import NotificationSelector from "/@/views/certd/notification/notification-selector/index.vue";

const settingsStore = useSettingStore();
defineOptions({
  name: "UserSecurity",
});

const formState = reactive<Partial<UserSiteMonitorSetting>>({
  notificationId: 0,
});

async function loadUserSettings() {
  const data: any = await api.SiteMonitorSettingsGet();
  merge(formState, data);
}

loadUserSettings();
const doSave = async (form: any) => {
  await api.SiteMonitorSettingsSave({
    ...formState,
  });
  notification.success({
    message: "保存成功",
  });
};
</script>

<style lang="less">
.page-user-settings {
  .user-settings-form {
    width: 600px;
    margin: 20px;
  }
}
</style>

<template>
  <div class="sys-settings-form sys-settings-pipeline">
    <a-form :model="formState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off" @finish="onFinish">
      <a-form-item :label="t('certd.manageOtherUserPipeline')" :name="['public', 'managerOtherUserPipeline']">
        <a-switch v-model:checked="formState.public.managerOtherUserPipeline" />
      </a-form-item>
      <a-form-item :label="t('certd.limitUserPipelineCount')" :name="['public', 'limitUserPipelineCount']">
        <a-input-number v-model:value="formState.public.limitUserPipelineCount" />
        <div class="helper">{{ t("certd.limitUserPipelineCountHelper") }}</div>
      </a-form-item>
      <a-form-item :label="t('certd.sys.setting.pipelineValidTimeEnabled')" :name="['public', 'pipelineValidTimeEnabled']">
        <div class="flex items-center">
          <a-switch v-model:checked="formState.public.pipelineValidTimeEnabled" :disabled="!settingsStore.isPlus" />
          <vip-button class="ml-5" mode="button"></vip-button>
        </div>

        <div class="helper">{{ t("certd.sys.setting.pipelineValidTimeEnabledHelper") }}</div>
      </a-form-item>
      <a-form-item :label="t('certd.sys.setting.certDomainAddToMonitorEnabled')" :name="['public', 'certDomainAddToMonitorEnabled']">
        <div class="flex items-center">
          <a-switch v-model:checked="formState.public.certDomainAddToMonitorEnabled" :disabled="!settingsStore.isPlus" />
          <vip-button class="ml-5" mode="button"></vip-button>
        </div>
        <div class="helper">{{ t("certd.sys.setting.certDomainAddToMonitorEnabledHelper") }}</div>
      </a-form-item>

      <a-form-item :label="t('certd.sys.setting.fixedCertExpireDays')" :name="['public', 'fixedCertExpireDays']">
        <div class="flex items-center">
          <a-input-number v-model:value="formState.public.fixedCertExpireDays" />
          <vip-button class="ml-5" mode="button"></vip-button>
        </div>
        <div class="helper">{{ t("certd.sys.setting.fixedCertExpireDaysHelper") }}</div>
      </a-form-item>

      <a-form-item label=" " :colon="false" :wrapper-col="{ span: 8 }">
        <a-button :loading="saveLoading" type="primary" html-type="submit">{{ t("certd.saveButton") }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="tsx">
import { reactive, ref } from "vue";
import { SysSettings } from "/@/views/sys/settings/api";
import * as api from "/@/views/sys/settings/api";
import { merge } from "lodash-es";
import { useSettingStore } from "/@/store/settings";
import { notification } from "ant-design-vue";
import { useI18n } from "/src/locales";
const { t } = useI18n();

defineOptions({
  name: "SettingPipeline",
});

const formState = reactive<Partial<SysSettings>>({
  public: {},
  private: {},
});

async function loadSysSettings() {
  const data: any = await api.SysSettingsGet();
  merge(formState, data);
}

const saveLoading = ref(false);
loadSysSettings();
const settingsStore = useSettingStore();
const onFinish = async (form: any) => {
  try {
    saveLoading.value = true;

    await api.SysSettingsSave(form);
    await settingsStore.loadSysSettings();
    notification.success({
      message: t("certd.saveSuccess"),
    });
  } finally {
    saveLoading.value = false;
  }
};
</script>
<style lang="less"></style>

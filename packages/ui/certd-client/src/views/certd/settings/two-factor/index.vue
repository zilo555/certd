<template>
  <fs-page class="page-user-settings page-two-factor">
    <template #header>
      <div class="title">多重认证设置</div>
    </template>
    <div class="user-settings-form settings-form">
      <a-form :model="formState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off">
        <a-form-item label="Authenticator APP认证" :name="['authenticator', 'enabled']">
          <div class="flex">
            <a-switch v-model:checked="formState.authenticator.enabled" />

            <a-button v-if="formState.authenticator.enabled && formState.authenticator.verified" class="ml-1" type="primary" @click="authenticatorForm.open = true">修改</a-button>
          </div>

          <div class="helper">创建流水线时默认使用此定时时间</div>
        </a-form-item>
        <div v-if="authenticatorOpenRef" class="authenticator-config">
          <h3>1. 安装任意一款 Authenticator APP</h3>
          <div>比如：Microsoft Authenticator / Google Authenticator / Authy / Synology Secure SignIn 等</div>
          <h3>2. 扫描二维码添加账号</h3>
          <div v-if="authenticatorForm.qrcodeSrc" class="qrcode">
            <img style="width: 400px; height: 400px" :src="authenticatorForm.qrcodeSrc" />
          </div>
          <h3>3. 输入验证码</h3>
          <div>
            <a-input v-model:value="authenticatorForm.verifyCode" placeholder="请输入验证码" />
          </div>
          <div>
            <loading-button type="primary" html-type="button" :click="doAuthenticatorSave">确认</loading-button>
            <a-button class="ml-1" @click="authenticatorForm.open = false">取消</a-button>
          </div>
        </div>
      </a-form>
    </div>
  </fs-page>
</template>

<script setup lang="tsx">
import { computed, reactive, watch } from "vue";
import * as api from "./api";
import { UserTwoFactorSetting } from "./api";
import { notification } from "ant-design-vue";
import { merge } from "lodash-es";

defineOptions({
  name: "UserSettingsTwoFactor",
});

const formState = reactive<Partial<UserTwoFactorSetting>>({});

const authenticatorForm = reactive({
  qrcodeSrc: "",
  verifyCode: "",
  open: false,
});

const authenticatorOpenRef = computed(() => {
  return formState.authenticator.enabled && (authenticatorForm.open || !formState.authenticator.verified);
});
watch(
  () => {
    return authenticatorOpenRef.value;
  },
  async open => {
    if (open) {
      const data = await api.TwoFactorAuthenticatorGet();
      //base64 转图片
      authenticatorForm.qrcodeSrc = `data:image/png;base64,${data}`;
    } else {
      authenticatorForm.qrcodeSrc = "";
      authenticatorForm.verifyCode = "";
    }
  }
);

async function loadUserSettings() {
  const data: any = await api.TwoFactorSettingsGet();
  merge(formState, data);
}

loadUserSettings();
const doAuthenticatorSave = async (form: any) => {
  await api.TwoFactorAuthenticatorSave({
    verifyCode: authenticatorForm.verifyCode,
  });
  notification.success({
    message: "保存成功",
  });
};
</script>

<style lang="less">
.page-user-settings {
  .user-settings-form {
    width: 500px;
    margin: 20px;
  }
}
</style>

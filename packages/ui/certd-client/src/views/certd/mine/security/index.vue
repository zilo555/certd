<template>
  <fs-page class="page-user-settings page-two-factor">
    <template #header>
      <div class="title">认证安全设置</div>
    </template>
    <div class="user-settings-form settings-form">
      <a-form :model="formState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off">
        <a-form-item label="2FA多重验证登录" :name="['authenticator', 'enabled']">
          <div class="flex mt-5">
            <a-switch v-model:checked="formState.authenticator.enabled" :disabled="!settingsStore.isPlus" @change="onAuthenticatorEnabledChanged" />

            <a-button
              v-if="formState.authenticator.enabled && formState.authenticator.verified"
              :disabled="authenticatorOpenRef || !settingsStore.isPlus"
              size="small"
              class="ml-5"
              type="primary"
              @click="authenticatorForm.open = true"
            >
              重新绑定
            </a-button>

            <vip-button class="ml-5" mode="button"></vip-button>
          </div>

          <div class="helper">是否开启多重验证登录</div>
        </a-form-item>
        <a-form-item v-if="authenticatorOpenRef" label="绑定设备" class="authenticator-config">
          <h3 class="font-bold m-5">1. 安装任意一款支持Authenticator的验证APP，比如：</h3>
          <div class="ml-20">
            <ul>
              <li>
                <a-tooltip title="如果报没有找到谷歌服务的错误，您可以安装KK谷歌助手">
                  <a href="https://appgallery.huawei.com/app/C100262999" target="_blank"> Microsoft Authenticator</a>
                </a-tooltip>
              </li>
              <li>
                <a href="https://sj.qq.com/appdetail/com.tencent.authenticator" target="_blank">腾讯身份验证器</a>
              </li>
              <li>
                <a href="https://www.synology.cn/zh-cn/dsm/feature/authentication" target="_blank">群晖身份验证器</a>
              </li>
              <li>
                <a-tooltip title="如果报没有找到谷歌服务的错误，您可以安装KK谷歌助手">
                  <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank">Google Authenticator</a>
                </a-tooltip>
              </li>
              <li>
                <a href="https://play.google.com/store/apps/details?id=com.authy.authy" target="_blank">Authy</a>
              </li>
            </ul>
          </div>
          <h3 class="font-bold m-10">2. 扫描二维码添加账号</h3>
          <div v-if="authenticatorForm.qrcodeSrc" class="qrcode">
            <div class="ml-20">
              <img class="full-w" :src="authenticatorForm.qrcodeSrc" />
            </div>
          </div>
          <h3 class="font-bold m-10">3. 输入验证码</h3>
          <div class="ml-20">
            <a-input v-model:value="authenticatorForm.verifyCode" placeholder="请输入验证码" />
          </div>
          <div class="ml-20 flex mt-10">
            <loading-button type="primary" html-type="button" :click="doAuthenticatorSave">确认</loading-button>
            <a-button class="ml-1" @click="authenticatorForm.open = false">取消</a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </fs-page>
</template>

<script setup lang="tsx">
import { computed, reactive, watch } from "vue";
import * as api from "./api";
import { UserTwoFactorSetting } from "./api";
import { Modal, notification } from "ant-design-vue";
import { merge } from "lodash-es";
import { useSettingStore } from "/@/store/settings";
const settingsStore = useSettingStore();
defineOptions({
  name: "UserSecurity",
});

const formState = reactive<Partial<UserTwoFactorSetting>>({
  authenticator: {
    enabled: false,
    verified: false,
  },
});

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
      //base64 转图片
      authenticatorForm.qrcodeSrc = await api.TwoFactorAuthenticatorGet();
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
  authenticatorForm.open = false;
};

function onAuthenticatorEnabledChanged(value: any) {
  if (!value) {
    //要关闭
    if (formState.authenticator.verified) {
      Modal.confirm({
        title: "确认",
        content: `确定要关闭多重验证登录吗？`,
        async onOk() {
          await api.TwoFactorAuthenticatorOff();
          notification.success({
            message: "关闭成功",
          });
          loadUserSettings();
        },
        onCancel() {
          formState.authenticator.enabled = true;
        },
      });
    }
  }
}
</script>

<style lang="less">
.page-user-settings {
  .user-settings-form {
    width: 600px;
    margin: 20px;
  }
}
</style>

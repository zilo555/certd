<template>
  <div class="sys-settings-form sys-settings-safe">
    <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off">
      <h2>站点隐藏</h2>
      <a-form-item label="启用站点隐藏" :name="['hidden', 'enabled']" :required="true">
        <div class="flex">
          <a-switch v-model:checked="formState.hidden.enabled" />
        </div>

        <div class="helper">
          可以在平时关闭站点的可访问性，需要时再打开，增强站点安全性
          <a href="https://certd.docmirror.cn/guide/feature/safe/hidden" class="flex items-center" target="_blank">
            <span>帮助说明</span>
            <fs-icon class="ml-1" icon="mingcute:question-line"></fs-icon
          ></a>
        </div>
      </a-form-item>
      <a-form-item v-if="formState.hidden.enabled" label="随机地址" :name="['hidden', 'openPath']" :required="true">
        <a-input-search v-model:value="formState.hidden.openPath" :allow-clear="true" @search="changeOpenPath">
          <template #enterButton>
            <fs-icon icon="ion:refresh"></fs-icon>
          </template>
        </a-input-search>
        <div class="helper">站点被隐藏后，需要访问此URL解锁，才能正常访问</div>
      </a-form-item>
      <a-form-item v-if="formState.hidden.enabled" label="完整解除隐藏地址" :name="['hidden', 'openPath']" :required="true">
        <div class="flex"><fs-copyable v-model="openUrl" class="flex-inline"></fs-copyable></div>
        <div class="helper red">请保存好此地址</div>
      </a-form-item>
      <a-form-item v-if="formState.hidden.enabled" label="解除密码" :name="['hidden', 'openPassword']" :required="false">
        <a-input-password v-model:value="formState.hidden.openPassword" :allow-clear="true" />
        <div class="helper">解除隐藏时需要输入密码，第一次需要设置密码，填写则重置密码</div>
      </a-form-item>
      <a-form-item v-if="formState.hidden.enabled" label="自动隐藏时间" :name="['hidden', 'autoHiddenTimes']" :required="true">
        <a-input-number v-model:value="formState.hidden.autoHiddenTimes" :allow-clear="true" />
        <div class="helper">多少分钟内无请求自动隐藏</div>
      </a-form-item>
      <a-form-item v-if="formState.hidden.enabled" label="隐藏开放接口" :name="['hidden', 'hiddenOpenApi']" :required="true">
        <a-switch v-model:checked="formState.hidden.hiddenOpenApi" />
        <div class="helper">是否隐藏开放接口，是否放开/api/v1开头的接口</div>
      </a-form-item>
      <a-form-item v-if="formState.hidden.enabled" label="立即隐藏站点">
        <loading-button class="ml-1" type="primary" html-type="button" :click="doHiddenImmediate">立即隐藏</loading-button>
      </a-form-item>
      <a-form-item label=" " :colon="false" :wrapper-col="{ span: 16 }">
        <loading-button type="primary" html-type="button" :click="onClick">保存</loading-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="tsx">
import { computed, reactive, ref } from "vue";
import { merge } from "lodash-es";
import { Modal, notification } from "ant-design-vue";
import { request } from "/@/api/service";
import { util, utils } from "/@/utils";
import { useSettingStore } from "/@/store/settings";
defineOptions({
  name: "SettingSafe",
});
const settingsStore = useSettingStore();
const api = {
  async SettingGet() {
    return await request({
      url: "/sys/settings/safe/get",
      method: "post",
    });
  },
  async SettingSave(data: any) {
    return await request({
      url: "/sys/settings/safe/save",
      method: "post",
      data,
    });
  },
  async HiddenImmediate() {
    return await request({
      url: "/sys/settings/safe/hidden",
      method: "post",
    });
  },
};

const defaultState = {
  hidden: {
    enabled: false,
    autoHiddenTimes: 5,
    hiddenOpenApi: false,
  },
};
const formRef = ref<any>(defaultState);
type SiteHidden = {
  enabled: boolean;
  openPath?: string;
  autoHiddenTimes?: number;
  openPassword?: string;
  hiddenOpenApi?: boolean;
};

const formState = reactive<
  Partial<{
    hidden: SiteHidden;
  }>
>({
  hidden: { enabled: false },
});

function changeOpenPath() {
  formState.hidden.openPath = util.randomString(16);
}

async function loadSettings() {
  const data: any = await api.SettingGet();
  merge(formState, defaultState, formState, data);
  if (!formState.hidden.openPath) {
    changeOpenPath();
  }
}

loadSettings();

const openUrl = computed(() => {
  const url = new URL(window.location.href);
  url.pathname = `/api/unhidden/${formState.hidden?.openPath || ""}`;
  //@ts-ignore
  url.query = undefined;
  url.hash = "";
  return url.href;
});

const onClick = async () => {
  const form = await formRef.value.validateFields();
  //密码md5
  // if (form.hidden?.openPassword) {
  //   form.hidden.openPassword = util.hash.md5(form.hidden.openPassword);
  // }
  await api.SettingSave(form);
  await loadSettings();
  notification.success({
    message: "保存成功",
  });
};

async function doHiddenImmediate() {
  Modal.confirm({
    title: "确定要立即隐藏站点吗？",
    content: "隐藏后，将无法访问站点，请谨慎操作",
    async onOk() {
      await api.HiddenImmediate();
      notification.success({
        message: "站点已隐藏",
      });
    },
  });
}
</script>
<style lang="less">
.sys-settings-base {
}
</style>

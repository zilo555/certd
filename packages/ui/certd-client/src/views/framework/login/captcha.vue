<template>
  <div class="captcha"></div>
</template>
<script setup lang="ts">
import { doRequest } from "/@/components/plugins/lib";
import { createAddonApi } from "/src/api/modules/addon";
import { useSettingStore } from "/@/store/settings";
const props = defineProps<{
  modelValue?: any;
}>();
const emit = defineEmits(["update:modelValue", "change"]);

const addonApi = createAddonApi();
const settingStore = useSettingStore();
async function getCaptchaAddonDefine() {
  const type = settingStore.public.captchaType;
  const define = addonApi.getDefineByType("captcha", type);

  const res = await doRequest(
    {
      addonId: settingStore.public.captchaAddonId
      type: "captcha",
      typeName: type,
      action: "onGetParams",
    },
  );
}

function init() {
  // @ts-ignore
  initGeetest4(
    {
      captchaId: "您的captchaId",
    },
    (captcha: any) => {
      // captcha为验证码实例
      captcha.appendTo(".captcha"); // 调用appendTo将验证码插入到页的某一个元素中，这个元素用户可以自定义
    }
  );
}

function onChange(value: string) {
  emit("update:modelValue", value);
  emit("change", value);
}
</script>

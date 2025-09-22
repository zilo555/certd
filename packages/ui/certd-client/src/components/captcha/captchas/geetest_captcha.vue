<template>
  <div ref="captchaRef" class="geetest_captcha_wrapper"></div>
</template>
<script setup lang="ts">
import { onMounted, defineProps, defineEmits, ref, onUnmounted } from "vue";
import { useSettingStore } from "/@/store/settings";
import { request } from "/src/api/service";
import { notification } from "ant-design-vue";

defineOptions({
  name: "GeetestCaptcha",
});
const emit = defineEmits(["update:modelValue", "change"]);
const props = defineProps<{
  captchaGet: () => Promise<any>;
}>();
const captchaRef = ref(null);
// const addonApi = createAddonApi();
const settingStore = useSettingStore();

const captchaInstanceRef = ref({});
async function init() {
  // if (!initGeetest4) {
  //   await import("https://static.geetest.com/v4/gt4.js");
  // }

  const { captchaId } = await props.captchaGet();
  // @ts-ignore
  initGeetest4(
    {
      captchaId: captchaId,
    },
    (captcha: any) => {
      // captcha为验证码实例
      captcha.appendTo(captchaRef.value); // 调用appendTo将验证码插入到页的某一个元素中，这个元素用户可以自定义
      captchaInstanceRef.value.instance = captcha;
      captchaInstanceRef.value.captchaId = captchaId;
    }
  );
}

function getCaptchaForm() {
  if (!captchaInstanceRef.value?.instance) {
    // notification.error({
    //   message: "验证码还未初始化",
    // });
    return false;
  }
  const result = captchaInstanceRef.value.instance.getValidate();
  if (!result) {
    // notification.error({
    //   message: "请先完成验证码验证",
    // });
    return false;
  }
  result.captcha_id = captchaInstanceRef.value.captchaId;

  return result;
}

const valueRef = ref(null);
const timeoutId = setInterval(() => {
  const form = getCaptchaForm();
  if (form && valueRef.value != form) {
    console.log("form", form);
    valueRef.value = form;
    emitChange(form);
  }
}, 1000);

onUnmounted(() => {
  clearTimeout(timeoutId);
});

function emitChange(value: string) {
  emit("update:modelValue", value);
  emit("change", value);
}

defineExpose({
  getCaptchaForm,
});

onMounted(async () => {
  await init();
});
</script>
<style lang="less">
.geetest_captcha_wrapper {
  .geetest_captcha {
    .geetest_holder {
      width: 100%;
    }
  }
}
</style>

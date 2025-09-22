<template>
  <div class="flex">
    <a-input :value="valueRef" placeholder="请输入图片验证码" autocomplete="off" @update:value="onChange">
      <template #prefix>
        <fs-icon icon="ion:image-outline"></fs-icon>
      </template>
    </a-input>
    <div class="input-right pointer" title="点击刷新">
      <img class="image-code" :src="imageCodeSrc" @click="resetImageCode" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineEmits, defineExpose, defineProps, ref } from "vue";
import { nanoid } from "nanoid";

const props = defineProps<{
  captchaGet?: () => Promise<any>;
}>();
defineOptions({
  name: "ImageCaptcha",
});
const emit = defineEmits(["update:modelValue", "change"]);

const valueRef = ref("");
const randomStrRef = ref();
const imageCodeSrc = ref();
async function resetImageCode() {
  const res = await props.captchaGet();
  randomStrRef.value = res.randomStr;
  valueRef.value = "";
  emitChange(null);
  imageCodeSrc.value = "data:image/svg+xml," + encodeURIComponent(res.imageData);
}

function getCaptchaForm() {
  return {
    imageCode: valueRef.value,
    randomStr: randomStrRef.value,
  };
}
defineExpose({
  resetImageCode,
  getCaptchaForm,
});

resetImageCode();

function onChange(value: string) {
  valueRef.value = value;
  const form = getCaptchaForm();
  emitChange(form);
}

function emitChange(value) {
  emit("update:modelValue", value);
  emit("change", value);
}
</script>

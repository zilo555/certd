<template>
  <AConfigProvider :locale="locale" :theme="tokenTheme">
    <FsFormProvider>
      <contextHolder />
      <router-view />
    </FsFormProvider>
  </AConfigProvider>
</template>

<script lang="ts" setup>
import { computed, onMounted, provide, ref } from "vue";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";
import dayjs from "dayjs";
import { usePreferences, preferences } from "/@/vben/preferences";
import { useAntdDesignTokens } from "/@/vben/hooks";
import { theme } from "ant-design-vue";
import AConfigProvider from "ant-design-vue/es/config-provider";
import { Modal } from "ant-design-vue";
import MaxKBChat from "/@/components/ai/index.vue";
import { util } from "/@/utils";
import { useSettingStore } from "/@/store/settings";
defineOptions({
  name: "App",
});
const [modal, contextHolder] = Modal.useModal();
provide("modal", modal);


const { isDark } = usePreferences();
const { tokens } = useAntdDesignTokens();

const tokenTheme = computed(() => {
  const algorithm = isDark.value ? [theme.darkAlgorithm] : [theme.defaultAlgorithm];

  // antd 紧凑模式算法
  if (preferences.app.compact) {
    algorithm.push(theme.compactAlgorithm);
  }

  return {
    algorithm,
    token: tokens,
  };
});

</script>

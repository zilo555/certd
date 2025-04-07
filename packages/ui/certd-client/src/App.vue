<template>
  <AConfigProvider :locale="locale" :theme="tokenTheme">
    <FsFormProvider>
      <contextHolder />
      <router-view />
    </FsFormProvider>
  </AConfigProvider>
</template>

<script lang="ts" setup>
import zhCN from "ant-design-vue/es/locale/zh_CN";
import enUS from "ant-design-vue/es/locale/en_US";
import { computed, provide, ref } from "vue";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";
import dayjs from "dayjs";
import { usePreferences, preferences } from "/@/vben/preferences";
import { useAntdDesignTokens } from "/@/vben/hooks";
import { theme } from "ant-design-vue";
import AConfigProvider from "ant-design-vue/es/config-provider";
import { Modal } from "ant-design-vue";

defineOptions({
  name: "App",
});
const [modal, contextHolder] = Modal.useModal();
provide("modal", modal);
//刷新页面方法
const locale = ref(zhCN);
async function reload() {}
localeChanged("zh-cn");
provide("fn:router.reload", reload);
provide("fn:locale.changed", localeChanged);
//刷新页面方法
function localeChanged(value: any) {
  console.log("locale changed:", value);
  if (value === "zh-cn") {
    locale.value = zhCN;
    dayjs.locale("zh-cn");
  } else if (value === "en") {
    locale.value = enUS;
    dayjs.locale("en");
  }
}
localeChanged("zh-cn");
provide("fn:router.reload", reload);
provide("fn:locale.changed", localeChanged);

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
//其他初始化
// const resourceStore = useResourceStore();
// resourceStore.init();
// const pageStore = usePageStore();
// pageStore.init();
// const settingStore = useSettingStore();
// settingStore.init();
</script>

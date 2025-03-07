<template>
  <div class="flex flex-between w-full text-sm p-5 bg-neutral-100 dark:bg-neutral-900">
    <div class="flex items-center">
      <span v-if="!settingStore.isComm">
        <span>Powered by</span>
        <a> handsfree.work </a>
      </span>

      <template v-if="siteInfo.licenseTo">
        <a-divider type="vertical" />
        <a :href="siteInfo.licenseToUrl || ''">{{ siteInfo.licenseTo }}</a>
      </template>

      <template v-if="sysPublic.icpNo">
        <a-divider type="vertical" />
        <span>
          <a href="https://beian.miit.gov.cn/" target="_blank">{{ sysPublic.icpNo }}</a>
        </span>
      </template>
    </div>
    <div class="ml-5">v{{ version }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useSettingStore } from "/@/store/modules/settings";

defineOptions({
  name: "PageFooter"
});
const version = ref(import.meta.env.VITE_APP_VERSION);

const settingStore = useSettingStore();

const sysPublic = computed(() => {
  return settingStore.sysPublic;
});
const siteInfo = computed(() => {
  return settingStore.siteInfo;
});
</script>

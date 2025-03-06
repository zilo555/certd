<script lang="ts" setup>
import { BasicLayout, LockScreen, UserDropdown } from "/@/vben/layouts";

import { computed, onErrorCaptured, onMounted } from "vue";
import { preferences } from "/@/vben/preferences";
import { useAccessStore } from "/@/vben/stores";
import { useUserStore } from "/@/store/modules/user";
import VipButton from "/@/components/vip-button/index.vue";
import TutorialButton from "/@/components/tutorial/index.vue";
import { useSettingStore } from "/@/store/modules/settings";
import Footer from "./components/footer/index.vue";
const userStore = useUserStore();
const accessStore = useAccessStore();

const menus = computed(() => [
  // {
  //   handler: () => {
  //     openWindow(VBEN_DOC_URL, {
  //       target: "_blank"
  //     });
  //   },
  //   icon: BookOpenText,
  //   text: $t("ui.widgets.document")
  // }
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await userStore.logout(true);
}

const settingStore = useSettingStore();

const sysPublic = computed(() => {
  return settingStore.sysPublic;
});
const siteInfo = computed(() => {
  return settingStore.siteInfo;
});

onErrorCaptured((e) => {
  console.error("ErrorCaptured:", e);
  // notification.error({ message: e.message });
  //阻止错误向上传递
  return false;
});

onMounted(async () => {
  await settingStore.checkUrlBound();
});
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown :avatar :menus :text="userStore.userInfo?.nickName" description="development@handsfree.work" tag-text="Pro" @logout="handleLogout" />
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
    <template #header-right-0>
      <div class="hover:bg-accent ml-1 mr-2 cursor-pointer rounded-full p-1.5 pl-3 pr-3">
        <tutorial-button v-if="!settingStore.isComm" class="flex-center header-btn" />
      </div>
      <div class="hover:bg-accent ml-1 mr-2 cursor-pointer rounded-full p-1.5 pl-3 pr-3">
        <vip-button class="flex-center header-btn" mode="nav" />
      </div>
    </template>
    <template #footer>
      <Footer></Footer>
    </template>
  </BasicLayout>
</template>

<style lang="less">
.header-btn {
  font-size: 14px;
}
</style>

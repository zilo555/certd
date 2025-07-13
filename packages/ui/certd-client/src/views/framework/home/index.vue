<template>
  <fs-page class="home—index bg-neutral-100 dark:bg-black">
    <!--    <page-content />-->
    <dashboard-user />
    <change-password-button ref="changePasswordButtonRef" :show-button="false"></change-password-button>
  </fs-page>
</template>

<script lang="ts" setup>
import DashboardUser from "./dashboard/index.vue";
import { useUserStore } from "/@/store/user";
import ChangePasswordButton from "/@/views/certd/mine/change-password-button.vue";
import { onMounted, ref } from "vue";
import { Modal } from "ant-design-vue";
import { useI18n } from "/src/locales";

const { t } = useI18n();

const userStore = useUserStore();
const changePasswordButtonRef = ref();
onMounted(() => {
  if (userStore.getUserInfo.isWeak === true) {
    Modal.info({
      title: t("authentication.title"),
      content: t("authentication.weakPasswordWarning"),
      onOk: () => {
        changePasswordButtonRef.value.open({
          password: "123456",
        });
      },
      okText: t("authentication.changeNow"),
    });
  }
});
</script>
<style lang="less">
.home—index {
}
</style>

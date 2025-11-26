<template>
  <div class="oauth-footer">
    <div v-for="item in oauthList" :key="item.type">
      <div class="oauth-icon-button pointer" @click="goOauthLogin(item.type)">
        <el-icon :icon="item.icon" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import * as api from "./api";

const oauthList = ref([
  {
    name: "OIDC",
    type: "oidc",
    icon: "ion:oidc",
  },
]);

async function goOauthLogin(type: string) {
  //获取第三方登录URL
  const res = await api.OauthLogin(type);
  const loginUrl = res.loginUrl;
  window.location.href = loginUrl;
}
</script>
<style lang="less">
.oauth-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  .oauth-icon-button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 100px;
  }
}
</style>

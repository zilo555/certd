<template>
  <div class="oauth-footer relative">
    <div class="oauth-title">
      <div class="oauth-title-text">其他方式登录</div>
    </div>
    <div v-for="item in oauthList" :key="item.type">
      <div class="oauth-icon-button pointer" @click="goOauthLogin(item.name)">
        <div><fs-icon :icon="item.icon" class="text-blue-600 text-40" /></div>
        <div>{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as api from "./api";

const oauthList = ref([]);

onMounted(async () => {
  oauthList.value = await api.GetOauthProviders();
});

async function goOauthLogin(type: string) {
  //获取第三方登录URL
  const res = await api.OauthLogin(type);
  const loginUrl = res.loginUrl;
  window.location.href = loginUrl;
}
</script>
<style lang="less">
.oauth-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;

  .oauth-title {
    width: 100%;
    font-size: 14px;
    font-weight: 500;
    color: #8c8c8c;
    position: relative;
    .oauth-title-text {
      position: relative;
      z-index: 1;
      text-align: center;
      &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        width: 36%;
        height: 0.5px;
        background-color: #8c8c8c;
      }
      &::before {
        content: "";
        position: absolute;
        top: 50%;
        right: 0;
        width: 36%;
        height: 0.5px;
        background-color: #8c8c8c;
      }
    }
  }

  .oauth-icon-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 8px 8px;
    border-radius: 100px;
    .fs-icon {
      font-size: 36px;
      color: #006be6 !important;
    }
  }
}
</style>

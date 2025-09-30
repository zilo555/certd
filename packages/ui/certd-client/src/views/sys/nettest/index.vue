<template>
  <fs-page class="page-sys-nettest">
    <template #header>
      <div class="title">网络测试</div>
    </template>
    <div class="nettest-container">
      <!-- 服务端信息 -->
      <server-info-card />
      
      <!-- 测试区域 -->
      <div class="test-areas">
        <!-- 用户输入域名测试 -->
        <domain-test-card class="w-50%" />

        <!-- 百度域名测试 (用于对比) -->
        <domain-test-card class="w-50%" :domain="'baidu.com'" :port="443" :auto-start="true" />
      </div>
    </div>
  </fs-page>
</template>

<script lang="ts" setup>
import DomainTestCard from "./DomainTestCard.vue";
import ServerInfoCard from "./ServerInfoCard.vue";
</script>

<style lang="less">
.page-sys-nettest {
  .nettest-container {
    padding: 16px;
    background-color: #fff;
  }

  .test-areas {
    display: flex;
    gap: 16px;
    margin-top: 16px;
  }
}
</style>

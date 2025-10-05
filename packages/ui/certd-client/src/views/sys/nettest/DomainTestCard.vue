<template>
  <div class="domain-test-card">
    <div class="card-header">
      <a-form v-if="editing" layout="inline" :model="formData">
        <a-form-item label="域名">
          <a-input v-model:value="formData.domain" placeholder="请输入要测试的域名或IP" style="width: 240px" />
        </a-form-item>
        <a-form-item label="端口">
          <a-input-number v-model:value="formData.port" placeholder="请输入端口" :min="1" :max="65535" style="width: 120px" />
        </a-form-item>
      </a-form>

      <div v-else class="domain-info">
        <span>域名: {{ formData.domain }}</span>
        <span>端口: {{ formData.port }}</span>
      </div>

      <a-button :disabled="!formData.domain" size="small" type="primary" :loading="loading" @click="runAllTests"> 开始测试 </a-button>
    </div>

    <div class="card-content">
      <div class="test-results">
        <!-- 域名解析结果 -->
        <test-case ref="domainResolveRef" title="域名解析" :test-method="() => createDomainResolveMethod()" :disabled="!getCurrentDomain()" />

        <!-- Ping测试结果 -->
        <test-case ref="pingTestRef" title="Ping测试" :test-method="() => createPingTestMethod()" :disabled="!getCurrentDomain()" />

        <!-- Telnet测试结果 -->
        <test-case ref="telnetTestRef" title="Telnet测试" :port="getCurrentPort()" :test-method="() => createTelnetTestMethod()" :disabled="!getCurrentDomain() || !getCurrentPort()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { DomainResolve, PingTest, TelnetTest } from "./api";
import TestCase from "./TestCase.vue";

// 组件属性
const props = defineProps<{
  domain?: string;
  port?: number;
  autoStart?: boolean;
}>();

const editing = ref(!props.domain);

// 测试组件的引用
const domainResolveRef = ref();
const pingTestRef = ref();
const telnetTestRef = ref();

// 表单数据
const formData = reactive({
  domain: props.domain || "",
  port: props.port || 443,
});

// 加载状态
const loading = ref(false);

// 创建域名解析测试方法
const createDomainResolveMethod = async () => {
  const domain = getCurrentDomain();
  return DomainResolve(domain);
};

// 创建Ping测试方法
const createPingTestMethod = async () => {
  const domain = getCurrentDomain();
  return PingTest(domain);
};

// 创建Telnet测试方法
const createTelnetTestMethod = async () => {
  const domain = getCurrentDomain();
  const port = getCurrentPort();

  return TelnetTest(domain, port);
};

// 获取当前使用的域名
const getCurrentDomain = () => {
  return formData.domain;
};

// 获取当前使用的端口
const getCurrentPort = () => {
  return formData.port;
};

// 运行全部测试
async function runAllTests() {
  const domain = getCurrentDomain();

  // 检查是否有域名
  if (!domain) {
    message.error("请输入域名");
    return;
  }

  loading.value = true;

  // 通过组件引用调用测试方法
  try {
    await Promise.allSettled([domainResolveRef.value?.test(), pingTestRef.value?.test(), telnetTestRef.value?.test()]);
  } catch (error) {
    message.error("部分测试执行失败，请查看详细结果");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (props.autoStart) {
    runAllTests();
  }
});
</script>

<style lang="less" scoped>
.domain-test-card {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.card-content {
  padding: 16px;
}

.input-form {
  margin-bottom: 12px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

.domain-info {
  padding: 5.5px 12px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.test-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.test-results {
  margin-top: 0px;
}

/* 调整按钮大小 */
.ant-btn {
  font-size: 12px;
  padding: 2px 8px;
  height: 24px;
}
</style>

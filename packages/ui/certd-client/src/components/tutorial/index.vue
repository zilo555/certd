<script setup lang="ts">
import { ref } from "vue";
import TutorialSteps from "/@/components/tutorial/tutorial-steps.vue";

const props = defineProps<{
  showIcon?: boolean;
}>();

const openedRef = ref(false);
function open() {
  openedRef.value = true;
}
const slots = defineSlots();
</script>

<template>
  <div class="tutorial-button pointer" @click="open">
    <template v-if="!slots.default">
      <fs-icon
        v-if="showIcon === false"
        icon="ant-design:question-circle-outlined"
        class="mr-0.5"
      ></fs-icon>
      <div class="hidden md:block">{{$t('tutorial.title')}}</div>
    </template>
    <slot></slot>
    <a-modal v-model:open="openedRef" class="tutorial-modal" width="90%">
      <template #title>{{$t('tutorial.title')}}</template>
      <tutorial-steps v-if="openedRef" />
      <template #footer></template>
    </a-modal>
  </div>
</template>


<style lang="less">
.tutorial-modal {
  top: 50px;
  .ant-modal-body {
    height: 80vh;
  }
}
</style>

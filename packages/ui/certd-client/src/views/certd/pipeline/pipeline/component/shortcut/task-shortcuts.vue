<template>
  <div class="task-shortcuts">
    <TaskShortcut v-for="(item, index) of shortcuts" :key="index" v-bind="item" />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import * as pluginApi from "/@/views/certd/pipeline/api.plugin";
import TaskShortcut from "./task-shortcut.vue";

defineOptions({
  name: "TaskShortcuts",
});

const props = defineProps<{
  task: any;
}>();

watch(
  () => props.task,
  value => {
    init();
  },
  { immediate: true }
);

const shortcuts = ref([]);
async function init() {
  const steps = props.task?.steps || [];
  if (steps.length === 0) {
    return;
  }
  const list = [];
  for (const step of steps) {
    const stepType = step.type;
    const pluginDefine = await pluginApi.GetPluginDefine(stepType);
    if (pluginDefine.shortcut) {
      for (const key in pluginDefine.shortcut) {
        const shortcut = pluginDefine.shortcut[key];
        list.push({
          ...shortcut,
          pluginName: stepType,
          input: step.input,
        });
      }
    }
  }
  shortcuts.value = list;
}
</script>

<template>
  <a-steps :current="3" class="mt-10" size="small" :items="steps" @click="goPipeline"></a-steps>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

type Step = {
  title: string;
  description?: string;
};

import { ref } from "vue";

const steps = ref<Step[]>([
  { title: t('certd.steps.createPipeline') },
  { title: t('certd.steps.addTask') },
  { title: t('certd.steps.scheduledRun') }
]);

const router = useRouter();
function goPipeline() {
  router.push({ path: "/certd/pipeline" });
}
</script>

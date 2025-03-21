<template>
  <div class="cert-info-updater w-full flex items-center">
    <div class="flex-o">
      <a-tag>{{ domain }}</a-tag>
      <fs-button type="primary" size="small" class="ml-1" icon="ion:upload" text="更新证书" @click="onUploadClick" />
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { computed, inject } from "vue";
import { useCertUpload } from "./use";
import { getAllDomainsFromCrt } from "/@/views/certd/pipeline/utils";

defineOptions({
  name: "CertInfoUpdater",
});

const props = defineProps<{
  modelValue?: { crt: string; key: string };
  type?: string;
  placeholder?: string;
  size?: string;
  disabled?: boolean;
}>();
const emit = defineEmits(["updated", "update:modelValue"]);

const { openUpdateCertDialog } = useCertUpload();

const domain = computed(() => {
  if (!props.modelValue?.crt) {
    return "";
  }
  const domains = getAllDomainsFromCrt(props.modelValue?.crt);

  return domains[0];
});

function onUpdated(res: { uploadCert: any }) {
  debugger;
  emit("update:modelValue", res.uploadCert);
  const domains = getAllDomainsFromCrt(res.uploadCert.crt);
  emit("updated", { domains });
}

const pipeline: any = inject("pipeline");
function onUploadClick() {
  debugger;
  openUpdateCertDialog({
    onSubmit: onUpdated,
  });
}
</script>
<style lang="less">
.cert-info-selector {
  width: 100%;
}
</style>

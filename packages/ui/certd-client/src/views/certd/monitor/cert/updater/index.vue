<template>
  <div class="cert-info-updater w-full flex items-center">
    <div class="flex-o">
      <fs-values-format :model-value="modelValue" :dict="certInfoDict" />
      <fs-button v-if="modelValue" type="primary" size="small" class="ml-1" icon="ion:upload" text="更新证书" @click="onUploadClick" />
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { inject } from "vue";
import { dict } from "@fast-crud/fast-crud";
import { certInfoApi } from "../api";
import { useCertUpload } from "/@/views/certd/pipeline/cert-upload/use";

defineOptions({
  name: "CertInfoUpdater",
});

const props = defineProps<{
  modelValue?: number | string;
  type?: string;
  placeholder?: string;
  size?: string;
  disabled?: boolean;
}>();
const emit = defineEmits(["updated"]);

const certInfoDict = dict({
  value: "id",
  label: "domain",
  getNodesByValues: async (values: any[]) => {
    const res = await certInfoApi.GetOptionsByIds(values);
    if (res.length > 0) {
      emit("updated", {
        domains: res[0].domains,
      });
    }
    return res;
  },
});

const { openUpdateCertDialog } = useCertUpload();
function onUpdated(res: any) {
  emit("updated", res);
}
function onUploadClick() {
  openUpdateCertDialog(props.modelValue, onUpdated);
}
</script>
<style lang="less">
.cert-info-selector {
  width: 100%;
}
</style>

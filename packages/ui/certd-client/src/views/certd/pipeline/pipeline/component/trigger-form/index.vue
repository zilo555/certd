<template>
  <a-drawer v-model:open="triggerDrawerVisible" placement="right" :closable="true" width="650px" class="pi-trigger-form" @after-open-change="triggerDrawerOnAfterVisibleChange">
    <template #title>
      <div>
        {{ t("certd.editTrigger") }}
        <a-button v-if="mode === 'edit'" @click="triggerDelete()">
          <template #icon>
            <DeleteOutlined />
          </template>
        </a-button>
      </div>
    </template>
    <template v-if="currentTrigger">
      <pi-container>
        <a-form ref="triggerFormRef" class="trigger-form" :model="currentTrigger" :label-col="labelCol" :wrapper-col="wrapperCol">
          <fs-form-item
            v-model="currentTrigger.title"
            :item="{
              title: t('certd.triggerName'),
              key: 'title',
              component: {
                name: 'a-input',
                vModel: 'value',
                disabled: !editMode,
              },
              rules: [{ required: true, message: t('certd.requiredField') }],
            }"
          />

          <fs-form-item
            v-model="currentTrigger.type"
            :item="{
              title: t('certd.type'),
              key: 'type',
              value: 'timer',
              component: {
                name: 'a-select',
                vModel: 'value',
                disabled: !editMode,
                options: [{ value: 'timer', label: t('certd.schedule') }],
              },
              rules: [{ required: true, message: t('certd.requiredField') }],
            }"
          />

          <fs-form-item
            v-model="currentTrigger.props.cron"
            :item="{
              title: t('certd.cronForm.title'),
              key: 'props.cron',
              component: {
                disabled: !editMode,
                name: 'cron-editor',
                vModel: 'modelValue',
              },
              helper: t('certd.cronForm.helper'),
              rules: [{ required: true, message: t('certd.cronForm.required') }],
            }"
          />
        </a-form>

        <template #footer>
          <a-form-item v-if="editMode" :wrapper-col="{ span: 14, offset: 4 }">
            <a-button type="primary" @click="triggerSave"> 确定 </a-button>
          </a-form-item>
        </template>
      </pi-container>
    </template>
  </a-drawer>
</template>

<script>
import { message, Modal } from "ant-design-vue";
import { inject, ref } from "vue";
import * as _ from "lodash-es";
import { useI18n } from "/src/locales/";
import { nanoid } from "nanoid";
export default {
  name: "PiTriggerForm",
  props: {
    editMode: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update"],
  setup(props, context) {
    /**
     *  trigger drawer
     * @returns
     */
    const { t } = useI18n();
    function useTriggerForm() {
      const mode = ref("add");
      const callback = ref();
      const currentTrigger = ref({ title: undefined, input: {} });
      const currentPlugin = ref({});
      const triggerFormRef = ref(null);
      const triggerDrawerVisible = ref(false);
      const rules = ref({
        name: [
          {
            type: "string",
            required: true,
            message: t("certd.enterName"),
          },
        ],
      });

      const triggerDrawerShow = () => {
        triggerDrawerVisible.value = true;
      };
      const triggerDrawerClose = () => {
        triggerDrawerVisible.value = false;
      };

      const triggerDrawerOnAfterVisibleChange = val => {
        console.log("triggerDrawerOnAfterVisibleChange", val);
      };

      const triggerOpen = (trigger, emit) => {
        callback.value = emit;
        currentTrigger.value = _.cloneDeep(trigger);
        console.log("currentTriggerOpen", currentTrigger.value);
        triggerDrawerShow();
      };

      const triggerAdd = emit => {
        mode.value = "add";
        const trigger = { id: nanoid(), title: t("certd.timerTrigger"), type: "timer", props: {} };
        triggerOpen(trigger, emit);
      };

      const triggerEdit = (trigger, emit) => {
        mode.value = "edit";
        triggerOpen(trigger, emit);
      };

      const triggerView = (trigger, emit) => {
        mode.value = "view";
        triggerOpen(trigger, emit);
      };

      const triggerSave = async e => {
        console.log("currentTriggerSave", currentTrigger.value);
        try {
          await triggerFormRef.value.validate();
        } catch (e) {
          console.error("表单验证失败:", e);
          return;
        }

        callback.value("save", currentTrigger.value);
        triggerDrawerClose();
      };

      const triggerDelete = () => {
        Modal.confirm({
          title: t("certd.confirm"),
          content: t("certd.confirmDeleteTrigger"),
          async onOk() {
            callback.value("delete");
            triggerDrawerClose();
          },
        });
      };

      const blankFn = () => {
        return {};
      };
      return {
        triggerFormRef,
        mode,
        triggerAdd,
        triggerEdit,
        triggerView,
        triggerDrawerShow,
        triggerDrawerVisible,
        triggerDrawerOnAfterVisibleChange,
        currentTrigger,
        currentPlugin,
        triggerSave,
        triggerDelete,
        rules,
        blankFn,
      };
    }

    return {
      ...useTriggerForm(),
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
  },
};
</script>

<style lang="less">
.pi-trigger-form {
}
</style>

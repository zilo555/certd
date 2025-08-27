import * as api from "/@/views/sys/plugin/api";
import { useFormWrapper } from "@fast-crud/fast-crud";
import { useI18n } from "/@/locales";
import { Modal, notification } from "ant-design-vue";
import ConfigEditor from "./config-editor.vue";
import { useModal } from "/@/use/use-modal";
import { ref } from "vue";
export function usePluginConfig() {
  const { openCrudFormDialog } = useFormWrapper();
  const { t } = useI18n();

  const modal = useModal();
  async function openConfigDialog({ row, crudExpose }) {
    const configEditorRef = ref();
    function createCrudOptions() {
      return {
        crudOptions: {
          columns: {},
          form: {
            wrapper: {
              width: "80%",
              title: "插件元数据配置",
              saveRemind: false,
              slots: {
                "form-body-top": () => {
                  return (
                    <div>
                      <ConfigEditor ref={configEditorRef} plugin={row}></ConfigEditor>
                    </div>
                  );
                },
              },
            },
            afterSubmit() {
              notification.success({ message: t("certd.operationSuccess") });
              crudExpose.doRefresh();
            },
            async doSubmit({}: any) {
              const form = configEditorRef.value.getForm();
              const newForm: any = {};
              for (const key in form) {
                const value = form[key];
                if (value && Object.keys(value).length > 0) {
                  newForm[key] = value;
                }
              }
              return await api.savePluginSetting({
                name: row.name,
                sysSetting: {
                  metadata: newForm,
                },
              });
            },
          },
        },
      };
    }
    const { crudOptions } = createCrudOptions();
    await openCrudFormDialog({ crudOptions });

    // modal.confirm({
    //   title: "插件元数据配置",
    //   width: "80%",
    //   content: () => {
    //     return <ConfigEditor plugin={row}></ConfigEditor>;
    //   },
    // });
  }

  return {
    openConfigDialog,
  };
}

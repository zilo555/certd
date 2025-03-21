import { compute, useFormWrapper } from "@fast-crud/fast-crud";
import NotificationSelector from "/@/views/certd/notification/notification-selector/index.vue";
import * as api from "./api";
import { omit, cloneDeep, set } from "lodash-es";
import { useReference } from "/@/use/use-refrence";
import { ref } from "vue";
import * as pluginApi from "../api.plugin";
import { checkPipelineLimit } from "/@/views/certd/pipeline/utils";
import { notification } from "ant-design-vue";
import { useRouter } from "vue-router";

export function useCertUpload() {
  const { openCrudFormDialog } = useFormWrapper();
  const router = useRouter();

  async function buildUploadCertPluginInputs(getFormData: any) {
    const plugin: any = await pluginApi.GetPluginDefine("CertApplyUpload");
    const inputs: any = {};
    for (const inputKey in plugin.input) {
      if (inputKey === "certInfoId" || inputKey === "domains") {
        continue;
      }
      const inputDefine = cloneDeep(plugin.input[inputKey]);
      useReference(inputDefine);
      inputs[inputKey] = {
        title: inputDefine.title,
        form: {
          ...inputDefine,
          show: compute(ctx => {
            const form = getFormData();
            if (!form) {
              return false;
            }

            let inputDefineShow = true;
            if (inputDefine.show != null) {
              const computeShow = inputDefine.show as any;
              if (computeShow === false) {
                inputDefineShow = false;
              } else if (computeShow && computeShow.computeFn) {
                inputDefineShow = computeShow.computeFn({ form });
              }
            }
            return inputDefineShow;
          }),
        },
      };
    }
    return inputs;
  }

  async function openUploadCreateDialog() {
    //检查是否流水线数量超出限制
    await checkPipelineLimit();

    const wrapperRef = ref();
    function getFormData() {
      if (!wrapperRef.value) {
        return null;
      }
      return wrapperRef.value.getFormData();
    }
    const inputs = await buildUploadCertPluginInputs(getFormData);

    function createCrudOptions() {
      return {
        crudOptions: {
          columns: {
            "cert.crt": {
              title: "证书",
              type: "text",
              form: {
                component: {
                  name: "pem-input",
                  vModel: "modelValue",
                  textarea: {
                    rows: 4,
                    placeholder: "-----BEGIN CERTIFICATE-----\n...\n...\n-----END CERTIFICATE-----",
                  },
                },
                helper: "选择pem格式证书文件，或者粘贴到此",
                rules: [{ required: true, message: "此项必填" }],
                col: { span: 24 },
                order: -9999,
              },
            },
            "cert.key": {
              title: "证书私钥",
              type: "text",
              form: {
                component: {
                  name: "pem-input",
                  vModel: "modelValue",
                  textarea: {
                    rows: 4,
                    placeholder: "-----BEGIN PRIVATE KEY-----\n...\n...\n-----END PRIVATE KEY----- ",
                  },
                },
                helper: "选择pem格式证书私钥文件，或者粘贴到此",
                rules: [{ required: true, message: "此项必填" }],
                col: { span: 24 },
                order: -9999,
              },
            },
            ...inputs,
            notification: {
              title: "失败通知",
              type: "text",
              form: {
                value: 0,
                component: {
                  name: NotificationSelector,
                  vModel: "modelValue",
                  on: {
                    selectedChange({ $event, form }: any) {
                      form.notificationTarget = $event;
                    },
                  },
                },
                order: 101,
                helper: "任务执行失败实时提醒",
              },
            },
          },
          form: {
            wrapper: {
              title: "上传证书&创建部署流水线",
              saveRemind: false,
            },
            async doSubmit({ form }: any) {
              const notifications = [];
              if (form.notification != null) {
                notifications.push({
                  type: "custom",
                  when: ["error", "turnToSuccess", "success"],
                  notificationId: form.notification,
                  title: form.notificationTarget?.name || "自定义通知",
                });
              }

              const req = {
                id: form.id,
                cert: form.cert,
                pipeline: {
                  input: omit(form, ["id", "cert", "notification", "notificationTarget"]),
                  notifications,
                },
              };
              const res = await api.UploadCert(req);
              router.push({
                path: "/certd/pipeline/detail",
                query: { id: res.pipelineId, editMode: "true" },
              });
            },
          },
        },
      };
    }
    const { crudOptions } = createCrudOptions();
    const wrapper = await openCrudFormDialog({ crudOptions });
    wrapperRef.value = wrapper;
  }

  async function openUpdateCertDialog(id: any, onSubmit?: any) {
    function createCrudOptions() {
      return {
        crudOptions: {
          columns: {
            "cert.crt": {
              title: "证书",
              type: "text",
              form: {
                component: {
                  name: "pem-input",
                  vModel: "modelValue",
                  textarea: {
                    rows: 4,
                    placeholder: "-----BEGIN CERTIFICATE-----\n...\n...\n-----END CERTIFICATE-----",
                  },
                },
                rules: [{ required: true, message: "此项必填" }],
                col: { span: 24 },
              },
            },
            "cert.key": {
              title: "私钥",
              type: "textarea",
              form: {
                component: {
                  name: "pem-input",
                  vModel: "modelValue",
                  textarea: {
                    rows: 4,
                    placeholder: "-----BEGIN PRIVATE KEY-----\n...\n...\n-----END PRIVATE KEY----- ",
                  },
                },
                rules: [{ required: true, message: "此项必填" }],
                col: { span: 24 },
              },
            },
          },
          form: {
            wrapper: {
              title: "更新证书",
              saveRemind: false,
            },
            async doSubmit({ form }: any) {
              const req = {
                id: id,
                cert: form.cert,
              };
              const res = await api.UploadCert(req);
              if (onSubmit) {
                await onSubmit(res);
              }
            },
          },
        },
      };
    }
    const { crudOptions } = createCrudOptions();
    await openCrudFormDialog({ crudOptions });
  }

  return {
    openUploadCreateDialog,
    openUpdateCertDialog,
  };
}

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
  function topRender({ form, key }: any) {
    function onChange(e: any) {
      const file = e.target.files[0];
      const size = file.size;
      if (size > 100 * 1024) {
        notification.error({
          message: "文件超过100k，请选择正确的证书文件",
        });
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = function (e: any) {
        const value = e.target.result;
        set(form, key, value);
      };
      fileReader.readAsText(file); // 以文本形式读取文件
    }
    return <file-input class="mb-5" type="primary" text={"选择文件"} onChange={onChange} />;
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
              type: "textarea",
              form: {
                component: {
                  rows: 4,
                  placeholder: "-----BEGIN CERTIFICATE-----\n...\n...\n-----END CERTIFICATE-----",
                },
                helper: "选择pem格式证书文件，或者粘贴到此",
                rules: [{ required: true, message: "此项必填" }],
                col: { span: 24 },
                order: -9999,
                topRender,
              },
            },
            "cert.key": {
              title: "证书私钥",
              type: "textarea",
              form: {
                component: {
                  rows: 4,
                  placeholder: "-----BEGIN PRIVATE KEY-----\n...\n...\n-----END PRIVATE KEY----- ",
                },
                helper: "选择pem格式证书私钥文件，或者粘贴到此",
                rules: [{ required: true, message: "此项必填" }],
                col: { span: 24 },
                order: -9999,
                topRender,
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

  async function openUpdateCertDialog(id: any) {
    function createCrudOptions() {
      return {
        crudOptions: {
          columns: {
            "cert.crt": {
              title: "证书",
              type: "textarea",
              form: {
                component: {
                  rows: 4,
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
                  rows: 4,
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
              return await api.UploadCert(form);
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

import { dict, useFormWrapper } from "@fast-crud/fast-crud";
import { checkPipelineLimit, eachSteps } from "/@/views/certd/pipeline/utils";
import { templateApi } from "/@/views/certd/pipeline/template/api";
import TemplateForm from "./form.vue";
import NotificationSelector from "/@/views/certd/notification/notification-selector/index.vue";
import GroupSelector from "/@/views/certd/pipeline/group/group-selector.vue";
import { ref } from "vue";
import { fillPipelineByDefaultForm } from "/@/views/certd/pipeline/certd-form/use";
import { cloneDeep } from "lodash-es";

export function useTemplate() {
  const { openCrudFormDialog } = useFormWrapper();

  async function openCreateFromTemplateDialog(req: { templateId?: number }) {
    //检查是否流水线数量超出限制
    await checkPipelineLimit();
    const detail = await templateApi.GetDetail(req.templateId);
    if (!detail) {
      throw new Error("模板不存在");
    }
    if (!detail.template?.pipelineId) {
      throw new Error("还未绑定模版流水线");
    }
    const templateProps = JSON.parse(detail.template.content || "{}");
    const pipeline = detail.pipeline;

    const groupDictRef = dict({
      url: "/pi/pipeline/group/all",
      value: "id",
      label: "name",
    });

    const wrapperRef = ref();
    function getFormData() {
      if (!wrapperRef.value) {
        return null;
      }
      return wrapperRef.value.getFormData();
    }

    const randomHour = Math.floor(Math.random() * 6);
    const randomMin = Math.floor(Math.random() * 60);
    const templateFormRef = ref();

    async function onSubmit(opts: { form: any }) {
      const form = opts.form;
      await templateFormRef.value.validate();

      const tempInputs = templateFormRef.value.getFormData();

      let newPipeline = cloneDeep(pipeline);
      newPipeline = fillPipelineByDefaultForm(newPipeline, form);
      //填充模版参数
      const steps: any = {};
      eachSteps(newPipeline, (step: any) => {
        steps[step.id] = step;
      });

      for (const inputKey in tempInputs) {
        const [stepId, key] = inputKey.split(".");
        const step = steps[stepId];
        if (step) {
          step.input[key] = tempInputs[inputKey];
        }
      }

      const groupId = form.groupId;
      const { id } = await templateApi.CreatePipelineByTemplate({
        title: form.title,
        content: JSON.stringify(newPipeline),
        keepHistoryCount: 30,
        groupId,
        templateId: detail.template.id,
      });
    }

    const crudOptions = {
      form: {
        onSubmit,
        wrapper: {
          title: `从模版<${detail.template.title}>创建流水线`,
          width: 1100,
          slots: {
            "form-body-top": () => {
              return (
                <div class={"w-full flex"}>
                  <TemplateForm ref={templateFormRef} input={templateProps.input} pipeline={pipeline} />
                </div>
              );
            },
          },
        },
      },
      columns: {
        triggerCron: {
          title: "定时触发",
          type: "text",
          form: {
            value: `0 ${randomMin} ${randomHour} * * *`,
            component: {
              name: "cron-editor",
              vModel: "modelValue",
              placeholder: "0 0 4 * * *",
            },
            helper: "点击上面的按钮，选择每天几点定时执行。\n建议设置为每天触发一次，证书未到期之前任务会跳过，不会重复执行",
            order: 100,
          },
        },
        notification: {
          title: "失败通知",
          type: "text",
          form: {
            value: 0,
            component: {
              name: NotificationSelector,
              vModel: "modelValue",
              on: {
                selectedChange(opts: any) {
                  opts.form.notificationTarget = opts.$event;
                },
              },
            },
            order: 101,
            helper: "任务执行失败实时提醒",
          },
        },
        groupId: {
          title: "流水线分组",
          type: "dict-select",
          dict: groupDictRef,
          form: {
            component: {
              name: GroupSelector,
              vModel: "modelValue",
            },
            order: 9999,
          },
        },
      },
    };

    const wrapper = await openCrudFormDialog({ crudOptions });
    wrapperRef.value = wrapper;
  }

  return {
    openCreateFromTemplateDialog,
  };
}

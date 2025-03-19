import { checkPipelineLimit } from "/@/views/certd/pipeline/utils";
import { omit } from "lodash-es";
import * as api from "/@/views/certd/pipeline/api";
import { message } from "ant-design-vue";
import { nanoid } from "nanoid";
import { useRouter } from "vue-router";

export function setRunnableIds(pipeline: any) {
  const idMap: any = {};
  function createId(oldId: any) {
    if (oldId == null) {
      return nanoid();
    }
    const newId = nanoid();
    idMap[oldId] = newId;
    return newId;
  }
  if (pipeline.stages) {
    for (const stage of pipeline.stages) {
      stage.id = createId(stage.id);
      if (stage.tasks) {
        for (const task of stage.tasks) {
          task.id = createId(task.id);
          if (task.steps) {
            for (const step of task.steps) {
              step.id = createId(step.id);
            }
          }
        }
      }
    }
  }

  for (const trigger of pipeline.triggers) {
    trigger.id = nanoid();
  }
  for (const notification of pipeline.notifications) {
    notification.id = nanoid();
  }

  let content = JSON.stringify(pipeline);
  for (const key in idMap) {
    content = content.replaceAll(key, idMap[key]);
  }
  return JSON.parse(content);
}

export function useCertd(certdFormRef: any) {
  const router = useRouter();
  async function openAddCertdPipelineDialog() {
    //检查是否流水线数量超出限制
    await checkPipelineLimit();

    certdFormRef.value.open(async ({ form }: any) => {
      // 添加certd pipeline
      const triggers = [];
      if (form.triggerCron) {
        triggers.push({ title: "定时触发", type: "timer", props: { cron: form.triggerCron } });
      }
      const notifications = [];
      if (form.notification != null) {
        notifications.push({
          type: "custom",
          when: ["error", "turnToSuccess", "success"],
          notificationId: form.notification,
          title: form.notificationTarget?.name || "自定义通知",
        });
      }
      const pluginInput = omit(form, ["triggerCron", "notification", "notificationTarget", "certApplyPlugin"]);
      let pipeline = {
        title: form.domains[0] + "证书自动化",
        runnableType: "pipeline",
        stages: [
          {
            title: "证书申请阶段",
            maxTaskCount: 1,
            runnableType: "stage",
            tasks: [
              {
                title: "证书申请任务",
                runnableType: "task",
                steps: [
                  {
                    title: "申请证书",
                    runnableType: "step",
                    input: {
                      renewDays: 35,
                      ...pluginInput,
                    },
                    strategy: {
                      runStrategy: 0, // 正常执行
                    },
                    type: form.certApplyPlugin,
                  },
                ],
              },
            ],
          },
        ],
        triggers,
        notifications,
      };
      pipeline = setRunnableIds(pipeline);

      /**
       *  // cert: 证书; backup: 备份; custom:自定义;
       *   type: string;
       *   // custom: 自定义; monitor: 监控;
       *   from: string;
       */
      const id = await api.Save({
        title: pipeline.title,
        content: JSON.stringify(pipeline),
        keepHistoryCount: 30,
        type: "cert",
        from: "custom",
      });
      message.success("创建成功,请添加证书部署任务");
      router.push({ path: "/certd/pipeline/detail", query: { id, editMode: "true" } });
    });
  }

  return {
    openAddCertdPipelineDialog,
  };
}

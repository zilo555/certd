import { forEach } from "lodash-es";
import { mySuiteApi } from "/@/views/certd/suite/mine/api";
import { notification } from "ant-design-vue";
import { useSettingStore } from "/@/store/modules/settings";
//@ts-ignore
import forge from "node-forge";
export function eachStages(list: any[], exec: (item: any, runnableType: string) => void, runnableType: string = "stage") {
  if (!list || list.length <= 0) {
    return;
  }
  forEach(list, item => {
    exec(item, runnableType);
    if (runnableType === "stage") {
      eachStages(item.tasks, exec, "task");
    } else if (runnableType === "task") {
      eachStages(item.steps, exec, "step");
    }
  });
}

export function eachSteps(pipeline: any, callback: any) {
  const pp = pipeline;
  if (pp.stages) {
    for (const stage of pp.stages) {
      if (stage.tasks) {
        for (const task of stage.tasks) {
          if (task.steps) {
            for (const step of task.steps) {
              callback(step, task, stage);
            }
          }
        }
      }
    }
  }
}

export function findStep(pipeline: any, id: string) {
  const pp = pipeline;
  if (pp.stages) {
    for (const stage of pp.stages) {
      if (stage.tasks) {
        for (const task of stage.tasks) {
          if (task.steps) {
            for (const step of task.steps) {
              if (step.id === id) {
                return step;
              }
            }
          }
        }
      }
    }
  }
}

export async function checkPipelineLimit() {
  const settingsStore = useSettingStore();
  if (settingsStore.isComm && settingsStore.suiteSetting.enabled) {
    //检查数量是否超限

    const suiteDetail = await mySuiteApi.SuiteDetailGet();
    const max = suiteDetail.pipelineCount.max;
    if (max != -1 && max <= suiteDetail.pipelineCount.used) {
      notification.error({
        message: `对不起，您最多只能创建${max}条流水线，请购买或升级套餐`,
      });
      throw new Error("流水线数量超限");
    }
  }
}

export function readCertDetail(crt: string) {
  const detail = forge.pki.certificateFromPem(crt);
  const expires = detail.notAfter;
  return { detail, expires };
}

export function getAllDomainsFromCrt(crt: string) {
  const { detail } = readCertDetail(crt);
  const domains = [];

  // 1. 提取SAN中的DNS名称
  const sanExtension = detail.extensions.find((ext: any) => ext.name === "subjectAltName");
  if (sanExtension) {
    sanExtension.altNames.forEach((altName: any) => {
      if (altName.type === 2) {
        // type=2 表示DNS名称
        domains.push(altName.value);
      }
    });
  }

  // 2. 如果没有SAN，回退到CN（通用名称）
  if (domains.length === 0) {
    const cnAttr = detail.subject.attributes.find((attr: any) => attr.name === "commonName");
    if (cnAttr) {
      domains.push(cnAttr.value);
    }
  }
  return domains;
}

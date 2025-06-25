import { AddReq, CreateCrudOptionsProps, CreateCrudOptionsRet, DelReq, dict, EditReq, useFormWrapper, UserPageQuery, UserPageRes } from "@fast-crud/fast-crud";
import { templateApi } from "./api";
import { useRouter } from "vue-router";
import { useModal } from "/@/use/use-modal";
import createCrudOptionsPipeline from "../crud";
import * as pipelineApi from "../api";
export default function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
  const api = templateApi;
  const pageRequest = async (query: UserPageQuery): Promise<UserPageRes> => {
    return await api.GetList(query);
  };
  const editRequest = async (req: EditReq) => {
    const { form, row } = req;
    form.id = row.id;
    const res = await api.UpdateObj(form);
    return res;
  };
  const delRequest = async (req: DelReq) => {
    const { row } = req;
    return await api.DelObj(row.id);
  };

  const addRequest = async (req: AddReq) => {
    const { form } = req;
    const res = await api.AddObj(form);
    return res;
  };
  const { openCrudFormDialog } = useFormWrapper();
  const router = useRouter();

  const model = useModal();
  return {
    crudOptions: {
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest,
      },
      addForm: {
        onSuccess: ({ res }) => {
          router.push({ path: "/certd/pipeline/template/edit", query: { templateId: res.id, editMode: "true" } });
        },
      },
      form: {
        labelCol: {
          //固定label宽度
          span: null,
          style: {
            width: "100px",
          },
        },
        col: {
          span: 22,
        },
        wrapper: {
          width: 600,
        },
      },
      actionbar: {
        show: true,
        buttons: {
          add: {
            text: "创建模版",
            type: "primary",
            show: true,
          },
        },
      },
      rowHandle: {
        // width: 100,
        fixed: "right",
        buttons: {
          edit: { show: false },
          copy: { show: false },
        },
      },
      columns: {
        id: {
          title: "ID",
          key: "id",
          type: "number",
          search: {
            show: false,
          },
          column: {
            width: 100,
            editable: {
              disabled: true,
            },
          },
          form: {
            show: false,
          },
        },
        title: {
          title: "模版名称",
          type: "text",
          search: {
            show: true,
          },
          column: {
            width: 400,
            sorter: true,
            cellRender({ row, value }) {
              return <router-link to={{ path: "/certd/pipeline/template/edit", query: { templateId: row.id } }}>{value}</router-link>;
            },
          },
        },
        pipelineId: {
          title: "流水线ID",
          type: "table-select",
          search: { show: true },
          dict: dict({
            value: "id",
            label: "title",
            //重要，根据value懒加载数据
            getNodesByValues: async (values: any[]) => {
              return await pipelineApi.GetSimpleByIds(values);
            },
          }),
          editForm: {
            show: false,
          },
          column: {
            show: false,
          },
          form: {
            show: true,
            helper: "复制该流水线配置作为模版来源",
            component: {
              valuesFormat: {
                labelFormatter: (item: any) => {
                  return `${item.id}.${item.title}`;
                },
              },
              select: {
                placeholder: "点击选择",
              },
              showSelect: false,
              createCrudOptions: createCrudOptionsPipeline,
              crudOptionsOverride: {
                actionbar: {
                  show: false,
                },
                toolbar: {
                  show: false,
                },
                columns: {
                  title: {
                    column: {
                      cellRender: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

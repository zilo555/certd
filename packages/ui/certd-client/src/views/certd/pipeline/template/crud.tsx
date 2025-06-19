// @ts-ignore
import { useI18n } from "vue-i18n";
import { AddReq, CreateCrudOptionsProps, CreateCrudOptionsRet, DelReq, EditReq, useFormWrapper, UserPageQuery, UserPageRes } from "@fast-crud/fast-crud";
import { templateApi } from "./api";
import { useRouter } from "vue-router";
import { useModal } from "/@/use/use-modal";

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
            width: 200,
            sorter: true,
          },
        },
        pipelineId: {
          title: "流水线ID",
          type: "text",
          search: {
            show: true,
          },
          column: {
            width: 200,
            sorter: true,
          },
        },
      },
    },
  };
}

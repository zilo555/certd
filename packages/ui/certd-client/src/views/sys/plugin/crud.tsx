import * as api from "./api";
import { useI18n } from "vue-i18n";
import { computed, Ref, ref } from "vue";
import { useRouter } from "vue-router";
import { AddReq, compute, CreateCrudOptionsProps, CreateCrudOptionsRet, DelReq, dict, EditReq, UserPageQuery, UserPageRes, utils } from "@fast-crud/fast-crud";
import { useUserStore } from "/src/store/modules/user";
import { useSettingStore } from "/src/store/modules/settings";
import { Modal } from "ant-design-vue";
//@ts-ignore
import yaml from "js-yaml";

export default function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
  const router = useRouter();
  const { t } = useI18n();
  const pageRequest = async (query: UserPageQuery): Promise<UserPageRes> => {
    return await api.GetList(query);
  };
  const editRequest = async ({ form, row }: EditReq) => {
    form.id = row.id;
    const res = await api.UpdateObj(form);
    return res;
  };
  const delRequest = async ({ row }: DelReq) => {
    return await api.DelObj(row.id);
  };

  const addRequest = async ({ form }: AddReq) => {
    const res = await api.AddObj(form);
    return res;
  };

  const userStore = useUserStore();
  const settingStore = useSettingStore();
  const selectedRowKeys: Ref<any[]> = ref([]);
  context.selectedRowKeys = selectedRowKeys;

  return {
    crudOptions: {
      settings: {
        plugins: {
          //这里使用行选择插件，生成行选择crudOptions配置，最终会与crudOptions合并
          rowSelection: {
            enabled: true,
            order: -2,
            before: true,
            // handle: (pluginProps,useCrudProps)=>CrudOptions,
            props: {
              multiple: true,
              crossPage: true,
              selectedRowKeys,
            },
          },
        },
      },
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest,
      },
      actionbar: {
        buttons: {
          add: {
            show: true,
            text: "自定义插件",
          },
        },
      },
      rowHandle: {
        show: true,
        minWidth: 200,
        fixed: "right",
        buttons: {
          edit: {
            show: compute(({ row }) => {
              return row.type === "custom";
            }),
          },
          copy: {
            show: compute(({ row }) => {
              return row.type === "custom";
            }),
          },
          remove: {
            show: compute(({ row }) => {
              return row.type === "custom";
            }),
          },
        },
      },
      table: {
        rowKey: "name",
      },
      tabs: {
        name: "type",
        show: true,
        defaultOption: {
          show: false,
        },
      },
      columns: {
        // id: {
        //   title: "ID",
        //   key: "id",
        //   type: "number",
        //   column: {
        //     width: 100
        //   },
        //   form: {
        //     show: false
        //   }
        // },
        name: {
          title: "插件名称",
          type: "text",
          search: {
            show: true,
          },
          form: {
            show: true,
            order: 0,
            helper: "必须为英文，驼峰命名，类型作为前缀\n例如AliyunDeployToCDN\n插件一旦被使用，不要修改名称",
            rules: [{ required: true }],
          },
          column: {
            width: 250,
            cellRender({ row }) {
              if (row.author) {
                return <fs-copyable model-value={`${row.author}/${row.name}`} />;
              } else {
                return <fs-copyable model-value={row.name} />;
              }
            },
          },
        },
        author: {
          title: "作者",
          type: "text",
          search: {
            show: true,
          },
          form: {
            show: true,
            order: 0,
            helper: "上传到插件商店时，将作为插件名称前缀,例如：greper/pluginName",
            rules: [{ required: true }],
          },
          column: {
            width: 200,
            show: false,
          },
        },
        icon: {
          title: "图标",
          type: "icon",
          form: {
            rules: [{ required: true }],
          },
          column: {
            width: 70,
            align: "center",
            component: {
              name: "fs-icon",
              vModel: "icon",
              style: {
                fontSize: "22px",
              },
            },
          },
        },

        title: {
          title: "标题",
          type: "text",
          form: {
            order: 0,
            helper: "插件中文名称",
            rules: [{ required: true }],
          },
          column: {
            width: 300,
            cellRender({ row }) {
              if (row.type === "custom") {
                return <router-link to={`/sys/plugin/edit?id=${row.id}`}>{row.title}</router-link>;
              }
              return <div>{row.title}</div>;
            },
          },
        },
        desc: {
          title: "描述",
          type: "textarea",
          helper: "插件的描述",
          column: {
            width: 300,
            show: false,
          },
        },
        type: {
          title: "来源",
          type: "dict-select",
          search: {
            show: true,
          },
          form: {
            value: "custom",
            component: {
              disabled: true,
            },
          },
          dict: dict({
            data: [
              { label: "内置", value: "builtIn" },
              { label: "自建", value: "custom" },
              { label: "商店", value: "store" },
            ],
          }),
          column: {
            width: 70,
            align: "center",
            component: {
              color: "auto",
            },
          },
        },
        pluginType: {
          title: "插件类型",
          type: "dict-select",
          search: {
            show: true,
          },
          form: {
            rules: [{ required: true }],
          },
          editForm: {
            component: {
              disabled: true,
            },
          },
          dict: dict({
            data: [
              { label: "授权", value: "access" },
              { label: "DNS", value: "dnsProvider" },
              { label: "部署插件", value: "plugin" },
            ],
          }),
          column: {
            width: 100,
            align: "center",
            component: {
              color: "auto",
            },
          },
        },
        version: {
          title: "版本",
          type: "text",
          column: {
            width: 100,
            align: "center",
          },
        },
        group: {
          title: "分组",
          type: "dict-select",
          dict: dict({
            url: "/pi/plugin/groupsList",
            label: "title",
            value: "key",
          }),
          form: {
            rules: [{ required: true }],
          },
          column: {
            width: 100,
            align: "left",
            component: {
              color: "auto",
            },
          },
        },
        "extra.default.strategy.runStrategy": {
          title: "运行策略",
          type: "dict-select",

          dict: dict({
            data: [
              { value: 0, label: "正常运行" },
              { value: 1, label: "成功后跳过（部署任务）" },
            ],
          }),
          form: {
            value: 1,
            rules: [{ required: true }],
            helper: "默认运行策略",
          },
          column: {
            width: 100,
            align: "left",
            component: {
              color: "auto",
            },
          },
          valueBuilder({ row }) {
            if (row.extra) {
              row.extra = yaml.load(row.extra);
            }
          },
          valueResolve({ row }) {
            if (row.extra) {
              row.extra = yaml.dump(row.extra);
            }
          },
        },
        disabled: {
          title: "点击禁用/启用",
          type: "dict-switch",
          dict: dict({
            data: [
              { label: "启用", value: false, color: "success" },
              { label: "禁用", value: true, color: "error" },
            ],
          }),
          form: {
            title: "禁用/启用",
            value: false,
          },
          column: {
            width: 120,
            align: "center",
            component: {
              title: "点击可禁用/启用",
              on: {
                async click({ value, row }) {
                  Modal.confirm({
                    title: "提示",
                    content: `确定要${!value ? "禁用" : "启用"}吗？`,
                    onOk: async () => {
                      await api.SetDisabled({
                        id: row.id,
                        name: row.name,
                        type: row.type,
                        disabled: !value,
                      });
                      await crudExpose.doRefresh();
                    },
                  });
                },
              },
            },
          },
        },
        createTime: {
          title: "创建时间",
          type: "datetime",
          form: {
            show: false,
          },
          column: {
            sorter: true,
            width: 160,
            align: "center",
          },
        },
        updateTime: {
          title: "更新时间",
          type: "datetime",
          form: {
            show: false,
          },
          column: {
            show: true,
          },
        },
      },
    },
  };
}

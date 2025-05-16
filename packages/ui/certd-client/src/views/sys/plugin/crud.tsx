import * as api from "./api";
import { useI18n } from "vue-i18n";
import { Ref, ref } from "vue";
import { useRouter } from "vue-router";
import { AddReq, compute, CreateCrudOptionsProps, CreateCrudOptionsRet, DelReq, dict, EditReq, useFormWrapper, UserPageQuery, UserPageRes } from "@fast-crud/fast-crud";
import { Modal, notification } from "ant-design-vue";
//@ts-ignore
import yaml from "js-yaml";

export default function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
  const router = useRouter();
  const { t } = useI18n();

  let lastType = "";
  const pageRequest = async (query: UserPageQuery): Promise<UserPageRes> => {
    if (lastType && lastType != query?.query?.type) {
      //lastType有变化
      query.page.offset = 0;
    }
    lastType = query?.query?.type;
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

  const selectedRowKeys: Ref<any[]> = ref([]);
  context.selectedRowKeys = selectedRowKeys;
  const { openCrudFormDialog } = useFormWrapper();

  async function openImportDialog() {
    function createCrudOptions() {
      return {
        crudOptions: {
          columns: {
            content: {
              title: "插件文件",
              type: "text",
              form: {
                component: {
                  name: "pem-input",
                  vModel: "modelValue",
                  textarea: {
                    rows: 8,
                  },
                },
                col: {
                  span: 24,
                },
                helper: "选择插件文件",
              },
            },
            override: {
              title: "同名覆盖",
              type: "dict-switch",
              dict: dict({
                data: [
                  {
                    value: true,
                    label: "覆盖",
                  },
                  {
                    value: false,
                    label: "不覆盖",
                  },
                ],
              }),
              form: {
                value: false,
                col: {
                  span: 24,
                },
                helper: "如果已有相同名称插件，直接覆盖",
              },
            },
          },
          form: {
            wrapper: {
              title: "导入插件",
              saveRemind: false,
            },
            afterSubmit() {
              notification.success({ message: "操作成功" });
              crudExpose.doRefresh();
            },
            async doSubmit({ form }: any) {
              return await api.ImportPlugin({
                ...form,
              });
            },
          },
        },
      };
    }
    const { crudOptions } = createCrudOptions();
    await openCrudFormDialog({ crudOptions });
  }
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
            icon: "ion:ios-add-circle-outline",
            text: "自定义插件",
          },
          import: {
            show: true,
            icon: "ion:cloud-upload-outline",
            text: "导入",
            type: "primary",
            async click() {
              await openImportDialog();
            },
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
            order: 999,
            show: compute(({ row }) => {
              return row.type === "custom";
            }),
          },
          export: {
            text: null,
            icon: "ion:cloud-download-outline",
            title: "导出",
            type: "link",
            show: compute(({ row }) => {
              return row.type === "custom";
            }),
            async click({ row }) {
              //将文本内容，作为文件下载
              const content = await api.ExportPlugin(row.id);
              if (content) {
                const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${row.name}.yaml`;
                link.click();
                URL.revokeObjectURL(url);
              }
            },
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
      form: {
        onSuccess(opts: any) {
          if (opts.res?.id) {
            router.push({
              name: "SysPluginEdit",
              query: {
                id: opts.res.id,
              },
            });
          }
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
        pluginType: {
          title: "插件类型",
          type: "dict-select",
          search: {
            show: true,
          },
          form: {
            order: 0,
            rules: [{ required: true }],
            component: {
              disabled: true,
            },
          },
          addForm: {
            component: {
              disabled: false,
            },
          },
          dict: dict({
            data: [
              { label: "授权", value: "access" },
              { label: "DNS", value: "dnsProvider" },
              { label: "部署插件", value: "deploy" },
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
        name: {
          title: "插件名称",
          type: "text",
          search: {
            show: true,
          },
          form: {
            show: true,
            helper: "必须为英文或数字，驼峰命名，类型作为前缀\n例如AliyunDeployToCDN\n插件一旦被使用，不要修改名称",
            rules: [
              { required: true },
              {
                type: "regexp",
                pattern: /^[a-zA-Z][a-zA-Z0-9]+$/,
                message: "必须为英文或数字，驼峰命名，类型作为前缀",
              },
            ],
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
            helper: "上传到插件商店时，将作为插件名称前缀,例如：greper/pluginName",
            rules: [
              { required: true },
              {
                type: "regexp",
                pattern: /^[a-zA-Z][a-zA-Z0-9]+$/,
                message: "必须为英文字母或数字",
              },
            ],
          },
          column: {
            width: 200,
            show: false,
          },
        },
        title: {
          title: "标题",
          type: "text",
          form: {
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
        version: {
          title: "版本",
          type: "text",
          column: {
            width: 100,
            align: "center",
          },
        },
        // "extra.dependLibs": {
        //   title: "第三方依赖",
        //   type: "text",
        //   form: {
        //     helper: "依赖的第三方库,package.dependencies的格式：name[:^version]",
        //     component: {
        //       name: "a-select",
        //       mode: "tags",
        //       allowClear: true,
        //       open: false,
        //     },
        //   },
        //   column: {
        //     show: false,
        //   },
        // },
        "extra.dependPlugins": {
          title: "插件依赖",
          type: "text",
          form: {
            component: {
              name: "a-select",
              mode: "tags",
              open: false,
              allowClear: true,
            },
            helper: "安装时会先安装依赖的插件,格式：[author/]pluginName[:version]",
          },
          column: {
            show: false,
          },
        },
        "extra.showRunStrategy": {
          title: "可修改运行策略",
          type: "dict-switch",
          dict: dict({
            data: [
              { value: true, label: "可修改" },
              { value: false, label: "不可修改" },
            ],
          }),
          form: {
            value: false,
            rules: [{ required: true }],
          },
          column: {
            width: 100,
            align: "left",
            show: false,
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
            show: compute(({ form }) => {
              return form.extra.showRunStrategy;
            }),
          },
          column: {
            width: 100,
            align: "left",
            component: {
              color: "auto",
            },
            show: false,
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
        group: {
          title: "插件分组",
          type: "dict-select",
          dict: dict({
            url: "/pi/plugin/groupsList",
            label: "title",
            value: "key",
          }),
          form: {
            rules: [{ required: true }],
            show: compute(({ form }) => {
              return form.pluginType === "deploy";
            }),
          },
          column: {
            width: 100,
            align: "left",
            component: {
              color: "auto",
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

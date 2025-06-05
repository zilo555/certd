// @ts-ignore
import { useI18n } from "vue-i18n";
import { AddReq, CreateCrudOptionsProps, CreateCrudOptionsRet, DelReq, dict, EditReq, UserPageQuery, UserPageRes } from "@fast-crud/fast-crud";
import { siteIpApi } from "./api";
import dayjs from "dayjs";
import { Modal, notification } from "ant-design-vue";
import { useSiteIpMonitor } from "/@/views/certd/monitor/site/ip/use";

export default function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
  const api = siteIpApi;

  const pageRequest = async (query: UserPageQuery): Promise<UserPageRes> => {
    if (!query.query) {
      query.query = {};
    }
    query.query.siteId = context.props.siteId;
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
    form.siteId = context.props.siteId;
    const res = await api.AddObj(form);
    return res;
  };

  const checkStatusDict = dict({
    data: [
      { label: "成功", value: "ok", color: "green" },
      { label: "检查中", value: "checking", color: "blue" },
      { label: "异常", value: "error", color: "red" },
    ],
  });
  const { openSiteIpImportDialog } = useSiteIpMonitor();
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
        buttons: {
          add: {
            async click() {
              await crudExpose.openAdd({});
            },
          },
          import: {
            show: true,
            text: "批量导入",
            type: "primary",
            async click() {
              openSiteIpImportDialog({
                siteId: context.props.siteId,
                afterSubmit() {
                  crudExpose.doRefresh();
                },
              });
            },
          },
          load: {
            text: "同步IP",
            type: "primary",
            async click() {
              Modal.confirm({
                title: "同步IP",
                content: "确定要同步IP吗？",
                onOk: async () => {
                  await api.DoSync(context.props.siteId);
                  await crudExpose.doRefresh();
                  notification.success({
                    message: "同步完成",
                  });
                },
              });
            },
          },
          checkAll: {
            text: "检查全部",
            type: "primary",
            click: () => {
              Modal.confirm({
                title: "确认",
                content: "确认触发检查全部IP站点的证书吗?",
                onOk: async () => {
                  await siteIpApi.CheckAll(context.props.siteId);
                  notification.success({
                    message: "检查任务已提交",
                    description: "请稍后刷新页面查看结果",
                  });
                },
              });
            },
          },
        },
      },
      rowHandle: {
        fixed: "right",
        width: 240,
        buttons: {
          check: {
            order: 0,
            type: "link",
            text: null,
            tooltip: {
              title: "立即检查",
            },
            icon: "ion:play-sharp",
            click: async ({ row }) => {
              await api.DoCheck(row.id);
              await crudExpose.doRefresh();
              notification.success({
                message: "检查任务已提交",
              });
            },
          },
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
            width: 80,
            align: "center",
          },
          form: {
            show: false,
          },
        },
        ipAddress: {
          title: "IP",
          search: {
            show: true,
          },
          type: "text",
          helper: "也支持填写CNAME域名",
          form: {
            rules: [{ required: true, message: "请输入IP" }],
          },
          column: {
            width: 160,
          },
        },
        certDomains: {
          title: "证书域名",
          search: {
            show: false,
          },
          type: "text",
          form: {
            show: false,
          },
          column: {
            width: 200,
            sorter: true,
            show: false,
            cellRender({ value }) {
              return (
                <a-tooltip title={value} placement="left">
                  {value}
                </a-tooltip>
              );
            },
          },
        },
        certProvider: {
          title: "颁发机构",
          search: {
            show: false,
          },
          type: "text",
          form: {
            show: false,
          },
          column: {
            width: 200,
            show: false,
            sorter: true,
            cellRender({ value }) {
              return <a-tooltip title={value}>{value}</a-tooltip>;
            },
          },
        },
        certStatus: {
          title: "证书状态",
          search: {
            show: true,
          },
          type: "dict-select",
          dict: dict({
            data: [
              { label: "正常", value: "ok", color: "green" },
              { label: "过期", value: "expired", color: "red" },
            ],
          }),
          form: {
            show: false,
          },
          column: {
            width: 100,
            sorter: true,
            show: true,
            align: "center",
          },
        },
        certExpiresTime: {
          title: "证书到期时间",
          search: {
            show: false,
          },
          type: "date",
          form: {
            show: false,
          },
          column: {
            sorter: true,
            cellRender({ value }) {
              if (!value) {
                return "-";
              }
              const expireDate = dayjs(value).format("YYYY-MM-DD");
              const leftDays = dayjs(value).diff(dayjs(), "day");
              const color = leftDays < 20 ? "red" : "#389e0d";
              const percent = (leftDays / 90) * 100;
              return <a-progress title={expireDate + "过期"} percent={percent} strokeColor={color} format={(percent: number) => `${leftDays}天`} />;
            },
          },
        },
        checkStatus: {
          title: "检查状态",
          search: {
            show: false,
          },
          type: "dict-select",
          dict: checkStatusDict,
          form: {
            show: false,
          },
          column: {
            width: 100,
            align: "center",
            sorter: true,
            cellRender({ value, row, key }) {
              return (
                <a-tooltip title={row.error}>
                  <fs-values-format v-model={value} dict={checkStatusDict}></fs-values-format>
                </a-tooltip>
              );
            },
          },
        },
        lastCheckTime: {
          title: "上次检查时间",
          search: {
            show: false,
          },
          type: "datetime",
          form: {
            show: false,
          },
          column: {
            sorter: true,
            width: 155,
          },
        },
        from: {
          title: "来源",
          search: {
            show: false,
          },
          type: "dict-switch",
          dict: dict({
            data: [
              { label: "同步", value: "sync", color: "green" },
              { label: "手动", value: "manual", color: "blue" },
              { label: "导入", value: "import", color: "blue" },
            ],
          }),
          form: {
            value: false,
          },
          column: {
            width: 100,
            sorter: true,
            align: "center",
          },
        },
        disabled: {
          title: "禁用启用",
          search: {
            show: false,
          },
          type: "dict-switch",
          dict: dict({
            data: [
              { label: "启用", value: false, color: "green" },
              { label: "禁用", value: true, color: "red" },
            ],
          }),
          form: {
            value: false,
          },
          column: {
            width: 100,
            sorter: true,
            align: "center",
          },
        },
        remark: {
          title: "备注",
          search: {
            show: false,
          },
          type: "text",
          form: {
            show: false,
          },
          column: {
            width: 200,
            sorter: true,
            tooltip: true,
          },
        },
      },
    },
  };
}

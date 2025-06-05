import { useFormWrapper } from "@fast-crud/fast-crud";

import SiteIpCertMonitor from "./index.vue";
import { siteIpApi } from "/@/views/certd/monitor/site/ip/api";

export function useSiteIpMonitor() {
  const { openDialog, openCrudFormDialog } = useFormWrapper();

  async function openSiteIpMonitorDialog(opts: { siteId: number }) {
    await openDialog({
      wrapper: {
        title: "站点IP监控",
        width: "80%",
        is: "a-modal",
        footer: false,
        buttons: {
          cancel: {
            show: false,
          },
          reset: {
            show: false,
          },
          ok: {
            show: false,
          },
        },
        slots: {
          "form-body-top": () => {
            return <SiteIpCertMonitor siteId={opts.siteId} />;
          },
        },
      },
    });
  }

  async function openSiteIpImportDialog(opts: { afterSubmit: any; siteId: any }) {
    const { afterSubmit } = opts;
    await openCrudFormDialog<any>({
      crudOptions: {
        columns: {
          text: {
            type: "textarea",
            title: "IP列表",
            form: {
              helper: "IP或者CNAME域名，一行一个",
              rules: [{ required: true, message: "请输入要导入的IP或域名" }],
              component: {
                placeholder: "192.168.1.2\ncname.foo.com",
                rows: 8,
              },
              col: {
                span: 24,
              },
            },
          },
        },
        form: {
          async doSubmit({ form }) {
            return siteIpApi.Import({
              ...form,
              siteId: opts.siteId,
            });
          },
          afterSubmit,
        },
      },
    });
  }

  return {
    openSiteIpMonitorDialog,
    openSiteIpImportDialog,
  };
}

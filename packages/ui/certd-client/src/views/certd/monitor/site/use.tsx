import { useFormWrapper } from "@fast-crud/fast-crud";
import { siteInfoApi } from "./api";

export function useSiteImport() {
  const { openCrudFormDialog } = useFormWrapper();

  async function openSiteImportDialog(opts: { afterSubmit: any }) {
    const { afterSubmit } = opts;
    await openCrudFormDialog<any>({
      crudOptions: {
        columns: {
          text: {
            type: "textarea",
            title: "域名列表",
            form: {
              helper: "格式【域名:端口:名称】，一行一个，其中端口、名称可以省略\n比如：\nwww.baidu.com:443:百度\nwww.taobao.com::淘宝\nwww.google.com",
              rules: [{ required: true, message: "请输入要导入的域名" }],
              component: {
                placeholder: "www.baidu.com:443:百度\nwww.taobao.com::淘宝\nwww.google.com\n",
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
            return siteInfoApi.Import(form);
          },
          afterSubmit,
        },
      },
    });
  }

  return {
    openSiteImportDialog,
  };
}

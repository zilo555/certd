import { useFormWrapper } from "@fast-crud/fast-crud";
import { siteInfoApi } from "./api";
import { useI18n } from "/src/locales";
import GroupSelector from "../../basic/group/group-selector.vue";
export function useSiteImport() {
  const { t } = useI18n();
  const { openCrudFormDialog } = useFormWrapper();

  async function openSiteImportDialog(opts: { afterSubmit: any; defaultGroupId?: number }) {
    const { afterSubmit, defaultGroupId } = opts;
    await openCrudFormDialog<any>({
      crudOptions: {
        columns: {
          text: {
            type: "textarea",
            title: t("certd.domainList.title"), // 域名列表
            form: {
              helper: t("certd.domainList.helper"),
              rules: [{ required: true, message: t("certd.domainList.required") }],
              component: {
                placeholder: t("certd.domainList.placeholder"),
                rows: 8,
              },
              col: {
                span: 24,
              },
            },
          },
          groupId: {
            type: "select",
            title: t("certd.fields.group"),
            form: {
              value: defaultGroupId,
              component: {
                name: GroupSelector,
                vModel: "modelValue",
                type: "site",
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

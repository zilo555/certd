import { useFormWrapper } from "@fast-crud/fast-crud";
import { siteInfoApi } from "./api";
import { useI18n } from "vue-i18n";

export function useSiteImport() {
	const { t } = useI18n();
	const { openCrudFormDialog } = useFormWrapper();

	async function openSiteImportDialog(opts: { afterSubmit: any }) {
		const { afterSubmit } = opts;
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

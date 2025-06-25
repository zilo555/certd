// @ts-ignore
import { useI18n } from "vue-i18n";
//
import { AddReq, compute, CreateCrudOptionsProps, CreateCrudOptionsRet, DelReq, dict, EditReq, useFormWrapper, UserPageQuery, UserPageRes } from "@fast-crud/fast-crud";
import { certInfoApi } from "./api";
import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { useModal } from "/@/use/use-modal";
import { notification } from "ant-design-vue";
import CertView from "/@/views/certd/pipeline/cert-view.vue";
import { useCertUpload } from "/@/views/certd/pipeline/cert-upload/use";

export default function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const { t } = useI18n();
	const api = certInfoApi;
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
	const viewCert = async (row: any) => {
		const cert = await api.GetCert(row.id);
		if (!cert) {
			notification.error({ message: t("certd.certificateNotGenerated") });
			return;
		}

		model.success({
			title: t("certd.modal.viewCertificateTitle"),
			maskClosable: true,
			okText: t("certd.modal.close"),
			width: 800,
			content: () => {
				return <CertView cert={cert}></CertView>;
			},
		});
	};

	const { openUploadCreateDialog, openUpdateCertDialog } = useCertUpload();
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
						text: "上传自定义证书",
						type: "primary",
						show: false,
						async click() {
							await openUploadCreateDialog();
						},
					},
				},
			},
			tabs: {
				name: "fromType",
				show: true,
			},
			rowHandle: {
				width: 100,
				fixed: "right",
				buttons: {
					view: { show: false },
					viewCert: {
						order: 3,
						title: t("certd.viewCert.title"),
						type: "link",
						icon: "ph:certificate",
						async click({ row }) {
							await viewCert(row);
						},
					},
					copy: { show: false },
					edit: { show: false },
					remove: {
						order: 10,
						show: false,
					},
					download: {
						order: 9,
						title: t("certd.download.title"),
						type: "link",
						icon: "ant-design:download-outlined",
						async click({ row }) {
							if (!row.certFile) {
								notification.error({ message: t("certd.certificateNotGenerated") });
								return;
							}
							window.open("/api/monitor/cert/download?id=" + row.id);
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
						width: 100,
						editable: {
							disabled: true,
						},
					},
					form: {
						show: false,
					},
				},
				fromType: {
					title: "来源",
					search: {
						show: true,
					},
					type: "dict-select",
					dict: dict({
						data: [
							{ label: "流水线", value: "pipeline" },
							{ label: "手动上传", value: "upload" },
						],
					}),
					form: {
						show: false,
					},
					column: {
						width: 100,
						sorter: true,
						component: {
							color: "auto",
						},
						conditionalRender: false,
					},
					valueBuilder({ value, row, key }) {
						if (!value) {
							row[key] = "pipeline";
						}
					},
				},
				domains: {
					title: "域名",
					search: {
						show: true,
					},
					type: "text",
					form: {
						rules: [{ required: true, message: "请输入域名" }],
					},
					column: {
						width: 450,
						sorter: true,
						component: {
							name: "fs-values-format",
							color: "auto",
						},
					},
				},
				domainCount: {
					title: "域名数量",
					type: "number",
					form: {
						show: false,
					},
					column: {
						width: 120,
						sorter: true,
						show: false,
					},
				},
				expiresLeft: {
					title: "有效天数",
					search: {
						show: false,
					},
					type: "date",
					form: {
						show: false,
					},
					column: {
						sorter: true,
						conditionalRender: false,
						cellRender({ row }) {
							const value = row.expiresTime;
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
				expiresTime: {
					title: "过期时间",
					search: {
						show: false,
					},
					type: "datetime",
					form: {
						show: false,
					},
					column: {
						sorter: true,
					},
				},
				certProvider: {
					title: "证书颁发机构",
					search: {
						show: false,
					},
					type: "text",
					form: {
						show: false,
					},
					column: {
						width: 200,
					},
				},
				applyTime: {
					title: "申请时间",
					search: {
						show: false,
					},
					type: "datetime",
					form: {
						show: false,
					},
					column: {
						sorter: true,
					},
				},
				"pipeline.title": {
					title: "关联流水线",
					search: { show: false },
					type: "link",
					form: {
						show: false,
					},
					column: {
						width: 350,
						sorter: true,
						component: {
							on: {
								onClick({ row }) {
									router.push({ path: "/certd/pipeline/detail", query: { id: row.pipelineId, editMode: "false" } });
								},
							},
						},
					},
				},
			},
		},
	};
}

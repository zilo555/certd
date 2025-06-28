<template>
	<fs-page>
		<template #header>
			<div class="title flex items-center">
				{{ t("certd.monitor.title") }}
				<div class="sub flex-1">
					<div>
						{{ t("certd.monitor.description") }}
						<router-link to="/certd/monitor/setting">{{ t("certd.monitor.settingLink") }}</router-link>
					</div>
					<div class="flex items-center">
						{{ t("certd.monitor.limitInfo") }}
						<vip-button class="ml-5" mode="nav"></vip-button>
					</div>
				</div>
			</div>
			<div class="more">
				<a-button type="primary" @click="checkAll">{{ t("certd.monitor.checkAll") }}</a-button>
			</div>
		</template>
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
	</fs-page>
</template>


<script lang="ts" setup>
import { onActivated, onMounted } from "vue";
import { useFs } from "@fast-crud/fast-crud";
import createCrudOptions from "./crud";
import { siteInfoApi } from "./api";
import { Modal, notification } from "ant-design-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
defineOptions({
	name: "SiteCertMonitor",
});
const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions, context: {} });
function checkAll() {
	Modal.confirm({
		title: t("certd.monitor.confirmTitle"), // "确认"
		content: t("certd.monitor.confirmContent"), // "确认触发检查全部站点证书吗?"
		onOk: async () => {
			await siteInfoApi.CheckAll();
			notification.success({
				message: t("certd.monitor.checkSubmitted"), // "检查任务已提交"
				description: t("certd.monitor.pleaseRefresh"), // "请稍后刷新页面查看结果"
			});
		},
	});
}


// 页面打开后获取列表数据
onMounted(() => {
	crudExpose.doRefresh();
});
onActivated(() => {
	crudExpose.doRefresh();
});
</script>

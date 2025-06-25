import { useSettingStore } from "/@/store/settings";
import aboutResource from "/@/router/source/modules/about";
import i18n from '/@/locales/i18n';

export const certdResources = [
	{
		title: i18n.global.t("certd.title"),
		name: "CertdRoot",
		path: "/certd",
		redirect: "/certd/pipeline",
		meta: {
			icon: "ion:key-outline",
			auth: true,
			order: 0,
		},
		children: [
			{
				title: i18n.global.t("certd.pipeline"),
				name: "PipelineManager",
				path: "/certd/pipeline",
				component: "/certd/pipeline/index.vue",
				meta: {
					icon: "ion:analytics-sharp",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t("certd.pipelineEdit"),
				name: "PipelineEdit",
				path: "/certd/pipeline/detail",
				component: "/certd/pipeline/detail.vue",
				meta: {
					isMenu: false,
				},
			},
			{
				title: i18n.global.t("certd.history"),
				name: "PipelineHistory",
				path: "/certd/history",
				component: "/certd/history/index.vue",
				meta: {
					icon: "ion:timer-outline",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t("certd.certStore"),
				name: "CertStore",
				path: "/certd/monitor/cert",
				component: "/certd/monitor/cert/index.vue",
				meta: {
					icon: "ion:shield-checkmark-outline",
					auth: true,
					isMenu: true,
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t("certd.siteMonitor"),
				name: "SiteCertMonitor",
				path: "/certd/monitor/site",
				component: "/certd/monitor/site/index.vue",
				meta: {
					icon: "ion:videocam-outline",
					auth: true,
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t("certd.settings"),
				name: "MineSetting",
				path: "/certd/setting",
				redirect: "/certd/access",
				meta: {
					icon: "ion:settings-outline",
					auth: true,
					keepAlive: true,
				},
				children: [
					{
						title: i18n.global.t("certd.accessManager"),
						name: "AccessManager",
						path: "/certd/access",
						component: "/certd/access/index.vue",
						meta: {
							icon: "ion:disc-outline",
							auth: true,
							keepAlive: true,
						},
					},
					{
						title: i18n.global.t("certd.cnameRecord"),
						name: "CnameRecord",
						path: "/certd/cname/record",
						component: "/certd/cname/record/index.vue",
						meta: {
							icon: "ion:link-outline",
							auth: true,
							keepAlive: true,
						},
					},
					{
						title: i18n.global.t("certd.subDomain"),
						name: "SubDomain",
						path: "/certd/pipeline/subDomain",
						component: "/certd/pipeline/sub-domain/index.vue",
						meta: {
							icon: "material-symbols:approval-delegation-outline",
							auth: true,
							keepAlive: true,
						},
					},
					{
						title: i18n.global.t("certd.pipelineGroup"),
						name: "PipelineGroupManager",
						path: "/certd/pipeline/group",
						component: "/certd/pipeline/group/index.vue",
						meta: {
							icon: "mdi:format-list-group",
							auth: true,
							keepAlive: true,
						},
					},
					{
						title: i18n.global.t("certd.openKey"),
						name: "OpenKey",
						path: "/certd/open/openkey",
						component: "/certd/open/openkey/index.vue",
						meta: {
							icon: "hugeicons:api",
							auth: true,
							keepAlive: true,
						},
					},
					{
						title: i18n.global.t("certd.notification"),
						name: "NotificationManager",
						path: "/certd/notification",
						component: "/certd/notification/index.vue",
						meta: {
							icon: "ion:megaphone-outline",
							auth: true,
							keepAlive: true,
						},
					},
					{
						title: i18n.global.t("certd.siteMonitorSetting"),
						name: "SiteMonitorSetting",
						path: "/certd/monitor/setting",
						component: "/certd/monitor/site/setting/index.vue",
						meta: {
							icon: "ion:videocam-outline",
							auth: true,
							isMenu: true,
						},
					},
					{
						title: i18n.global.t("certd.userSecurity"),
						name: "UserSecurity",
						path: "/certd/mine/security",
						component: "/certd/mine/security/index.vue",
						meta: {
							icon: "fluent:shield-keyhole-16-regular",
							auth: true,
							isMenu: true,
						},
					},
					{
						title: i18n.global.t("certd.userProfile"),
						name: "UserProfile",
						path: "/certd/mine/user-profile",
						component: "/certd/mine/user-profile.vue",
						meta: {
							icon: "ion:person-outline",
							auth: true,
							isMenu: false,
						},
					},
				],
			},
			{
				title: i18n.global.t("certd.suite"),
				name: "SuiteProduct",
				path: "/certd/suite",
				redirect: "/certd/suite/mine",
				meta: {
					show: () => {
						const settingStore = useSettingStore();
						return settingStore.isComm && settingStore.isSuiteEnabled;
					},
					icon: "ion:cart-outline",
					auth: true,
				},
				children: [
					{
						title: i18n.global.t("certd.mySuite"),
						name: "MySuite",
						path: "/certd/suite/mine",
						component: "/certd/suite/mine/index.vue",
						meta: {
							show: () => {
								const settingStore = useSettingStore();
								return settingStore.isComm;
							},
							icon: "ion:gift-outline",
							auth: true,
						},
					},
					{
						title: i18n.global.t("certd.suiteBuy"),
						name: "SuiteProductBuy",
						path: "/certd/suite/buy",
						component: "/certd/suite/buy.vue",
						meta: {
							show: () => {
								const settingStore = useSettingStore();
								return settingStore.isComm;
							},
							icon: "ion:cart-outline",
							auth: true,
						},
					},
					{
						title: i18n.global.t("certd.myTrade"),
						name: "MyTrade",
						path: "/certd/trade",
						component: "/certd/trade/index.vue",
						meta: {
							show: () => {
								const settingStore = useSettingStore();
								return settingStore.isComm;
							},
							icon: "ion:bag-check-outline",
							auth: true,
							keepAlive: true,
						},
					},
					{
						title: i18n.global.t("certd.paymentReturn"),
						name: "PaymentReturn",
						path: "/certd/payment/return/:type",
						component: "/certd/payment/return.vue",
						meta: {
							icon: "ant-design:pay-circle-outlined",
							auth: false,
							isMenu: false,
						},
					},
				],
			},
		],
	},
];


export default certdResources;

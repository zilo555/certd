import LayoutPass from "/@/layout/layout-pass.vue";
import { useSettingStore } from "/@/store/settings";
import aboutResource from "/@/router/source/modules/about";
import i18n from '/@/locales/i18n';

export const sysResources = [
	{
		title: i18n.global.t('certd.sysResources.sysRoot'),
		name: "SysRoot",
		path: "/sys",
		redirect: "/sys/settings",
		meta: {
			icon: "ion:settings-outline",
			permission: "sys:settings:view",
			order: 10,
		},
		children: [
			{
				title: i18n.global.t('certd.sysResources.sysConsole'),
				name: "SysConsole",
				path: "/sys/console",
				component: "/sys/console/index.vue",
				meta: {
					show: () => {
						const settingStore = useSettingStore();
						return settingStore.isComm;
					},
					icon: "ion:speedometer-outline",
					permission: "sys:auth:user:view",
				},
			},

			{
				title: i18n.global.t('certd.sysResources.sysSettings'),
				name: "SysSettings",
				path: "/sys/settings",
				component: "/sys/settings/index.vue",
				meta: {
					icon: "ion:settings-outline",
					permission: "sys:settings:view",
				},
			},
			{
				title: i18n.global.t('certd.sysResources.cnameSetting'),
				name: "CnameSetting",
				path: "/sys/cname/provider",
				component: "/sys/cname/provider/index.vue",
				meta: {
					icon: "ion:earth-outline",
					permission: "sys:settings:view",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t('certd.sysResources.emailSetting'),
				name: "EmailSetting",
				path: "/sys/settings/email",
				component: "/sys/settings/email/index.vue",
				meta: {
					permission: "sys:settings:view",
					icon: "ion:mail-outline",
					auth: true,
				},
			},
			{
				title: i18n.global.t('certd.sysResources.siteSetting'),
				name: "SiteSetting",
				path: "/sys/site",
				component: "/sys/site/index.vue",
				meta: {
					show: () => {
						const settingStore = useSettingStore();
						return settingStore.isComm;
					},
					icon: "ion:document-text-outline",
					permission: "sys:settings:view",
				},
			},
			{
				title: i18n.global.t('certd.sysResources.headerMenus'),
				name: "HeaderMenus",
				path: "/sys/settings/header-menus",
				component: "/sys/settings/header-menus/index.vue",
				meta: {
					show: () => {
						const settingStore = useSettingStore();
						return settingStore.isComm;
					},
					icon: "ion:menu",
					permission: "sys:settings:view",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t('certd.sysResources.sysAccess'),
				name: "SysAccess",
				path: "/sys/access",
				component: "/sys/access/index.vue",
				meta: {
					show: () => {
						const settingStore = useSettingStore();
						return settingStore.isComm;
					},
					icon: "ion:disc-outline",
					permission: "sys:settings:view",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t('certd.sysResources.sysPlugin'),
				name: "SysPlugin",
				path: "/sys/plugin",
				component: "/sys/plugin/index.vue",
				meta: {
					icon: "ion:extension-puzzle-outline",
					permission: "sys:settings:view",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t('certd.sysResources.sysPluginEdit'),
				name: "SysPluginEdit",
				path: "/sys/plugin/edit",
				component: "/sys/plugin/edit.vue",
				meta: {
					isMenu: false,
					icon: "ion:extension-puzzle",
					permission: "sys:settings:view",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t('certd.sysResources.sysPluginConfig'),
				name: "SysPluginConfig",
				path: "/sys/plugin/config",
				component: "/sys/plugin/config.vue",
				meta: {
					show: () => {
						const settingStore = useSettingStore();
						return settingStore.isComm;
					},
					icon: "ion:extension-puzzle",
					permission: "sys:settings:view",
				},
			},
			{
				title: i18n.global.t('certd.sysResources.accountBind'),
				name: "AccountBind",
				path: "/sys/account",
				component: "/sys/account/index.vue",
				meta: {
					icon: "ion:golf-outline",
					permission: "sys:settings:view",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t('certd.sysResources.permissionManager'),
				name: "PermissionManager",
				path: "/sys/authority/permission",
				component: "/sys/authority/permission/index.vue",
				meta: {
					icon: "ion:list-outline",
					permission: "sys:auth:per:view",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t('certd.sysResources.roleManager'),
				name: "RoleManager",
				path: "/sys/authority/role",
				component: "/sys/authority/role/index.vue",
				meta: {
					icon: "ion:people-outline",
					permission: "sys:auth:role:view",
					keepAlive: true,
				},
			},
			{
				title: i18n.global.t('certd.sysResources.userManager'),
				name: "UserManager",
				path: "/sys/authority/user",
				component: "/sys/authority/user/index.vue",
				meta: {
					icon: "ion:person-outline",
					permission: "sys:auth:user:view",
					keepAlive: true,
				},
			},

			{
				title: i18n.global.t('certd.sysResources.suiteManager'),
				name: "SuiteManager",
				path: "/sys/suite",
				redirect: "/sys/suite/setting",
				meta: {
					icon: "ion:cart-outline",
					permission: "sys:settings:edit",
					show: () => {
						const settingStore = useSettingStore();
						return settingStore.isComm;
					},
					keepAlive: true,
				},
				children: [
					{
						title: i18n.global.t('certd.sysResources.suiteSetting'),
						name: "SuiteSetting",
						path: "/sys/suite/setting",
						component: "/sys/suite/setting/index.vue",
						meta: {
							show: () => {
								const settingStore = useSettingStore();
								return settingStore.isComm;
							},
							icon: "ion:cart",
							permission: "sys:settings:edit",
						},
					},
					{
						title: i18n.global.t('certd.sysResources.orderManager'),
						name: "OrderManager",
						path: "/sys/suite/trade",
						component: "/sys/suite/trade/index.vue",
						meta: {
							show: () => {
								const settingStore = useSettingStore();
								return settingStore.isComm;
							},
							icon: "ion:bag-check",
							permission: "sys:settings:edit",
							keepAlive: true,
						},
					},
					{
						title: i18n.global.t('certd.sysResources.userSuites'),
						name: "UserSuites",
						path: "/sys/suite/user-suite",
						component: "/sys/suite/user-suite/index.vue",
						meta: {
							show: () => {
								const settingStore = useSettingStore();
								return settingStore.isComm;
							},
							icon: "ion:gift-outline",
							auth: true,
							keepAlive: true,
						},
					},
				],
			},
		],
	},
];

export default sysResources;

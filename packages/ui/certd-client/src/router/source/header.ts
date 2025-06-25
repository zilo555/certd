import i18n from '/@/locales/i18n';

export const headerResource = [
	{
		title: i18n.global.t("certd.helpDoc"),
		path: "https://certd.docmirror.cn",
		meta: {
			icon: "ion:document-text-outline"
		}
	},
	{
		title: i18n.global.t("certd.source"),
		name: "source",
		key: "source",
		meta: {
			icon: "ion:git-branch-outline"
		},
		children: [
			{
				title: i18n.global.t("certd.github"),
				path: "https://github.com/certd/certd",
				meta: {
					icon: "ion:logo-github"
				}
			},
			{
				title: i18n.global.t("certd.gitee"),
				path: "https://gitee.com/certd/certd",
				meta: {
					icon: "ion:logo-octocat"
				}
			}
		]
	}
];


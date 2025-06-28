import i18n from "/@/locales/i18n";

export const headerResource = [
  {
    title: "certd.helpDoc",
    path: "https://certd.docmirror.cn",
    meta: {
      icon: "ion:document-text-outline",
    },
  },
  {
    title: "certd.source",
    name: "source",
    key: "source",
    meta: {
      icon: "ion:git-branch-outline",
    },
    children: [
      {
        title: "certd.github",
        path: "https://github.com/certd/certd",
        meta: {
          icon: "ion:logo-github",
        },
      },
      {
        title: "certd.gitee",
        path: "https://gitee.com/certd/certd",
        meta: {
          icon: "ion:logo-octocat",
        },
      },
    ],
  },
];

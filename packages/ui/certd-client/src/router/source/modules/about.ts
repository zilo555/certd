import { IFrameView } from "/@/vben/layouts";
import { useSettingStore } from "/@/store/modules/settings";

export const aboutResource = [
  {
    title: "文档",
    name: "about",
    path: "/about",
    redirect: "/about/doc",
    meta: {
      icon: "lucide:copyright",
      order: 9999,
      show: () => {
        const settingStore = useSettingStore();
        return !settingStore.isComm;
      }
    },
    children: [
      {
        title: "文档",
        name: "document",
        path: "/about/doc",
        component: IFrameView,
        meta: {
          icon: "lucide:book-open-text",
          link: "https://certd.docmirror.cn",
          title: "文档"
        }
      },
      {
        name: "Github",
        path: "/about/github",
        component: IFrameView,
        meta: {
          icon: "mdi:github",
          link: "https://github.com/certd/certd",
          title: "Github"
        }
      },
      {
        name: "Gitee",
        path: "/about/gitee",
        component: IFrameView,
        meta: {
          icon: "ion:logo-octocat",
          link: "https://gitee.com/certd/certd",
          title: "Gite"
        }
      }
    ]
  }
];

export default aboutResource;

import { IFrameView } from "/@/vben/layouts";
import { useSettingStore } from "/@/store/settings";
import { computed } from "vue";
import TutorialButton from "/@/components/tutorial/index.vue";
export const aboutResource = [
  {
    title: "文档",
    name: "document",
    path: "/about/doc",
    component: IFrameView,
    meta: {
      icon: "lucide:book-open-text",
      link: "https://certd.docmirror.cn",
      title: "文档",
      order: 9999,
      show: () => {
        const settingStore = useSettingStore();
        return !settingStore.isComm;
      }
    }
  }
];

export default aboutResource;

import en from "./locale/en";
import zh from "./locale/zh_CN";
import { SupportedLanguagesType } from "/@/vben/locales";
export const messages = {
  "en-US": {
    label: "English",
    ...en
  },
  "zh-CN": {
    label: "简体中文",
    ...zh
  }
};

// export default createI18n({
//   legacy: false,
//   locale: "zh-cn",
//   fallbackLocale: "zh-cn",
//   messages
// });

export async function loadMessages(lang: SupportedLanguagesType) {
  return messages[lang];
}

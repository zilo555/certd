// const editorWorker = await import("monaco-editor/esm/vs/editor/editor.worker?worker");
// const jsonWorker = await import("monaco-editor/esm/vs/language/json/json.worker?worker");
// const cssWorker = await import("monaco-editor/esm/vs/language/css/css.worker?worker");
// const htmlWorker = await import("monaco-editor/esm/vs/language/html/html.worker?worker");
// const tsWorker = await import("monaco-editor/esm/vs/language/typescript/ts.worker?worker");
// const yamlWorker = await import("monaco-yaml/yaml.worker.js?worker");

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import yamlWorker from "./yaml.worker?worker";

const WorkerBucket: any = {};

/**
 * 注册自定义worker
 * @param name
 * @param worker
 */
export function registerWorker(name: string, worker: any) {
  WorkerBucket[name] = worker;
}
//@ts-ignore
window.MonacoEnvironment = {
  //@ts-ignore
  getWorker(_, label) {
    debugger;
    const custom = WorkerBucket[label];
    if (custom) {
      return new custom();
    }
    if (label === "json") {
      return new jsonWorker();
    } else if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    } else if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    } else if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    } else if (label === "yaml" || label === "yml") {
      //@ts-ignore
      return new yamlWorker();
    }
    return new editorWorker();
  },
};

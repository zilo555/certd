// 扫描目录，列出文件，然后加载为模块

import { join } from 'path';
import fs from 'fs'
import { pathToFileURL } from "node:url";
import path from 'path'
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  const result = [];
  // 扫描目录及子目录
  for (const file of files) {
    if (file.includes("index.js")) {
      continue;
    }

    const filePath = join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      result.push(...scanDir(filePath));
    } else {
      if (!file.endsWith(".js")) {
        continue;
      }
      result.push(filePath);
    }
  }
  return result
}

export default async function loadModules(dir) {
  const files = scanDir(dir);
  const modules = {}
  for (const file of files) {

    try {
      // 转换为 file:// URL（Windows 必需）
      const moduleUrl = pathToFileURL(file).href
      const module = await import(moduleUrl)

      // 如果模块有默认导出，优先使用
      modules[file] = module.default || module
    } catch (err) {
      console.error(`加载模块 ${file} 失败:`, err)
    }
  }
  return modules;
}

const modules = await loadModules('./dist/plugins');

for (const key in modules) {
  console.log(key)
}

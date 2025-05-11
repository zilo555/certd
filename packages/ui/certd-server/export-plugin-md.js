import "./dist/plugins/index.js";
import { accessRegistry, notificationRegistry, pluginGroups, pluginRegistry } from "@certd/pipeline";
import { dnsProviderRegistry } from "@certd/plugin-cert";
import fs from "fs";

function genPluginMd() {
  const plugins = {
    access: [],
    deploy: [],
    dnsProvider: [],
    notification: []
  };

  plugins.access = accessRegistry.getDefineList();
  plugins.deploy = pluginRegistry.getDefineList();
  plugins.dnsProvider = dnsProviderRegistry.getDefineList();
  plugins.notification = notificationRegistry.getDefineList();


//   function genMd(list) {
//     let mdContent = `<table style='width:100%'>
// <thead style='width:100%'>
// <tr >
//   <th width='70'>序号</th><th width='265'>名称</th><th>说明</th>
// </tr>
// </thead>
// <tbody>
// `;
//     let i = 0;
//     for (const x of list) {
//       i++
//       mdContent += `<tr> <td>${i}.</td> <td style='font-weight: bold'>${x.title}</td> <td>${x.desc||''}</td> </tr>`;
//     }
//     mdContent += `</tbody></table>`;
//     return mdContent;
//   }

  //   function genMd(list) {
  //   let mdContent = ``;
  //   let i = 0;
  //   for (const x of list) {
  //     i++
  //     mdContent += `${i}. **${x.title}**     \n${x.desc||''}  \n\n\n`;
  //   }
  //   return mdContent;
  // }

  function genMd(list) {
    let mdContent = `
| 序号 | 名称 | 说明 |
|-----|-----|-----|
`;
    let i = 0;
    for (const x of list) {
      i++
      mdContent += `| ${i}.| **${x.title}** | ${x.desc||''} | \n`;
    }
    return mdContent;
  }

  function addTableStyle(){
    return `
<style module>
table th:first-of-type {
        width: 65px;
    }
table th:nth-of-type(2) {
        width: 240px;
    }
</style>
    `
  }

  let mdContent = "";
  mdContent = "# 授权列表\n";
  mdContent += genMd(plugins.access);
  mdContent += addTableStyle()
  fs.writeFileSync("../../../docs/guide/plugins/access.md", mdContent);

  mdContent = "# DNS提供商\n";
  mdContent += genMd(plugins.dnsProvider);
  mdContent += addTableStyle()
  fs.writeFileSync("../../../docs/guide/plugins/dns-provider.md", mdContent);


  mdContent = "# 通知插件\n";
  mdContent += genMd(plugins.notification);
  mdContent += addTableStyle()
  fs.writeFileSync("../../../docs/guide/plugins/notification.md", mdContent);


  mdContent = "# 任务插件\n";
  mdContent += `共 \`${plugins.deploy.length}\` 款任务插件    \n`
  let index =0
  for (const key in pluginGroups) {
    index++
    const group = pluginGroups[key];
    mdContent += `## ${index}. ${group.title}\n`;
    mdContent += genMd(group.plugins);
  }
  mdContent += addTableStyle()
  fs.writeFileSync("../../../docs/guide/plugins/deploy.md", mdContent);

  process.exit()
}

genPluginMd()

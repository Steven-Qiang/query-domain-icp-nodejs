/**
 * @file: miit.test.js
 * @description: miit.test.js
 * @package: query-domain-icp-nodejs
 * @create: 2021-12-07 09:23:36
 * @author: qiangmouren (2962051004@qq.com)
 * -----
 * @last-modified: 2022-07-26 12:49:43
 * -----
 */

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
const Miit = require('./miit');

function ask() {
  return new Promise((resolve, reject) => {
    readline.question(`输入待查询的域名：`, (domain) => {
      resolve(domain);
      // readline.close()
    });
  });
}

async function doQuery(unitName) {
  const boot = new Miit(unitName);
  const resp = await boot.query();

  console.log(resp);

  resp.navigatepageNums.shift();
  for (const pageNum of resp.navigatepageNums) {
    console.log(await boot.query(pageNum));
  }
}

(async () => {
  while (1) {
    const unitName = await ask();
    await doQuery(unitName);
  }
})();

const fs = require('fs');

const css = fs.readFileSync('miracle-danmaku.css', 'utf8').trimEnd();
const assetUrl = 'https://raw.githubusercontent.com/maker0911/medical-danmaku-assets/4400f596a4e7ac0b414bf40860499d3c4ce036a4/assets/miracle/';
fs.writeFileSync('miracle-preview-local.css', css.replaceAll(assetUrl, 'assets/miracle/') + '\n');
const variants = [
  ['huixinghao-all.html', ['index.html', 'miracle-huixinghao.html'], '彗星号 · 奇迹款弹幕'],
  ['blivechat-all.html', ['miracle-blivechat.html'], 'BLiveChat · 奇迹款弹幕']
];

for (const [sourceFile, targetFiles, title] of variants) {
  const source = fs.readFileSync(sourceFile, 'utf8');
  const start = source.indexOf('/* BLiveChat 文字弹幕：');
  const end = source.indexOf('/* 欢迎上舰：', start);
  if (start < 0 || end < 0) throw new Error(`${sourceFile}: text styles not found`);
  const result = source.slice(0, start) + css + '\n\n' + source.slice(end);
  const output = result.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  for (const targetFile of targetFiles) fs.writeFileSync(targetFile, output);
}

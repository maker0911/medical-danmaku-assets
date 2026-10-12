const fs = require('fs');

const file = 'huixinghao-all.html';
const html = fs.readFileSync(file, 'utf8');
const css = fs.readFileSync('gift-thanks.css', 'utf8').trimEnd();
const start = html.indexOf('/* 礼物感谢卡：');
const end = html.indexOf('\n  </style>', start);
if (start < 0 || end < 0) throw new Error('Cannot locate embedded gift CSS');
fs.writeFileSync(file, html.slice(0, start) + css + html.slice(end));

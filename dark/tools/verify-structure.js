// verify-structure.js —— 结构自检（v1.1.67 工具页重构）
// ① 所有 JS 语法可解析 ② app.json 引用的页面/分包/组件路径都存在
// ③ WXML 标签配对 ④ WXSS 花括号配对 ⑤ 页面 json 的 usingComponents 路径存在
// ⑥ 全仓已无 pages/search、pages/weeks 的残留引用
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const MP = path.join(__dirname, '..', 'miniprogram');
const NODE = process.execPath;
let fail = 0;
const bad = (m) => { console.log('  ❌ ' + m); fail++; };

function walk(dir, out) {
  out = out || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, out);
    else out.push(p);
  });
  return out;
}
const files = walk(MP);
const rel = p => path.relative(MP, p).replace(/\\/g, '/');

// ① JS 语法
// ⚠️ 不用 child_process 调 node --check：本机沙箱里 spawnSync 一律静默失败（stderr 为空、status 非 0），
//    会得到「全部文件语法错误」的假结果。改用 new Function 编译源码 —— 只编译不执行，语法错必抛。
const jsFiles = files.filter(f => f.endsWith('.js'));
let jsOk = 0;
jsFiles.forEach(f => {
  const src = fs.readFileSync(f, 'utf8');
  try { new Function(src); jsOk++; }
  catch (e) { bad('JS 语法错误 ' + rel(f) + ' :: ' + e.message); }
});
console.log('① JS 语法：' + jsOk + '/' + jsFiles.length + ' 通过');

// ② app.json
const appJson = JSON.parse(fs.readFileSync(path.join(MP, 'app.json'), 'utf8'));
appJson.pages.forEach(p => {
  ['js', 'json', 'wxml', 'wxss'].forEach(ext => {
    const f = path.join(MP, p + '.' + ext);
    if (!fs.existsSync(f)) bad('缺文件 ' + p + '.' + ext);
  });
});
const subs = appJson.subPackages || appJson.subpackages || [];
subs.forEach(sp => {
  const root = path.join(MP, sp.root);
  if (!fs.existsSync(root)) bad('分包根不存在 ' + sp.root);
  sp.pages.forEach(p => {
    ['js', 'json', 'wxml', 'wxss'].forEach(ext => {
      const f = path.join(root, p + '.' + ext);
      if (!fs.existsSync(f)) bad('分包缺文件 ' + sp.root + '/' + p + '.' + ext);
    });
  });
  // 分包页面不能被列进主包 pages
  sp.pages.forEach(p => {
    if (appJson.pages.indexOf(sp.root + '/' + p) >= 0) bad('分包页被误列进主包 pages：' + sp.root + '/' + p);
  });
});
console.log('② app.json：主包 ' + appJson.pages.length + ' 页 / 分包 ' + subs.length + ' 个（' +
  subs.reduce((a, s) => a + s.pages.length, 0) + ' 页）');

// tabBar：顺序 + 页面存在
const tabList = (appJson.tabBar && appJson.tabBar.list) || [];
console.log('   tabBar 顺序：' + tabList.map(t => t.text + '(' + t.pagePath + ')').join(' → '));
tabList.forEach(t => {
  if (appJson.pages.indexOf(t.pagePath) < 0) bad('tabBar 页不在 pages 里：' + t.pagePath);
  ['iconPath', 'selectedIconPath'].forEach(k => { if (t[k] && !fs.existsSync(path.join(MP, t[k]))) bad('tab 图标缺失 ' + t[k]); });
});
// custom-tab-bar 的 list 必须与 app.json 一致
const cjs = fs.readFileSync(path.join(MP, 'custom-tab-bar/index.js'), 'utf8');
tabList.forEach(t => { if (cjs.indexOf(t.pagePath) < 0) bad('custom-tab-bar 缺 ' + t.pagePath); });

// ③ WXML 标签配对（简易：只查常见成对标签）
const PAIR = ['view', 'block', 'text', 'button', 'scroll-view', 'input', 'page-meta', 'navigator'];
files.filter(f => f.endsWith('.wxml')).forEach(f => {
  const s = fs.readFileSync(f, 'utf8');
  PAIR.forEach(tag => {
    if (tag === 'input' || tag === 'page-meta') return;   // 自闭合
    const open = (s.match(new RegExp('<' + tag + '(?=[\\s>])', 'g')) || []).length;
    const close = (s.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (open !== close) bad('WXML 标签不配对 ' + rel(f) + ' <' + tag + '> open=' + open + ' close=' + close);
  });
});
console.log('③ WXML 标签配对：检查 ' + files.filter(f => f.endsWith('.wxml')).length + ' 个文件');

// ④ WXSS 花括号
files.filter(f => f.endsWith('.wxss')).forEach(f => {
  const s = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const o = (s.match(/\{/g) || []).length, c = (s.match(/\}/g) || []).length;
  if (o !== c) bad('WXSS 花括号不配对 ' + rel(f) + ' {=' + o + ' }=' + c);
});
console.log('④ WXSS 花括号：检查 ' + files.filter(f => f.endsWith('.wxss')).length + ' 个文件');

// ⑤ usingComponents 路径
files.filter(f => f.endsWith('.json')).forEach(f => {
  let j; try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { bad('JSON 解析失败 ' + rel(f)); return; }
  const uc = j.usingComponents || {};
  Object.keys(uc).forEach(k => {
    let p = uc[k];
    let base;
    if (p.charAt(0) === '/') base = path.join(MP, p);
    else base = path.resolve(path.dirname(f), p);
    const ok = fs.existsSync(base + '.js') || fs.existsSync(path.join(base, 'index.js')) || fs.existsSync(base + '.json');
    if (!ok) bad('组件路径不存在 ' + rel(f) + ' → ' + uc[k]);
  });
  // 页面 json 里声明的 pages 引用检查已由 ② 覆盖
});
console.log('⑤ usingComponents 路径：已检查全部 json');

// ⑥ 旧页面残留引用
const DEAD = ['pages/search/search', 'pages/weeks/weeks'];
files.filter(f => /\.(js|json|wxml|wxss)$/.test(f)).forEach(f => {
  const s = fs.readFileSync(f, 'utf8');
  DEAD.forEach(d => { if (s.indexOf(d) >= 0) bad('仍引用已删除页面 ' + d + ' → ' + rel(f)); });
});
console.log('⑥ 旧页面残留引用：检查完毕');

console.log(fail ? ('\n=== 有 ' + fail + ' 处问题 ===') : '\n=== 全部通过 ===');
process.exit(fail ? 1 : 0);

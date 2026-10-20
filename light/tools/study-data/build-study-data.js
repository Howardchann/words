// build-study-data.js —— 把内容源 JSON 落成小程序数据文件
//   data/phonetic.json                       → miniprogram/utils/phonetic.js        （主包：工具页内联音标区）
//   data/grammar.json (+ data/grammar-map.json)
//                                            → miniprogram/utils/study-cats.js      （主包：工具页分类卡）
//                                            → miniprogram/pkg-study/data/grammar.js（分包：语法点全文）
//   data/grammar.json 的 group 字段             → miniprogram/utils/study-groups.js   （主包：分类分组，工具页/语法页分段用）
//
// ⚠️ grammar.js / study-cats.js / phonetic.js 三个文件都是本脚本的产物，不要手改。
//    改内容 → 改 data/*.json；改结构 → 改本脚本；然后：
//        node tools/study-data/build-study-data.js
//
// 路径全部相对本文件（换机 clone 后可直接跑，无需改任何绝对路径）。
//
// 🔴 grammar-map.json 用「扁平序号」记录「某语法点在哪几天讲过」：
//    序号 = 该主题之前所有分类的主题数累加 + 本分类内下标。
//    因此**只能在末尾追加新分类**；在中间插入/删除主题会让后面所有主题的课程对应天整体错位。
const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const MP = path.join(__dirname, '..', '..', 'miniprogram');

const phonetic = require(path.join(SRC, 'data', 'phonetic.json'));
const grammar = require(path.join(SRC, 'data', 'grammar.json'));
let map = { rev: {} };
try { map = require(path.join(SRC, 'data', 'grammar-map.json')); } catch (e) { console.warn('⚠️ 未找到 data/grammar-map.json，课程对应留空'); }

// 课程 g 节点扁平序号 → 日历天（与 data.js 的 WEEKS = concat(p1..p6) 一致）
// 每个文件 13 组 × 5 天 = 65 条；第 i 条：pf=⌊i/65⌋  wi=⌊(i%65)/5⌋  di=i%5
// day = (pf*13 + wi)*7 + di + 1
function dayOfCourseIdx(i) {
  const pf = Math.floor(i / 65), rem = i % 65;
  const wi = Math.floor(rem / 5), di = rem % 5;
  return (pf * 13 + wi) * 7 + di + 1;
}

const HEAD = (t) => `// ${t}\n// ⚠️ 本文件由 light/tools/study-data/build-study-data.js 生成，请勿手改；改内容请改同目录 data/*.json。\n`;

// 换行符按产物固定（**不要**改成"读现有文件自动检测"：文件一旦被写成 LF 就再也检测不回来）。
//   utils/phonetic.js        → CRLF（历史遗留，与 tools.* / speech.js 等同一批）
//   utils/study-cats.js      → LF
//   pkg-study/data/grammar.js→ LF
// 三个文件的大 JSON 都是「一整行」，EOL 对不上就会整行全变，git diff 无法审。
function writeEol(p, text, eol) {
  fs.writeFileSync(p, eol === '\r\n' ? text.replace(/\n/g, '\r\n') : text, 'utf8');
}

// ---- 1. utils/phonetic.js ----
const ph = phonetic.map(p => ({
  s: p.s, cls: p.cls, grp: p.grp, tips: p.tips, mix: p.mix,
  ex: p.ex.map(e => ({ w: e.w, cn: e.cn, hit: e.hit })),
}));
let phOut = HEAD('utils/phonetic.js —— 音标速查（44 个国际音标，英国 RP 体系）');
phOut += '// 字段：s 音标符号 / cls vowel|consonant / grp 子类 / tips 发音要领 / mix 易混提醒 / ex 例词\n';
phOut += '// 例词的播放：优先用词表里同形词的预生成音频（离线可听），词表里没有的走在线朗读。\n';
phOut += 'module.exports = ' + JSON.stringify(ph) + ';\n';
writeEol(path.join(MP, 'utils/phonetic.js'), phOut, '\r\n');

// ---- 2. utils/study-cats.js（工具页只需要分类卡，全文在分包）----
const cats = grammar.map(c => ({ id: c.id, name: c.name, intro: c.intro, count: c.topics.length }));
let catOut = HEAD('utils/study-cats.js —— 语法速查的 ' + cats.length + ' 个体系分类（工具页分类卡用）');
catOut += '// 完整语法点内容在分包 pkg-study/data/grammar.js；主包只保留这份「目录」，以免撑大启动包。\n';
catOut += 'module.exports = ' + JSON.stringify(cats) + ';\n';
writeEol(path.join(MP, 'utils/study-cats.js'), catOut, '\n');

// ---- 3. utils/study-groups.js（工具页/语法页的分段依据，v1.1.107）----
// 分组由 grammar.json 每个分类的 group 字段推导；study-cats / grammar 的产物形状**不动**，
// 这样既有 12 类的 JSON 键序能保持逐字节不变（加字段会让整行 diff）。
const GROUP_META = [
  { id: 'grammar', name: '语法' },
  { id: 'wordform', name: '词形与构词' },
];
const badGroup = grammar.filter(c => !GROUP_META.some(m => m.id === c.group));
if (badGroup.length) throw new Error('分类 group 缺失或非法：' + badGroup.map(c => c.id).join(', '));
const groups = GROUP_META.map(m => {
  const list = grammar.filter(c => c.group === m.id);
  return {
    id: m.id, name: m.name,
    ids: list.map(c => c.id),
    count: list.length,
    points: list.reduce((a, c) => a + c.topics.length, 0),
  };
});
let grpOut = HEAD('utils/study-groups.js —— 语法分类的分组（工具页分段 + 语法页分段用）');
grpOut += '// 字段：id 组 id / name 组名 / ids 分类 id（顺序同 grammar.js）/ count 分类数 / points 语法点数\n';
grpOut += '// 分组由 data/grammar.json 每个分类的 group 字段推导：新增分类写对 group 就会自动归组。\n';
grpOut += 'module.exports = ' + JSON.stringify(groups) + ';\n';
writeEol(path.join(MP, 'utils/study-groups.js'), grpOut, '\n');

// ---- 4. pkg-study/data/grammar.js（分包：全文，含课程对应天数）----
const full = grammar.map((c, ci) => {
  const base = grammar.slice(0, ci).reduce((a, x) => a + x.topics.length, 0);
  return {
    id: c.id, name: c.name, intro: c.intro,
    topics: c.topics.map((t, ti) => {
      const days = (map.rev && map.rev[base + ti] ? map.rev[base + ti] : []).map(dayOfCourseIdx);
      days.sort((a, b) => a - b);
      // 字段顺序必须与历史产物一致（t → plain → def → use → note → ex → days → tags）：
      // grammar.js 是单行 JSON，顺序一变就是全文件 diff。plain / tags 为 v1.1.68 起新增，缺省会被 JSON.stringify 丢掉。
      return { t: t.t, plain: t.plain, def: t.def, use: t.use, note: t.note, ex: t.ex, days: days, tags: t.tags };
    }),
  };
});
let gOut = HEAD('pkg-study/data/grammar.js —— 语法速查全文（' + full.length + ' 分类 / ' + full.reduce((a, c) => a + c.topics.length, 0) + ' 语法点）');
gOut += '// 字段：t 标题 / def 一句话定义 / use[] 怎么用 / note[] 注意什么 / ex[{en,cn}] 例句 / days[] 课程里讲过它的天（1 基）\n';
gOut += 'module.exports = ' + JSON.stringify(full) + ';\n';
fs.mkdirSync(path.join(MP, 'pkg-study/data'), { recursive: true });
writeEol(path.join(MP, 'pkg-study/data/grammar.js'), gOut, '\n');

const total = full.reduce((a, c) => a + c.topics.length, 0);
const linked = full.reduce((a, c) => a + c.topics.filter(t => t.days.length).length, 0);
console.log('OK 音标=' + ph.length + ' 个');
console.log('OK 语法分类=' + cats.length + ' 个 / 语法点=' + total + ' 个（其中 ' + linked + ' 个能在课程里找到对应天）');
groups.forEach(x => console.log('   [' + x.id + '] ' + x.name + '：' + x.count + ' 类 / ' + x.points + ' 点'));
console.log('   体积：phonetic=' + (fs.statSync(path.join(MP, 'utils/phonetic.js')).size) + 'B  study-cats=' +
  fs.statSync(path.join(MP, 'utils/study-cats.js')).size + 'B  grammar(分包)=' + fs.statSync(path.join(MP, 'pkg-study/data/grammar.js')).size + 'B');

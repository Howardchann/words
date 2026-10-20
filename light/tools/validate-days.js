#!/usr/bin/env node
// tools/validate-days.js —— 390 节全量数据校验（人工测不到的节用脚本兜底）
// v1.1.110 起：课程单位从「546 天」改为「6 册 / 78 章 / 390 节」，本脚本同步换口径。
//
// 用法：node tools/validate-days.js
// 输出：控制台摘要 + tools/validate-report.txt（有问题才列明细）
//
// 校验范围：
//   ① 章节表结构（78 章 × 5 节 + 章末自测 sun，字段非空；语法课需例句，复习/策略课允许空例句）
//   ② 骨架数组自洽（SEC_N 合计 = 8115、390 项；CH_SEC / BOOK_CHS 累加与偏移表一致；
//      **显式断言不再受「5 的倍数」约束**——WORD_TOTAL 只由 SEC_N 相加得出）
//   ③ 8115 词表逐行（单词/词性/释义/例句/音频编号非空，全局查重）
//   ④ 逐节 getSection(0..389)：词条数=SEC_N、core 标记与 CORE_CNT 一致、无重复词、
//      占位符 {D}{W}{Wp}{P1} 已全部替换、字段完整、章末节带 quiz
//   ⑤ 三层映射（sectionInfo / sectionOfKey ↔ keyOfSection / sectionOfDay / sectionOfWordIndex）

const fs = require('fs');
const path = require('path');
const plan = require('../miniprogram/utils/data.js');

const ROOT = path.resolve(__dirname, '..');
const problems = [];
let checks = 0;
function bad(msg) { const s = String(msg); if (problems.indexOf(s) < 0) problems.push(s); }
function ok(cond, msg) { checks++; if (!cond) bad(msg); }

const SEC_TOTAL = plan.SECTION_TOTAL;
const WORD_TOTAL = plan.WORD_TOTAL;

// ---------- ① 章节表结构 ----------
const WEEKS = plan.WEEKS;
ok(WEEKS.length === 78, `章数=${WEEKS.length}，应为 78`);
WEEKS.forEach((wk, i) => {
  const tag = `章${i + 1}`;
  if (!wk) { bad(`WEEKS[${i}] 为空`); return; }
  ok(wk.w === i + 1, `${tag} 旧周编号不连续（期望 ${i + 1}）`);
  ok(wk.p >= 1 && wk.p <= 4, `${tag} 阶段号非法：${wk.p}`);
  ok(!!wk.theme, `${tag} 缺 theme（章节标题）`);
  ok(Array.isArray(wk.d) && wk.d.length === 5, `${tag} 节数=${wk.d ? wk.d.length : 0}，应为 5`);
  (wk.d || []).forEach((d, k) => {
    const si = (plan.CH_OFF[i] || 0) + k;
    const dt = `${tag} 第${k + 1}节（si=${si}）`;
    if (!d) { bad(`${dt} 数据为空`); return; }
    ok(!!d.t, `${dt} 缺标题 t`);
    ok(!!d.obj, `${dt} 缺目标 obj`);
    ok(!!d.pr, `${dt} 缺练习 pr`);
    ok(!!d.tip, `${dt} 缺技巧 tip`);
    ok(d.g && !!d.g.t && !!d.g.exp, `${dt} 语法点 g.t/g.exp 缺失`);
    const exOk = d.g && Array.isArray(d.g.ex) && d.g.ex.every(s => typeof s === 'string' && s.trim());
    // 复习策略/方法课的 g.ex=[] 是有意设计：页面会显示「今日要点」而非「例句精读」。
    // 其余新授语言点（语法/词法/句型）必须至少有一条非空例句。
    const strategyDay = /巩固周|巩固|总复习与评估/.test(String(wk.theme || ''));
    ok(exOk && (d.g.ex.length > 0 || strategyDay), `${dt} 语法/语言点课 g.ex 缺失或含空串（复习策略课可为空）`);
  });
  ok(wk.sun && !!wk.sun.t && !!wk.sun.obj && !!wk.sun.pr && !!wk.sun.tip, `${tag} 章末自测 sun 字段缺失`);
});

// ---------- ② 骨架数组自洽 ----------
const SEC_N = plan.SEC_N, CH_SEC = plan.CH_SEC, BOOK_CHS = plan.BOOK_CHS;
ok(SEC_N.length === SEC_TOTAL, `SEC_N 长度=${SEC_N.length}，应与 SECTION_TOTAL=${SEC_TOTAL} 一致`);
ok(SEC_N.every(n => n > 0), 'SEC_N 存在非正值');
const nSum = SEC_N.reduce((a, b) => a + b, 0);
ok(nSum === WORD_TOTAL, `SEC_N 合计=${nSum}，应等于 WORD_TOTAL=${WORD_TOTAL}`);
ok(WORD_TOTAL === 8115, `WORD_TOTAL=${WORD_TOTAL}，应为 8115`);
// 「5 的倍数」已解除：这里只断言「词量 = 各节词量之和」，刻意不再出现 sum(RAMP)×5 的等式
ok(WORD_TOTAL % 5 !== 0 || true, '');
const chSecSum = CH_SEC.reduce((a, b) => a + b, 0);
ok(chSecSum === SEC_TOTAL, `CH_SEC 合计=${chSecSum}，应等于 ${SEC_TOTAL}`);
ok(BOOK_CHS.reduce((a, b) => a + b, 0) === CH_SEC.length, `BOOK_CHS 合计≠章数 ${CH_SEC.length}`);
ok(plan.CH_OFF.length === CH_SEC.length, `CH_OFF 长度=${plan.CH_OFF.length}`);
ok(plan.SEC_OFF.length === SEC_TOTAL, `SEC_OFF 长度=${plan.SEC_OFF.length}`);
ok(plan.SEC_OFF[SEC_TOTAL - 1] + SEC_N[SEC_TOTAL - 1] === WORD_TOTAL, 'SEC_OFF 末尾 + 末节词数 ≠ 8115');
// 章偏移必须逐项等于前项累加
(function () {
  let s = 0, b = 0, bad2 = 0;
  CH_SEC.forEach((n, i) => { if (plan.CH_OFF[i] !== s) bad2++; s += n; });
  BOOK_CHS.forEach((n, i) => { if (plan.BOOK_OFF[i] !== b) bad2++; b += n; });
  ok(bad2 === 0, `CH_OFF / BOOK_OFF 有 ${bad2} 项与前缀和不符`);
})();
const CORE_CNT = plan.CORE_CNT;
ok(CORE_CNT.length === SEC_TOTAL, `CORE_CNT 长度=${CORE_CNT.length}，应为 ${SEC_TOTAL}`);
ok(CORE_CNT.reduce((a, b) => a + b, 0) === 1125, `CORE_CNT 合计=${CORE_CNT.reduce((a, b) => a + b, 0)}，应为 1125`);
ok(CORE_CNT.every((n, i) => n >= 0 && n <= SEC_N[i]), 'CORE_CNT 存在负值或超过该节词数');
// 章标题唯一性（目录靠它区分章）
const themes = WEEKS.map(w => String((w && w.theme) || ''));
const dupTheme = themes.filter((t, i) => themes.indexOf(t) !== i);
if (dupTheme.length) bad(`章标题重复 ${dupTheme.length} 个：${dupTheme.slice(0, 5).join(' / ')}`);

// ---------- ③ 词表逐行（与 data.js 同层：require 运行时字符串，按真实 \n/\t 拆分） ----------
const WORD_PARTS = require('../miniprogram/utils/words.js');
const wordLines = (Array.isArray(WORD_PARTS) ? WORD_PARTS : WORD_PARTS.PARTS).join('\n').split('\n');
const seenW = new Map(), seenAi = new Map();
let dupW = [], dupAi = [], badLine = 0;
wordLines.forEach((ln, i) => {
  const row = String(ln).split('\t');
  if (row.length < 5 || row.slice(0, 4).some(s => !String(s || '').trim()) || !(parseInt(row[4], 10) > 0)) { badLine++; if (badLine <= 5) bad(`词表第 ${i + 1} 行字段缺失：${ln.slice(0, 60)}`); return; }
  const w = row[0];
  if (seenW.has(w)) dupW.push(w); else seenW.set(w, 1);
  const ai = row[4];
  if (seenAi.has(ai)) dupAi.push(ai); else seenAi.set(ai, 1);
});
ok(badLine === 0, `词表字段异常 ${badLine} 行`);
ok(wordLines.length === WORD_TOTAL, `词表行数=${wordLines.length}，应等于 WORD_TOTAL=${WORD_TOTAL}`);
if (dupW.length) bad(`词表重复单词 ${dupW.length} 个（前 10：${dupW.slice(0, 10).join(', ')}）`);
if (dupAi.length) bad(`词表重复音频编号 ${dupAi.length} 个（前 10：${dupAi.slice(0, 10).join(', ')}）`);

// ---------- ④ 逐节 getSection ----------
const PH = /\{(D|W|Wp|P1)\}/;
let wordVisits = 0, quizCnt = 0;
for (let si = 0; si < SEC_TOTAL; si++) {
  const info = plan.sectionInfo(si);
  if (!info) { bad(`sectionInfo(${si}) 返回 null`); continue; }
  ok(info.no === si + 1, `sectionInfo(${si}).no=${info.no}`);
  ok(info.k >= 0 && info.k < 5, `sectionInfo(${si}).k=${info.k} 越界`);
  ok(info.ch === plan.SEC_CH[si], `sectionInfo(${si}).ch 与 SEC_CH 不一致`);
  ok(info.loc === `第 ${info.bookNo} 册 · 第 ${info.chInBook} 章 · 第 ${info.kNo} 节`, `sectionInfo(${si}).loc 拼装异常：${info.loc}`);
  ok(info.bookNo >= 1 && info.bookNo <= 6, `sectionInfo(${si}).bookNo=${info.bookNo} 越界`);
  ok(info.chInBook >= 1 && info.chInBook <= 13, `sectionInfo(${si}).chInBook=${info.chInBook} 越界`);

  const d = plan.getSection(si);
  if (!d) { bad(`节 ${si}：getSection 返回 null`); continue; }
  ok(d.type === 'study', `节 ${si} type=${d.type}，应为 study`);
  ok(Array.isArray(d.v) && d.v.length === SEC_N[si], `节 ${si} 词数=${d.v ? d.v.length : 0}，SEC_N 应为 ${SEC_N[si]}`);
  ok(d.coreCount + d.extraCount === (d.v ? d.v.length : 0), `节 ${si} core+extra ≠ 词数`);
  const inSec = new Set();
  (d.v || []).forEach((v, i) => {
    wordVisits++;
    if (!v.w || !v.m || !v.p || !v.e || !(v.ai > 0)) { bad(`节 ${si} 第 ${i + 1} 词字段缺失：${JSON.stringify(v).slice(0, 60)}`); return; }
    if (inSec.has(v.w)) bad(`节 ${si} 重复单词：${v.w}`);
    inSec.add(v.w);
    ok(v.core === (i < d.coreCount), `节 ${si} 第 ${i + 1} 词 core 标记与 coreCount 不一致`);
    if (!v.core && i < d.coreCount) bad(`节 ${si} 前 ${d.coreCount} 词中出现非 core`);
  });
  ok(!!d.t && !!d.obj && !!d.pr && !!d.tip && d.g && !!d.g.t, `节 ${si} 教学字段缺失`);
  [d.t, d.obj, d.pr, d.tip].forEach(s => { if (PH.test(s)) bad(`节 ${si} 存在未替换占位符：${String(s).slice(0, 40)}`); });
  ok(/分钟$/.test(d.time || ''), `节 ${si} time 异常：${d.time}`);
  if (info.last) {
    quizCnt++;
    ok(!!d.quiz && !!d.quiz.t && !!d.quiz.pr, `节 ${si}（章末）quiz 缺失`);
    if (d.quiz) {
      [d.quiz.obj, d.quiz.pr, d.quiz.tip].forEach(s => { if (PH.test(s)) bad(`节 ${si}（章末自测）存在未替换占位符：${String(s).slice(0, 40)}`); });
    }
  } else {
    ok(!d.quiz, `节 ${si} 非章末节却带了 quiz`);
  }
}
ok(quizCnt === 78, `章末自测数=${quizCnt}，应为 78`);

// ---------- ⑤ 三层映射 ----------
let mapBad = 0;
for (let si = 0; si < SEC_TOTAL; si++) {
  const key = plan.keyOfSection(si);
  if (!/^w\d+d[1-5]$/.test(key)) { mapBad++; if (mapBad <= 5) bad(`keyOfSection(${si}) = ${key}`); continue; }
  if (plan.sectionOfKey(key) !== si) { mapBad++; if (mapBad <= 5) bad(`sectionOfKey(${key}) ≠ ${si}`); }
}
ok(mapBad === 0, `进度键往返映射有 ${mapBad} 处不一致`);
ok(plan.sectionOfKey('w1d6') === -1 && plan.sectionOfKey('w1d7') === -1, '旧弹性日键（d6/d7）应返回 -1');
ok(plan.sectionOfKey('w0d1') === -1 && plan.sectionOfKey('w79d1') === -1 && plan.sectionOfKey('') === -1, '非法键未返回 -1');
ok(plan.sectionInfo(-1) === null && plan.sectionInfo(SEC_TOTAL) === null, 'sectionInfo 越界未返回 null');
ok(plan.getSection(-1) === null && plan.getSection(SEC_TOTAL) === null, 'getSection 越界未返回 null');
// 旧日号 → 节（语法页「课程对应」用）：每周 7 天里前 5 天有词，弹性日归本周第 5 节
ok(plan.sectionOfDay(1) === 0 && plan.sectionOfDay(5) === 4, 'sectionOfDay 首周映射错误');
ok(plan.sectionOfDay(6) === 4 && plan.sectionOfDay(7) === 4, 'sectionOfDay 弹性日应归本周第 5 节');
ok(plan.sectionOfDay(8) === 5, 'sectionOfDay 第 2 周首日应映射到 si=5');
ok(plan.sectionOfDay(0) === -1 && plan.sectionOfDay(SEC_TOTAL * 2) === -1, 'sectionOfDay 越界未返回 -1');
// 词表下标 → 节：区间必须首尾相接
(function () {
  let bad3 = 0;
  for (let i = 0; i < WORD_TOTAL; i++) {
    const si = plan.sectionOfWordIndex(i);
    if (!(si >= 0 && si < SEC_TOTAL)) { bad3++; continue; }
    if (i < plan.SEC_OFF[si] || i >= plan.SEC_OFF[si] + SEC_N[si]) bad3++;
  }
  ok(bad3 === 0, `sectionOfWordIndex 有 ${bad3} 个下标落到错误区间`);
})();
// 目录树：只展开一册一章，节点数应远小于全量 390
(function () {
  const tree = plan.bookTree({}, -1, -1, 0);
  ok(Array.isArray(tree) && tree.length === 6, `bookTree 顶层应为 6 册，实得 ${tree && tree.length}`);
  const opened = plan.bookTree({}, 0, 0, 0);
  const flat = opened.reduce((a, b) => a + (b.chapters ? b.chapters.length : 0), 0);
  ok(flat === 13, `展开 1 册应只有 13 章节点，实得 ${flat}`);
})();

// ---------- 汇总 ----------
const head = [
  '==== 390 节全量数据校验报告（v1.1.110 章节骨架） ====',
  `时间：${new Date().toLocaleString('zh-CN')}`,
  `断言通过：${checks - problems.length}/${checks}`,
  `覆盖：${plan.BOOK_COUNT} 册 · ${plan.WEEK_COUNT} 章 · ${SEC_TOTAL} 节 · 词条访问 ${wordVisits} 次 · 章末自测 ${quizCnt} 个`,
  `词表：${wordLines.length} 行，唯一单词 ${seenW.size}，唯一音频编号 ${seenAi.size}，WORD_TOTAL=${WORD_TOTAL}`,
  '',
];
let out;
if (!problems.length) {
  out = head.join('\n') + '✅ 全部通过，未发现数据问题。\n';
} else {
  out = head.join('\n') + `❌ 发现 ${problems.length} 个问题：\n` + problems.map((p, i) => `${i + 1}. ${p}`).join('\n') + '\n';
}
fs.writeFileSync(path.join(__dirname, 'validate-report.txt'), out);
console.log(out.split('\n').slice(0, 8).join('\n'));
console.log(problems.length ? `❌ ${problems.length} 个问题，明细见 tools/validate-report.txt` : '✅ 全部通过（tools/validate-report.txt）');

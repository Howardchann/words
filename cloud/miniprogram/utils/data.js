// utils/data.js —— 课程骨架 + 词表装配（6 册 / 78 章 / 390 节 / 8115 词）
//
// 结构
// ────────
// · utils/data-p1..p6.js  只存教学内容：每册 13 章，每章 5 节（d[]）+ 章末自测（sun）
// · utils/words.js        8115 词表，顺序 = 课程顺序（每节：核心主题词 → 扩展词）
// · SEC_N[]               每节新词数（390 项，显式数据）
// · CH_SEC[] / BOOK_CHS[] 每章节数（78 项）/ 每册章数（6 项）
//
// 为什么不再用「每天 N 词 × 5 天」推算（v1.1.110）
// ─────────────────────────────────────────────
// 旧模型里 WORD_TOTAL 恒等于 sum(RAMP) × 5，加词必须先凑成 5 的倍数；而且一章 5 节
// 被强行绑成同一个词量。现在「节」是唯一计量单位：
//   · 加词 = 在 SEC_N 末尾追加一项（或调大某一项）+ 在对应 data-pX 里补一条节标题；
//   · 每章节数 / 每册章数各是一份独立数组，跟词数没有倍数关系。
// 本版 SEC_N 由旧 RAMP 展开固化，390 节的词表边界与旧版逐日完全一致 → 老进度键零迁移。
const wordforms = require('./wordforms.js');
const contentOverrides = require('./content-overrides.js');
const functionalWordOverrides = require('./functional-word-overrides.js');
const splitSenses = require('./split-senses.js');
const p1 = require('./data-p1.js');
const p2 = require('./data-p2.js');
const p3 = require('./data-p3.js');
const p4 = require('./data-p4.js');
const p5 = require('./data-p5.js');
const p6 = require('./data-p6.js');
const WORD_PARTS = require('./words.js');

const WEEKS = [].concat(p1, p2, p3, p4, p5, p6);

// ── 1. 骨架数据 ─────────────────────────────────────────────────────
// 每节新词数（390 项）。顺序 = 课程顺序，与 words.js 的词表区间一一对应。
const SEC_N = [
  15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 12, 12, 12, 12, 16, 16, 16, 16, 16,
  16, 16, 16, 16, 16, 13, 13, 13, 13, 13, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17,
  13, 13, 13, 13, 13, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 14, 14, 14, 14, 14,
  18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 14, 14, 14, 14, 14, 18, 18, 18, 18, 18,
  18, 18, 18, 18, 18, 15, 15, 15, 15, 15, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19,
  15, 15, 15, 15, 15, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 15, 15, 15, 15, 15,
  19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 15, 15, 15, 15, 15, 20, 20, 20, 20, 20,
  20, 20, 20, 20, 20, 16, 16, 16, 16, 16, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21,
  16, 16, 16, 16, 16, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 17, 17, 17, 17, 17,
  22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 17, 17, 17, 17, 17, 22, 22, 22, 22, 22,
  22, 22, 22, 22, 22, 18, 18, 18, 18, 18, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  18, 18, 18, 18, 18, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 19, 19, 19, 19, 19,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 19, 19, 19, 19, 19, 25, 25, 25, 25, 25,
  25, 25, 25, 25, 25, 20, 20, 20, 20, 20, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26,
  20, 20, 20, 20, 20, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 21, 21, 21, 21, 21,
  27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 21, 21, 21, 21, 21, 27, 27, 27, 27, 27,
  27, 27, 27, 27, 27, 22, 22, 22, 22, 22, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  22, 22, 22, 22, 22, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 23, 23, 23, 23, 23,
  29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 23, 23, 23, 23, 23, 30, 30, 30, 30, 30,
  25, 25, 25, 25, 25, 30, 30, 30, 30, 30,
];

// 每章几节（78 项）/ 每册几章（6 项）/ 每册标题
const CH_SEC = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const BOOK_CHS = [13, 13, 13, 13, 13, 13];
const BOOK_META = [
  { no: 1, title: '第 1 册 · 入门' },
  { no: 2, title: '第 2 册 · 基础' },
  { no: 3, title: '第 3 册 · 日常' },
  { no: 4, title: '第 4 册 · 进阶' },
  { no: 5, title: '第 5 册 · 拓展' },
  { no: 6, title: '第 6 册 · 冲刺' },
];

const SECTION_TOTAL = SEC_N.length;                              // 390
const WORD_TOTAL = SEC_N.reduce((a, b) => a + b, 0);              // 8115
const WEEK_COUNT = CH_SEC.length;                                 // 78 章
const BOOK_COUNT = BOOK_CHS.length;                               // 6 册
const CHECKIN_DAYS = SECTION_TOTAL;                               // 旧名保留：可打卡单位 = 节

// 册 / 章 / 节 三层偏移
const BOOK_OFF = [];                                              // 册 → 首章下标
(function () { let c = 0; BOOK_CHS.forEach(n => { BOOK_OFF.push(c); c += n; }); })();
const CH_OFF = [];                                                // 章 → 首节下标
(function () { let s = 0; CH_SEC.forEach(n => { CH_OFF.push(s); s += n; }); })();
const SEC_CH = [], SEC_K = [], BOOK_OF_CH = [];
(function () {
  CH_SEC.forEach((n, ch) => {
    for (let k = 0; k < n; k++) { SEC_CH.push(ch); SEC_K.push(k); }
  });
  BOOK_CHS.forEach((n, b) => { for (let i = 0; i < n; i++) BOOK_OF_CH.push(b); });
})();
const SEC_OFF = [];                                               // 节 → 词表起始下标
(function () { let s = 0; SEC_N.forEach(n => { SEC_OFF.push(s); s += n; }); })();

// 旧名字兼容：RAMP = 每章词数（= 该章首节词数 × 章内节数）。新代码请直接用 SEC_N。
const RAMP = CH_SEC.map((n, ch) => SEC_N[CH_OFF[ch]]);
const P1_TOTAL = (function () { let s = 0; for (let i = 0; i < Math.min(13, CH_SEC.length); i++) s += SEC_N[CH_OFF[i]] * CH_SEC[i]; return s; })();

const CORE_CNT = [
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  0, 0, 0, 0, 0, 5, 5, 5, 3, 4, 5, 5, 5, 5, 4, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 5, 4, 5, 5, 3,
  5, 5, 5, 4, 4, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 4, 5, 5, 5, 4, 0, 0, 0, 0, 0, 4, 5, 4, 5, 4, 5, 5, 5, 5, 4, 0, 0, 0, 0, 0,
  4, 5, 5, 4, 5, 5, 5, 5, 4, 4, 0, 0, 0, 0, 0, 4, 5, 5, 5, 4, 5, 5, 5, 4, 5, 0, 0, 0, 0, 0, 5, 5, 5, 5, 4, 3, 4, 4, 5, 5,
  0, 0, 0, 0, 0, 4, 4, 5, 5, 5, 4, 4, 3, 5, 4, 0, 0, 0, 0, 0, 5, 4, 5, 5, 5, 4, 4, 5, 5, 5, 0, 0, 0, 0, 0, 5, 4, 5, 5, 5,
  5, 5, 5, 5, 4, 0, 0, 0, 0, 0, 5, 5, 3, 5, 5, 4, 5, 5, 5, 4, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 0, 0, 0, 0, 0,
  4, 5, 5, 4, 5, 5, 5, 4, 4, 4, 0, 0, 0, 0, 0, 5, 5, 4, 4, 4, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4,
  0, 0, 0, 0, 0, 1, 0, 0, 3, 5, 4, 2, 3, 4, 5, 0, 0, 0, 0, 0, 4, 5, 1, 3, 5, 4, 3, 3, 5, 3, 0, 0, 0, 0, 0, 3, 5, 2, 5, 1,
  1, 2, 5, 2, 4, 0, 0, 0, 0, 0, 4, 5, 3, 4, 5, 4, 4, 4, 2, 4, 0, 0, 0, 0, 0, 3, 5, 3, 3, 4, 4, 3, 5, 3, 4, 0, 0, 0, 0, 0,
  3, 3, 4, 3, 3, 3, 0, 2, 2, 4, 0, 0, 0, 0, 0, 4, 5, 4, 1, 2, 0, 0, 0, 0, 0, 4, 4, 3, 2, 4,
];

// 新装默认开始日 = 今天（只在「开始学习」前作占位；进度由打卡驱动，不再按自然日推进）
const DEFAULT_START = (() => {
  const n = new Date();
  const p = x => ('0' + x).slice(-2);
  return n.getFullYear() + '-' + p(n.getMonth() + 1) + '-' + p(n.getDate());
})();

// ── 2. 词表 ─────────────────────────────────────────────────────────
let _words = null;
function allWords() {
  if (_words) return _words;
  const lines = WORD_PARTS.join('\n').split('\n');
  const out = new Array(lines.length);
  for (let i = 0; i < lines.length; i++) {
    const c = lines[i].split('\t');
    // p0 = 词表原始词性（拆卡/纠错会改 p，但「这个词有哪些词性」要看词表原值，
    //      否则 use 只剩 n.，变形行就推不出 uses / using / used）
    const item = { w: c[0], p: c[1], p0: c[1], m: c[2], e: c[3], ai: c[4] | 0, ipa: c[5] || '', uk: c[6] || '', cn: c[7] || '' };
    // 内容纠错按 ai 锚定，永不改 w/ai；拆卡主卡在所有入口统一归一。
    Object.assign(item, functionalWordOverrides[item.ai] || {}, contentOverrides[item.ai] || {});
    out[i] = splitSenses.normalizePrimary(item);
  }
  _words = out;
  return out;
}

// 单词 → 词表下标（懒建；搜索、变形跳转共用）
let _wordIdx = null;
function wordIndex() {
  if (_wordIdx) return _wordIdx;
  _wordIdx = Object.create(null);
  const ws = allWords();
  for (let i = 0; i < ws.length; i++) {
    const k = String(ws[i].w || '').toLowerCase();
    if (k && !(k in _wordIdx)) _wordIdx[k] = i;
  }
  return _wordIdx;
}

function sectionOfWordIndex(i) {
  let lo = 0, hi = SEC_OFF.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (SEC_OFF[mid] <= i) lo = mid; else hi = mid - 1;
  }
  return lo;
}

// ── 3. 骨架查询 ─────────────────────────────────────────────────────
function themeOf(week) {
  return String((week && week.theme) || '').replace(/巩固周/g, '巩固');
}
// sun.t 里带「第 182 天自检：」前缀（旧版按自然日编号），章末自测去掉它
function quizTitle(t) {
  const s = String(t || '').replace(/^第\s*\d+\s*天自检[:：]\s*/, '').trim();
  return s || '本章自测';
}

const _chWords = [];
function chapterWords(ch) {
  if (_chWords[ch] !== undefined) return _chWords[ch];
  let n = 0;
  const start = CH_OFF[ch] || 0, cnt = CH_SEC[ch] || 0;
  for (let i = 0; i < cnt; i++) n += SEC_N[start + i] || 0;
  _chWords[ch] = n;
  return n;
}

// 节信息：{ si, no, ch, chNo, chInBook, book, bookNo, k, kNo, last, n, core, title, chapterTitle, bookTitle, loc }
function sectionInfo(si) {
  if (!(si >= 0 && si < SECTION_TOTAL)) return null;
  const ch = SEC_CH[si], k = SEC_K[si], book = BOOK_OF_CH[ch];
  const week = WEEKS[ch] || {};
  const d = (week.d || [])[k] || {};
  const bookNo = book + 1, chInBook = ch - BOOK_OFF[book] + 1, kNo = k + 1;
  return {
    si: si, no: si + 1,
    ch: ch, chNo: ch + 1, chInBook: chInBook,
    book: book, bookNo: bookNo,
    k: k, kNo: kNo,
    last: k === (CH_SEC[ch] || 0) - 1,
    n: SEC_N[si] || 0,
    core: CORE_CNT[si] || 0,
    title: d.t || '',
    chapterTitle: themeOf(week),
    bookTitle: (BOOK_META[book] || {}).title || ('第 ' + bookNo + ' 册'),
    loc: '第 ' + bookNo + ' 册 · 第 ' + chInBook + ' 章 · 第 ' + kNo + ' 节',
  };
}

function chapterInfo(ch) {
  if (!(ch >= 0 && ch < WEEK_COUNT)) return null;
  const book = BOOK_OF_CH[ch];
  const week = WEEKS[ch] || {};
  const secs = [];
  for (let k = 0; k < (CH_SEC[ch] || 0); k++) {
    const si = CH_OFF[ch] + k;
    secs.push({ si: si, kNo: k + 1, title: ((week.d || [])[k] || {}).t || '', n: SEC_N[si] || 0 });
  }
  return {
    ch: ch, chNo: ch + 1, book: book, bookNo: book + 1,
    chInBook: ch - BOOK_OFF[book] + 1,
    title: themeOf(week),
    words: chapterWords(ch),
    sections: secs,
  };
}

// 「本章自测」：内容取自旧版的周日自检（sun），不打卡、不占进度
function chapterQuiz(ch) {
  const wk = WEEKS[ch] || {};
  const sun = wk.sun || {};
  const n = CH_SEC[ch] ? SEC_N[CH_OFF[ch]] : 0;
  const wkTotal = chapterWords(ch);
  const prev = ch > 0 ? chapterWords(ch - 1) : wkTotal;
  return {
    t: quizTitle(sun.t),
    chapterTitle: themeOf(wk),
    obj: fill(sun.obj, n, wkTotal, prev),
    pr: fill(sun.pr, n, wkTotal, prev),
    tip: fill(sun.tip, n, wkTotal, prev),
  };
}

// 占位符替换：{D} 本节词数 {W} 本章词数 {Wp} 上一章词数 {P1} 前 13 章累计
function fill(s, n, wk, wp) {
  if (!s) return s;
  return String(s)
    .replace(/\{D\}/g, n)
    .replace(/\{Wp\}/g, wp)
    .replace(/\{W\}/g, wk)
    .replace(/\{P1\}/g, P1_TOTAL);
}

function wordsOfSection(si) {
  const n = SEC_N[si] || 0;
  const start = SEC_OFF[si] || 0;
  const ws = allWords().slice(start, start + n);
  const cn = CORE_CNT[si] || 0;
  for (let i = 0; i < ws.length; i++) {
    ws[i] = {
      w: ws[i].w, m: ws[i].m, p: ws[i].p, p0: ws[i].p0, e: ws[i].e, ai: ws[i].ai,
      ipa: ws[i].ipa || '', uk: ws[i].uk || '', cn: ws[i].cn || '',
      altSense: ws[i].altSense || null, core: i < cn,
    };
  }
  return ws;
}

// 取某一节的学习数据（含章末自测卡）
function getSection(si) {
  const info = sectionInfo(si);
  if (!info) return null;
  const week = WEEKS[info.ch];
  const d = (week && week.d ? week.d[info.k] : null);
  if (!d) return null;
  const n = SEC_N[si];
  const wkTotal = chapterWords(info.ch);
  const prevTotal = info.ch > 0 ? chapterWords(info.ch - 1) : wkTotal;
  const v = wordsOfSection(si);
  const coreCount = CORE_CNT[si] || 0;
  return {
    type: 'study',
    t: d.t,
    obj: fill(d.obj, n, wkTotal, prevTotal),
    pr: fill(d.pr, n, wkTotal, prevTotal),
    tip: fill(d.tip, n, wkTotal, prevTotal),
    g: d.g,
    time: Math.round((25 + n * 1.2) / 5) * 5 + '分钟',
    words: n,
    coreCount: coreCount,
    extraCount: n - coreCount,
    v: v,
    quiz: info.last ? chapterQuiz(info.ch) : null,
  };
}

// 老名字兼容（v1.1.110 前到处是 getDay(day)）
function getDay(day) { return getSection(day - 1); }

// 进度键 w{章}d{节} → 节下标；非法 / 旧版弹性日-自检日（d6 / d7）返回 -1
// 节下标 → 进度键（w{章}d{节}，与旧版逐字节兼容）
function keyOfSection(si) {
  if (!(si >= 0 && si < SECTION_TOTAL)) return '';
  return 'w' + (SEC_CH[si] + 1) + 'd' + (SEC_K[si] + 1);
}

function sectionOfKey(key) {
  const m = /^w(\d+)d(\d+)$/.exec(String(key || ''));
  if (!m) return -1;
  const ch = parseInt(m[1], 10) - 1, k = parseInt(m[2], 10) - 1;
  if (!(ch >= 0 && ch < CH_SEC.length)) return -1;
  if (!(k >= 0 && k < CH_SEC[ch])) return -1;
  return CH_OFF[ch] + k;
}

// 老「第 N 天」（1 起，546 天日历口径）→ 节下标（0 起）
// 旧模型每周 7 天里只有前 5 天排词（后 2 天是弹性日 / 自检日，不打卡），节 = 周 * 5 + 周内第几天；
// 弹性日没有独立词表，归到本周第 5 节。语法数据（grammar.js 的 days）存的仍是旧日号，
// 展示/跳转统一走这里换算，**不改数据源**（改了就得重刷 151 个数字、还会动 grammar-map 的扁平序号）。
function sectionOfDay(day) {
  const d = Number(day) - 1;
  if (!(d >= 0)) return -1;
  const si = Math.floor(d / 7) * 5 + Math.min(d % 7, 4);
  return si < SECTION_TOTAL ? si : -1;
}

function sectionStats(checkedDays) {
  let done = 0;
  Object.keys(checkedDays || {}).forEach(key => {
    if (!checkedDays[key]) return;
    if (sectionOfKey(key) >= 0) done++;
  });
  return { done: done, left: Math.max(0, SECTION_TOTAL - done), total: SECTION_TOTAL };
}

// 已学词汇池：返回所有已打卡节的词汇（供随机复习）
function learnedWords(checkedDays) {
  const pool = [];
  const seen = {};
  Object.keys(checkedDays || {}).forEach(key => {
    if (!checkedDays[key]) return;
    const si = sectionOfKey(key);
    if (si < 0) return;
    wordsOfSection(si).forEach(v => {
      if (!seen[v.w]) { seen[v.w] = 1; pool.push(v); }
    });
  });
  return pool;
}

// 目录树：只展开一本册 / 一章，避免一次性 setData 400 个节点
function bookTree(checkedDays, openBook, openCh, curSi) {
  const ck = checkedDays || {};
  const isDone = si => !!ck['w' + (SEC_CH[si] + 1) + 'd' + (SEC_K[si] + 1)];
  return BOOK_META.map((b, bi) => {
    let done = 0, total = 0;
    for (let ch = BOOK_OFF[bi]; ch < BOOK_OFF[bi] + BOOK_CHS[bi]; ch++) {
      total += CH_SEC[ch];
      for (let k = 0; k < CH_SEC[ch]; k++) if (isDone(CH_OFF[ch] + k)) done++;
    }
    const chapters = [];
    if (bi === openBook) {
      for (let i = 0; i < BOOK_CHS[bi]; i++) {
        const ch = BOOK_OFF[bi] + i;
        const info = chapterInfo(ch);
        let cdone = 0;
        for (let k = 0; k < CH_SEC[ch]; k++) if (isDone(CH_OFF[ch] + k)) cdone++;
        const secs = [];
        if (ch === openCh) {
          info.sections.forEach(s => secs.push({ si: s.si, kNo: s.kNo, title: s.title, done: isDone(s.si), cur: s.si === curSi }));
        }
        chapters.push({ ch: ch, chInBook: info.chInBook, title: info.title, done: cdone, total: CH_SEC[ch], open: ch === openCh, secs: secs });
      }
    }
    return { book: bi, no: bi + 1, title: b.title, done: done, total: total, open: bi === openBook, chapters: chapters };
  });
}

// 语音试听样句：取第 1 节首个词的例句（走真实音频链路）
function demo() {
  const d = getSection(0);
  const w = d && d.v && d.v[0];
  return w ? { word: w.w, example: w.e, ai: w.ai } : null;
}

// ── 4. 搜索 ─────────────────────────────────────────────────────────
const SEARCH_LIMIT = 60;

// 变形列表（搜索结果卡用）：规则 + 不规则，has = 词库里另有词条（可跳转）
function formsOf(it) {
  const idx = wordIndex();
  const w = String(it.w || '').toLowerCase();
  // 本身是变体的词条（used / taken / better）：只给一条「原形」，不再硬推屈折
  if (!wordforms.noteFor(w).length) {
    const lem = wordforms.lemma(w).filter(c => c.base !== w && (c.base in idx));
    if (lem.length) return [{ label: '原形', form: lem[0].base, speak: true, same: false, has: true }];
  }
  const list = wordforms.formsOf(w, it.p0 || it.p);
  return list.map(f => ({
    label: f.label,
    form: f.form,
    speak: f.speak !== false,
    has: f.form !== it.w && (String(f.form).toLowerCase() in idx),
  }));
}

function searchWords(kw, limit) {
  const q = String(kw || '').trim().toLowerCase();
  if (!q) return { total: 0, list: [] };
  const ws = allWords();
  let exact = [], pre = [], inc = [], zh = [];
  for (let i = 0; i < ws.length; i++) {
    const it = ws[i];
    const lw = it.w.toLowerCase();
    if (lw === q) exact.push(i);
    else if (lw.indexOf(q) === 0) pre.push(i);
    else if (lw.indexOf(q) > 0) inc.push(i);
    else if (it.m && it.m.indexOf(q) >= 0) zh.push(i);
  }
  // 词形归一：完全匹配缺失时，把查询词当变体归一回原形（查 taken -> take）。
  // 归一命中排最前，并带 via 标签；查询词本身就是词条时它排第一、原形紧跟其后。
  const viaMap = {};
  {
    const cands = wordforms.lemma(q);
    for (let c = 0; c < cands.length; c++) {
      const base = cands[c].base;
      if (base === q) break;
      let hit = -1;
      for (let i = 0; i < ws.length; i++) {
        if (ws[i].w.toLowerCase() === base) { hit = i; break; }
      }
      if (hit < 0) continue;
      let lb = cands[c].label;
      if (lb === wordforms.LBL.pl && ws[hit].p.indexOf('v.') === 0) lb = wordforms.LBL.s;
      viaMap[hit] = lb;
      const hasSelf = exact.length > 0;
      exact = exact.filter(function (j) { return j !== hit; });
      if (hasSelf) exact.splice(1, 0, hit); else exact.unshift(hit);
      break;
    }
  }
  const total = exact.length + pre.length + inc.length + zh.length;
  const cap = limit > 0 ? limit : SEARCH_LIMIT;
  const list = exact.concat(pre, inc, zh).slice(0, cap).map(function (i) {
    const it = ws[i];
    const si = sectionOfWordIndex(i);
    const info = sectionInfo(si);
    const row = {
      w: it.w, p: it.p, p0: it.p0 || it.p, m: it.m, e: it.e, ai: it.ai, ipa: it.ipa || '', uk: it.uk || '', cn: it.cn || '', altSense: it.altSense || null,
      sec: si, secNo: info ? info.no : 0, bookNo: info ? info.bookNo : 0,
      chNo: info ? info.chNo : 0, kNo: info ? info.kNo : 0,
      loc: info ? info.loc : '',
      via: viaMap[i] || '',
      wf: wordforms.wfNotes(it.w, it.p),
    };
    row.forms = formsOf(row);
    return row;
  });
  return { total: total, list: list };
}

// 单词定位（搜索里点变形词跳转用）
function lookup(w) {
  const idx = wordIndex()[String(w || '').toLowerCase()];
  if (idx === undefined) return null;
  const it = allWords()[idx];
  const si = sectionOfWordIndex(idx);
  const info = sectionInfo(si);
  return { w: it.w, sec: si, loc: info ? info.loc : '', bookNo: info ? info.bookNo : 0, chNo: info ? info.chNo : 0, kNo: info ? info.kNo : 0 };
}

// 英文例句挖空：把目标词（含常见词形变化）替换成 ____，其余部分保留作上下文。
function clozeSentence(it) {
  const s = String((it && it.e) || '');
  const w = String((it && it.w) || '');
  if (!s || !w) return '';
  const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let re = new RegExp('\\b' + esc + '\\b', 'i');
  if (re.test(s)) return s.replace(re, '____');
  const stem = esc.replace(/e$/, '');
  re = new RegExp('\\b' + stem + '[a-z]{0,4}\\b', 'i');
  if (re.test(s)) return s.replace(re, '____');
  return '';
}

// 中文例句挖空练习：为 target 生成 n 个选项（含正确答案），返回打乱后的英文单词数组。
function clozeOptions(target, pool, n) {
  const N = Math.max(2, n || 4);
  const src = (pool && pool.length ? pool : allWords());
  const pos = String(target.p || '').split('/')[0];
  const cand = [];
  const shuffled = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
  const take = arr => {
    for (let i = 0; i < arr.length && cand.length < N - 1; i++) {
      const it = arr[i];
      if (!it || it.w === target.w) continue;
      if (cand.indexOf(it.w) >= 0) continue;
      cand.push(it.w);
    }
  };
  take(shuffled(src.filter(x => pos && String(x.p || '').split('/')[0] === pos)));
  take(shuffled(src));
  return shuffled(cand.concat([target.w]));
}

// 将收藏快照等旧结构按当前词库归一；只覆盖教学字段，不碰 w/ai/ts 等身份与进度字段。
let _wordByName = null;
function normalizeWord(snapshot) {
  if (!snapshot || !snapshot.w) return snapshot;
  if (!_wordByName) {
    _wordByName = Object.create(null);
    allWords().forEach(it => { _wordByName[String(it.w).toLowerCase()] = it; });
  }
  const canonical = _wordByName[String(snapshot.w).toLowerCase()];
  return canonical ? Object.assign({}, snapshot, canonical, snapshot.ts === undefined ? {} : { ts: snapshot.ts }) : Object.assign({}, snapshot);
}

// 词形 → 预生成音频编号（工具页音标区的例词播放用）。
let _aiMap = null;
function wordAi(word) {
  const w = String(word || '').toLowerCase();
  if (!w) return 0;
  if (!_aiMap) {
    _aiMap = {};
    const ws = allWords();
    for (let i = 0; i < ws.length; i++) { const k = String(ws[i].w || '').toLowerCase(); if (k && !(k in _aiMap)) _aiMap[k] = ws[i].ai | 0; }
  }
  return _aiMap[w] || 0;
}

module.exports = {
  WEEKS, BOOKS: BOOK_META, BOOK_CHS, CH_SEC, SEC_N, SEC_OFF, CH_OFF, BOOK_OFF, SEC_CH, SEC_K, BOOK_OF_CH,
  SECTION_TOTAL, WORD_TOTAL, WEEK_COUNT, BOOK_COUNT, CHECKIN_DAYS, P1_TOTAL, DEFAULT_START, SEARCH_LIMIT, RAMP,
  CORE_CNT,
  sectionInfo, chapterInfo, chapterQuiz, bookTree, sectionOfKey, keyOfSection, sectionOfDay, sectionStats, chapterWords,
  getSection, getDay, wordsOfSection, learnedWords, allWords, demo,
  clozeOptions, clozeSentence, searchWords, lookup, wordIndex, wordAi, normalizeWord, sectionOfWordIndex, formsOf,
};

// utils/data.js —— 课程数据汇总 + 词表装配（等级制：4 个等级 / 546 天 / 8000 词）
//
// 结构说明
// ────────
// · utils/data-p1..p6.js  只存**教学内容**：主题、每日标题/目标、语法或技能点、练习、技巧、自检
// · utils/words.js        8000 词表，顺序＝课程顺序（每天：核心主题词 → 扩展词）
// · 每天词量由 RAMP 决定
//
// 546 天排法（对外不再出现「周」，内部仍以 7 天为一组）
// ───────────
// 原 52 段课程每 2 段后插 1 个「巩固段」，共 52 + 26 = 78 组（546 天，390 个学习日）。
// 巩固段不引入新语法，专注复习前两段的词 + 一个词汇/输出技能点。
// 两条坡道：新课组 14→30 词/天，巩固组 11→25 词/天，合计恰好 8000。
//
// 为什么词表按课程顺序排列：这样「某一天要用哪些词」就是一整段连续区间，
// 偏移量在启动时一次算好（DAY_OFF），运行时零查表开销。
// 每个词带 ai（音频编号）——音频文件名用的是词频序排名，与本表顺序不同，故必须显式携带。
const wordforms = require('./wordforms.js');
const p1 = require('./data-p1.js');
const p2 = require('./data-p2.js');
const p3 = require('./data-p3.js');
const p4 = require('./data-p4.js');
const p5 = require('./data-p5.js');
const p6 = require('./data-p6.js');
const WORD_PARTS = require('./words.js');

const WEEKS = [].concat(p1, p2, p3, p4, p5, p6);
const TOTAL_DAYS = 546;
const DOW = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
// 默认开始日期：取「今天」。
// 旧版取「下一个周一」——那是「周」还作为对外单位时的遗留，会让新用户先等几天才能开学。
// 第 1 天就是开始日，无需对齐星期；老用户已存有 startDate，不受影响。
const DEFAULT_START = (() => {
  const n = new Date();
  const p = x => ('0' + x).slice(-2);
  return n.getFullYear() + '-' + p(n.getMonth() + 1) + '-' + p(n.getDate());
})();

// 每组的每日新词数（双坡道：新课组 14→30，巩固组 11→25，总量 8000）
const RAMP = [
  14, 14, 11, 15, 15, 12, 15, 16, 12, 16, 16, 13, 17,
  17, 13, 17, 17, 14, 18, 18, 14, 18, 19, 15, 19, 19,
  15, 20, 20, 16, 20, 21, 16, 21, 21, 17, 22, 22, 17,
  22, 22, 18, 23, 23, 18, 23, 24, 19, 24, 24, 19, 25,
  25, 20, 25, 26, 20, 26, 26, 21, 27, 27, 21, 27, 27,
  22, 28, 28, 22, 28, 29, 23, 29, 29, 23, 30, 25, 30,
];

// 390 个学习日的核心词数（原有主题词；其余为扩展词。合计 1125）
// 巩固组全部为扩展词，故对应位置为 0
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

const WORD_TOTAL = 8000;
const WEEK_COUNT = 78;
// 可打卡天数（v1.1.67）：每 7 天里第 6 天是弹性复习日（type='sat'，页面不给打卡按钮），
// 所以「能打卡的天」= 78 组 × 6 天 = 468。工具页学习记录的分母用它，
// 剩余天数才能随进度真正归零（旧版用 546 作分母，学满 468 天后剩余会永远停在 78）。
const CHECKIN_DAYS = WEEK_COUNT * 6;
const P1_TOTAL = RAMP.slice(0, 13).reduce((a, b) => a + b, 0) * 5;   // 前 13 组（入门段）累计词数

// ── 每个学习日的词表起始偏移（0 基），启动时算一次 ────────────────────
const DAY_OFF = [];
(function () {
  let off = 0;
  for (let w = 0; w < WEEK_COUNT; w++) {
    for (let k = 0; k < 5; k++) { DAY_OFF.push(off); off += RAMP[w]; }
  }
})();

// 词表延迟解析：8000 行只在首次取词时拆一次，避免启动开销
let _words = null;
function allWords() {
  if (_words) return _words;
  const lines = WORD_PARTS.join('\n').split('\n');
  const out = new Array(lines.length);
  for (let i = 0; i < lines.length; i++) {
    const c = lines[i].split('\t');
    out[i] = { w: c[0], p: c[1], m: c[2], e: c[3], ai: c[4] | 0, ipa: c[5] || '', uk: c[6] || '', cn: c[7] || '' };
  }
  _words = out;
  return out;
}

// 占位符替换：{D} 当日词数 {W} 本组词数 {Wp} 上一组词数 {P1} 前 13 组累计
function fill(s, n, wk, wp) {
  if (!s) return s;
  return String(s)
    .replace(/\{D\}/g, n)
    .replace(/\{Wp\}/g, wp)
    .replace(/\{W\}/g, wk)
    .replace(/\{P1\}/g, P1_TOTAL);
}

function fillBlock(o, n, wk, wp) {
  const r = {};
  for (const k in o) r[k] = typeof o[k] === 'string' ? fill(o[k], n, wk, wp) : o[k];
  return r;
}

// 弹性复习日固定内容（词数为相对本组 5 天新词总量的占位符）
// v1.1.66：文案去「周」——每 7 天里的第 6 天固定为弹性日，不再对应「周六」。
const SATURDAY = {
  t: '弹性复习日',
  obj: '不安排新内容——补进度、巩固这一轮的词、或好好休息，三选一。',
  pr: '1) 补进度：这一轮里有落下的学习日，就今天补上。2) 巩固：听写这一轮 {W} 词 + 朗读全部例句。3) 休息：只做 10 分钟随机复习，其余放空。三选一即可，休息不丢人。',
  tip: '语言学习靠的是"持续在场"而非"每天高强度"。弹性日是计划的一部分，不是偷懒——休息也是复习曲线的一环。',
};

// 天序号信息：day 1-546 → { wIdx, k }
function dayInfo(day) {
  if (day < 1 || day > TOTAL_DAYS) return { wIdx: 0, k: 1 };
  return { wIdx: Math.floor((day - 1) / 7), k: ((day - 1) % 7) + 1 };
}

// 由学习日序号取该日词条
function wordsOfStudyDay(di, perDay) {
  const start = DAY_OFF[di];
  const ws = allWords().slice(start, start + perDay);
  const cn = CORE_CNT[di] || 0;
  for (let i = 0; i < ws.length; i++) {
    ws[i] = { w: ws[i].w, m: ws[i].m, p: ws[i].p, e: ws[i].e, ai: ws[i].ai, ipa: ws[i].ipa || '', uk: ws[i].uk || '', cn: ws[i].cn || '', core: i < cn };
  }
  return ws;
}

// 取某一天的学习数据（含弹性日/收尾日特殊处理）
function getDay(day) {
  const info = dayInfo(day);
  const week = WEEKS[info.wIdx];
  if (!week) return null;
  const perDay = RAMP[info.wIdx];
  const wkTotal = perDay * 5;
  const prevTotal = info.wIdx > 0 ? RAMP[info.wIdx - 1] * 5 : wkTotal;

  if (info.k === 6) return Object.assign({ type: 'sat' }, fillBlock(SATURDAY, perDay, wkTotal, prevTotal));
  if (info.k === 7) return Object.assign({ type: 'sun' }, fillBlock(week.sun || {}, perDay, wkTotal, prevTotal));

  const d = week.d[info.k - 1];
  if (!d) return null;
  const di = info.wIdx * 5 + (info.k - 1);
  const v = wordsOfStudyDay(di, perDay);
  const coreCount = CORE_CNT[di] || 0;
  return {
    type: 'study',
    t: d.t,
    obj: fill(d.obj, perDay, wkTotal, prevTotal),
    pr: fill(d.pr, perDay, wkTotal, prevTotal),
    tip: fill(d.tip, perDay, wkTotal, prevTotal),
    g: d.g,
    time: Math.round((25 + perDay * 1.2) / 5) * 5 + '分钟',
    words: perDay,
    coreCount: coreCount,
    extraCount: perDay - coreCount,
    v: v,
  };
}

// 由开始日期计算今天对应计划第几天（1 起；0 表示尚未开始）
function currentDayFromStart(startDateStr) {
  const sd = new Date(startDateStr + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((today - sd) / 86400000);
  if (diff < 0) return 0;
  return Math.min(diff + 1, TOTAL_DAYS);
}

// 已学词汇池：返回所有已打卡学习日的词汇（供随机复习）
function learnedWords(checkedDays) {
  const pool = [];
  const seen = {};
  Object.keys(checkedDays || {}).forEach(key => {
    if (!checkedDays[key]) return;
    const m = /^w(\d+)d(\d+)$/.exec(key);
    if (!m) return;
    const day = (parseInt(m[1], 10) - 1) * 7 + parseInt(m[2], 10);
    const info = dayInfo(day);
    if (info.k > 5) return;
    const di = info.wIdx * 5 + (info.k - 1);
    const ws = wordsOfStudyDay(di, RAMP[info.wIdx]);
    ws.forEach(v => {
      if (!seen[v.w]) { seen[v.w] = 1; pool.push(v); }
    });
  });
  return pool;
}

// 语音试听样句：取 Day 1 首个词的例句（走真实音频链路）
function demo() {
  const d = getDay(1);
  const w = d && d.v && d.v[0];
  return w ? { word: w.w, example: w.e, ai: w.ai } : null;
}

// ── 全库搜索（v1.1.46 搜索页）────────────────────────────────────────
// 词下标 → 所属学习日的「日历天」序号：词表按学习日顺序平铺，DAY_OFF[di] 是第 di 个
// 学习日的起点。二分定位所属学习日，再按「每组 5 个学习日 + 复习 2 天」换算日历天
// （di=0 → 第 1 天；di=4 → 第 5 天；di=5 → 第 8 天）。
// ⚠️ 口径必须与 App 一致：App 里「第 N 天」= 自然日序号（7 天一组），不是学习日序号。
function dayOfWordIndex(i) {
  let lo = 0, hi = DAY_OFF.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (DAY_OFF[mid] <= i) lo = mid; else hi = mid - 1;
  }
  return lo + Math.floor(lo / 5) * 2 + 1;
}

// 全库搜索：完全匹配 > 英文前缀 > 英文包含 > 中文释义包含（每组内部保持词表序 = 由易到难 = Day 升序）。
// 完全匹配必须置顶：搜 good 时若前缀组里有 goods/goodbye 排前面，用户会以为搜错了。
// 8000 词单次遍历，实测 <5ms，不需要索引。limit 只截断返回条数，total 始终是真实命中数。
const SEARCH_LIMIT = 60;
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
  // 词形归一（v1.1.73）：完全匹配缺失时，把查询词当变体归一回原形（查 taken -> take）。
  // 归一命中排最前，并带 via 标签（「是 xx 的过去分词」类提示），行首显示一条 muted 小字。
  const viaMap = {};
  // 词形归一与直查共存（v1.1.73）：making/better/used 这类词本身也是词条（直查命中），
  // 但用户多半想看原形 —— 归一到的原形排最前并带 via 标签，词条自身照常显示在后。
  // 完全未命中时同理（taken -> take）。could/would 指向的情态动词暂不在词表，功能词包补入后自动生效。
  {
    const cands = wordforms.lemma(q);
    for (let c = 0; c < cands.length; c++) {
      const base = cands[c].base;
      if (base === q) break;                 // 原形就是查询词本身，无需归一
      let hit = -1;
      for (let i = 0; i < ws.length; i++) {
        if (ws[i].w.toLowerCase() === base) { hit = i; break; }
      }
      if (hit < 0) continue;
      // -s 类变体：原形是动词开头（v./n. 混性词除外）时，标签应是「第三人称单数」不是「复数」
      let lb = cands[c].label;
      if (lb === wordforms.LBL.pl && ws[hit].p.indexOf('v.') === 0) lb = wordforms.LBL.s;
      viaMap[hit] = lb;
      exact = exact.filter(function (j) { return j !== hit; });
      exact.unshift(hit);                    // 原形排最前
      break;                                 // 只要最可信的一个候选
    }
  }
  const total = exact.length + pre.length + inc.length + zh.length;
  const cap = limit > 0 ? limit : SEARCH_LIMIT;
  const list = exact.concat(pre, inc, zh).slice(0, cap).map(function (i) {
    const it = ws[i];
    const day = dayOfWordIndex(i);
    const info = dayInfo(day);
    return {
      w: it.w, p: it.p, m: it.m, e: it.e, ai: it.ai, ipa: it.ipa || '', uk: it.uk || '', cn: it.cn || '',
      day: day, dow: DOW[info.k - 1], wn: info.wIdx + 1,
      via: viaMap[i] || '',
      wf: wordforms.noteFor(it.w),   // [{label:'过去式',form:'took'},...]，无不规则形式为 []
    };
  });
  return { total: total, list: list };
}

// 英文例句挖空：把目标词（含常见词形变化）替换成 ____，其余部分保留作上下文。
// 匹配不到（无例句 / 词形变化超出 4 字号范围）返回 ''，该词不参与填空练习。
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
// 干扰项优先「同词性」（词性首段相同），不足再用整个词库补。刻意不返回释义——练习要求不显示释义。
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

// 词形 → 预生成音频编号（工具页音标区的例词播放用）。
// 词表里有的词直接拿它的 ai（可离线播放）；没有的返回 0，由调用方降级到在线朗读。
// 首次调用建一次 8000 项的表，之后 O(1)。
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
  WEEKS, TOTAL_DAYS, DOW, DEFAULT_START, SATURDAY,
  RAMP, CORE_CNT, WORD_TOTAL, WEEK_COUNT, CHECKIN_DAYS, P1_TOTAL, SEARCH_LIMIT,
  dayInfo, getDay, currentDayFromStart, learnedWords, allWords, demo, clozeOptions, clozeSentence,
  searchWords, dayOfWordIndex, wordAi,
};

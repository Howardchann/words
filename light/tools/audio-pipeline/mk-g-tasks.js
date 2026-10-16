// mk-g-tasks.js —— 生成「语法例句 / 音标例词」预生成音频的任务清单
//
// 为什么要这个：speech.js 里语法例句的音频路径 = g/{hash%10}/{hash}.mp3（+ 慢速 s 后缀），
// hash = djb2(text) 的 8 位十六进制。这个哈希必须与小程序端**逐字节一致**，
// 所以本脚本直接复制 speech.js 的算法（不要"优化"它）。
//
// 输入：
//   ① grammar.js 所有语法点的例句（ex[].en）
//   ② phonetic.js 例词中「不在 8000 词表」的那些（在词表的走 w/ 桶，音色已经一致）
//   ③ 可选：data/g-extra.json —— 以后新增内容时把文本塞这里即可复用整条管线
//
// 输出：_work/g-tasks.json  [{ text, shard, name, nameSlow, out, outSlow }]

const { HERE, WORK, MP, FFMPEG: FF, FFPROBE: FFP, data, work, mp } = require('./_env');

const fs = require('fs');

const MIRROR = work('g_mirror');        // 本地镜像根（上传时整目录推上去）
const OUT = work('g-tasks.json');
const EXTRA = data('g-extra.json');

function hashName(t) {
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = (h * 33 + t.charCodeAt(i)) >>> 0;
  return ('0000000' + h.toString(16)).slice(-8);
}

const GRAMMAR = require(mp('pkg-study/data/grammar.js'));
const PHONETIC = require(mp('utils/phonetic.js'));
const plan = require(mp('utils/data.js'));

const texts = [];
const why = {};
// 「像句子」判定（v1.1.85 定案：注释类不播）——与 today.js 的 exSpk 同口径，两侧必须一致。
// 含汉字（注释/提示行）、填空 ___、箭头替换、「标签:」开头、无句末标点、英文词 <3 → 不生成（客户端也不会给喇叭）。
function looksSentence(s) {
  if (!s) return false;
  if (/[\u4e00-\u9fff]/.test(s)) return false;
  if (/[_\u2192\u2191\u2260\u300c\u300d\u21d2\u279c]|->/.test(s)) return false;
  if ((String(s).match(/[A-Za-z']+/g) || []).length < 3) return false;
  if (/^[A-Za-z][A-Za-z ]{0,12}:\s/.test(s)) return false;
  if (/^\d/.test(s)) return false;                          // 日程条目（10:45 - 11:45 writing…）
  if (/^(Day|Box|Minute|Week)\s*\d/i.test(s)) return false; // 打卡/计划条目（Day 5: mixed practice…）
  // v1.1.86：句末允许跟一个短括号补充（与客户端 today.js:exSpk 逐字同口径）
  return /[.!?]["']?\s*(\([^)]{0,24}\))?\s*$/.test(String(s).trim());
}
function add(t, src) {
  const s = String(t || '').trim();
  if (!s) return;
  if (/[\u4e00-\u9fff]/.test(s)) return;   // 含汉字 = 注释/提示行，客户端不给喇叭 → 不生成
  if (texts.indexOf(s) >= 0) return;
  texts.push(s); why[s] = src;
}
// 例句精读专用：额外套「像句子」过滤（该来源混有日程/清单/填空/备注碎片，客户端按 exSpk 不给喇叭）。
// ⚠️ 语法区例句/音标例词/新增**不套**——它们是数据组织时挑好的真内容（如双词例句「I work.」），全给喇叭。
function addEx(t, src) {
  const s = String(t || '').trim();
  if (!looksSentence(s)) return;
  add(s, src);
}

GRAMMAR.forEach(c => c.topics.forEach(t => (t.ex || []).forEach(e => add(e.en, '语法例句:' + t.t))));
PHONETIC.forEach(p => (p.ex || []).forEach(e => { if (!plan.wordAi(e.w)) add(e.w, '音标例词:' + p.s); }));

// ④ 今日页「例句精读」（2026-10-11 补）：每天 g.ex 的句子在 today.wxml 里是 `data-kind="g"` 且**无 ai**
//    → 客户端走文本哈希（g/ 桶）。此前生成清单只收 grammar.js，**没收 data-p*.js 这个来源** →
//    912 句里 906 句没有预生成音频，真机点这些喇叭一直是在线音源（音色与全站不一致）。***
for (let d = 1; d <= plan.TOTAL_DAYS; d++) {
  let x = null;
  try { x = plan.getDay(d); } catch (e) { }
  if (!x) continue;
  const pick = g => { if (g && g.ex) g.ex.forEach(s => addEx(s, '例句精读')); };
  pick(x.g);
  pick(x.sun && x.sun.g);
}

// ⑤ 词形变体小字（2026-10-11 补）：今日/复习/工具三页的 `data-text="{{F.form}}"` 同样无 ai → 走 g/ 桶。
//    ⚠️ 这里必须**无条件**收集：`was → be`、`does → do` 这类「原形」标签的 form 是**词表内的词**，
//    用 `!plan.wordAi()` 过滤会把它们漏掉 —— 而客户端播放时传的是 form 文本、不带词表编号，
//    根本走不到 w/ 桶，于是这 23 个原形一直降级在线音源。***
const WORDFORMS = require(mp('utils/wordforms.js'));
const WORD_PARTS = require(mp('utils/words.js'));
String(WORD_PARTS.join('\n')).split('\n').filter(Boolean).map(l => l.split('\t')).forEach(r => {
  const w = r[0];
  if (!w) return;
  (WORDFORMS.wfNotes(w) || []).forEach(f => { if (f && f.form && !plan.wordAi(f.form)) add(f.form, '词形:' + w); });   // 词表内的形式客户端走 w/ 桶，不进 g/
});

try {
  const ex = JSON.parse(fs.readFileSync(EXTRA, 'utf8'));
  ex.forEach(t => add(t, '新增'));
} catch (e) { /* 无扩展文件，正常 */ }

const tasks = texts.map(t => {
  const h = hashName(t);
  const shard = parseInt(h, 16) % 10;
  return {
    text: t,
    src: why[t],
    shard: shard,
    name: h + '.mp3',
    nameSlow: h + 's.mp3',
    out: MIRROR + '/g/' + shard + '/' + h + '.mp3',
    outSlow: MIRROR + '/g/' + shard + '/' + h + 's.mp3',
  };
});

// 自检：哈希唯一性（不同文本撞同一哈希的概率极低，但必须确认，否则会互相覆盖）
const byHash = {};
let dup = 0;
tasks.forEach(t => {
  const k = t.shard + '/' + t.name;
  if (byHash[k] && byHash[k] !== t.text) { console.log('!! 哈希冲突：' + byHash[k] + ' vs ' + t.text); dup++; }
  byHash[k] = t.text;
});

fs.writeFileSync(OUT, JSON.stringify(tasks, null, 1), 'utf8');
const bySrc = {};
tasks.forEach(t => { const g = t.src.split(':')[0]; bySrc[g] = (bySrc[g] || 0) + 1; });
console.log('任务数 = ' + tasks.length + '（' + JSON.stringify(bySrc) + '），哈希冲突 = ' + dup);
console.log('分片分布 = ' + JSON.stringify(tasks.reduce((a, t) => (a[t.shard] = (a[t.shard] || 0) + 1, a), {})));
console.log('→ ' + OUT);
tasks.slice(0, 5).forEach(t => console.log('  [' + t.shard + '] ' + t.name + '  ' + t.text.slice(0, 60)));

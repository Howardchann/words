// utils/wordforms.js —— 词形归一（lemmatization）+ 不规则形式标注（v1.1.73）
// 词典学常规：词条只收原形（lemma），规则变体不存（规则由语法区讲），查词时把变体归一回原形；
// 反方向（查 take 看到 taken）= 词条内「不规则形式」小字标注。数据只含不规则项，规则变化现场推导。
// 情态动词（could/would 等）语义已独立，现代词典列为独立词条——但(can → could)仍是标准词形表关系，保留映射。

// 不规则动词：原形 -> [过去式, 过去分词]（两者相同则只写一个字符串）
var IRREG_V = {
  be: ['was/were', 'been'], become: ['became', 'become'], begin: ['began', 'begun'],
  bend: ['bent'], bet: ['bet'], bite: ['bit', 'bitten'], blow: ['blew', 'blown'],
  break: ['broke', 'broken'], bring: ['brought'], build: ['built'], burn: ['burnt/burned'],
  buy: ['bought'], catch: ['caught'], choose: ['chose', 'chosen'], come: ['came', 'come'],
  cost: ['cost'], cut: ['cut'], dig: ['dug'], do: ['did', 'done'], draw: ['drew', 'drawn'],
  dream: ['dreamt/dreamed'], drink: ['drank', 'drunk'], drive: ['drove', 'driven'],
  eat: ['ate', 'eaten'], fall: ['fell', 'fallen'], feed: ['fed'], feel: ['felt'],
  fight: ['fought'], find: ['found'], fly: ['flew', 'flown'], forget: ['forgot', 'forgotten'],
  forgive: ['forgave', 'forgiven'], freeze: ['froze', 'frozen'], get: ['got', 'got/gotten'],
  give: ['gave', 'given'], go: ['went', 'gone'], grow: ['grew', 'grown'],
  hang: ['hung/hanged'], have: ['had'], hear: ['heard'], hide: ['hid', 'hidden'],
  hit: ['hit'], hold: ['held'], hurt: ['hurt'], keep: ['kept'], know: ['knew', 'known'],
  lay: ['laid', 'laid'], lead: ['led'], leave: ['left'], lend: ['lent'], let: ['let'],
  lie: ['lay', 'lain'], lose: ['lost'], make: ['made'], mean: ['meant'], meet: ['met'],
  pay: ['paid'], put: ['put'], read: ['read'], ride: ['rode', 'ridden'],
  ring: ['rang', 'rung'], rise: ['rose', 'risen'], run: ['ran', 'run'],
  say: ['said'], see: ['saw', 'seen'], sell: ['sold'], send: ['sent'], set: ['set'],
  shake: ['shook', 'shaken'], shine: ['shone/shined'], shoot: ['shot'], show: ['showed', 'shown'],
  shut: ['shut'], sing: ['sang', 'sung'], sit: ['sat'], sleep: ['slept'],
  speak: ['spoke', 'spoken'], spend: ['spent'], stand: ['stood'], steal: ['stole', 'stolen'],
  stick: ['stuck'], swim: ['swam', 'swum'], take: ['took', 'taken'], teach: ['taught'],
  tear: ['tore', 'torn'], tell: ['told'], think: ['thought'], throw: ['threw', 'thrown'],
  understand: ['understood'], wake: ['woke/waked', 'woken'], wear: ['wore', 'worn'],
  win: ['won'], write: ['wrote', 'written'],
  // 情态动词（词形表关系；语义独立的词条由功能词包补入）
  can: ['could'], will: ['would'], shall: ['should'], may: ['might'], must: ['must']
};

// 不规则名词复数：复数 -> 原形（存反方向，词条标注时取原形反查）
var IRREG_PL = {
  children: 'child', men: 'man', women: 'woman', people: 'person', feet: 'foot',
  teeth: 'tooth', geese: 'goose', mice: 'mouse', lice: 'louse',
  leaves: 'leaf', lives: 'life', wives: 'wife', knives: 'knife', halves: 'half',
  shelves: 'shelf', wolves: 'wolf', thieves: 'thief', loaves: 'loaf', selves: 'self'
};

// 不规则比较级/最高级
var IRREG_ADJ = {
  good: ['better', 'best'], well: ['better', 'best'], bad: ['worse', 'worst'],
  badly: ['worse', 'worst'], ill: ['worse', 'worst'],
  many: ['more', 'most'], much: ['more', 'most'], little: ['less', 'least'],
  far: ['farther/further', 'farthest/furthest'], old: ['older/elder', 'oldest/eldest'],
  late: ['later/latter', 'latest/last']
};

var LBL = { past: '过去式', pp: '过去分词', ing: '现在分词', s: '第三人称单数', pl: '复数', er: '比较级', est: '最高级' };

// ---- 构建：变体反查表（变体 -> {base, label}）与原形标注表（原形 -> [{label, form}]）----
var VARIANTS = {};   // 'taken' -> {base:'take', label:'过去分词'}
var FORMS = {};      // 'take'   -> [{label:'过去式', form:'took'}, {label:'过去分词', form:'taken'}]

Object.keys(IRREG_V).forEach(function (base) {
  var pair = IRREG_V[base];
  var ppIdx = pair.length > 1 ? 1 : 0;
  var tags = [{ label: LBL.past, form: pair[0] }];
  if (pair[1] && pair[1] !== pair[0]) tags.push({ label: LBL.pp, form: pair[1] });
  // 变体可能含「/」两写（burnt/burned），逐个登记
  pair[0].split('/').forEach(function (v) { VARIANTS[v] = { base: base, label: LBL.past }; });
  if (pair[1]) pair[1].split('/').forEach(function (v) { VARIANTS[v] = { base: base, label: LBL.pp }; });
  FORMS[base] = tags;
});

Object.keys(IRREG_PL).forEach(function (pl) {
  var base = IRREG_PL[pl];
  VARIANTS[pl] = { base: base, label: LBL.pl };
  if (!FORMS[base]) FORMS[base] = [];
  FORMS[base].push({ label: LBL.pl, form: pl });
});

Object.keys(IRREG_ADJ).forEach(function (base) {
  var er = IRREG_ADJ[base][0], est = IRREG_ADJ[base][1];
  // 反查表不覆盖先到者：better 同时是 good/well 的比较级，归到先登记的 good（更典型）
  er.split('/').forEach(function (v) { if (!VARIANTS[v]) VARIANTS[v] = { base: base, label: LBL.er }; });
  est.split('/').forEach(function (v) { if (!VARIANTS[v]) VARIANTS[v] = { base: base, label: LBL.est }; });
  FORMS[base] = (FORMS[base] || []).concat([
    { label: LBL.er, form: er }, { label: LBL.est, form: est }
  ]);
});

// ---- 规则变形推导（只在反查表未命中时用，候选必须真实存在于词表才生效）----
// 输入查询词 q，猜它的原形候选：返回 [{base, label}] 列表，由调用方逐个到词表里核对。
function regularCandidates(q) {
  var out = [];
  function push(base, label) {
    if (base && base.length >= 2 && base !== q) {
      for (var i = 0; i < out.length; i++) if (out[i].base === base) return;
      out.push({ base: base, label: label });
    }
  }
  // 复数 / 第三人称单数
  if (q.slice(-3) === 'ies') push(q.slice(0, -3) + 'y', LBL.pl);
  if (q.slice(-2) === 'es') {
    push(q.slice(0, -2), LBL.pl);
    push(q.slice(0, -1), LBL.pl);            // watches -> watch；goes -> go
  }
  if (q.slice(-1) === 's') push(q.slice(0, -1), LBL.pl);
  // 过去式 / 过去分词（候选顺序很重要：e 还原优先于裸切——hoped 必须归 hope 而不是 hop）
  if (q.slice(-3) === 'ied') push(q.slice(0, -3) + 'y', LBL.past);
  if (q.slice(-2) === 'ed') {
    push(q.slice(0, -1), LBL.past);          // hoped  -> hope；used -> use
    push(q.slice(0, -2), LBL.past);          // worked -> work
    var stem = q.slice(0, -2);
    if (stem.length >= 3 && stem.slice(-1) === stem.slice(-2, -1)) push(stem.slice(0, -1), LBL.past); // stopped -> stopp -> stop
  }
  if (q.slice(-1) === 'd') push(q.slice(0, -1), LBL.past);
  // 现在分词（同理：e 还原优先——making 归 make 而不是 mak）
  if (q.slice(-3) === 'ing') {
    push(q.slice(0, -3) + 'e', LBL.ing);     // hoping  -> hope；making -> make
    push(q.slice(0, -3), LBL.ing);           // working -> work
    var st2 = q.slice(0, -3);
    if (st2.length >= 3 && st2.slice(-1) === st2.slice(-2, -1)) push(st2.slice(0, -1), LBL.ing); // sitting -> sitt -> sit
  }
  return out;
}

// 查询词归一：先查不规则反查表，再给规则候选。调用方拿候选去词表核对存在性。
// 返回 [{base, label}]（按可信度排序，通常 0~3 个）。
function lemma(q) {
  q = String(q || '').trim().toLowerCase();
  if (!q || q.length < 3) return [];
  var hit = VARIANTS[q];
  if (hit) return [hit];
  return regularCandidates(q);
}

// 原形词条的「不规则形式」标注行：take -> [{label:'过去式',form:'took'}, ...]
// 没有不规则形式的词返回 []（规则变化不上小字，避免每行都挂一堆噪音）。
// 「was/were」这类双写法拆成两个独立标签——音频按单词粒度预生成（g/ 桶按文本哈希），
// 标签文本必须与朗读文本逐字一致。
function noteFor(base) {
  base = String(base || '').toLowerCase();
  var tags = FORMS[base] || [];
  var out = [];
  tags.forEach(function (t) {
    t.form.split('/').forEach(function (f) { out.push({ label: t.label, form: f }); });
  });
  return out;
}

// 给音频任务用：全部需要预生成读音的变体形式（去重、展平）
function allForms() {
  var seen = {}, out = [];
  function add(form) { form.split('/').forEach(function (f) { if (!seen[f]) { seen[f] = 1; out.push(f); } }); }
  Object.keys(FORMS).forEach(function (base) { FORMS[base].forEach(function (t) { add(t.form); }); });
  return out;
}

module.exports = { lemma: lemma, noteFor: noteFor, allForms: allForms, LBL: LBL };

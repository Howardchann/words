// utils/wordforms.js —— 词形归一（lemmatization）+ 不规则形式标注（v1.1.73）
// 词典学常规：词条只收原形（lemma），规则变体不存（规则由语法区讲），查词时把变体归一回原形；
// 反方向（查 take 看到 taken）= 词条内「不规则形式」小字标注。数据只含不规则项，规则变化现场推导。
// 情态动词的 could/would/should/might 不是普通动词屈折表；不在这里标作「过去式」。must 也没有 must→must 的过去式标签。

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
  // 情态动词不在普通动词屈折表中；语法课单独解释 could/would/should/might 与 must。
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

var LBL = { past: '过去式', pp: '过去分词', same: '过去式 / 过去分词（形式不变）', samePP: '过去分词（形式不变）', ing: '现在分词', s: '第三人称单数', pl: '复数', er: '比较级', est: '最高级' };

// ---- 构建：变体反查表（变体 -> {base, label}）与原形标注表（原形 -> [{label, form}]）----
var VARIANTS = {};   // 'taken' -> {base:'take', label:'过去分词'}
var FORMS = {};      // 'take'   -> [{label:'过去式', form:'took'}, {label:'过去分词', form:'taken'}]

Object.keys(IRREG_V).forEach(function (base) {
  var pair = IRREG_V[base];
  var past = pair[0];
  var pp = pair.length > 1 ? pair[1] : pair[0];
  var tags = [];
  var combined = pair.length === 1;

  if (past === base) {
    // cut/cost/hit 等形式不变：保留教学说明，但不把原形登记成自己的变体。
    tags.push({ label: LBL.same, form: base, speak: true });
  } else if (combined) {
    tags.push({ label: LBL.past + ' / ' + LBL.pp, form: past, speak: true });
    past.split('/').forEach(function (v) { if (v !== base) VARIANTS[v] = { base: base, label: LBL.past + ' / ' + LBL.pp }; });
  } else {
    tags.push({ label: LBL.past, form: past, speak: true });
    past.split('/').forEach(function (v) { if (v !== base) VARIANTS[v] = { base: base, label: LBL.past }; });
    if (pp === base) tags.push({ label: LBL.samePP, form: base, speak: true });
    else if (pp !== past) {
      tags.push({ label: LBL.pp, form: pp, speak: true });
      pp.split('/').forEach(function (v) { if (v !== base && v !== past) VARIANTS[v] = { base: base, label: LBL.pp }; });
    }
  }
  // read 的过去式/过去分词拼写仍为 read，但读 /red/；不能调用默认单词音频，否则会播 /riːd/。
  if (base === 'read') tags = [{ label: '过去式 / 过去分词（读 /red/）', form: 'read', speak: false }];
  FORMS[base] = tags;
});

Object.keys(IRREG_PL).forEach(function (pl) {
  var base = IRREG_PL[pl];
  if (pl !== base) VARIANTS[pl] = { base: base, label: LBL.pl };
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

// v1.1.94：本身就是原形、却以 -ed 结尾的词（bed / red / feed / seed / shed…）不是过去式，
// 不能被 -ed 分支剥掉。否则搜 feed 会冒出「fee 是它的过去式」这种假标签。
var BASEED = { bed: 1, red: 1, wed: 1, shed: 1, sled: 1, feed: 1, need: 1, seed: 1, speed: 1,
  breed: 1, weed: 1, bleed: 1, deed: 1, creed: 1, greed: 1, heed: 1, steed: 1, tweed: 1 };
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
  if (q.slice(-2) === 'ed' && !BASEED[q]) {
    push(q.slice(0, -1), LBL.past);          // hoped  -> hope；used -> use
    push(q.slice(0, -2), LBL.past);          // worked -> work
    var stem = q.slice(0, -2);
    if (stem.length >= 3 && stem.slice(-1) === stem.slice(-2, -1)) push(stem.slice(0, -1), LBL.past); // stopped -> stopp -> stop
  }
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
    t.form.split('/').forEach(function (f) { out.push({ label: t.label, form: f, speak: t.speak !== false }); });
  });
  return out;
}

// 给音频任务用：全部需要预生成读音的变体形式（去重、展平）
function allForms() {
  var seen = {}, out = [];
  function add(form) { form.split('/').forEach(function (f) { if (!seen[f]) { seen[f] = 1; out.push(f); } }); }
  Object.keys(FORMS).forEach(function (base) { FORMS[base].forEach(function (t) { if (t.speak !== false) add(t.form); }); });
  return out;
}

// 词条要展示的「其他形式」标签（v1.1.80）—— 一个入口出全部标签，模板直接遍历：
//  · 正向：单词本身是原形 → 列出它的不规则变化（take → 过去式 took / 过去分词 taken）
//  · 反向：单词本身是某原形的变体（功能词包里 was/were/been/am/is/are 都是独立词条）
//          → 标出原形（were → 原形 be）。此前只做正向，所以「were」当今日单词时词形行是空的。
// 返回 [{label, form}]，form 也是朗读文本（音频按文本哈希走 g/ 桶，逐字一致）。
//
// 词性过滤（v1.1.108，用户真机反馈）：拆卡词主/副卡词性不同（tear 主 n. 泪滴 / 副 v. 撕裂），
// 变形只属于其中一侧 —— tore/torn 是动词的变形，挂到名词主卡上就是误导。
// 传 pos 时按卡词性过滤：动词类标签只上 v. 卡、复数只上 n. 卡、比较级/最高级只上 adj. 卡；
// 「原形」反向标注（were → 原形 be）不参与过滤（功能词没有拆卡）。
// 真机实测受影响的只有三个词：tear（主卡误挂）、lead（副卡误挂 led）、read（副卡误挂过去式说明）。
function tagKind(label) {
  var s = String(label);
  if (s.indexOf('原形') >= 0) return '*';
  if (s.indexOf('复数') >= 0) return 'n';
  if (s.indexOf('比较级') >= 0 || s.indexOf('最高级') >= 0) return 'adj';
  return 'v';
}

function wfNotes(w, pos) {
  w = String(w || '').toLowerCase();
  var out = noteFor(w);
  if (!out.length) {
    var hit = VARIANTS[w];
    out = hit ? [{ label: '原形', form: hit.base }] : [];
  }
  if (pos && out.length) {
    var p = String(pos).split('/')[0].replace(/[^a-z]/g, '');
    if (p === 'n' || p === 'v' || p === 'adj') {
      out = out.filter(function (t) { var k = tagKind(t.label); return k === '*' || k === p; });
    }
  }
  return out;
}


// ---- 屈折全表（v1.1.110）：词卡「变形」行 / 搜索结果变形条共用 ----
// 只做同一词的屈折（use → uses / using / used），不做派生（user / usage 不算变形）。
// 拼写推导偏保守：单音节 CVC 才双写；多音节默认不双写，词尾重读的动词另列白名单。
var FINAL_STRESS = {
  begin: 1, prefer: 1, occur: 1, refer: 1, admit: 1, control: 1, regret: 1, permit: 1,
  commit: 1, forget: 1, upset: 1, equip: 1, patrol: 1, compel: 1, expel: 1, repel: 1,
  submit: 1, transmit: 1, omit: 1, forbid: 1, allot: 1, recur: 1, confer: 1, defer: 1,
  deter: 1, incur: 1, infer: 1, transfer: 1, embed: 1, propel: 1, rebel: 1, abhor: 1,
};
var IRREG_3SG = { be: 'is', have: 'has', do: 'does', go: 'goes' };
var PL_S = { photo: 1, piano: 1, radio: 1, video: 1, zoo: 1, studio: 1, kilo: 1, memo: 1, logo: 1, solo: 1, auto: 1, typo: 1, demo: 1 };
var BASE_PL = {};   // 原形 → 不规则复数（knife → knives）
Object.keys(IRREG_PL).forEach(function (pl) { var b = IRREG_PL[pl]; if (!BASE_PL[b]) BASE_PL[b] = pl; });
var BASE_CMP = {};  // good → [better, best]（noteFor 已经会展开，这里只用于跳过规则推导）
Object.keys(IRREG_ADJ).forEach(function (b) { BASE_CMP[b] = 1; });

function vowelGroups(s) { var c = s.replace(/e$/, ''); var m = c.match(/[aeiouy]+/g); return m ? m.length : 1; }
function cvc(s) {
  if (s.length < 3) return false;
  var a = s.slice(-3, -2), b = s.slice(-2, -1), c = s.slice(-1);
  if (!/[bcdfghjklmnpqrstvwxz]/.test(a)) return false;
  if (!/[aeiou]/.test(b)) return false;
  if (!/[bcdfghjklmnpqrstvwxz]/.test(c)) return false;
  if (/[wxy]/.test(c)) return false;
  if (s.slice(-2, -1) === c) return false;
  return true;
}
function dbl(s) { return cvc(s) && (vowelGroups(s) <= 1 || !!FINAL_STRESS[s]); }

function verbForms(s) {
  var out = [];
  var irr = IRREG_V[s];
  var s3 = IRREG_3SG[s];
  if (!s3) {
    if (/(s|x|z|ch|sh)$/.test(s)) s3 = s + 'es';
    else if (/[^aeiou]y$/.test(s)) s3 = s.slice(0, -1) + 'ies';
    else s3 = s + 's';
  }
  out.push({ label: LBL.s, form: s3 });
  if (/ie$/.test(s)) out.push({ label: LBL.ing, form: s.slice(0, -2) + 'ying' });
  else if (s.length > 2 && /[^e]e$/.test(s)) out.push({ label: LBL.ing, form: s.slice(0, -1) + 'ing' });
  else if (/c$/.test(s)) out.push({ label: LBL.ing, form: s + 'king' });
  else if (dbl(s)) out.push({ label: LBL.ing, form: s + s.slice(-1) + 'ing' });
  else out.push({ label: LBL.ing, form: s + 'ing' });
  if (!irr) {
    if (/e$/.test(s)) out.push({ label: LBL.past + ' / ' + LBL.pp, form: s + 'd' });
    else if (/[^aeiou]y$/.test(s)) out.push({ label: LBL.past + ' / ' + LBL.pp, form: s.slice(0, -1) + 'ied' });
    else if (/c$/.test(s)) out.push({ label: LBL.past + ' / ' + LBL.pp, form: s + 'ked' });
    else if (dbl(s)) out.push({ label: LBL.past + ' / ' + LBL.pp, form: s + s.slice(-1) + 'ed' });
    else out.push({ label: LBL.past + ' / ' + LBL.pp, form: s + 'ed' });
  }
  return out;
}

function nounForms(s) {
  if (IRREG_PL[s]) return [];
  if (BASE_PL[s]) return [{ label: LBL.pl, form: BASE_PL[s] }];
  var out;
  if (/(s|x|z|ch|sh)$/.test(s)) out = s + 'es';
  else if (/[^aeiou]y$/.test(s)) out = s.slice(0, -1) + 'ies';
  else if (/o$/.test(s) && !PL_S[s]) out = s + 'es';
  else out = s + 's';
  return [{ label: LBL.pl, form: out }];
}

function adjForms(s) {
  if (BASE_CMP[s]) return [];
  var g = vowelGroups(s);
  // 双音节只有 -y / -er / -le / -ow 结尾才加 -er；其余与三音节以上一样用 more / most
  if (g >= 3 || (g === 2 && !/(y|er|le|ow)$/.test(s))) {
    return [{ label: LBL.er, form: 'more ' + s }, { label: LBL.est, form: 'most ' + s }];
  }
  var er, est;
  if (/[^aeiou]y$/.test(s)) { er = s.slice(0, -1) + 'ier'; est = s.slice(0, -1) + 'iest'; }
  else if (/e$/.test(s)) { er = s + 'r'; est = s + 'st'; }
  else if (dbl(s)) { er = s + s.slice(-1) + 'er'; est = s + s.slice(-1) + 'est'; }
  else { er = s + 'er'; est = s + 'est'; }
  return [{ label: LBL.er, form: er }, { label: LBL.est, form: est }];
}

// 一个词的完整变形表：不规则（含 read 的 /red/ 提示）在前，规则推导在后，按 form 去重。
// 返回 [{ label, form, speak, same }]，same = 与原形同形（cut / read 这类，只作说明不跳转）。
function formsOf(w, pos) {
  w = String(w || '').toLowerCase();
  if (!w) return [];
  // 本身就是变体的词条（took / better / broken）：只标原形，不再往下推屈折（否则会造出 tooks）
  if (VARIANTS[w] && !FORMS[w]) return [{ label: '原形', form: VARIANTS[w].base, speak: true, same: false }];
  var p = String(pos || '').split('/').map(function (x) { return x.replace(/[^a-z]/g, ''); });
  var has = function (k) { return p.indexOf(k) >= 0; };
  var out = [], seen = {};
  function add(label, form, speak) {
    form = String(form || '').trim();
    if (!form) return;
    var same = form.toLowerCase() === w;
    if (same && speak !== false && !/形式不变/.test(String(label))) return;
    var k = form.toLowerCase();
    if (seen[k]) return;
    seen[k] = 1;
    out.push({ label: label, form: form, speak: speak !== false, same: same });
  }
  noteFor(w).forEach(function (t) { add(t.label, t.form, t.speak); });
  var any = !p.length || (p.length === 1 && !p[0]);
  if (any || has('v')) verbForms(w).forEach(function (f) { add(f.label, f.form); });
  if (any || has('n')) nounForms(w).forEach(function (f) { add(f.label, f.form); });
  // 只给「纯形容词」推比较级：read（v./adj.）、open（n./adj./v.）这类形容词义是不可分级的分词/状态义，
  // 硬推会得到 reader / readest 这种不存在的词。
  if ((any || has('adj') || has('adv')) && !has('v')) adjForms(w).forEach(function (f) { add(f.label, f.form); });
  return out;
}
module.exports = { lemma: lemma, noteFor: noteFor, wfNotes: wfNotes, formsOf: formsOf, allForms: allForms, LBL: LBL };

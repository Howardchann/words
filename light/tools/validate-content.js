#!/usr/bin/env node
// validate-content.js —— 内容与跨页面归一专项回归（不联网、不访问云端、不生成音频）
const assert = require('assert');
const plan = require('../miniprogram/utils/data.js');
const senses = require('../miniprogram/utils/split-senses.js');
const wordforms = require('../miniprogram/utils/wordforms.js');
const functionalWords = require('./audio-pipeline/data/funcwords-insert.json');
const words = plan.allWords();
const byWord = Object.create(null);
words.forEach(w => { assert(!byWord[w.w], 'duplicate word identity: ' + w.w); byWord[w.w] = w; ['p','m','e','ipa','uk','cn'].forEach(k => assert(String(w[k] || '').trim(), w.w + ' missing ' + k)); });
assert.strictEqual(words.length, 8115, 'word count');
assert.strictEqual(new Set(words.map(w => w.ai)).size, 8115, 'audio IDs must remain unique');
// Functional-word source and runtime table must share the same 115 immutable IDs and display fields.
assert.strictEqual(functionalWords.length, 115, 'functional-word count');
const byAi = Object.create(null);
words.forEach(w => { byAi[w.ai] = w; });
functionalWords.forEach((r, i) => {
  const [w, p, m, e, ai, ipa, uk, cn] = r;
  assert.strictEqual(Number(ai), 8001 + i, 'functional ai sequence ' + w);
  assert(w && p && m && e && ipa && uk && cn, 'functional word has all teaching fields: ' + w);
  const actual = byAi[Number(ai)];
  assert(actual, 'runtime functional word ' + w);
  [['w',w],['p',p],['m',m],['e',e],['ipa',ipa],['uk',uk],['cn',cn]].forEach(([k,v]) => assert.strictEqual(actual[k],v, w + ' runtime/source ' + k));
});
const functionalByWord = Object.fromEntries(functionalWords.map(r => [r[0], r]));
assert.strictEqual(functionalByWord.a[5], '/eɪ/');
assert.strictEqual(functionalByWord.a[6], '/eɪ/');
assert.strictEqual(functionalByWord.an[5], '/æn/');
assert.strictEqual(functionalByWord.an[6], '/æn/');
assert.strictEqual(functionalByWord.the[5], '/ðiː/');
assert.strictEqual(functionalByWord.the[6], '/ðiː/');
const expected = {
  isle: ['n.', '小岛；岛屿'], aisle: ['n.', '（建筑或座位间的）过道；走廊'],
  catching: ['v.', '赶上；补上；叙旧（catch up 的现在分词）'], reinforced: ['adj.', '加固的；增强的'],
  bitumen: ['n.', '沥青'], oblong: ['n./adj.', '长方形；长椭圆形；长方形的'],
  conservatory: ['n.', '温室；（英国）音乐学院'], expedient: ['adj./n.', '权宜的；权宜之计；有利的'],
  moderate: ['adj.', '适度的；温和的；中等的'], sow: ['v.', '播种；播下'], recount: ['v.', '详述；叙述'],
  tear: ['n.', '泪滴；眼泪'], use: ['n.', '使用；用途'], addict: ['n.', '上瘾者；入迷的人'],
  go: ['v.', '去；走；前往'], make: ['v.', '做；制造；使；安排'], think: ['v.', '想；认为；思考'],
  one: ['num./det./pron.', '一；一个；某一个'], some: ['det./pron.', '一些；若干；某些']
};
Object.keys(expected).forEach(w => {
  assert(byWord[w], 'missing target word ' + w);
  assert.strictEqual(byWord[w].p, expected[w][0], w + ' POS');
  assert.strictEqual(byWord[w].m, expected[w][1], w + ' gloss');
  assert(byWord[w].e && byWord[w].cn, w + ' example/translation');
  assert(byWord[w].ipa && byWord[w].uk, w + ' US/UK IPA');
});
assert.strictEqual(byWord.isle.ai, 7825);
assert.strictEqual(byWord.aisle.ai, 3597);
assert.strictEqual(byWord.tear.ai, 1513);
// Old favorite snapshots get canonical teaching fields while retaining the original progress timestamp and identity.
const oldSnapshot = plan.normalizeWord({ w: 'tear', p: 'n./v.', m: '旧释义', ai: 1513, ts: 12345 });
assert.strictEqual(oldSnapshot.p, 'n.');
assert.strictEqual(oldSnapshot.m, '泪滴；眼泪');
assert.strictEqual(oldSnapshot.ai, 1513);
assert.strictEqual(oldSnapshot.ts, 12345);
const expandedTear = senses.expand([byWord.tear]).list;
assert.strictEqual(expandedTear.length, 2);
assert.strictEqual(expandedTear[0].k, 'tear');
assert.strictEqual(expandedTear[1].k, 'tear~2');
assert.strictEqual(expandedTear[1].p, 'v.');
assert.strictEqual(senses.close.sub.p, 'v.');
assert.strictEqual(senses.close.sub.e, 'Please close the door quietly.');
const splitWords = Object.entries(senses).filter(([w, v]) => v && typeof v === 'object' && v.sub).map(([w]) => w);
splitWords.forEach(w => {
  const primary = senses.normalizePrimary(byWord[w]);
  const search = plan.searchWords(w, 20).list.find(x => x.w === w);
  assert(search, 'search hit ' + w);
  assert.strictEqual(search.p, primary.p, w + ' primary POS matches search');
  assert.strictEqual(search.m, primary.m, w + ' primary gloss matches search');
  assert.strictEqual(search.ipa, primary.ipa, w + ' primary US IPA matches search');
  assert.strictEqual(search.uk, primary.uk, w + ' primary UK IPA matches search');
  assert.strictEqual(search.altSense.m, primary.altSense.m, w + ' alternate gloss matches search');
  assert(search.altSense.ai && primary.altSense.ai, w + ' secondary sense has its own audio ID');
  const cards = senses.expand([byWord[w]]).list;
  assert.strictEqual(cards.length, 2, w + ' expands to one primary + one secondary sense');
  assert.strictEqual(cards[0].k, w, w + ' primary card key');
  assert.strictEqual(cards[1].k, w + '~2', w + ' secondary display key');
});
['addict','moderate','recount','tear','use','read','object','record','conduct','digest','permit'].forEach(w => {
  const primary = senses.normalizePrimary(byWord[w]);
  const search = plan.searchWords(w, 20).list.find(x => x.w === w);
  assert(search, 'search hit ' + w);
  assert.strictEqual(search.p, primary.p, w + ' search POS normalization');
  assert.strictEqual(search.m, primary.m, w + ' search gloss normalization');
  assert.strictEqual(search.ipa, primary.ipa, w + ' search IPA normalization');
  if (primary.altSense) assert.strictEqual(search.altSense.m, primary.altSense.m, w + ' alternate sense');
});
['cut','cost'].forEach(w => {
  const n = wordforms.wfNotes(w);
  assert(n.some(x => /形式不变/.test(x.label)), w + ' unchanged form label');
  assert.strictEqual(wordforms.lemma(w).some(x => x.base === w), false, w + ' self lemma mapping');
});
assert(wordforms.wfNotes('read').some(x => x.speak === false && /\/red\//.test(x.label)), 'read pronunciation disambiguation');
assert.strictEqual(wordforms.wfNotes('must').length, 0, 'must must not be tagged as an unchanged past form');
assert.strictEqual(wordforms.lemma('read').some(x => x.base === 'read'), false, 'read self mapping');
// v1.1.110：骨架改为「6 册 / 78 章 / 390 节」，词量不再由 sum(RAMP)×5 推出
assert.strictEqual(plan.SECTION_TOTAL, 390);
assert.strictEqual(plan.WORD_TOTAL, 8115);
assert.strictEqual(plan.WORD_TOTAL, plan.SEC_N.reduce((a,b)=>a+b,0));
assert.strictEqual(plan.WEEK_COUNT, 78);
assert.strictEqual(plan.BOOK_COUNT, 6);
assert.strictEqual(plan.CH_SEC.reduce((a,b)=>a+b,0), 390);
assert.strictEqual(plan.CORE_CNT.length, 390);
console.log(`内容一致性专项通过：${Object.keys(expected).length} 个目标词；${splitWords.length} 个多义词拆卡入口；115 条功能词源/运行时一致；${words.length} 条词目 / 唯一 ai；主卡归一、词形与 390 节课程结构均通过。`);

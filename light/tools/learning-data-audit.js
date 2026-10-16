// 学习数据回归检查：词库结构、多义词副卡、词形标注、语法知识点与空例句豁免。
const words = require('../miniprogram/utils/words.js').join('\n').split('\n').map(line => line.split('\t'));
const splitSenses = require('../miniprogram/utils/split-senses.js');
const wordforms = require('../miniprogram/utils/wordforms.js');
const plan = require('../miniprogram/utils/data.js');
const phoneticFixes = require('../miniprogram/utils/phonetic-corrections.js');
const EXPECTED_WORDS = 8115;
const fail = [];
function check(ok, message) { if (!ok) fail.push(message); }

check(words.length === EXPECTED_WORDS, '词表应为 8115 条，实际 ' + words.length);
const seen = new Set();
words.forEach((row, i) => {
  check(row.length === 8, '第 ' + (i + 1) + ' 行字段数应为 8，实际 ' + row.length);
  check(row.every(v => String(v || '').trim()), '第 ' + (i + 1) + ' 行存在空字段');
  if (row[0]) {
    const key = row[0].toLowerCase();
    check(!seen.has(key), '重复词条：' + row[0]);
    seen.add(key);
  }
  check(/^\/.+\/$/.test(row[5] || ''), (row[0] || i + 1) + ' 缺少美音音标包装');
  check(/^\/.+\/$/.test(row[6] || ''), (row[0] || i + 1) + ' 缺少英音音标包装');
  check(/^\d+$/.test(row[4] || ''), (row[0] || i + 1) + ' 音频编号不是数字');
});

const overlayKeys = Object.keys(splitSenses).filter(k => k !== 'expand' && k !== 'subFor' && k !== 'mainFor');
const ids = new Set();
overlayKeys.forEach(key => {
  const v = splitSenses[key];
  if (!v || !v.sub) return;
  check(v.sub.ai >= 8200 && v.sub.ai <= 8245, key + ' 副卡音频编号超范围：' + v.sub.ai);
  check(!ids.has(v.sub.ai), '副卡音频编号重复：' + v.sub.ai);
  ids.add(v.sub.ai);
  ['p','m','ipa','uk','ai','e','cn'].forEach(k => check(v.sub[k] !== undefined && String(v.sub[k]).trim() !== '', key + ' 副卡缺少 ' + k));
});
check(ids.size === 46, '副卡应有 46 个唯一 ID，实际 ' + ids.size);

['read','cut','cost','hit','hurt','let','put','set','shut','bet','must'].forEach(w =>
  check(!wordforms.wfNotes(w).some(x => x.form === w), w + ' 不应显示与原形相同的可点读标签'));
check(wordforms.wfNotes('must').length === 0, 'must 不应显示普通过去式标签');
check(wordforms.wfNotes('go').some(x => x.form === 'went'), 'go 应显示不规则过去式 went');
check(phoneticFixes.r[1].w === 'right' && phoneticFixes.r[1].hit === 'r', '/r/ 例词应使用 right');
check(phoneticFixes.w[2].w === 'win' && phoneticFixes.w[2].hit === 'w', '/w/ 例词不应把 qu 整体高亮');

const grammar = require('../miniprogram/pkg-study/data/grammar.js');
const grammarTopics = grammar.flatMap(group => group.topics || []);
check(grammar.length === 12, '语法速查分类应为 12，实际 ' + grammar.length);
check(grammarTopics.length === 71, '语法知识点应为 71，实际 ' + grammarTopics.length);
grammarTopics.forEach(topic => {
  check(!!topic.t && !!topic.def, '语法点缺标题或定义：' + (topic.t || '(无标题)'));
  check(Array.isArray(topic.use) && topic.use.length > 0, '语法点缺用法：' + topic.t);
  check(Array.isArray(topic.ex) && topic.ex.length > 0, '语法点缺例句：' + topic.t);
  (topic.ex || []).forEach(ex => check(!!ex.en && !!ex.cn, '语法点例句缺英文或中文：' + topic.t));
});

const runtimeWords = new Map(plan.allWords().map(w => [w.w, w]));
const expected = {
  isle:['The small isle is home to many birds.','小岛'],
  aisle:['Please leave the aisle clear.','过道；通道'],
  catching:['Laughter is catching.','有感染力的；容易传染的'],
  reinforced:['The reinforced bridge can carry heavier trucks.','加固的；增强的'],
  bitumen:['Workers used bitumen to seal the roof.','沥青'],
  oblong:['The box is oblong.','长方形；长椭圆形；长方形的'],
  conservatory:['She studies piano at the conservatory.','温室；（尤指英国的）音乐学院'],
  expedient:['It was expedient to wait until morning.','权宜之计；权宜的；方便的'],
  moderate:['We need a moderate amount of exercise.','适度的；稳健的'],
  sow:['Farmers sow seeds in spring.','播种'],
  recount:['She recounted what happened during the trip.','详述；叙述'],
  some:['Some of the best players in the world train here.','一些；一部分']
};
const aisle = runtimeWords.get('aisle');
check(!!aisle, '运行时缺少 aisle 词条');
if (aisle) {
  check(aisle.e === 'Please leave the aisle clear.', 'aisle 例句修正未生效');
  check(aisle.m === '过道；通道', 'aisle 释义修正未生效：' + aisle.m);
  check(aisle.cn === '请保持过道畅通。', 'aisle 翻译修正未生效');
}
Object.keys(expected).forEach(w => {
  const actual = runtimeWords.get(w), e = expected[w];
  check(!!actual, '运行时缺少词条 ' + w);
  if (actual) {
    check(actual.e === e[0], w + ' 例句修正未生效');
    check(actual.m === e[1], w + ' 主卡释义修正未生效：' + actual.m);
    if (w === 'isle' || w === 'aisle') check(actual.ipa === '/aɪl/' && actual.uk === '/aɪl/', w + ' 英美音标应统一为 /aɪl/');
  }
});
['abuse','addict','moderate','read','recount','use'].forEach(w =>
  check(!!(runtimeWords.get(w) && runtimeWords.get(w).subSense), w + ' 的副读音未进入共享数据'));

const NO_EXAMPLE_OK = new Set([
  '6-1','12-1','12-5','18-1','18-2','18-4','18-5','24-4','27-1','27-5','30-3','30-5',
  '39-1','39-2','39-3','39-5','42-2','42-4','51-1','54-4','54-5','57-5','58-2','63-5',
  '66-5','72-1','72-4','75-5','77-1','77-2','77-4'
]);
const weeks = [1,2,3,4,5,6].flatMap(i => require('../miniprogram/utils/data-p' + i + '.js'));
const emptyExampleDays = [];
weeks.forEach((week, wi) => (week.d || []).forEach((day, di) => {
  if (day.g && (!Array.isArray(day.g.ex) || day.g.ex.length === 0)) {
    const key = (wi + 1) + '-' + (di + 1);
    emptyExampleDays.push(key);
    check(NO_EXAMPLE_OK.has(key), '第 ' + key + ' 天「' + day.t + '」缺少例句且未审核豁免');
  }
}));
NO_EXAMPLE_OK.forEach(key => check(emptyExampleDays.includes(key), '空例句豁免 ' + key + ' 已过期，应清理'));

console.log('词表：' + words.length + ' 行 / ' + seen.size + ' 个唯一拼写');
console.log('多义词副卡：' + overlayKeys.length + ' 个 overlay 键 / ' + ids.size + ' 个唯一 ID');
console.log('语法速查：' + grammar.length + ' 类 / ' + grammarTopics.length + ' 个知识点，字段与例句结构完整');
console.log('空例句豁免：' + emptyExampleDays.length + ' 天（策略/复盘型）');
if (fail.length) { console.error('\n失败 ' + fail.length + ' 项：\n' + fail.map(x => ' - ' + x).join('\n')); process.exitCode = 1; }
else console.log('\n学习数据结构审查：全部通过');

// selftest.js —— 换机 clone 后第一件事：确认管线依赖齐、路径解析对
// 用法：node tools/audio-pipeline/selftest.js
const fs = require('fs');
const env = require('./_env');

let bad = 0;
const need = (label, p) => {
  const ok = fs.existsSync(p);
  if (!ok) bad++;
  console.log('  ' + (ok ? '✓' : '✗') + ' ' + label.padEnd(34) + p);
};

console.log('audio-pipeline 自检');
console.log('  HERE   = ' + env.HERE);
console.log('  WORK   = ' + env.WORK);
console.log('  MP     = ' + env.MP);
console.log('  FFMPEG = ' + env.FFMPEG + (env.FFMPEG === 'ffmpeg' ? '   （走 PATH，请确认已安装）' : ''));
console.log('');

console.log('【输入数据 · data/】');
['cambridge-db.json', 'cambridge-db-legacy.json', 'uk-words.json', 'funcwords-insert.json', 'audio-tasks.json', 'g-extra.json']
  .forEach((f) => need(f, env.data(f)));

console.log('【小程序内核 · ../../miniprogram/】');
['utils/words.js', 'utils/split-senses.js', 'utils/phonetic.js', 'utils/wordforms.js', 'utils/data.js', 'utils/speech.js', 'pkg-study/data/grammar.js']
  .forEach((f) => need(f, env.mp(f)));

console.log('【云端清单 · 可选】');
const mf = require('path').join(env.HERE, 'cloud-manifest.json');
if (fs.existsSync(mf)) {
  const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
  console.log('  ✓ cloud-manifest.json（' + m.generatedAt + '）  ' +
    Object.entries(m.buckets).map(([b, x]) => b + ' ' + x.count).join(' / ') +
    '   合计 ' + m.summary.totalCount + ' 个 / ' + m.summary.totalMB + ' MB');
} else {
  console.log('  · cloud-manifest.json 不存在（可选：node mk-manifest.js 重新拉取）');
}

console.log('');
console.log(bad === 0 ? '✅ 全部就位，可以开始生成音频' : '⚠️  ' + bad + ' 项缺失，先补齐再跑生成脚本');
process.exit(bad === 0 ? 0 : 1);

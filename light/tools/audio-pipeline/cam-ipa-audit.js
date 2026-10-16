// cam-ipa-audit.js —— 比对「卡面音标」与「剑桥选中块音标」，找真正的读音不一致

const { HERE, WORK, MP, FFMPEG: FF, FFPROBE: FFP, data, work, mp } = require('./_env');

const fs = require('fs');
const plan = require(work('cam-plan.json'));

// 激进归一：把两套记法折到同一骨架（去长度符/重音符/斜杠/点，合并近似元音）
const canon = s => (s || '')
  .replace(/[\/．.\s]/g, '').replace(/[ˈˌː]/g, '').toLowerCase()
  .replace(/ɡ/g, 'g')
  .replace(/ɚ/g, 'er').replace(/ɝ/g, '3r').replace(/ɜ/g, '3')
  .replace(/[əʌ]/g, 'e')
  .replace(/[ɒɑ]/g, 'a')
  .replace(/ɔ/g, 'o')
  .replace(/æ/g, 'a')
  .replace(/ɛ/g, 'e')
  .replace(/ɪ/g, 'i')
  .replace(/ʊ/g, 'u')
  .replace(/θ/g, 'T').replace(/ð/g, 'D')
  .replace(/ʃ/g, 'S').replace(/ʒ/g, 'Z')
  .replace(/ŋ/g, 'N').replace(/tʃ/g, 'C').replace(/dʒ/g, 'J');
const stressIdx = s => (s || '').replace(/[\/.]/g, '').indexOf('ˈ');

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j), cur = [];
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}
const sim = (a, b) => { const L = Math.max(a.length, b.length); return L ? 1 - lev(a, b) / L : 1; };

const rows = [];
for (const c of plan) {
  if (c.skip) continue;
  for (const acc of ['us', 'uk']) {
    const target = acc === 'us' ? c.usT : c.ukT;
    const blkRaw = acc === 'us' ? c.usIpa : c.ukIpa;
    const blk = blkRaw ? blkRaw.split(',')[0].trim().replace(/[-·]/g, '') : blkRaw;  // 取剑桥第一个读音变体
    const pos = acc === 'us' ? c.usPos : c.ukPos;
    if (!blk) { rows.push({ key: c.key, acc, kind: c.kind, pos, target, blk, verdict: '无音频块', sim: 0, dStress: '-' }); continue; }
    const ca = canon(target), cb = canon(blk);
    const s = sim(ca, cb);
    const sa = stressIdx(target), sb = stressIdx(blk);
    const dStress = (sa >= 0 && sb >= 0) ? (sa - sb) : (sa < 0 ? 0 : NaN);
    let verdict = '✓ 一致';
    if (s < 0.999) {
      if (s >= 0.85 && (dStress === 0 || Number.isNaN(dStress))) verdict = '≈ 记法差异';
      else if (s >= 0.85) verdict = '△ 仅重音位置差 ' + (dStress > 0 ? '+' : '') + dStress;
      else verdict = '✗ 音段不同';
    } else if (s >= 0.999 && dStress !== 0 && !Number.isNaN(dStress)) verdict = '△ 仅重音位置差 ' + (dStress > 0 ? '+' : '') + dStress;
    rows.push({ key: c.key, acc, kind: c.kind, pos, target, blk, verdict, sim: +s.toFixed(3), dStress });
  }
}

const bad = rows.filter(r => !r.verdict.startsWith('✓') && !r.verdict.startsWith('≈'));
console.log('总比对', rows.length, '| 需要处理', bad.length);
console.log('-'.repeat(110));
for (const r of bad) {
  console.log(r.verdict.padEnd(18) + ' ' + (r.key + '/' + r.acc).padEnd(22) + ' pos=' + String(r.pos).padEnd(10) +
    ' 卡面=' + String(r.target).padEnd(18) + ' 剑桥=' + String(r.blk).padEnd(18) + ' sim=' + r.sim);
}
console.log('-'.repeat(110));
console.log('≈记法差异（不影响读音，仅列几例）:');
rows.filter(r => r.verdict.startsWith('≈')).slice(0, 8).forEach(r =>
  console.log('   ' + (r.key + '/' + r.acc).padEnd(22) + ' pos=' + String(r.pos).padEnd(10) + ' 卡面=' + String(r.target).padEnd(18) + ' 剑桥=' + r.blk + ' sim=' + r.sim));
fs.writeFileSync(work('cam-ipa-audit.json'), JSON.stringify(rows, null, 1));

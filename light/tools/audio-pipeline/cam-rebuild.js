// cam-rebuild.js —— 剑桥音频选块修正 + 审计 + 可选重建
// 用法：
//   node cam-rebuild.js            # 只审计（打印 105 卡选块明细）
//   node cam-rebuild.js --gen      # 审计 + 下载 + ffmpeg 输出到 _out1102

const { HERE, WORK, MP, FFMPEG: FF, FFPROBE: FFP, data, work, mp } = require('./_env');

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { pick, POSMAP } = require('./cam-pick.js');

const DBFILE = fs.existsSync(data('cambridge-db.json'))
  ? data('cambridge-db.json') : data('cambridge-db-legacy.json');
const db = require(DBFILE);
const SP = require(mp('utils/split-senses.js'));
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
const GEN = process.argv.includes('--gen');

// ── words.js 解析 ──
const raw = fs.readFileSync(mp('utils/words.js'), 'utf8');
const TAB = '\\t', NL = '\\n';
const W = {};
for (const line of raw.split(NL)) {
  if (!line) continue;
  const f = line.split(TAB);
  if (f.length >= 7 && f[4]) W[f[0]] = { ai: +f[4], us: f[5], uk: f[6], p1: (f[1] || '').split('/')[0].replace(/\./g, '') };
}

// ── 收集卡 ──
const cards = [];
for (const word of Object.keys(db)) {
  const m = W[word];
  if (!m) { console.log('!! 词表缺:', word); continue; }
  const sp = SP[word];
  // 主卡「实际显示词性」= overlay 覆盖的 p1（若有），否则 words.js 词性首项
  const mainP1 = (sp && typeof sp === 'object' && sp.p1) ? sp.p1 : m.p1;
  cards.push({ key: word, word, ai: m.ai, kind: 'main', pos: POSMAP[String(mainP1).split('/')[0].replace(/\./g, '')] || null, usT: m.us, ukT: m.uk });
  if (sp && typeof sp === 'object' && sp.sub && typeof sp.sub === 'object') {
    const s = sp.sub;
    cards.push({ key: word + '#sub', word, ai: +s.ai, kind: 'sub', pos: POSMAP[(s.p || '').replace(/\./g, '')] || null, usT: s.ipa, ukT: s.uk });
  }
}

// 特例
let redUrls = null;
const SPECIAL_SKIP = { 'addict#sub': '剑桥/牛津/韦氏均无 v. 公开音频 → 保留 TTS' };

(async () => {
  try {
    const t = await fetch('https://dictionary.cambridge.org/dictionary/english/red', { headers: UA }).then(r => r.text());
    const srcs = [...t.matchAll(/<source[^>]*type="audio\/mpeg"[^>]*src="([^"]+\.mp3)"/g)].map(m => 'https://dictionary.cambridge.org' + m[1]);
    redUrls = { uk: srcs.find(u => u.includes('uk_pron')), us: srcs.find(u => u.includes('us_pron')) };
  } catch (e) { console.log('red 抓取失败:', e.message); }

  const plan = [];
  const susp = [];
  for (const c of cards) {
    if (SPECIAL_SKIP[c.key]) { c.skip = SPECIAL_SKIP[c.key]; plan.push(c); continue; }
    if (c.kind === 'sub' && c.word === 'read' && redUrls) {
      c.us = { url: redUrls.us, ipa: 'red', pos: 'adjective', score: 99, why: 'red 同音替代' };
      c.uk = { url: redUrls.uk, ipa: 'red', pos: 'adjective', score: 99, why: 'red 同音替代' };
      c.via = 'red 同音替代'; plan.push(c); continue;
    }
    const us = pick(db[c.word], 'us', c.pos, c.usT);
    const uk = pick(db[c.word], 'uk', c.pos, c.ukT);
    c.us = us; c.uk = uk;
    plan.push(c);
    // 可疑判据：任一侧未命中 POS 且未命中 IPA 骨架
    for (const [acc, r] of [['us', us], ['uk', uk]]) {
      if (!r) { susp.push(c.key + '/' + acc + ' 无可用块'); continue; }
      if (r.score < 5) susp.push(c.key + '/' + acc + ' 低分 ' + r.score + '(' + (r.why || '无)') + ') 目标pos=' + (c.pos || '-') + ' 选中pos=' + r.pos);
    }
  }

  // ── 审计打印 ──
  console.log('#'.repeat(80));
  console.log('卡数', plan.length, '| 词库', path.basename(DBFILE));
  console.log('#'.repeat(80));
  const byWord = {};
  plan.forEach(c => { (byWord[c.word] = byWord[c.word] || []).push(c); });
  for (const w of Object.keys(byWord)) {
    console.log('── ' + w + '  剑桥块: ' + (db[w] || []).filter(b => b.mp3us || b.mp3uk).map(b => b.pos + (b.mp3uk ? '[uk]' : '') + (b.mp3us ? '[us]' : '')).join(' , '));
    for (const c of byWord[w]) {
      const f = r => r ? (r.ipa + '(' + r.pos + ',s' + r.score + (r.why ? ',' + r.why : '') + ')') : '×';
      console.log('   ' + (c.kind === 'sub' ? '└副' : '主 ') + ' ai=' + c.ai + ' pos=' + (c.pos || '-') +
        '  美: 目标=' + (c.usT || '-') + ' → ' + f(c.us) +
        '  英: 目标=' + (c.ukT || '-') + ' → ' + f(c.uk) + (c.skip ? '  [SKIP ' + c.skip + ']' : ''));
    }
  }
  console.log('='.repeat(80));
  console.log('可疑项', susp.length, susp.length ? '\n  ' + susp.join('\n  ') : '');

  fs.writeFileSync(work('cam-plan.json'),
    JSON.stringify(plan.map(({ key, word, ai, kind, pos, usT, ukT, us, uk, skip, via }) => ({
      key, word, ai, kind, pos, usT, ukT,
      usUrl: us && us.url, ukUrl: uk && uk.url,
      usPos: us && us.pos, ukPos: uk && uk.pos, usIpa: us && us.ipa, ukIpa: uk && uk.ipa,
      usScore: us && us.score, ukScore: uk && uk.score, skip, via,
    })), null, 1));

  if (!GEN) { console.log('\n（审计模式；加 --gen 才下载+转码）'); return; }

  // ── 下载（去重，缓存续传）──
  const urls = new Set();
  plan.forEach(c => { if (c.us && c.us.url) urls.add(c.us.url); if (c.uk && c.uk.url) urls.add(c.uk.url); });
  const srcDir = work('cam_src');
  fs.mkdirSync(srcDir, { recursive: true });
  const srcFile = u => path.join(srcDir, u.replace(/[^a-z0-9]/gi, '_').slice(-70) + '.mp3');
  const list = [...urls];
  let dlOk = 0; const dlFail = [];
  for (let i = 0; i < list.length; i += 2) {
    await Promise.all(list.slice(i, i + 2).map(async u => {
      const f = srcFile(u);
      if (fs.existsSync(f) && fs.statSync(f).size > 2000) { dlOk++; return; }
      for (let att = 0; att < 3; att++) {
        try {
          const r = await fetch(u, { headers: UA });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const buf = Buffer.from(await r.arrayBuffer());
          if (buf.length < 2000) throw new Error('too small');
          fs.writeFileSync(f, buf); dlOk++; return;
        } catch (e) { if (att === 2) dlFail.push(u.slice(-40) + ' ' + e.message); else await new Promise(r => setTimeout(r, 1500 * (att + 1))); }
      }
    }));
    await new Promise(r => setTimeout(r, 600));
  }
  console.log('下载', dlOk + '/' + list.length, dlFail.length ? '失败:' + dlFail.slice(0, 5).join(' | ') : '');

  // ── ffmpeg 输出 _out1102 ──
  const outRoot = work('cam_out');
  let genOk = 0; const genFail = [];
  for (const c of plan) {
    if (c.skip) continue;
    for (const accent of ['us', 'uk']) {
      const info = c[accent];
      if (!info || !info.url) { genFail.push(c.key + '/' + accent + ': 无源'); continue; }
      const src = srcFile(info.url);
      if (!fs.existsSync(src)) { genFail.push(c.key + '/' + accent + ': 源缺失'); continue; }
      const bucket = accent === 'us' ? 'w' : 'wuk';
      const shard = String(Math.floor(c.ai / 1000));
      const dir = path.join(outRoot, bucket, shard);
      fs.mkdirSync(dir, { recursive: true });
      // ⚠️ 必须与 speech.js 的 fname() 一致：4 位补零（('0000'+ai).slice(-4)）
      const base = String(c.ai).padStart(4, '0');
      for (const [out, extra] of [[path.join(dir, base + '.mp3'), []], [path.join(dir, base + 's.mp3'), ['-filter:a', 'atempo=0.78']]]) {
        try {
          execFileSync(FF, ['-y', '-i', src, ...extra, '-ar', '44100', '-b:a', '96k', out], { stdio: 'pipe', timeout: 30000 });
          if (fs.statSync(out).size > 2000) genOk++; else genFail.push(out + ': 小文件');
        } catch (e) { genFail.push(c.key + '/' + accent + ' ' + e.message.slice(0, 50)); }
      }
    }
  }
  console.log('生成', genOk, '文件', genFail.length ? '失败:\n  ' + genFail.slice(0, 10).join('\n  ') : '');
})();

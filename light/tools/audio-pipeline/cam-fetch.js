// cam-fetch.js —— 重抓 Cambridge 音标（修「嵌套音节 span 导致 IPA 截断」）
// 关键修正：
//   1) IPA 用 `<span class="ipa...">([\s\S]*?)</span>/` 匹配（终点是 </span>/，绕开嵌套 span），再剥内部标签 + 去音节点
//   2) 音频两种结构都取：<source type="audio/mpeg" src=> 与 data-src-mp3=
//   3) 429 退避重试；逐词串行 + 700ms 间隔

const { HERE, WORK, MP, FFMPEG: FF, FFPROBE: FFP, data, work, mp } = require('./_env');

const fs = require('fs');
const OLD = data('cambridge-db-legacy.json');
const OUT = data('cambridge-db.json');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' };

const sleep = ms => new Promise(r => setTimeout(r, ms));

function cleanIpa(s) {
  if (!s) return null;
  // 剥所有内部标签，再去掉音节分隔点（保留重音符与长音符）
  let x = s.replace(/<[^>]+>/g, '').replace(/\./g, '').trim();
  return x || null;
}

async function get(word) {
  const url = 'https://dictionary.cambridge.org/dictionary/english/' + encodeURIComponent(word);
  let t = null;
  for (let att = 0; att < 4; att++) {
    const r = await fetch(url, { headers: UA });
    if (r.status === 429) { await sleep(2500 * (att + 1)); continue; }
    if (!r.ok) return { err: 'HTTP ' + r.status };
    t = await r.text();
    break;
  }
  if (!t) return { err: 'HTTP 429 重试耗尽' };

  // pos 锚点
  const posRe = /<span class="pos dpos"[^>]*>([^<]+)<\/span>/g;
  const marks = [];
  let pm;
  while ((pm = posRe.exec(t))) marks.push({ pos: pm[1].trim(), i: pm.index });
  if (!marks.length) return { err: 'no pos' };

  const out = [];
  for (let i = 0; i < marks.length; i++) {
    const seg = t.slice(marks[i].i, i + 1 < marks.length ? marks[i + 1].i : marks[i].i + 12000);
    // 段内 dpron-i 子块（uk/us）
    const sub = [];
    const dre = /class="(uk|us) dpron-i/g;
    let dm;
    while ((dm = dre.exec(seg))) sub.push({ region: dm[1], i: dm.index });
    const blk = { pos: marks[i].pos, uk: null, us: null, mp3uk: null, mp3us: null, mp3uk_o: null, mp3us_o: null };
    for (let k = 0; k < sub.length; k++) {
      const s = seg.slice(sub[k].i, k + 1 < sub.length ? sub[k + 1].i : Math.min(seg.length, sub[k].i + 4000));
      // IPA：从 <span class="ipa..."> 到 </span>/（绕开嵌套）
      const im = s.match(/<span class="ipa[^"]*">([\s\S]*?)<\/span>\//);
      const ipa = im ? cleanIpa(im[1]) : null;
      // 音频：mp3 与 ogg 两种
      const mp3 = s.match(/<source[^>]*type="audio\/mpeg"[^>]*src="([^"]+\.mp3)"/) || s.match(/data-src-mp3="([^"]+\.mp3)"/);
      const u = mp3 ? (mp3[1].startsWith('http') ? mp3[1] : 'https://dictionary.cambridge.org' + mp3[1]) : null;
      const ogg = s.match(/<source[^>]*type="audio\/ogg"[^>]*src="([^"]+\.ogg)"/);
      const uo = ogg ? (ogg[1].startsWith('http') ? ogg[1] : 'https://dictionary.cambridge.org' + ogg[1]) : null;
      if (sub[k].region === 'uk') {
        if (!blk.uk && ipa) blk.uk = ipa;
        if (!blk.mp3uk && u) blk.mp3uk = u;
        if (!blk.mp3uk_o && uo) blk.mp3uk_o = uo;
      } else {
        if (!blk.us && ipa) blk.us = ipa;
        if (!blk.mp3us && u) blk.mp3us = u;
        if (!blk.mp3us_o && uo) blk.mp3us_o = uo;
      }
    }
    if (blk.uk || blk.us || blk.mp3uk || blk.mp3us) out.push(blk);
  }
  return out;
}

(async () => {
  const old = JSON.parse(fs.readFileSync(OLD, 'utf8'));
  const words = Object.keys(old);
  console.log('词数', words.length);
  const db = {};
  let diff = 0;
  for (let idx = 0; idx < words.length; idx++) {
    const w = words[idx];
    try {
      const r = await get(w);
      db[w] = r;
      if (!Array.isArray(r)) { console.log('ERR', w, JSON.stringify(r)); }
      else {
        const o = old[w];
        if (Array.isArray(o)) {
          for (let i = 0; i < Math.max(o.length, r.length); i++) {
            const a = o[i] || {}, b = r[i] || {};
            if (a.uk !== b.uk || a.us !== b.us) {
              diff++;
              console.log('  差异 ' + w + '[' + i + '] ' + b.pos + ': 旧 uk=' + (a.uk || '-') + ' us=' + (a.us || '-') + '  →  新 uk=' + (b.uk || '-') + ' us=' + (b.us || '-'));
            }
          }
        }
      }
    } catch (e) { console.log('ERR', w, e.message); db[w] = { err: e.message }; }
    if (idx % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify(db, null, 1)); }
    await sleep(700);
  }
  fs.writeFileSync(OUT, JSON.stringify(db, null, 1));
  console.log('--- saved', Object.keys(db).length, 'words | 音标差异', diff, '处 ---');
})();

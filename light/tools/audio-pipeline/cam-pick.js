// cam-pick.js —— 剑桥音频选块（v1.1.102 修正版）
// 旧 bug：norm() 比较因音标截断永不成立 + 重音索引「带斜杠 target vs 不带斜杠剑桥」错位 1
//        → 分数恒 0 → 退化成「剑桥第一个有音频的块」胜出（abuse 名词拿了动词录音）
// 新逻辑：① 词性匹配为主键（剑桥块 pos ↔ 卡面色词性）② 音标骨架相等 ③ 重音位置相等

const { HERE, WORK, MP, FFMPEG: FF, FFPROBE: FFP, data, work, mp } = require('./_env');

const POSMAP = {
  n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb',
  noun: 'noun', verb: 'verb', adjective: 'adjective', adverb: 'adverb',
  pron: 'pronoun', prep: 'preposition', conj: 'conjunction', num: 'number',
};

// 骨架：去斜杠/点/长音符/重音符 → 只留音段序列（用于「是否同一串音」判断）
const skeleton = s => (s || '')
  .replace(/[\/．.ːˈˌ\s]/g, '')
  .toLowerCase()
  .replace(/ɡ/g, 'g');
// 重音索引：保留重音符，去斜杠与音节点
const stressIdx = s => (s || '').replace(/[\/.]/g, '').indexOf('ˈ');

// 编辑距离相似度（用于同词性多块时的决胜，如 tear 的「眼泪/撕裂」两个 noun 块）
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

function score(cardPos, cardIpa, blkPos, blkIpa) {
  let sc = 0; const why = [];
  if (cardPos && blkPos && cardPos === blkPos) { sc += 5; why.push('POS'); }
  if (cardIpa && blkIpa) {
    if (skeleton(cardIpa) === skeleton(blkIpa)) { sc += 4; why.push('IPA='); }
    else {
      const a = stressIdx(cardIpa), b = stressIdx(blkIpa);
      if (a >= 0 && a === b) { sc += 2; why.push('重音同'); }
      const s = sim(skeleton(cardIpa), skeleton(blkIpa));
      sc += s * 1.5;                       // 连续相似度：同词性多块时决胜
      if (s >= 0.66) why.push('近' + s.toFixed(2));
    }
  }
  return { sc, why: why.join('+') };
}

// 返回 { url, ipa, pos, ipaTarget, score, why } | null
function pick(blocks, accent, cardPos, cardIpa) {
  const key = 'mp3' + accent;       // mp3us | mp3uk
  const ipaKey = accent;            // us | uk
  let best = null;
  for (const b of blocks || []) {
    if (!b[key]) continue;
    const bi = b[ipaKey];
    const r = score(cardPos, cardIpa, b.pos, bi);
    if (!best || r.sc > best.score) {
      best = { url: b[key], ipa: bi, pos: b.pos, score: r.sc, why: r.why };
    }
  }
  if (best) best.cardPos = cardPos || null, best.cardIpa = cardIpa || null;
  return best;
}

module.exports = { pick, skeleton, stressIdx, POSMAP };

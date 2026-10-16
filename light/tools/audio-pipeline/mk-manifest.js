// mk-manifest.js —— 汇总云端音频 key 清单 + 缺口分析 → cloud-manifest.json
//
// 为什么存在：云端音频本体约 1GB，不可能进 git；但"云端到底有哪些文件"是换机后
//   最需要离线可查的信息（对照缺口、核对音源批次）。本脚本把云端对象列表落成一份
//   纯文本清单（约 1MB），随仓库走。
//
// 用法：
//   node mk-manifest.js                                # 调 CloudBase CLI 逐个分片拉取（需联网 + 已登录）
//   node mk-manifest.js --from-dir=D:/tmp/cloud_list   # 离线：从已有的分片 JSON 目录汇总
//
// 环境变量：
//   TCB_ENV   云环境 ID（默认内置）
//   TCB_CLI   CLI 调用前缀（默认 npx -y @cloudbase/cli；本机若装在本地 node_modules 可覆盖）
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { HERE } = require('./_env');

const ENV = process.env.TCB_ENV || 'cloud1-d2gfv3f254c476e40';
const OUT = path.join(HERE, 'cloud-manifest.json');

// 分片：w / wuk / s 各 0~8（按 ai 号千位），g 按 djb2 hash 末位 0~9
const SHARDS = [];
['w', 'wuk', 's'].forEach((b) => { for (let i = 0; i <= 8; i++) SHARDS.push(b + '/' + i); });
for (let i = 0; i <= 9; i++) SHARDS.push('g/' + i);

const dirArg = process.argv.find((a) => a.startsWith('--from-dir='));

function readShard(shard) {
  if (dirArg) {
    const f = path.join(dirArg.split('=')[1], shard.replace('/', '_') + '.json');
    if (!fs.existsSync(f)) return [];
    return JSON.parse(fs.readFileSync(f, 'utf8')).data || [];
  }
  const cli = process.env.TCB_CLI || 'npx -y @cloudbase/cli';
  const out = execSync(cli + ' storage list ' + shard + ' --json -e ' + ENV, {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return JSON.parse(out).data || [];
}

const raw = {};
SHARDS.forEach((s) => {
  let items = [];
  try { items = readShard(s); } catch (e) { console.log('  ⚠ ' + s + ' 拉取失败：' + e.message); }
  process.stdout.write('  ' + s.padEnd(7) + String(items.length).padStart(6) + '\n');
  items.forEach((it) => {
    const b = String(it.key).split('/')[0];
    (raw[b] = raw[b] || []).push({ k: it.key, size: +it.size });
  });
});

const out = {
  env: ENV,
  generatedAt: new Date().toISOString().slice(0, 10),
  source: 'tcb storage list <分片> --json -e <env>（w|wuk|s 各 0~8，g 各 0~9，共 37 次调用）',
  note:
    '云端音频对象的 key 全量清单（只记 key，不记 eTag/lastModified 以控制体积）。' +
    'mp3 本体约 1GB，不进 git；本清单用于换机后离线对照与缺口审计。路径规则见同目录 README.md。',
  buckets: {},
};

['w', 'wuk', 's', 'g'].forEach((b) => {
  const arr = (raw[b] || []).slice().sort((x, y) => (x.k < y.k ? -1 : 1));
  const bytes = arr.reduce((s, x) => s + x.size, 0);
  const sz = arr.map((x) => x.size).sort((a, c) => a - c);
  out.buckets[b] = {
    count: arr.length,
    bytes,
    mb: +(bytes / 1048576).toFixed(1),
    avgKB: arr.length ? +(bytes / arr.length / 1024).toFixed(1) : 0,
    minKB: sz.length ? +(sz[0] / 1024).toFixed(1) : 0,
    maxKB: sz.length ? +(sz[sz.length - 1] / 1024).toFixed(1) : 0,
    keys: arr.map((x) => x.k),
  };
});

// ── 缺口分析：w / wuk / s 三桶按 ai 号对照 ──
const num = (k) => {
  const m = k.match(/\/(\d+)(s?)\.mp3$/);
  return m ? { ai: +m[1], slow: m[2] === 's' } : null;
};
const setOf = (b) => {
  const fast = new Set(), slow = new Set();
  (out.buckets[b].keys || []).forEach((k) => {
    const p = num(k);
    if (!p) return;
    (p.slow ? slow : fast).add(p.ai);
  });
  return { fast, slow };
};
const W = setOf('w'), UK = setOf('wuk'), S = setOf('s');
const gap = (has, lack) => [...has].filter((n) => !lack.has(n)).sort((a, b) => a - b);

out.summary = {
  totalCount: ['w', 'wuk', 's', 'g'].reduce((s, b) => s + out.buckets[b].count, 0),
  totalMB: +['w', 'wuk', 's', 'g'].reduce((s, b) => s + out.buckets[b].mb, 0).toFixed(1),
  wordCards: {
    wFast: W.fast.size, wSlow: W.slow.size,
    ukFast: UK.fast.size, ukSlow: UK.slow.size,
    sFast: S.fast.size, sSlow: S.slow.size,
  },
  gaps: {
    缺英音单词: gap(W.fast, UK.fast),
    缺美音单词: gap(UK.fast, W.fast),
    缺英音慢速: gap(UK.fast, UK.slow),
    缺美音慢速: gap(W.fast, W.slow),
    缺例句: gap(W.fast, S.fast),
    缺例句慢速: gap(S.fast, S.slow),
  },
};
Object.keys(out.summary.gaps).forEach((k) => {
  const a = out.summary.gaps[k];
  out.summary.gaps[k] = { count: a.length, ids: a.slice(0, 400) };
});

fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

console.log('\n云端音频清单 → ' + OUT + '   ' + (fs.statSync(OUT).size / 1048576).toFixed(2) + ' MB\n');
console.log('桶      数量      体积      平均    最小    最大');
['w', 'wuk', 's', 'g'].forEach((b) => {
  const x = out.buckets[b];
  console.log(
    b.padEnd(6) + String(x.count).padStart(7) + String(x.mb + ' MB').padStart(10) +
    String(x.avgKB + ' KB').padStart(9) + String(x.minKB + ' KB').padStart(9) + String(x.maxKB + ' KB').padStart(9)
  );
});
console.log('\n合计 ' + out.summary.totalCount + ' 个 / ' + out.summary.totalMB + ' MB');
console.log('\n缺口：');
Object.entries(out.summary.gaps).forEach(([k, v]) => {
  console.log('  ' + k.padEnd(12) + v.count + (v.count ? '   ' + v.ids.slice(0, 20).join(',') + (v.count > 20 ? ' …' : '') : ''));
});

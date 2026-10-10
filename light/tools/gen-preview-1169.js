// gen-preview-1169.js —— v1.1.69 效果图：音标例词行改方案A + 语法详情例句行喇叭收口
// 数据取真实文件（phonetic.js / grammar.js），喇叭 SVG 从 app.wxss 实抽 —— 效果图 = 真机外观。
const fs = require('fs');

const MP = 'D:/idea/ielts-365/light/miniprogram';
const OUT = 'D:/idea/_reviews/音标例词行方案A效果图_v1.1.69.html';

const PH = require(MP + '/utils/phonetic.js');
const GRAM = require(MP + '/pkg-study/data/grammar.js');

// 实抽喇叭 data-URI（浅色 / 深绿两种状态）
const appwxss = fs.readFileSync(MP + '/app.wxss', 'utf8');
function spkUri(on) {
  const re = on ? /\.spk-ico--on\{background-image:url\("([^"]+)"\);\}/ : /\.spk-ico\{[^}]*background-image:url\("([^"]+)"\);\}/;
  const m = appwxss.match(re);
  if (!m) throw new Error('抽不到喇叭 data-URI');
  return m[1];
}
const SPK = spkUri(false);
const SPK_ON = spkUri(true);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const A = u => String(u).replace(/'/g, '%27');

// 取几个有代表性的音标：短词(ɪ) / 最长词(ʒ) / 爆破(p) / 破擦(tʃ)
const pick = s => PH.filter(p => p.s === s)[0];
const SAMPLES = ['ɪ', 'ʒ', 'tʃ', 'p'].map(pick).filter(Boolean);

// 语法详情例句：挑一句会折行的长句
const gTense = GRAM.filter(c => c.id === 'tense')[0];
const gTopic = gTense.topics.filter(t => t.t === '现在完成时')[0];
const EXS = gTopic.ex.slice(0, 3);

// ── 行渲染 ──
// 改前（v1.1.68）：文字 flex:1 撑满 + 喇叭钉最右
const rowBefore = e => `<div class="phex"><div class="phextxt"><span class="pexw">${e.w}</span><span class="pexhit">${esc(e.hit)}</span><span class="pexcn">${esc(e.cn)}</span></div><span class="pexspk"><i class="spk"></i></span></div>`;
// 改后（v1.1.69 方案A）：喇叭在行首成一列，文字左对齐自然宽度
const rowAfter = e => `<div class="phex"><span class="pexspk pexspk--lead"><i class="spk"></i></span><div class="phextxt"><span class="pexw">${e.w}</span><span class="pexhit">${esc(e.hit)}</span><span class="pexcn">${esc(e.cn)}</span></div></div>`;

const panel = (ph, rowFn) => `<div class="phpanel">
  <div class="phbody">
    <div class="phhead"><span class="phbig">/${ph.s}/</span><span class="phtag">${ph.grp}</span></div>
    <div class="blk"><div class="blkt">例词</div>${ph.ex.map(rowFn).join('')}</div>
  </div>
</div>`;

// 语法详情例句行
const gexBefore = e => `<div class="gex gex--center"><div class="gexmain"><div class="gexen">${esc(e.en)}</div><div class="gexcn">${esc(e.cn)}</div></div><span class="gexspk-old"></span></div>`;
const gexAfter = e => `<div class="gex"><div class="gexmain"><div class="gexen">${esc(e.en)}</div><div class="gexcn">${esc(e.cn)}</div></div><span class="ex-speak"><i class="spk"></i></span></div>`;

const phone = (title, body) => `<div class="phone"><div class="phtitle">${title}</div><div class="screen">${body}</div></div>`;

const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>v1.1.69 效果图 · 音标例词行方案A + 喇叭收口</title>
<style>
:root{--bg:#F3F8EF;--card:#FFF;--ink:#24332F;--ink2:#5F6D68;--ink3:#53605B;--ink4:#43504C;
--muted:#8B9893;--muted2:#82908B;--muted3:#66736E;--muted4:#7B8A84;
--green:#176B5B;--greenpress:#0F4A3E;--soft:#F0F7F3;--soft2:#E6F4EE;--line:#E9F0EC;--ukink:#2A5C8A;--red:#C0392B;}
*{box-sizing:border-box}
body{margin:0;background:#DDE6E0;color:var(--ink);font:14px/1.6 -apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif}
.wrap{max-width:1240px;margin:0 auto;padding:22px 16px 60px}
h1{font-size:21px;margin:0 0 6px;color:#0F4A3E}
.sub{color:#5C6B66;font-size:13px;margin-bottom:16px;line-height:1.8}
h2{font-size:16px;margin:26px 0 10px;color:#0F4A3E;border-left:4px solid var(--green);padding-left:10px}
h3{font-size:13.5px;margin:16px 0 8px;color:#0F4A3E}
.card2{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 14px rgba(23,107,91,.08);margin-bottom:16px}
.phones{display:flex;flex-wrap:wrap;gap:20px}
.phone{width:375px;flex:0 0 auto}
.phtitle{font-size:12.5px;font-weight:700;color:#0F4A3E;margin-bottom:7px}
.screen{width:375px;height:560px;background:var(--bg);border-radius:22px;border:7px solid #1E2A28;overflow:hidden;padding:12px 0;box-shadow:0 10px 26px rgba(0,0,0,.2)}
.card{background:var(--card);border-radius:12px;padding:14px;margin:0 12px 10px;box-shadow:0 2px 9px rgba(23,107,91,.06)}
.slabel{font-size:13px;font-weight:700;color:var(--green);margin-bottom:7px;letter-spacing:.5px}

/* 喇叭图标：与线上同一 data-URI */
.spk{display:inline-block;vertical-align:middle;width:18px;height:18px;background:center/contain no-repeat;background-image:url("${SPK}")}

/* 音标面板 */
.phpanel{margin-top:6px;padding:11px 13px 9px;border-radius:8px;background:var(--soft);border:1px solid var(--line)}
.phhead{display:flex;align-items:baseline}
.phbig{font-size:28px;font-weight:800;color:var(--green);line-height:1.15;font-family:'Times New Roman',Georgia,serif}
.phtag{margin-left:8px;font-size:11.5px;color:var(--muted)}
.blk{margin-top:10px}
.blkt{font-size:12px;font-weight:700;color:var(--green);margin-bottom:4px;letter-spacing:.5px}
.phbody{}
.phex{display:flex;align-items:baseline;padding:8px 7px;border-bottom:1px solid var(--line)}
.phex:last-child{border-bottom:none}
.phextxt{flex:1;min-width:0}
.pexw{font-size:14.5px;font-weight:700;color:var(--ink)}
.pexhit{font-size:12px;color:var(--ukink);margin-left:4px}
.pexcn{font-size:12px;color:var(--muted3);margin-left:7px}
/* 喇叭盒：56rpx=28px 热区，图标 36rpx=18px */
.pexspk{flex-shrink:0;display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;margin-left:6px}
.pexspk--lead{margin-left:0;margin-right:7px;width:22px;height:22px;line-height:22px}

/* 语法详情例句行 */
.gex{display:flex;align-items:baseline;padding:9px 8px;border-bottom:1px solid var(--line);border-radius:7px}
.gex:last-child{border-bottom:none}
.gexmain{flex:1;min-width:0}
.gexen{font-size:14px;color:var(--ink3);line-height:1.7;word-break:break-word}
.gexcn{margin-top:2px;font-size:12px;color:var(--muted3);line-height:1.6}
/* 改前：整行垂直居中 + 40rpx(20px) 裸图标（比全站小一号、折行时漂在两行中间） */
.gex--center{align-items:center}
.gexspk-old{flex-shrink:0;width:20px;height:20px;margin-left:8px;background:center/contain no-repeat;background-image:url("${SPK}")}
.ex-speak{flex-shrink:0;display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;margin-left:6px}

.tagline{font-size:12px;color:var(--muted2);margin:4px 0 0}
.k{display:inline-block;font-size:10.5px;padding:1px 7px;border-radius:9px;background:var(--soft2);color:var(--green);font-weight:700}
.k--bad{background:#FDECEA;color:var(--red)}
.k--ok{background:#E6F4EE;color:var(--green)}
table{border-collapse:collapse;width:100%;font-size:12.5px;background:#fff;border-radius:10px;overflow:hidden;margin-top:8px}
th,td{padding:8px 11px;text-align:left;border-bottom:1px solid var(--line)}
th{background:#F0F7F3;color:var(--green);font-size:11.5px;white-space:nowrap}
@media(max-width:820px){.phone{width:100%}.screen{width:100%}}
</style></head>
<body><div class="wrap">
<h1>v1.1.69 效果图 · 音标例词行改「左列喇叭」+ 语法详情例句行喇叭收口</h1>
<div class="sub">
  全部按 375px 手机 1 等比渲染（1rpx = 0.5px），例词与语法例句取真实数据；喇叭是 <code>app.wxss</code> 里那一枚 SVG 实抽，不是另画的示意。
</div>

<h2>① 音标 · 例词行：改前 → 改后</h2>
<div class="sub" style="margin-bottom:10px">改前的问题：文字块被 <code>flex:1</code> 强行撑满、喇叭又被钉死在最右，例词本身很短 → 中间空出一大片（红字标注的是"被撑出来的空白"，实际是看不见的白）。改后喇叭挪到行首成一列，文字左对齐、自然宽度，右侧不再有元素把空白"框"出来。</div>
<div class="phones">
${SAMPLES.map(ph => phone(`/${ph.s}/ ${ph.grp} · 改前（v1.1.68）`, `<div class="card"><div class="slabel">音标（44 个）</div>${panel(ph, rowBefore)}<div class="tagline">↔ 文字与喇叭之间空出一大片</div></div>`)).join('')}
</div>
<div class="phones" style="margin-top:14px">
${SAMPLES.map(ph => phone(`/${ph.s}/ ${ph.grp} · 改后（v1.1.69 方案A）`, `<div class="card"><div class="slabel">音标（44 个）</div>${panel(ph, rowAfter)}<div class="tagline">文字左对齐、喇叭成一条竖线，空白消失</div></div>`)).join('')}
</div>

<h2>② 语法详情 · 例句行：改前 → 改后（喇叭收口）</h2>
<div class="sub" style="margin-bottom:10px">这是全站一致性核查里唯一"没有理由的例外"：图标 40rpx（全站 36rpx）、热区 40×40 裸块（全站 56×56）、整行垂直居中（全站基线对齐）。折行时喇叭会漂到两行中间。改后与今日页例句行完全同构。</div>
<div class="phones">
${phone('改前（v1.1.68）：40rpx 裸图标 + 整行垂直居中', `<div class="card"><div class="slabel">例句</div>${EXS.map(gexBefore).join('')}</div>`)}
${phone('改后（v1.1.69）：56×56 热区 + 36rpx 图标 + 基线对齐', `<div class="card"><div class="slabel">例句</div>${EXS.map(gexAfter).join('')}</div>`)}
</div>

<div class="card2" style="margin-top:20px">
<h3>③ 改了什么（两处，其余一律不动）</h3>
<table>
<thead><tr><th>位置</th><th>改前</th><th>改后</th><th>文件</th></tr></thead>
<tbody>
<tr><td>音标例词行</td><td>文字 flex:1 撑满 + 喇叭钉最右（空白 49%~72%）</td><td><b>喇叭挪到行首成一列</b>，文字左对齐自然宽度；图标仍是同一枚 36rpx 绿喇叭；垂直对齐仍走 strut + x-height 锚定</td><td><code>tools.wxml / tools.wxss</code></td></tr>
<tr><td>语法详情例句行</td><td>40rpx 裸背景块 + 整行垂直居中</td><td><b>换回全站 .ex-speak</b>（56×56 热区 + 36rpx 图标 + baseline）；播放态用 .spk-ico--on</td><td><code>topic.wxml / topic.wxss</code></td></tr>
</tbody>
</table>
<h3 style="margin-top:16px">刻意不动</h3>
<div style="font-size:13px;line-height:2;color:#3C4A46">
· 复习页随机卡例句（喇叭绝对定位到右端，为「文本真居中」）—— 你 10-10 真机定稿<br>
· 复习页重点词磁贴例句（align-items:center，折行时喇叭居中）—— 你 09-29 定稿<br>
· 音标胶囊内的 30rpx 小喇叭、复习页大词行的 62rpx 大喇叭 —— 「跟随所在行字号」的合理例外<br>
· 今日页 / 工具页查单词的例句行 —— 本来就是基准，一行没动
</div>
</div>

<div class="card2">
<h3>④ 顺带一提：目标字母要不要染进单词里</h3>
<div style="font-size:13px;line-height:2.1;color:#3C4A46">
现在目标字母是作为独立小标签挂在高亮蓝里：<code>sit</code> <span style="color:#2A5C8A">i</span> <span style="color:#66736E">坐</span>；
也可以把目标字母直接染在单词内部：<code>s<span style="color:#176B5B;font-weight:700">i</span>t</code> <span style="color:#66736E">坐</span> ——
一眼就能看出"哪个字母发这个音"。132 个例词的 hit 基本都能在单词里定位到，技术上没有障碍。<b>这处我没动，等你点头再做。</b>
</div>
</div>

</div></body></html>`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('OK → ' + OUT + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB)');

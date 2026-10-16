// gen-prep-btn-1190.js —— 准备期按钮：去掉左侧图标 + 圆角档位对比
//   用户反馈（v1.1.89 方案A 落地后）：
//     ① 两个按钮左侧的两个图标都可以不用
//     ② 背景色两端改成圆弧形看看效果
// 渲染 5 台手机：现状（带图标 16rpx）→ 去图标×3 档圆角（16/24/胶囊）→ 胶囊+主行实心绿对照
// 样式实抽 app.wxss 变量 + tools.wxss 箭头行；文案与 today.wxml 实文一致。
const fs = require('fs');
const MP = require('path').join(__dirname, '..', 'miniprogram');
const OUT = 'D:/idea/_reviews/准备期按钮_去图标圆角_1011.html';

const appNoCmt = fs.readFileSync(MP + '/app.wxss', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
function uri(src, sel) {
  const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*?background-image\\s*:\\s*url\\("([^"]+)"\\)');
  const m = src.match(re);
  if (!m) throw new Error('抽不到 ' + sel);
  return m[1];
}
const HEART = uri(appNoCmt, '.ico-heart');
const SEARCH = uri(appNoCmt, '.ico-search');
const tbNoCmt = fs.readFileSync(MP + '/custom-tab-bar/index.wxss', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const TB = ['i-clock', 'i-review', 'i-tool', 'i-set'].map(k => uri(tbNoCmt, '.' + k + '.on'));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const svg = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`;
const goArrow = cls => `<i class="go ${cls || ''}"></i>`;
const ICON_PLAY = svg(`<circle cx="12" cy="12" r="11" fill="#176B5B"/><path d="M9.6 7.6v8.8l7.6-4.4z" fill="#fff"/>`);
const ICON_EYE = svg(`<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" fill="none" stroke="#8B9893" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="#8B9893" stroke-width="1.8"/>`);

const prepShell = inner => `<div class="card prep"><div class="ptitle">准备期</div><div class="psub">先熟悉一下，随时可以开始</div><div class="pnote">还没有学习记录 · 点「开始学习」即开学</div>
<div class="tipbox"><div class="tiptx">可以先看看第 1 天的单词，熟悉一下操作：点音标模块听发音（美音 / 英音各读各的），点<i class="iheart" style="background-image:url('${HEART}')"></i>收藏重点词</div></div>${inner}</div>`;

// 按钮行生成器：rounded 档位 / 是否带图标 / 主行底色
//   main: main=true 主行（开始学习）；main=false 次行（先看看第 1 天）
const row = ({ main, rad, icon, solid }) => {
  const cls = ['cellrow', 'r-' + rad];
  if (main) cls.push(solid ? 'is-solid' : 'is-main');
  const ico = icon ? `<i class="cico">${svg(main ? ICON_PLAY : ICON_EYE)}</i>` : '';
  const tt = main ? `<span class="ctt">开始学习</span>` : `<span class="ctt ctt--sub">先看看第 1 天</span>`;
  const meta = main ? '' : `<span class="cmeta">只预览 · 不打卡</span>`;
  return `<div class="${cls.join(' ')}">${ico}${tt}${meta}${goArrow(main ? 'go--dark' : '')}</div>`;
};

const pair = (o) => prepShell(row({ main: true, ...o }) + row({ main: false, ...o }));

// 局部放大对照（按钮本体 2 倍）
const zoomRow = (label, o) => `<div class="zcell"><div class="zlabel">${label}</div><div class="zbox">${row({ main: true, ...o })}${row({ main: false, ...o })}</div></div>`;

const nav = t => `<div class="nav"><div class="nav-t">${t}</div><div class="nav-s"><i class="icosearch" style="background-image:url('${SEARCH}')"></i></div></div>`;
const tabbar = () => `<div class="dock">${['Today', 'Review', 'Tools', 'Settings'].map((n, i) =>
  `<div class="dock-i${i === 0 ? ' on' : ''}"><i class="ti" style="background-image:url('${TB[i]}')"></i><span>${n}</span></div>`).join('')}</div>`;
const screen = (title, tag, body) =>
  `<div class="phone"><div class="phtitle">${title}${tag ? ` <span class="k ${tag[1] || ''}">${tag[0]}</span>` : ''}</div><div class="scr">${nav('今日单词')}<div class="body">${body}</div>${tabbar()}</div></div>`;

const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>准备期按钮：去图标 + 圆角档位</title>
<style>
:root{--bg:#F3F8EF;--card:#FFF;--ink:#24332F;--ink2:#5F6D68;--ink3:#53605B;
--muted:#8B9893;--muted3:#66736E;--green:#176B5B;--greenpress:#0F4A3E;--soft:#F0F7F3;
--pressgreen:#DCEFE7;--soft2:#E6F4EE;--line:#E9F0EC;}
*{box-sizing:border-box}
body{margin:0;background:#DDE6E0;color:var(--ink);font:14px/1.6 -apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif}
.wrap{max-width:1340px;margin:0 auto;padding:22px 16px 60px}
h1{font-size:21px;margin:0 0 6px;color:#0F4A3E}
h2{font-size:16px;margin:26px 0 10px;color:#0F4A3E;border-left:4px solid var(--green);padding-left:10px}
.sub{color:#5C6B66;font-size:13px;margin-bottom:14px;line-height:1.85}
.phones{display:flex;flex-wrap:wrap;gap:20px}
.phone{width:375px;flex:0 0 auto}
.phtitle{font-size:12.5px;font-weight:700;color:#0F4A3E;margin-bottom:7px}
.scr{width:375px;height:620px;background:var(--bg);border-radius:22px;border:7px solid #1E2A28;overflow:hidden;position:relative;box-shadow:0 10px 26px rgba(0,0,0,.2)}
.body{position:absolute;inset:64px 0 0 0;overflow:hidden}
.nav{height:64px;display:flex;align-items:flex-end;justify-content:center;position:relative;background:var(--bg)}
.nav-t{font-size:17px;font-weight:700;color:var(--ink);padding-bottom:11px}
.nav-s{position:absolute;left:12px;bottom:14px}
.icosearch{display:inline-block;width:20px;height:20px;background:center/contain no-repeat}
.card{background:var(--card);border-radius:12px;padding:14px;margin:10px 12px;box-shadow:0 2px 9px rgba(23,107,91,.06)}
.prep{text-align:center;padding:30px 15px}
.ptitle{font-size:20px;font-weight:800;color:var(--green)}
.psub{font-size:14px;color:var(--muted3);margin-top:7px}
.pnote{font-size:14px;color:var(--muted3);margin:14px 0 3px}
.tipbox{background:var(--soft);border-radius:7px;padding:10px 12px;margin-top:10px;text-align:left}
.tiptx{color:var(--ink3);font-size:13px;line-height:1.7}
.iheart{display:inline-block;width:13px;height:13px;vertical-align:-2px;margin:0 2px;background:center/contain no-repeat}
/* ── 箭头行（= today.wxss .cellrow 实抽）── */
.cellrow{display:flex;align-items:center;text-align:left;background:var(--soft);border-radius:8px;padding:10px 12px;margin-top:10px}
.cellrow.is-main{background:var(--pressgreen)}
.cellrow.is-main .ctt{color:var(--greenpress)}
.cellrow.is-solid{background:var(--green)}
.cellrow.is-solid .ctt{color:#fff}
.cellrow.is-solid .go{color:#fff}
.cico{flex-shrink:0;width:26px;height:26px;margin-right:9px;display:inline-flex;align-items:center;justify-content:center}
.cico svg{width:26px;height:26px}
.ctt{flex:1;min-width:0;font-size:13.5px;font-weight:700;color:var(--ink)}
.ctt--sub{color:var(--ink2);font-weight:400}
.cmeta{flex-shrink:0;font-size:11px;color:var(--muted);margin-right:8px}
.go{flex-shrink:0;width:8px;height:8px;margin-left:6px;color:var(--muted3);border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg)}
.go--dark{color:var(--greenpress)}
/* 圆角档位：16rpx=8px / 24rpx=12px / 胶囊=999px */
.cellrow.r-16{border-radius:8px}
.cellrow.r-24{border-radius:12px}
.cellrow.r-pill{border-radius:999px}
.k{display:inline-block;font-size:10.5px;padding:1px 7px;border-radius:9px;background:#E6F4EE;color:var(--green);font-weight:700}
.k--blue{background:#E8F1FF;color:#2A5C8A}
.k--gray{background:#EDF0EE;color:#5F6D68}
.callout{font-size:12.5px;color:#2A5C8A;margin:8px 2px 0;line-height:1.85}
.card2{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 14px rgba(23,107,91,.08);margin-bottom:16px}
.zgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.zlabel{font-size:12px;font-weight:700;color:#0F4A3E;margin-bottom:6px}
.zbox{background:var(--bg);border-radius:12px;padding:10px;transform:scale(1.18);transform-origin:left top}
.dock{position:absolute;left:12px;right:12px;bottom:8px;height:56px;padding:4px 6px;display:flex;background:#FFF;border-radius:20px;box-shadow:0 5px 17px rgba(15,58,49,.16)}
.dock-i{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ti{width:23px;height:23px;margin-bottom:1px;background:center/contain no-repeat}
.dock-i span{font-size:11px;line-height:15px;color:var(--muted)}
.dock-i.on span{color:var(--green);font-weight:700}
@media(max-width:820px){.phone{width:100%}.scr{width:100%}.zgrid{grid-template-columns:repeat(2,1fr)}}
</style></head>
<body><div class="wrap">
<h1>准备期按钮：去掉左侧图标 + 圆角档位</h1>
<div class="sub">按你的两点意见渲染：<b>① 左侧图标（实心绿圆播放标 / 灰眼睛）全部去掉；② 背景两端改成圆弧</b>。圆角给了三档，另附一版「主行实心绿」对照，看主次会不会更强。样式与图标实抽 <code>today.wxss / app.wxss</code>，文案与 <code>today.wxml</code> 一致。</div>

<h2>① 手机整屏：现状 → 去图标 → 圆弧</h2>
<div class="phones">
${screen('现状（v1.1.89）· 带图标 + 16rpx', ['现状', 'k--gray'], pair({ rad: '16', icon: true }))}
${screen('去图标 · 16rpx（小圆角）', ['A', 'k--blue'], pair({ rad: '16', icon: false }))}
${screen('去图标 · 24rpx（中圆角）', ['B', 'k--blue'], pair({ rad: '24', icon: false }))}
${screen('去图标 · 胶囊圆弧（推荐）', ['C', 'k--blue'], pair({ rad: 'pill', icon: false }))}
${screen('胶囊 + 主行实心绿（对照）', ['D', 'k--gray'], pair({ rad: 'pill', icon: false, solid: true }))}
</div>
<div class="callout">
  <b>去掉图标后主次还分得清吗</b>：分得清 —— 主行有 <code>--press-green</code> 浅绿底 + 700 字重 + 深绿字与箭头，次行是浅灰底 + 400 字重 + 灰字灰箭头。「开始学习」天然更重。<br>
  <b>三档圆角的差别</b>：16rpx 和现状一样（只少了图标）；24rpx 已经像 iOS 设置页的分组行；<b>胶囊（999rpx）两端是完全的半圆</b>，最接近「按钮」的直觉，和全站其它胶囊（工具页分类格、设置页分段）也更统一。<br>
  <b>D 版（主行实心绿）</b>：主次最强，但会和新版「开始学习」的语义（还没开始，别太隆重）稍显冲突，仅作对照。
</div>

<h2>② 局部放大对照（1.18×，只看圆角与主次）</h2>
<div class="card2">
<div class="zgrid">
${zoomRow('带图标 · 16rpx（现状）', { rad: '16', icon: true })}
${zoomRow('去图标 · 16rpx', { rad: '16', icon: false })}
${zoomRow('去图标 · 24rpx', { rad: '24', icon: false })}
${zoomRow('去图标 · 胶囊', { rad: 'pill', icon: false })}
</div>
</div>

<h2>③ 改动清单（选定后要动的代码）</h2>
<div class="card2" style="font-size:12.5px;line-height:2">
<div><code>today.wxml</code>：删掉 <code>.cellrow__ico</code> 两个节点（<code>--play</code> / <code>--eye</code>）。</div>
<div><code>today.wxss</code>：<code>.cellrow</code> 的 <code>border-radius</code> 由 <code>16rpx</code> 改为选定档位；删 <code>.cellrow__ico</code> 四组规则（含深色主题两套）；左右 <code>padding</code> 可微调（胶囊下 22rpx 也够）。</div>
<div>宽屏媒体查询里 <code>.cellrow { border-radius:8px }</code> 同步改（胶囊则用 <code>999px</code>）。</div>
<div>行为、文案、按压色一律不动（<code>startLearning</code> / <code>backToToday</code>）。</div>
</div>
</div></body></html>`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('✓ 已生成', OUT, (html.length / 1024).toFixed(0) + 'KB');

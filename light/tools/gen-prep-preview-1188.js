// gen-prep-preview-1188.js —— v1.1.88 效果图：准备期双按钮 + 设置页删日期模块
// 全部按 375px 手机 1 等比渲染（1rpx = 0.5px）；按钮/图标/配色全部从 app.wxss 实抽，
// 词条取 words.js 真实数据（Day 1 = bye / be / am），页面文案取 today.wxml 实文。
const fs = require('fs');

const MP = require('path').join(__dirname, '..', 'miniprogram');
const OUT = 'D:/idea/_reviews/准备期双按钮效果图_v1.1.88.html';

// ── 从 app.wxss / tabbar 实抽图标 data-URI ──
const appRaw = fs.readFileSync(MP + '/app.wxss', 'utf8');
const appNoCmt = appRaw.replace(/\/\*[\s\S]*?\*\//g, ''); // 注释里也有 url()，先剥掉
function uri(src, sel, nth) {
  const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*?background-image\\s*:\\s*url\\("([^"]+)"\\)', 'g');
  const m = []; let x;
  while ((x = re.exec(src))) m.push(x[1]);
  const r = m[nth || 0];
  if (!r) throw new Error('抽不到 data-URI: ' + sel);
  return r;
}
const SPK = uri(appNoCmt, '.spk-ico');
const HEART = uri(appNoCmt, '.ico-heart');
const CHECK = uri(appNoCmt, '.ico-check');
const EYE_OFF = uri(appNoCmt, '.eye-ico');
const SEARCH = uri(appNoCmt, '.ico-search');
const tbRaw = fs.readFileSync(MP + '/custom-tab-bar/index.wxss', 'utf8');
const tbNoCmt = tbRaw.replace(/\/\*[\s\S]*?\*\//g, '');
const TB = ['i-clock', 'i-review', 'i-tool', 'i-set'].map(k => uri(tbNoCmt, '.' + k + '.on'));

// ── 真词条（Day 1：bye / be / am）──
const wRaw = fs.readFileSync(MP + '/utils/words.js', 'utf8');
const rows = [];
wRaw.split('const PARTS = [')[1].split(/\n\];?/)[0].split('\n')
  .forEach(l => { const s = l.trim(); if (!s.startsWith("'")) return;
    const body = s.slice(1, s.lastIndexOf("'")); // 去首尾引号
    body.split('\\n').forEach(rec => { const f = rec.split('\\t'); if (f.length >= 7) rows.push(f); });
  });
const DAY1 = rows.slice(0, 3).map(r => ({ w: r[0], p: r[1], m: r[2], e: r[3], us: r[5], uk: r[6] }));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── 页面部件 ──
const nav = t => `<div class="nav"><div class="nav-t">${t}</div><div class="nav-s"><i class="icosearch"></i></div></div>`;
const tabbar = act => `<div class="dock">${['Today', 'Review', 'Tools', 'Settings'].map((n, i) =>
  `<div class="dock-i${i === act ? ' on' : ''}"><i class="ti" style="background-image:url('${TB[i]}')"></i><span>${n}</span></div>`).join('')}</div>`;

const spk = () => '<i class="spk"></i>';
const wRow = d => `<div class="wrow"><div class="wmain">
  <div class="whead"><span class="wen">${esc(d.w)}</span><span class="wpos">${esc(d.p)}</span><span class="wzh">${esc(d.m)}</span>
    <div class="iparow">
      <span class="ipamod">${spk()}<span class="ipatx">${esc(d.us)}</span></span>
      <span class="ipamod ipamod--uk">${spk()}<span class="ipatx">${esc(d.uk)}</span></span>
    </div></div>
  <div class="wexor"><span class="wex">${esc(d.e)}</span><i class="exspk">${spk()}</i><i class="exeye" style="background-image:url('${EYE_OFF}')"></i></div>
</div><i class="wstar"></i></div>`;

const dayHead = () => `<div class="card dayhead">
  <div class="daynav"><span class="navbtn dis">‹ 前一天</span><span class="dayttl"><b>第 1 天</b><i>周一</i></span><span class="navbtn">后一天 ›</span></div>
  <div class="phase">问候与自我介绍</div></div>`;

// 准备期卡片（两版共用）
const prepCard = (o) => `<div class="card prep">
  <div class="ptitle">准备期</div>
  <div class="psub">${o.sub}</div>
  ${o.days ? `<div class="pdays">${o.days}</div>` : `<div class="pnote">${o.note}</div>`}
  <div class="tipbox"><div class="tiptx">可以先看看第 1 天的单词，熟悉一下操作：点音标模块听发音（美音 / 英音各读各的），点<i class="iheart" style="background-image:url('${HEART}')"></i>收藏重点词</div></div>
  <div class="btnrow">
    ${o.primary ? `<div class="btn btnp">${o.primary}</div>` : ''}
    <div class="btn ${o.primary ? 'btng' : 'btnp'}">${o.secondary}</div>
  </div></div>`;

const screen = (title, tag, body) =>
  `<div class="phone"><div class="phtitle">${title}${tag ? ` <span class="k ${tag[1]}">${tag[0]}</span>` : ''}</div><div class="scr">${nav('今日单词')}<div class="body">${body}</div>${tabbar(0)}</div></div>`;

// ── HTML ──
const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>v1.1.88 效果图 · 准备期双按钮 + 设置页删日期模块</title>
<style>
:root{--bg:#F3F8EF;--card:#FFF;--ink:#24332F;--ink2:#5F6D68;--ink3:#53605B;
--muted:#8B9893;--muted3:#66736E;--green:#176B5B;--greenpress:#0F4A3E;--soft:#F0F7F3;
--soft2:#E6F4EE;--line:#E9F0EC;--usline:#CBE7DA;--usbg:#EAF6F0;--usink:#176B5B;
--ukline:#CBDDEF;--ukbg:#EAF1F9;--ukink:#2A5C8A;--disbg:#EDF3F0;--disink:#A6B2AD;--red:#C0392B;}
*{box-sizing:border-box}
body{margin:0;background:#DDE6E0;color:var(--ink);font:14px/1.6 -apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif}
.wrap{max-width:1300px;margin:0 auto;padding:22px 16px 60px}
h1{font-size:21px;margin:0 0 6px;color:#0F4A3E}
.sub{color:#5C6B66;font-size:13px;margin-bottom:16px;line-height:1.85}
h2{font-size:16px;margin:26px 0 10px;color:#0F4A3E;border-left:4px solid var(--green);padding-left:10px}
h3{font-size:13.5px;margin:16px 0 8px;color:#0F4A3E}
.phones{display:flex;flex-wrap:wrap;gap:20px}
.phone{width:375px;flex:0 0 auto}
.phtitle{font-size:12.5px;font-weight:700;color:#0F4A3E;margin-bottom:7px}
.scr{width:375px;height:600px;background:var(--bg);border-radius:22px;border:7px solid #1E2A28;overflow:hidden;position:relative;box-shadow:0 10px 26px rgba(0,0,0,.2)}
.body{position:absolute;inset:64px 0 0 0;overflow:hidden}
/* 导航栏（nav-bar 组件：状态栏 20px + 44px，bg=--nav-bg 浅色同页面底色） */
.nav{height:64px;display:flex;align-items:flex-end;justify-content:center;position:relative;background:var(--bg)}
.nav-t{font-size:17px;font-weight:700;color:var(--ink);padding-bottom:11px}
.nav-s{position:absolute;left:12px;bottom:14px}
.icosearch{display:inline-block;width:20px;height:20px;background:center/contain no-repeat;background-image:url("${SEARCH}")}
/* 卡片：.card 24rpx 圆角 / padding 28rpx / margin 20rpx 24rpx */
.card{background:var(--card);border-radius:12px;padding:14px;margin:10px 12px;box-shadow:0 2px 9px rgba(23,107,91,.06)}
.slabel{font-size:13px;font-weight:700;color:var(--green);margin-bottom:7px;letter-spacing:.5px}
/* 准备期卡：.prestart-card 覆盖 padding 60rpx 30rpx + 居中 */
.prep{text-align:center;padding:30px 15px}
.ptitle{font-size:20px;font-weight:800;color:var(--green)}
.psub{font-size:14px;color:var(--muted3);margin-top:7px}
.pdays{font-size:30px;font-weight:800;color:var(--ink);margin:15px 0}
.pnote{font-size:14px;color:var(--muted3);margin:14px 0 3px}
.tipbox{background:var(--soft);border-radius:7px;padding:10px 12px;margin-top:10px;text-align:left}
.tiptx{color:var(--ink3);font-size:13px;line-height:1.7}
.iheart{display:inline-block;width:13px;height:13px;vertical-align:-2px;margin:0 2px;background:center/contain no-repeat}
/* 按钮：.btn-fit 宽度自适应居中；.btn-primary 浅底绿字 / .btn-ghost 描边感（实为无边框文字按钮） */
.btnrow{}
.btn{display:flex;align-items:center;justify-content:center;width:fit-content;margin:0 auto;
  border-radius:22px;font-size:15px;font-weight:700;padding:4px 10px;line-height:1.3}
.btnp{background:var(--soft);color:var(--green)}
.btng{background:transparent;color:var(--green);font-weight:400}
.btnrow .btn+.btn{margin-top:6px}
.btnrow .btn:first-child{margin-top:12px}
.btndis{background:var(--disbg);color:var(--disink)}
/* 日期导航卡 */
.daynav{display:flex;align-items:center;justify-content:space-between}
.navbtn{font-size:13px;color:var(--green);padding:7px 9px}
.navbtn.dis{opacity:.35}
.dayttl{flex:1;text-align:center;display:flex;flex-direction:column;align-items:center}
.dayttl b{font-size:22px;font-weight:800;color:var(--ink)}
.dayttl i{font-size:12px;color:var(--muted);font-style:normal;margin-top:2px}
.phase{text-align:center;font-size:13px;color:var(--green);margin-top:6px}
.prepback{margin:10px 12px 0;color:var(--green);font-size:13px;padding:4px 2px}
/* 词条行 */
.wrow{display:flex;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--line)}
.wrow:last-child{border-bottom:none}
.wmain{flex:1;min-width:0;padding-left:8px}
.whead{display:flex;align-items:baseline;flex-wrap:wrap}
.wen{font-size:16px;font-weight:700;color:var(--ink)}
.wpos{font-size:11px;color:var(--green);font-style:italic;margin-left:5px}
.wzh{font-size:13px;color:var(--ink2);margin-left:6px}
.iparow{display:flex;flex-wrap:wrap;align-items:center;margin-left:4px}
.ipamod{display:inline-flex;align-items:center;height:28px;padding:0 7px;margin:3px 5px 0 0;border-radius:7px;
  border:1px solid var(--usline);background:var(--usbg)}
.ipamod--uk{border-color:var(--ukline);background:var(--ukbg)}
.ipatx{font-size:12px;line-height:1;color:var(--usink)}
.ipamod--uk .ipatx{color:var(--ukink)}
.spk{display:inline-block;width:15px;height:15px;background:center/contain no-repeat;background-image:url("${SPK}")}
.ipamod .spk{width:15px;height:15px;margin-right:3px}
.wexor{display:flex;align-items:baseline;margin-top:3px}
.wex{flex:1;min-width:0;font-size:12.5px;color:#82908B;padding-left:2px}
.exspk{flex-shrink:0;width:28px;height:28px;line-height:28px;text-align:center;margin-left:6px}
.exspk .spk,.exeye{width:18px;height:18px}
.exeye{flex-shrink:0;display:inline-block;width:28px;height:28px;margin-left:1px;background:center/contain no-repeat;vertical-align:middle}
.wstar{flex-shrink:0;width:32px;font-size:16px;text-align:center;color:#C7D0CC;font-style:normal}
/* tabbar：V1 浮窗 dock */
.dock{position:absolute;left:12px;right:12px;bottom:8px;height:56px;padding:4px 6px;display:flex;
  background:#FFF;border-radius:20px;box-shadow:0 5px 17px rgba(15,58,49,.16)}
.dock-i{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ti{width:23px;height:23px;margin-bottom:1px;background:center/contain no-repeat}
.dock-i.on .ti{width:24px;height:24px}
.dock-i span{font-size:11px;line-height:15px;color:var(--muted)}
.dock-i.on span{color:var(--green);font-weight:700}
/* 标注 */
.k{display:inline-block;font-size:10.5px;padding:1px 7px;border-radius:9px;background:var(--soft2);color:var(--green);font-weight:700}
.k--bad{background:#FDECEA;color:var(--red)}
.k--new{background:#E8F1FF;color:#2A5C8A}
.callout{font-size:12px;color:#2A5C8A;margin:6px 12px 0;line-height:1.7}
table{border-collapse:collapse;width:100%;font-size:12.5px;background:#fff;border-radius:10px;overflow:hidden;margin-top:8px}
th,td{padding:8px 11px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
th{background:#F0F7F3;color:var(--green);font-size:11.5px;white-space:nowrap}
.card2{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 14px rgba(23,107,91,.08);margin-bottom:16px}
@media(max-width:820px){.phone{width:100%}.scr{width:100%}}
</style></head>
<body><div class="wrap">
<h1>v1.1.88 效果图 · 准备期双按钮 + 设置页删「计划开始日期」</h1>
<div class="sub">
全部按 375px 手机 1 等比渲染（1rpx = 0.5px）：按钮、图标、配色一律从 <code>app.wxss</code> 实抽，词条是真数据（第 1 天 = bye / be / am），文案是 <code>today.wxml</code> 实文。<b>这不是示意图，是按代码复现的样子。</b>
</div>

<h2>① 准备期卡片：改前 → 改后</h2>
<div class="sub" style="margin-bottom:10px">改前只有一个按钮，且状态行是 30px 的粗体大字「尚未设置开始日期 · 选好日期即开学」—— 那行字原本是给「倒计时」用的，没有日期时它其实在说一句用户看不懂的话（"选好日期"在哪选？）。改后拆成两档：大字只留给真倒计时，没日期时用小字直说下一步点哪里；按钮变成一个主一个次。</div>
<div class="phones">
${screen('改前（v1.1.87）· 单按钮', ['现状', ''], prepCard({ sub: '计划开始日前，可先熟悉操作', days: '尚未设置开始日期 · 选好日期即开学', secondary: '先看看第 1 天' }))}
${screen('改后（v1.1.88）· 双按钮', ['本版', 'k'], prepCard({ sub: '先熟悉一下，随时可以开始', note: '还没有学习记录 · 点「开始学习」即开学', primary: '开始学习', secondary: '先看看第 1 天' }))}
</div>
<div class="callout">
  ↑ 大字「还有 N 天开始学单词」只在<b>真有倒计时</b>时出现（旧版设了一个未来日期才有）；现在日期入口已删，这行基本不会出现在这条路径上，但保留它不影响。
</div>

<h2>② 两个按钮点下去，分别是这样</h2>
<div class="sub" style="margin-bottom:10px">左边是「先看看第 1 天」——<b>只预览</b>：顶部常驻一条「‹ 返回准备期」，打卡按钮置灰点不动，看完随手一按就退回准备期。右边是「开始学习」——<b>真开学</b>：没有返回条，打卡按钮正常，从今天起算第 1 天。<br>这就是你要的「两个按钮的不同之处」：一个能回来，一个回不来（想回只能走清除学习记录）。</div>
<div class="phones">
${screen('点「先看看第 1 天」· 预览态', ['可返回', 'k--new'], `<div class="prepback">‹ 返回准备期</div>` + dayHead() + `<div class="card"><div class="slabel">打招呼与告别</div><div style="font-size:13.5px;color:var(--ink3)">目标：学会最基本的问候用语，掌握 be 动词（am/is/are）</div><div style="margin:12px 0 0"><div class="btn btndis" style="margin:0 auto">完成打卡<i class="spk" style="margin-left:6px;width:16px;height:16px;background-image:url('${CHECK}')"></i></div></div></div><div class="card"><div class="slabel">本日词汇（3）</div>${DAY1.map(wRow).join('')}</div>`)}
${screen('点「开始学习」· 正式第 1 天', ['已开学', 'k'], dayHead() + `<div class="card"><div class="slabel">打招呼与告别</div><div style="font-size:13.5px;color:var(--ink3)">目标：学会最基本的问候用语，掌握 be 动词（am/is/are）</div><div style="margin:12px 0 0"><div class="btn btnp" style="margin:0 auto">完成打卡<i class="spk" style="margin-left:6px;width:16px;height:16px;background-image:url('${CHECK}')"></i></div></div></div><div class="card"><div class="slabel">本日词汇（3）</div>${DAY1.map(wRow).join('')}</div>`)}
</div>
<div class="callout">
  左图顶部那条「‹ 返回准备期」= 现有 <code>.prep-back</code>，只是文案从「‹ 返回准备期（未设置开始日期）」简化成「‹ 返回准备期」——因为括号里那句话已经没意义了。
</div>

<h2>③ 顺带：设置页删掉了「计划开始日期」</h2>
<div class="sub" style="margin-bottom:10px">这个模块当年是为了给「周计划 / 雅思考试日」倒推学习节奏用的。周计划和考试都没了，它已经没有任何作用，直接删掉（连同那套自绘月历弹层）。<b>只删界面，数据字段 <code>startDate</code> 留在本地与云端不动</b>——云同步、导入导出还要用它。</div>
<div class="phones">
${screen('改前 · 顶部就是日期卡', ['已删除', 'k--bad'], `<div class="card"><div class="slabel">计划开始日期</div>
  <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0"><span style="font-size:15px;color:var(--ink)">未设置 · 准备期</span><span style="color:var(--green);font-size:16px">›</span></div>
  <div style="font-size:12.5px;color:var(--muted2);line-height:1.7">只能选今天及以后；从这天起算第 1 天。未设置（如清空学习记录后）或设为未来某天时，今日页为「准备期」……</div></div>
  <div class="card"><div class="slabel">学习进度</div><div style="font-size:12.5px;color:var(--muted2)">（下方卡片原样不动）</div></div>`)}
${screen('改后 · 直接进「学习进度」', ['本版', 'k'], `<div class="card"><div class="slabel">学习进度</div><div style="font-size:12.5px;color:var(--muted2)">（原第二张卡，现在是第一张）</div></div>
  <div class="card"><div class="slabel">进度同步（多端）</div><div style="font-size:12.5px;color:var(--muted2)">云同步已开启</div></div>
  <div class="card"><div class="slabel">朗读语速</div><div style="font-size:12.5px;color:var(--muted2)">（滑杆原样不动）</div></div>`)}
</div>

<div class="card2" style="margin-top:20px">
<h3>④ 改了哪些文案（一处不多、一处不少）</h3>
<table>
<thead><tr><th>位置</th><th>改前</th><th>改后</th></tr></thead>
<tbody>
<tr><td>准备期副标题</td><td>计划开始日前，可先熟悉操作</td><td><b>先熟悉一下，随时可以开始</b></td></tr>
<tr><td>准备期状态行</td><td>尚未设置开始日期 · 选好日期即开学<br><span style="color:#8B9893">（30px 粗体大字）</span></td><td><b>还没有学习记录 · 点「开始学习」即开学</b><br><span style="color:#8B9893">（14px 小字；大字只留给「还有 N 天」倒计时）</span></td></tr>
<tr><td>预览态返回条</td><td>‹ 返回准备期（未设置开始日期）</td><td><b>‹ 返回准备期</b></td></tr>
<tr><td>清除记录弹窗尾句</td><td>想开学，在今日页选一个开始日期即可。</td><td><b>想开学，在今日页点「开始学习」即可。</b></td></tr>
<tr><td>设置页日期卡 + 月历弹层</td><td>整块保留</td><td><b>整块删除</b>（wxml 日期卡 + 弹层 · js 六个方法 + data.startDate/cal · wxss .cal-*）</td></tr>
</tbody>
</table>
<h3 style="margin-top:16px">刻意不动</h3>
<div style="font-size:13px;line-height:2;color:#3C4A46">
· <code>store.js</code> 的 <code>startDate</code> 字段、<code>settingsAt</code> 云同步合并规则 —— 数据层照旧，只是不再有界面入口<br>
· 「先看看第 1 天」的行为（预览 + 返回条 + 打卡置灰）—— 一行没改<br>
· 打卡逻辑、第 N 天计算（<code>currentDayFromStart</code>）—— 一行没改，只是被「开始学习」显式驱动了一次
</div>
</div>

<div class="card2">
<h3>⑤ 要请你注意的一点</h3>
<div style="font-size:13px;line-height:2.1;color:#3C4A46">
设置页的日期入口删掉之后，<b>「开始学习」就成为全站唯一的开学入口</b>。<br>
所以这两半（删日期模块 + 加双按钮）<b>必须在同一个包里上线</b>：只删不加 → 用户再也开不了学；只加不删 → 设置页还挂着一个跟「开始学习」可能打架的日期开关。
</div>
</div>

</div></body></html>`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('OK → ' + OUT + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB)');

// gen-1189-proposals.js —— v1.1.89 待定方案效果图：
//   ① 易错点排版 3 方案（内容已按新口径修正后渲染）
//   ② 准备期按钮 4 方案（含用户点名的「双箭头去底色」）
//   ③ 易错点内容修正 17 条对照
//   ④ 84 个重做精读天 → 可搜索跳转词
// 样式/图标全部实抽 app.wxss 与 tools.wxss，词条真数据。
const fs = require('fs');
const MP = require('path').join(__dirname, '..', 'miniprogram');
const OUT = 'D:/idea/_reviews/易错点与准备期按钮方案_1011.html';

const appRaw = fs.readFileSync(MP + '/app.wxss', 'utf8');
const appNoCmt = appRaw.replace(/\/\*[\s\S]*?\*\//g, '');
function uri(src, sel) {
  const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*?background-image\\s*:\\s*url\\("([^"]+)"\\)');
  const m = src.match(re);
  if (!m) throw new Error('抽不到 ' + sel);
  return m[1];
}
const SPK = uri(appNoCmt, '.spk-ico');
const HEART = uri(appNoCmt, '.ico-heart');
const SEARCH = uri(appNoCmt, '.ico-search');
const tbNoCmt = fs.readFileSync(MP + '/custom-tab-bar/index.wxss', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const TB = ['i-clock', 'i-review', 'i-tool', 'i-set'].map(k => uri(tbNoCmt, '.' + k + '.on'));

const JUMP = JSON.parse(fs.readFileSync('D:/idea/_ipa_build/_jump84.json', 'utf8'));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── 易错点数据（修正后的真实内容，noun·可数与不可数 两条）──
const NOTE1 = { bad: 'I need an advice.', say: 'I need some advice.', tail: ' advice 不可数，前面不加 a；句中用 some 就对了，要表示数量才用 a piece of（一条）、a bottle of（一瓶）' };
const NOTE2 = { bad: 'I have many money.', say: 'I have a lot of money.', tail: ' money 不可数，many 只修饰可数名词，修饰 money 要用 a lot of；疑问句、否定句才用 much' };

// 三种排版的渲染
const FIXMK_BAD = 'M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4';
const FIXMK_GOOD = 'M4.9 12.4l4.9 4.9L19 6.9';
const mk = (t, d) => `<path d="${d}" fill="none" stroke="${t}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
const icoX = `<i class="fmk">${svg(mk('#C0392B', FIXMK_BAD))}</i>`;
const icoV = `<i class="fmk">${svg(mk('#176B5B', FIXMK_GOOD))}</i>`;
function svg(inner) { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`; }
const spkI = on => `<i class="spk${on ? ' spk--on' : ''}"></i>`;

// 现状：英文句+中文尾巴连排，喇叭钉行尾（会落在尾巴中间）
const v0 = n => `<div class="frow">${icoV}<div class="ftx">${esc(n.say)}${esc(n.tail)}${spkI()}</div></div>`;
// 方案A：尾巴独立成行（缩进对齐文本列，小字弱化），喇叭跟在英文句后
const vA = n => `<div class="frow">${icoV}<div class="ftx"><span class="fsay">${esc(n.say)}.</span> ${spkI()}</div></div><div class="ftail">${esc(n.tail.trim())}</div>`;
// 方案B：同行但尾巴弱化成小字浅色（喇叭紧跟英文句）
const vB = n => `<div class="frow">${icoV}<div class="ftx"><span class="fsay">${esc(n.say)}.</span> ${spkI()}<span class="ftail2">${esc(n.tail.trim())}</span></div></div>`;

const fixCard = (a, b, c) => `<div class="card"><div class="slabel">易错点</div>
${icoX}<div class="ftx">${esc(NOTE1.bad)}</div>
${a(NOTE1)}
${icoX}<div class="ftx">${esc(NOTE2.bad)}</div>
${b(NOTE2)}
${c || ''}</div>`;

// ── 准备期卡片（双按钮 4 方案）──
const prepShell = inner => `<div class="card prep"><div class="ptitle">准备期</div><div class="psub">先熟悉一下，随时可以开始</div><div class="pnote">还没有学习记录 · 点「开始学习」即开学</div>
<div class="tipbox"><div class="tiptx">可以先看看第 1 天的单词，熟悉一下操作：点音标模块听发音（美音 / 英音各读各的），点<i class="iheart" style="background-image:url('${HEART}')"></i>收藏重点词</div></div>${inner}</div>`;

// 现状
const P0 = prepShell(`<div class="btnrow"><div class="btn btnp">开始学习</div><div class="btn btng">先看看第 1 天</div></div>`);
// 方案A：同构双箭头行，主行浅绿底 + 实心播放圆标，次行无底 + 灰眼睛圆标
const goArrow = cls => `<i class="go ${cls || ''}"></i>`;
const PA = prepShell(`<div class="cellrow cellrow--main"><i class="cico cico--play">${svg(`<circle cx="12" cy="12" r="11" fill="#176B5B"/><path d="M9.6 7.6v8.8l7.6-4.4z" fill="#fff"/>`)}</i><span class="ctt">开始学习</span>${goArrow('go--dark')}</div>
<div class="cellrow"><i class="cico cico--eye">${svg(`<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" fill="none" stroke="#8B9893" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="#8B9893" stroke-width="1.8"/>`)}</i><span class="ctt ctt--sub">先看看第 1 天</span><span class="cmeta">只预览 · 不打卡</span>${goArrow('')}</div>`);
// 方案B：主胶囊保留 + 次改箭头行
const PB = prepShell(`<div class="btnrow"><div class="btn btnp">开始学习</div></div><div class="cellrow cellrow--bare"><span class="ctt ctt--sub">先看看第 1 天</span><span class="cmeta">只预览 · 不打卡</span>${goArrow('')}</div>`);
// 方案C：双箭头行全去底，主次只靠字重与图标色
const PC = prepShell(`<div class="cellrow cellrow--bare cellrow--mainbare"><i class="cico cico--play">${svg(`<path d="M9 6.5v11l9-5.5z" fill="#176B5B"/><circle cx="12" cy="12" r="10.6" fill="none" stroke="#176B5B" stroke-width="1.6"/>`)}</i><span class="ctt">开始学习</span>${goArrow('go--green')}</div>
<div class="cellrow cellrow--bare"><i class="cico cico--eye">${svg(`<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" fill="none" stroke="#8B9893" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="#8B9893" stroke-width="1.8"/>`)}</i><span class="ctt ctt--sub">先看看第 1 天</span>${goArrow('')}</div>`);

// ── 内容修正对照（17 条，节选自 fix_grammar_note_tails.js）──
const FIXLIST = [
  ['可数与不可数', 'I need some advice.', '不可数名词要表示数量用 a piece of / a bottle of', 'advice 不可数，前面不加 a；句中用 some 就对了，要表示数量才用 a piece of…'],
  ['可数与不可数', 'I have a lot of money.', '不可数名词用 much / a lot of', 'money 不可数，many 只修饰可数名词，修饰 money 要用 a lot of；疑问句、否定句才用 much'],
  ['名词复数', 'There are three children.', '常见不规则复数要背：man-men…', 'children 是不规则复数，不按加 s 的规则变；同类一起背：man→men…'],
  ['名词复数', 'I saw two sheep.', 'sheep / fish / Chinese / Japanese 单复数同形', 'sheep 单复数同形，加了 s 反而错；同类还有 fish / Chinese / Japanese'],
  ['定冠词 the', 'She plays the piano.', '但球类不加：play basketball', '乐器前面要加 the，句中就是例子；球类运动不加：play basketball'],
  ['不用冠词', 'I have breakfast at seven.', '但如果特指就加：The breakfast today was great.', '三餐前不加冠词，句中就是例子；特指某一顿才加 the：…'],
  ['基数与序数', '21st / 22nd', '。尾数是 1/2/3 用 st/nd/rd，其余加 th', '。看尾数：1/2/3 用 st/nd/rd，所以是 21st、22nd；其余加 th（如 4th）'],
  ['时间与日期', 'on May 1st', '。具体某一天用 on，只有月份或年份才用 in', '。具体到某一天用 on，句中就是例子；只说月份或年份才用 in（in May / in 2024）'],
  ['时间与日期', "It's half past seven.", "o'clock 只能跟整点", '几点半用 half past，句中就是例子；o\'clock 只能跟整点（seven o\'clock）'],
  ['much/many', 'I have a lot of money.', '（原✓为 I have much money. / I have a lot of money.）', 'money 不可数，不能用 many，要用 a lot of；疑问句、否定句才常用 much（✓句收敛为一句，音频已有）'],
  ['much/many', 'I have a lot of homework.', '疑问否定才常用 much', '肯定句用 a lot of；疑问句、否定句才常用 much，如 I don\'t have much homework.'],
  ['时间介词', 'in the morning', '；但 at night 是固定说法，不用 in the night', '。早上用 in，句中就是例子；但「在夜里」固定说 at night，不说 in the night'],
  ['方式工具介词', 'write with a pen', '；走路去是 on foot，不是 by foot', '。用什么工具写用 with，句中就是例子；「走路去」说 on foot，不说 by foot'],
  ['一般现在时', 'I like coffee.', '一般现在时不用 be + 动词。', 'like 前面不加 be：一般现在时直接用动词原形（I like / he likes）'],
  ['现在进行时', 'I know him.', 'know/like/want 等不用进行时。', 'know 是状态动词，本来就不「正在进行」，别套 be + ing；like / want 也一样'],
  ['过去进行时', 'I was watching TV.', 'be 动词和 ing 都不能少。', 'was 就是 be 动词的过去式，它和后面的 ing 一个都不能少'],
  ['动名词', 'I enjoy swimming.', 'enjoy 后接 doing', 'enjoy 后面要接 doing 形式，swimming 就是 swim 的 doing'],
];
const fixTable = `<table><thead><tr><th>语法点</th><th>✓ 句（朗读不变）</th><th>改前尾巴</th><th>改后尾巴（先接住句中成分）</th></tr></thead><tbody>
${FIXLIST.map(r => `<tr><td>${r[0]}</td><td class="mono">${esc(r[1])}</td><td class="old">${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('')}
</tbody></table>`;

// ── 跳转清单 ──
const jumpTable = `<table class="jtable"><thead><tr><th>天</th><th>当日主题</th><th>搜索这个词</th><th>天</th><th>当日主题</th><th>搜索这个词</th></tr></thead><tbody>
${Array.from({ length: Math.ceil(JUMP.length / 2) }, (_, i) => {
  const a = JUMP[i], b = JUMP[i + Math.ceil(JUMP.length / 2)];
  return `<tr><td class="mono">第 ${a.d} 天</td><td>${esc(a.t)}</td><td class="mono"><b>${esc(a.w)}</b></td>${b ? `<td class="mono">第 ${b.d} 天</td><td>${esc(b.t)}</td><td class="mono"><b>${esc(b.w)}</b></td>` : '<td></td><td></td><td></td>'}</tr>`;
}).join('')}
</tbody></table>`;

// ── 部件 ──
const nav = t => `<div class="nav"><div class="nav-t">${t}</div><div class="nav-s"><i class="icosearch" style="background-image:url('${SEARCH}')"></i></div></div>`;
const tabbar = () => `<div class="dock">${['Today', 'Review', 'Tools', 'Settings'].map((n, i) =>
  `<div class="dock-i${i === 0 ? ' on' : ''}"><i class="ti" style="background-image:url('${TB[i]}')"></i><span>${n}</span></div>`).join('')}</div>`;
const screen = (title, tag, body) =>
  `<div class="phone"><div class="phtitle">${title}${tag ? ` <span class="k ${tag[1] || ''}">${tag[0]}</span>` : ''}</div><div class="scr">${nav('今日单词')}<div class="body">${body}</div>${tabbar()}</div></div>`;
const screenG = (title, tag, body) =>
  `<div class="phone"><div class="phtitle">${title}${tag ? ` <span class="k ${tag[1] || ''}">${tag[0]}</span>` : ''}</div><div class="scr">${nav('名词与冠词')}<div class="body" style="padding:10px 0 0">${body}</div>${tabbar()}</div></div>`;

const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>易错点排版 + 准备期按钮 · 方案稿</title>
<style>
:root{--bg:#F3F8EF;--card:#FFF;--ink:#24332F;--ink2:#5F6D68;--ink3:#53605B;
--muted:#8B9893;--muted3:#66736E;--green:#176B5B;--greenpress:#0F4A3E;--soft:#F0F7F3;
--pressgreen:#DCEFE7;--soft2:#E6F4EE;--line:#E9F0EC;--red:#C0392B;--redsoft:#FDECEA;}
*{box-sizing:border-box}
body{margin:0;background:#DDE6E0;color:var(--ink);font:14px/1.6 -apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif}
.wrap{max-width:1300px;margin:0 auto;padding:22px 16px 60px}
h1{font-size:21px;margin:0 0 6px;color:#0F4A3E}
h2{font-size:16px;margin:26px 0 10px;color:#0F4A3E;border-left:4px solid var(--green);padding-left:10px}
.sub{color:#5C6B66;font-size:13px;margin-bottom:14px;line-height:1.85}
.card2{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 14px rgba(23,107,91,.08);margin-bottom:16px}
h3{font-size:13.5px;margin:16px 0 8px;color:#0F4A3E}
.phones{display:flex;flex-wrap:wrap;gap:20px}
.phone{width:375px;flex:0 0 auto}
.phtitle{font-size:12.5px;font-weight:700;color:#0F4A3E;margin-bottom:7px}
.scr{width:375px;height:600px;background:var(--bg);border-radius:22px;border:7px solid #1E2A28;overflow:hidden;position:relative;box-shadow:0 10px 26px rgba(0,0,0,.2)}
.body{position:absolute;inset:64px 0 0 0;overflow:hidden}
.nav{height:64px;display:flex;align-items:flex-end;justify-content:center;position:relative;background:var(--bg)}
.nav-t{font-size:17px;font-weight:700;color:var(--ink);padding-bottom:11px}
.nav-s{position:absolute;left:12px;bottom:14px}
.icosearch{display:inline-block;width:20px;height:20px;background:center/contain no-repeat}
.card{background:var(--card);border-radius:12px;padding:14px;margin:10px 12px;box-shadow:0 2px 9px rgba(23,107,91,.06)}
.slabel{font-size:13px;font-weight:700;color:var(--green);margin-bottom:7px;letter-spacing:.5px}
/* 语法页返回条 */
.gback{margin:10px 12px 0;color:var(--green);font-size:13px}
/* 易错点排版 */
.fix{margin-top:12px}
.fixrow{display:flex;align-items:baseline;margin-top:6px}
.fmk{flex-shrink:0;width:34px;text-align:center;display:inline-block}
.fmk svg{width:13px;height:13px;vertical-align:middle}
.ftx{flex:0 1 auto;min-width:0;font-size:13.5px;color:var(--ink3);line-height:1.75;word-break:break-word}
.fsay{color:var(--ink3)}
.ftail{margin-top:4px;padding-left:44px;font-size:11.5px;color:var(--muted3);line-height:1.7}
.ftail2{font-size:12px;color:var(--muted3)}
.spk{display:inline-block;width:16px;height:16px;vertical-align:-3px;margin-left:5px;background:center/contain no-repeat;background-image:url("${SPK}")}
/* 准备期 */
.prep{text-align:center;padding:30px 15px}
.ptitle{font-size:20px;font-weight:800;color:var(--green)}
.psub{font-size:14px;color:var(--muted3);margin-top:7px}
.pnote{font-size:14px;color:var(--muted3);margin:14px 0 3px}
.tipbox{background:var(--soft);border-radius:7px;padding:10px 12px;margin-top:10px;text-align:left}
.tiptx{color:var(--ink3);font-size:13px;line-height:1.7}
.iheart{display:inline-block;width:13px;height:13px;vertical-align:-2px;margin:0 2px;background:center/contain no-repeat}
.btn{display:flex;align-items:center;justify-content:center;width:fit-content;margin:0 auto;border-radius:22px;font-size:15px;font-weight:700;padding:4px 10px;line-height:1.3}
.btnp{background:var(--soft);color:var(--green)}
.btng{background:transparent;color:var(--green);font-weight:400}
.btnrow .btn+.btn{margin-top:6px}
.btnrow .btn:first-child{margin-top:12px}
/* 箭头行（cat-cell 同语言） */
.cellrow{display:flex;align-items:center;text-align:left;background:var(--soft);border-radius:8px;padding:10px 11px;margin-top:10px}
.cellrow--bare{background:transparent;padding:10px 4px}
.cellrow--main{background:var(--pressgreen)}
.cellrow--main .ctt{color:var(--greenpress)}
.cico{flex-shrink:0;width:26px;height:26px;margin-right:9px;display:inline-flex;align-items:center;justify-content:center}
.cico svg{width:26px;height:26px}
.ctt{flex:1;min-width:0;font-size:13.5px;font-weight:700;color:var(--ink)}
.ctt--sub{color:var(--ink2);font-weight:400}
.cmeta{flex-shrink:0;font-size:11px;color:var(--muted);margin-right:8px}
.go{flex-shrink:0;width:8px;height:8px;margin-left:6px;color:var(--muted3);border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg)}
.go--green{color:var(--green)}
.go--dark{color:var(--greenpress)}
.k{display:inline-block;font-size:10.5px;padding:1px 7px;border-radius:9px;background:#E6F4EE;color:var(--green);font-weight:700}
.k--blue{background:#E8F1FF;color:#2A5C8A}
.callout{font-size:12.5px;color:#2A5C8A;margin:8px 2px 0;line-height:1.8}
table{border-collapse:collapse;width:100%;font-size:12.5px;background:#fff;border-radius:10px;overflow:hidden;margin-top:8px}
th,td{padding:7px 10px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
th{background:#F0F7F3;color:var(--green);font-size:11.5px;white-space:nowrap}
.mono{font-family:Consolas,monospace;font-size:12px}
.old{color:#B0544A}
.dock{position:absolute;left:12px;right:12px;bottom:8px;height:56px;padding:4px 6px;display:flex;background:#FFF;border-radius:20px;box-shadow:0 5px 17px rgba(15,58,49,.16)}
.dock-i{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ti{width:23px;height:23px;margin-bottom:1px;background:center/contain no-repeat}
.dock-i.on .ti{width:24px;height:24px}
.dock-i span{font-size:11px;line-height:15px;color:var(--muted)}
.dock-i.on span{color:var(--green);font-weight:700}
@media(max-width:820px){.phone{width:100%}.scr{width:100%}}
</style></head>
<body><div class="wrap">
<h1>易错点排版 + 准备期按钮 · 方案稿（内容修正已落地，排版/按钮等你定）</h1>
<div class="sub">样式全部实抽 <code>app.wxss / tools.wxss</code>；易错点内容用的是<b>已修正后</b>的文案（本次已随源数据一起改完，见 ③）。</div>

<h2>① 易错点排版：3 个方案（同一张卡片、同一份数据）</h2>
<div class="sub" style="margin-bottom:10px">现状的问题有两个：一是英文句和中文说明连成一串，超长折行后「一句话横跨两个视觉层」；二是喇叭钉在整行末尾 —— 折行后正好落在「a piece of」中间，看着像在读半个词组。三个方案都把喇叭挪到<b>英文句后面</b>，区别只在中文说明放哪。</div>
<div class="phones">
${screenG('现状（v1.1.88）', ['问题', ''], `<div class="gback">‹ 返回</div><div class="card" style="margin-top:6px"><div class="slabel">易错点</div>
  <div class="fixrow">${icoX}<div class="ftx">${esc(NOTE1.bad)}</div></div>
  ${v0(NOTE1)}
  <div class="fixrow">${icoX}<div class="ftx">${esc(NOTE2.bad)}</div></div>
  ${v0(NOTE2)}</div>`)}
${screenG('方案A · 说明独立成行（推荐）', ['方案A', 'k--blue'], `<div class="gback">‹ 返回</div><div class="card" style="margin-top:6px"><div class="slabel">易错点</div>
  <div class="fixrow">${icoX}<div class="ftx">${esc(NOTE1.bad)}</div></div>
  ${vA(NOTE1)}
  <div class="fixrow">${icoX}<div class="ftx">${esc(NOTE2.bad)}</div></div>
  ${vA(NOTE2)}</div>`)}
${screenG('方案B · 同行弱化（更紧凑）', ['方案B', 'k--blue'], `<div class="gback">‹ 返回</div><div class="card" style="margin-top:6px"><div class="slabel">易错点</div>
  <div class="fixrow">${icoX}<div class="ftx">${esc(NOTE1.bad)}</div></div>
  ${vB(NOTE1)}
  <div class="fixrow">${icoX}<div class="ftx">${esc(NOTE2.bad)}</div></div>
  ${vB(NOTE2)}</div>`)}
</div>
<div class="callout">
  <b>方案A</b>：英文句一行 + 喇叭，中文说明另起一行、缩进到文本列、小字浅色 —— 和「（原因）」行的处理完全同构，层次最清楚；代价是卡片略高。<br>
  <b>方案B</b>：说明跟在句后但换成小号浅色字，视觉上分层、卡片不增高；折行多时右下会显碎。<br>
  另有「错句/对句分块上底色」的重方案没画 —— 125 个片段全上色块会太重，不建议。
</div>

<h2>② 准备期按钮：4 个方案</h2>
<div class="sub" style="margin-bottom:10px">你的问题「两个都箭头并去底色是否无法分辨主次」—— 方案C 就是答案的实物：<b>能分辨，但只靠字重和图标色，弱</b>。所以同时给了折中：方案A 同构双箭头行但主行给 <code>--press-green</code> 浅绿底（就是工具页分类格按压的那个底色，行级常亮），主次一眼可分、语言又统一；方案B 主按钮不动、只把「先看看」降级成箭头行。</div>
<div class="phones">
${screen('现状（v1.1.88）', ['现状', ''], P0)}
${screen('方案A · 双箭头行，主行浅绿底', ['推荐', 'k--blue'], PA)}
${screen('方案B · 主胶囊 + 次箭头行', ['方案B', 'k--blue'], PB)}
${screen('方案C · 双箭头全去底', ['主次最弱', 'k'], PC)}
</div>
<div class="callout">
  方案A 里主行的圆标是<b>实心绿圆 + 白色播放三角</b>（开学 = 按下播放键的隐喻），次行是灰描边眼睛（看看而已）；箭头都是 tools 页那枚 CSS chevron。<br>
  三个方案的点击行为完全一样：主行/主按钮 → 真开学；次行 → 预览第 1 天、顶部保留返回条。
</div>

<div class="card2">
<h3>③ 易错点内容修正：17 条已全部落地（源 _grammar.json + 产物 grammar.js 同步改）</h3>
<div class="sub" style="margin:0 0 6px">修法口径：<b>尾巴先接住 ✓ 句里的成分</b>（"句中就是例子" / "children 是不规则复数"），再向外延伸；零基础顺着 ✓ 句就能看懂尾巴在说什么。英文句一律没动（朗读音频零新增），唯一例外是 much/many 那条把 ✓ 从两句收敛成「I have a lot of money.」（该句音频已存在，旧句 2 个音频已成孤儿并删除）。应试词扫描 0 命中。</div>
${fixTable}
</div>

<div class="card2">
<h3>④ 84 个重做精读的天 → 搜索这个词就能跳过去（v1.1.87 验收用）</h3>
<div class="sub" style="margin:0 0 6px">工具页搜词 → 点结果行跳到当天 → 当天第 2 卡就是新口径的「例句精读」。词都是该天词表里的，且全表唯一（不会跳到别的天）。一共 84 天：</div>
${jumpTable}
</div>

</div></body></html>`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('OK → ' + OUT + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB)');

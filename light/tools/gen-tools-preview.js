// gen-tools-preview.js —— 生成「工具页重构」高保真效果图（单文件 HTML）
// 数据全部取自小程序真实文件（phonetic.js / study-cats.js / pkg-study/data/grammar.js），
// 底栏图标直接从 custom-tab-bar/index.wxss 里抽 data-URI —— 效果图 = 真机外观，不是另画的示意。
const fs = require('fs');
const path = require('path');

const MP = 'D:/idea/ielts-365/light/miniprogram';
const OUT = 'D:/idea/_reviews/工具页效果图_v1.1.67.html';

const PH = require(MP + '/utils/phonetic.js');
const CATS = require(MP + '/utils/study-cats.js');
const GRAM = require(MP + '/pkg-study/data/grammar.js');

// 从生成的 wxss 里抽真实图标 data-URI
const wxss = fs.readFileSync(MP + '/custom-tab-bar/index.wxss', 'utf8');
function icon(name, on) {
  const re = new RegExp('\\.i-' + name + (on ? '\\.on' : '') + '\\{background-image:url\\("([^"]+)"\\)\\}');
  const m = wxss.match(re);
  return m ? m[1] : '';
}

const ICO = {
  clock: icon('clock', false), clockOn: icon('clock', true),
  review: icon('review', false), reviewOn: icon('review', true),
  tool: icon('tool', false), toolOn: icon('tool', true),
  set: icon('set', false), setOn: icon('set', true),
  book: icon('book', false),          // 旧「词表」书本图标（已下线，仅作对比）—— 若已从 wxss 移除则为空
};
// 已生成脚本里没有 book 了，兜底用历史 data-URI（对照用）
if (!ICO.book) ICO.book = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%3E%3Cpath%20d='M12,6.6C10.2,5.1%207.6,4.4%204.6,4.7V17.4C7.6,17.1%2010.2,17.8%2012,19.3C13.8,17.8%2016.4,17.1%2019.4,17.4V4.7C16.4,4.4%2013.8,5.1%2012,6.6Z'%20stroke-width='1.8'%20fill='none'%20stroke='%238B9893'%20stroke-linejoin='round'/%3E%3Cpath%20d='M12,6.6V19.3'%20stroke-width='1.8'%20fill='none'%20stroke='%238B9893'%20stroke-linecap='round'/%3E%3C/svg%3E";

// 「工具」图标：最终采用的方案（工具箱 + 红提手）
function svgUri(inner) {
  return "data:image/svg+xml," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>" + inner + "</svg>");
}
const SW = "stroke-width='1.8' fill='none' stroke='#176B5B'";
const SW_G = "stroke-width='1.8' fill='none' stroke='#8B9893'";
const SW_R = "stroke-width='1.8' fill='none' stroke='#D85A30'";
// 未选中态：整枚单色灰，**不含任何红色元素**（用户点名要求）；选中态：箱体仍绿，只有提手变红。
const TOOL_CASE = c => `<rect x='3' y='8.5' width='18' height='12.5' rx='2.5' stroke-width='1.8' fill='none' stroke='${c}'/>` +
  `<path d='M3,14h18' stroke-width='1.8' fill='none' stroke='${c}'/>`;
const TOOL_ON = svgUri(TOOL_CASE('#176B5B') + `<path d='M9,8.5V7.2a3,3 0 0 1 6,0V8.5' ${SW_R} stroke-linecap='round'/>`);
const TOOL_OFF = svgUri(TOOL_CASE('#8B9893') + `<path d='M9,8.5V7.2a3,3 0 0 1 6,0V8.5' ${SW_G} stroke-linecap='round'/>`);

// 抽真实内容
const phI = PH[0];   // 面板默认选中第一个音标（与小程序一致）
const gTense = GRAM.filter(c => c.id === 'tense')[0];
const gTopic = gTense.topics.filter(t => t.t === '现在完成时')[0];
const phGroups = (cls) => {
  const out = [], idx = {};
  PH.filter(p => p.cls === cls).forEach(p => {
    if (!(p.grp in idx)) { idx[p.grp] = out.length; out.push({ name: p.grp, items: [] }); }
    out[idx[p.grp]].items.push(p);
  });
  return out;
};
const VG = phGroups('vowel'), CG = phGroups('consonant');

// data-URI 里的单引号在 CSS url("...") 里没事，但放进 HTML 内联 style 就会跟属性引号打架：
// 统一转义成 %27（SVG 数据 URI 对 %27 的解析与原字符完全等价）。
const A = u => String(u).replace(/'/g, '%27');
const inlineIcon = u => `style="background-image:url('${A(u)}')"`;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── 手机框 ──
function phone(title, body, tabActive) {
  const tabs = [['今日', 'clock'], ['复习', 'review'], ['工具', 'tool'], ['设置', 'set']];
  return `<div class="phone">
  <div class="ph-title">${title}</div>
  <div class="screen">
    <div class="sbar"><span>9:41</span><span>开溜6.5</span></div>
    <div class="body">${body}</div>
    <div class="tabbar">
      ${tabs.map(([t, k], i) => `<div class="tab ${i === tabActive ? 'on' : ''}">
        <div class="tico" ${inlineIcon(i === tabActive ? ICO[k + 'On'] : ICO[k])}></div>
        <div class="ttxt">${t}</div>
      </div>`).join('')}
    </div>
  </div>
</div>`;
}

const recCard = `<div class="card rec">
  <div class="recrow">
    <div class="recitem"><div class="recnum">87<span>天</span></div><div class="reclab">已学</div></div>
    <div class="recdiv"></div>
    <div class="recitem"><div class="recnum">1240<span>个</span></div><div class="reclab">已学单词</div></div>
    <div class="recdiv"></div>
    <div class="recitem"><div class="recnum">381<span>天</span></div><div class="reclab">预计还剩</div></div>
  </div>
</div>`;

const searchCard = (withResults) => `<div class="card">
  <div class="slabel">查单词</div>
  <div class="sbar2"><div class="sico"></div><div class="sph">输入单词或中文释义</div></div>
  ${withResults ? `
  <div class="meta">找到 <b>3</b> 个结果</div>
  <div class="wrow">
    <div class="wmain">
      <div class="whead"><span class="wen">achieve</span><span class="wpos">v.</span><span class="wzh">达到；实现</span></div>
      <div class="iparow"><span class="ipamod us">🔊 /əˈtʃiːv/</span><span class="ipamod uk">🔊 /əˈtʃiːv/</span></div>
      <div class="wex">She worked hard to <b>achieve</b> her goal.</div>
      <div class="wday">第 132 天 ›</div>
    </div>
  </div>
  <div class="wrow">
    <div class="wmain">
      <div class="whead"><span class="wen">achievement</span><span class="wpos">n.</span><span class="wzh">成就；成绩</span></div>
      <div class="iparow"><span class="ipamod us">🔊 /əˈtʃiːvmənt/</span></div>
      <div class="wex">Winning the prize was a great <b>achievement</b>.</div>
      <div class="wday">第 133 天 ›</div>
    </div>
  </div>` : `<div class="hint">全库共 <b>8000</b> 个单词；只输入前几个字母也能搜到（如 nano → nanotechnology）。</div>`}
</div>`;

const gramCard = `<div class="card">
  <div class="slabel">语法速查</div>
  <div class="catgrid">
    ${CATS.map(c => `<div class="catcell"><span class="catname">${c.name}</span><span class="catn">${c.count} 个</span></div>`).join('')}
  </div>
  <div class="note">共 ${CATS.reduce((a, c) => a + c.count, 0)} 个语法点：一句话定义 + 用法 + 易错点 + 例句，能对应上课程的还会挂出「课程里讲过哪几天」。点分类进入。</div>
</div>`;

const phCard = `<div class="card">
  <div class="slabel">音标（${PH.length} 个）</div>
  <div class="phtitle">元音</div>
  ${VG.map(G => `<div class="phgrp">${G.name}</div><div class="phgrid">${G.items.map(p => `<span class="phchip${p.s === phI.s ? ' on' : ''}">/${p.s}/</span>`).join('')}</div>`).join('')}
  <div class="phtitle gap">辅音</div>
  ${CG.map(G => `<div class="phgrp">${G.name}</div><div class="phgrid">${G.items.map(p => `<span class="phchip${p.s === phI.s ? ' on' : ''}">/${p.s}/</span>`).join('')}</div>`).join('')}
  <div class="phpanel">
    <div class="phhead"><span class="phbig">/${phI.s}/</span><span class="phtag">${phI.grp}</span></div>
    <div class="blk"><div class="blkt">怎么读</div><div class="blkb">${esc(phI.tips)}</div></div>
    <div class="blk"><div class="blkt">易混音</div><div class="blkb">${esc(phI.mix)}</div></div>
    <div class="blk"><div class="blkt">例词</div>
      ${phI.ex.map(e => `<div class="phex"><span class="spk">🔊</span><span class="pexw">${e.w}</span><span class="pexhit">${esc(e.hit)}</span><span class="pexcn">${esc(e.cn)}</span></div>`).join('')}
    </div>
  </div>
  <div class="note">点任意音标，下面的讲解随即切换；例词可直接点读（词表里有的词离线也能听）。</div>
</div>`;

// 局部核对用：只含详情面板（整页/手机框截图无法滚动，面板在音标表下方会被截掉）
const phPanelCard = `<div class="card">
  <div class="slabel">详情面板（当前选中 /${phI.s}/ · 点上方 chip 就地切换）</div>
  <div class="phpanel">
    <div class="phhead"><span class="phbig">/${phI.s}/</span><span class="phtag">${phI.grp}</span></div>
    <div class="blk"><div class="blkt">怎么读</div><div class="blkb">${esc(phI.tips)}</div></div>
    <div class="blk"><div class="blkt">易混音</div><div class="blkb">${esc(phI.mix)}</div></div>
    <div class="blk"><div class="blkt">例词</div>
      ${phI.ex.map(e => `<div class="phex"><span class="spk">🔊</span><span class="pexw">${e.w}</span><span class="pexhit">${esc(e.hit)}</span><span class="pexcn">${esc(e.cn)}</span></div>`).join('')}
    </div>
  </div>
</div>`;

// 语法速查页
const gramPage = `<div class="navtop">‹ 语法速查</div>
<div class="sb2"><span class="sb2i">🔍</span><span class="sb2ph">搜语法点，如 时态 / 从句 / 冠词</span></div>
<div class="intro">共 ${CATS.reduce((a, c) => a + c.count, 0)} 个语法点，按 12 个体系分类排列。每个语法点含：一句话定义、用法、易错点、例句，并在能对应上的条目里挂出「课程里讲过哪几天」。</div>
<div class="card catcard">
  <div class="cathead"><div class="catl"><div class="catnm">句子基础</div><div class="catintro">${esc(GRAM[0].intro)}</div></div><span class="catnum">5</span><span class="catarrow">›</span></div>
</div>
<div class="card catcard">
  <div class="cathead on"><div class="catl"><div class="catnm">动词与时态</div><div class="catintro">${esc(gTense.intro)}</div></div><span class="catnum">9</span><span class="catarrow on">›</span></div>
  ${gTense.topics.map(t => `<div class="tp"><div class="tphead"><span class="tpt">${t.t}</span></div><div class="tpdef">${esc(t.def)}</div></div>`).join('')}
</div>`;

// 语法点详情
const gramTopic = `<div class="navtop">‹ 现在完成时</div>
<div class="card ghead">
  <span class="gcat">动词与时态</span>
  <div class="gtt">${gTopic.t}</div>
  <div class="gdef">${esc(gTopic.def)}</div>
</div>
<div class="card"><div class="slabel">用法</div>
  ${gTopic.use.map(u => `<div class="li"><i></i><span>${esc(u)}</span></div>`).join('')}
</div>
<div class="card"><div class="slabel">易错点</div>
  ${gTopic.note.map(u => `<div class="li note"><i></i><span>${esc(u)}</span></div>`).join('')}
</div>
<div class="card"><div class="slabel">例句</div>
  ${gTopic.ex.map(e => `<div class="gex"><div><div class="gexen">${esc(e.en)}</div><div class="gexcn">${esc(e.cn)}</div></div><span class="spk">🔊</span></div>`).join('')}
</div>
<div class="card"><div class="slabel">课程对应</div>
  <div class="dchips">${gTopic.days.map(d => `<span class="dchip">第 ${d} 天</span>`).join('')}</div>
  <div class="note">这些天的「例句精读」讲的就是这个语法点，点一下跳到当天原文。</div>
</div>`;

const iconCompare = `<div class="card2">
  <h3>① 底栏「工具」图标 · 已定稿：工具箱 + 红提手</h3>
  <div class="cmp">
    <div class="cmpcol">
      <div class="cmpk">改之前</div>
      <div class="cmprow">${['clock', 'book', 'review', 'set'].map(k => `<span class="ci" ${inlineIcon(ICO[k])}></span>`).join('')}</div>
      <div class="cmpl">今日 · <b>词表</b> · 复习 · 设置</div>
    </div>
    <div class="cmpcol pick">
      <div class="cmpk">改之后 · 未选中（灰）</div>
      <div class="cmprow">${[ICO.clock, ICO.tool, ICO.review, ICO.set].map(u => `<span class="ci" ${inlineIcon(u)}></span>`).join('')}</div>
      <div class="cmpl">今日 · <b>工具</b> · 复习 · 设置 —— 整枚单色灰，<b style="color:#8B9893">无红色</b></div>
    </div>
    <div class="cmpcol pick">
      <div class="cmpk">改之后 · 选中（绿 + 红提手）</div>
      <div class="cmprow">${[ICO.clockOn, ICO.toolOn, ICO.reviewOn, ICO.setOn].map(u => `<span class="ci" ${inlineIcon(u)}></span>`).join('')}</div>
      <div class="cmpl">只有选中时提手才变红 —— <b style="color:#D85A30">红提手</b></div>
    </div>
  </div>
  <div class="cmpnote">图标为真机尺寸 46rpx（23px），直接抽自 <code>custom-tab-bar/index.wxss</code> 的生成结果。四枚已做尺寸归一：外接宽全部 17.8 / 24 格（复习的弧径 7.8→7.6 + 箭头内收、设置的轨道 5~19→4~20 + 圆钮 r2.4→2.8），选中态才有红色。</div>
</div>`;

const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>工具页重构 v2 · 效果图 v1.1.67</title>
<style>
:root{--bg:#F3F8EF;--card:#FFF;--ink:#24332F;--ink2:#5F6D68;--ink3:#53605B;--ink4:#43504C;
--muted:#8B9893;--muted2:#82908B;--muted3:#66736E;--muted4:#7B8A84;
--green:#176B5B;--greenmid:#2E8B72;--soft:#F0F7F3;--soft2:#E6F4EE;--line:#E9F0EC;--cardline:#DCE7DF;
--usbg:#EAF6F0;--usline:#CBE7DA;--usink:#176B5B;--ukbg:#EAF1F9;--ukline:#CBDDEF;--ukink:#2A5C8A;}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:#DDE6E0;color:var(--ink);font:14px/1.6 -apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif}
.wrap{max-width:1240px;margin:0 auto;padding:22px 16px 60px}
h1{font-size:22px;margin:0 0 6px;color:#0F4A3E}
.sub{color:#5C6B66;font-size:13px;margin-bottom:18px}
h2{font-size:16px;margin:30px 0 12px;color:#0F4A3E;border-left:4px solid var(--green);padding-left:10px}
.card2{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 14px rgba(23,107,91,.08);margin-bottom:16px}
.card2 h3{font-size:14px;margin:0 0 14px;color:var(--green)}
.phones{display:flex;flex-wrap:wrap;gap:22px;justify-content:flex-start}
.phone{width:330px;flex:0 0 auto}
.ph-title{font-size:13px;font-weight:700;color:#0F4A3E;margin-bottom:8px}
.screen{width:330px;height:660px;background:var(--bg);border-radius:26px;border:8px solid #1E2A28;
  overflow:hidden;position:relative;display:flex;flex-direction:column;box-shadow:0 10px 30px rgba(0,0,0,.22)}
.sbar{height:22px;background:#F3F8EF;display:flex;justify-content:space-between;align-items:center;
  padding:0 14px;font-size:9px;color:#6C7A75;flex:0 0 auto}
.body{flex:1;overflow-y:auto;padding-bottom:4px}
.body::-webkit-scrollbar{width:0}
.tabbar{height:56px;background:#fff;border-top:1px solid var(--line);display:flex;align-items:center;
  padding:4px 9px;flex:0 0 auto}
.tab{flex:1;text-align:center}
.tico{width:23px;height:23px;margin:0 auto 1px;background:center/contain no-repeat}
.tab.on .tico{width:24px;height:24px}
.ttxt{font-size:11px;color:var(--muted)}
.tab.on .ttxt{color:var(--green);font-weight:700}

.card{background:var(--card);border-radius:12px;padding:14px;margin:10px 12px;box-shadow:0 2px 9px rgba(23,107,91,.06)}
.slabel{font-size:13px;font-weight:700;color:var(--green);margin-bottom:7px;letter-spacing:.5px}
.note{margin-top:8px;font-size:11.5px;color:var(--muted2);line-height:1.7}

/* 学习记录 */
.recrow{display:flex;align-items:center}
.recitem{flex:1;text-align:center}
.recdiv{width:1px;height:34px;background:var(--line)}
.recnum{font-size:28px;line-height:1.1;font-weight:800;color:var(--green);font-variant-numeric:tabular-nums}
.recnum span{font-size:12px;font-weight:600;margin-left:3px}
.reclab{margin-top:3px;font-size:12px;color:var(--muted)}
.recsub{margin-top:9px;text-align:center;font-size:12px;color:var(--ink3)}
.recnote{margin-top:5px;font-size:11px;color:var(--muted2);text-align:center}

/* 搜索 */
.sbar2{display:flex;align-items:center;height:38px;background:var(--soft);border-radius:19px;padding:0 11px}
.sico{width:16px;height:16px;margin-right:7px;background:center/contain no-repeat;
  background-image:url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23176B5B'%20stroke-width='2'%20stroke-linecap='round'%3E%3Ccircle%20cx='10.8'%20cy='10.8'%20r='6.6'/%3E%3Cpath%20d='M15.8%2015.8l4.7%204.7'/%3E%3C/svg%3E")}
.sph{color:var(--muted);font-size:14px}
.hint{margin-top:8px;font-size:12.5px;color:var(--muted3);line-height:1.7}
.hint b{color:var(--green)}
.meta{margin-top:8px;font-size:12.5px;color:var(--muted3)}
.meta b{color:var(--green)}
.wrow{padding:7px 0;border-bottom:1px solid var(--line)}
.wrow:last-child{border-bottom:none}
.whead{display:flex;align-items:baseline;flex-wrap:wrap}
.wen{font-size:16px;font-weight:700}
.wpos{font-size:11px;color:var(--green);font-style:italic;margin-left:5px}
.wzh{font-size:13px;color:var(--ink2);margin-left:6px}
.iparow{margin-top:3px}
.ipamod{display:inline-flex;align-items:center;height:28px;padding:0 7px;border-radius:8px;font-size:12px;
  margin:3px 5px 0 0;background:var(--usbg);border:1px solid var(--usline);color:var(--usink)}
.ipamod.uk{background:var(--ukbg);border-color:var(--ukline);color:var(--ukink)}
.wex{font-size:12.5px;color:var(--muted2);margin-top:3px}
.wday{font-size:11px;color:var(--green);margin-top:5px}

/* 语法分类 */
.catgrid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.catcell{background:var(--soft);border-radius:8px;padding:10px 11px;display:flex;align-items:center;justify-content:space-between}
.catname{font-size:13.5px;font-weight:700}
.catn{font-size:11px;color:var(--green)}

/* 音标 */
.phtitle{font-size:12px;font-weight:700;color:var(--ink3);letter-spacing:.5px}
.phtitle.gap{margin-top:13px}
.phgrp{font-size:11px;color:var(--muted2);margin:8px 0 4px}
.phgrid{display:flex;flex-wrap:wrap;gap:6px}
.phchip{min-width:48px;text-align:center;padding:6px 8px;background:var(--soft);border-radius:7px;
  font-size:14px;font-weight:700;color:var(--green);font-family:'Times New Roman',Georgia,serif}
.phchip.on{background:var(--green);color:#fff}

/* 音标常驻面板 */
.phpanel{margin-top:11px;padding:11px 13px 9px;border-radius:8px;background:var(--soft);border:1px solid var(--line)}
.phhead{display:flex;align-items:baseline;position:relative;padding:2px 0 4px}
.phbig{font-size:31px;font-weight:800;color:var(--green);font-family:'Times New Roman',Georgia,serif}
.phtag{margin-left:8px;font-size:11.5px;color:var(--muted)}
.blk{margin-top:11px}
.blkt{font-size:12px;font-weight:700;color:var(--green);margin-bottom:4px}
.blkb{font-size:13px;color:var(--ink4);line-height:1.75}
.phex{display:flex;align-items:center;padding:9px 8px;border-bottom:1px solid var(--line)}
.phex:last-child{border-bottom:none}
.spk{font-size:14px;margin-right:6px}
.pexw{font-size:14.5px;font-weight:700}
.pexhit{font-size:11px;color:var(--ukink);margin-left:5px}
.pexcn{flex:1;text-align:right;font-size:12px;color:var(--muted3)}

/* 语法页 */
.navtop{background:#F3F8EF;padding:10px 16px;font-size:15px;font-weight:600;color:var(--ink);position:sticky;top:0}
.sb2{display:flex;align-items:center;height:38px;background:#fff;border:1px solid var(--cardline);
  border-radius:19px;margin:9px 12px 2px;padding:0 11px}
.sb2i{margin-right:7px;font-size:13px}
.sb2ph{color:var(--muted);font-size:13px}
.intro{margin:11px 16px 0;font-size:12px;color:var(--muted3);line-height:1.8}
.catcard{padding:3px 14px}
.cathead{display:flex;align-items:center;padding:11px 0}
.cathead.on{background:var(--soft);border-radius:6px}
.catl{flex:1;min-width:0}
.catnm{font-size:15px;font-weight:700}
.catintro{margin-top:3px;font-size:11.5px;color:var(--muted3);line-height:1.6}
.catnum{font-size:11.5px;color:var(--green);margin-left:7px}
.catarrow{width:20px;text-align:center;font-size:17px;color:var(--muted2);margin-left:3px}
.catarrow.on{transform:rotate(90deg)}
.tp{padding:10px 0;border-top:1px solid var(--line)}
.tpt{font-size:14px;font-weight:700}
.tpdef{margin-top:3px;font-size:12px;color:var(--muted3)}
.ghead .gcat{display:inline-block;font-size:11px;color:var(--ukink);background:var(--ukbg);border-radius:4px;padding:1px 6px}
.gtt{margin-top:6px;font-size:19px;font-weight:800;line-height:1.35}
.gdef{margin-top:5px;font-size:13.5px;color:var(--ink3);line-height:1.7}
.li{display:flex;align-items:flex-start;margin-top:7px}
.li i{flex:0 0 auto;width:6px;height:6px;border-radius:50%;background:var(--green);margin:7px 7px 0 0}
.li span{flex:1;font-size:13.5px;color:var(--ink4);line-height:1.75}
.li.note i{background:#C0392B}
.li.note span{color:var(--ink3)}
.gex{display:flex;align-items:center;padding:9px 8px;border-bottom:1px solid var(--line)}
.gex:last-child{border-bottom:none}
.gexen{font-size:14px;color:var(--ink3);line-height:1.7}
.gexcn{margin-top:2px;font-size:12px;color:var(--muted3)}
.dchips{display:flex;flex-wrap:wrap;gap:6px}
.dchip{background:var(--soft);color:var(--green);border-radius:7px;padding:6px 11px;font-size:12.5px;font-weight:700}

/* 图标对比 */
.cmp{display:flex;gap:16px;flex-wrap:wrap}
.cmpcol{background:var(--bg);border-radius:12px;padding:12px 14px;border:2px solid transparent}
.cmpcol.pick{border-color:var(--green);background:#F7FCF9}
.cmpk{font-size:12px;color:var(--ink3);font-weight:700;margin-bottom:8px}
.cmprow{display:flex;gap:16px;align-items:center}
.cmprow.sel{margin-top:8px}
.ci{width:23px;height:23px;background:center/contain no-repeat;display:block}
.cmpl{margin-top:8px;font-size:11.5px;color:var(--muted3)}
.cmpl b{color:var(--green)}
.cmpnote{margin-top:10px;font-size:12px;color:var(--muted2)}
@media(max-width:760px){.phones{gap:16px}.phone{width:100%}.screen{width:100%;height:600px}}
</style></head>
<body><div class="wrap">
<h1>工具页重构 v2 · 高保真效果图</h1>
<div class="sub">v1.1.67 ｜ 等级全面下线 + 内容层「周/阶段 → 天」+ 音标常驻面板 + 工具箱图标 ｜ 数据全部取自小程序真实文件（音标 ${PH.length} 个 / 语法 <%= n1 %> 个 / 底栏图标 data-URI 实抽）｜ 待你确认后再盖章上传体验版</div>

${iconCompare}

<h2>② 工具页 · 上半（学习记录 + 查单词）</h2>
<div class="phones">
${phone('工具页 · 顶部', recCard + searchCard(false), 2)}
${phone('工具页 · 搜索结果', recCard + searchCard(true), 2)}
${phone('工具页 · 音标 + 语法', phCard + gramCard, 2)}
</div>

<h2 id="phon">③ 音标区改版：底部弹层（整片白遮罩）→ 常驻面板</h2>
<div class="phones">
${phone('音标 · 常驻面板（默认选中第一个音标 /ɪ/，零遮罩）', phCard, 2)}
</div>

<h2>④ 语法速查（分包页，原生导航栏）</h2>
<div class="phones">
${phone('语法速查 · 体系目录', gramPage, 2)}
${phone('语法点详情 · 现在完成时', gramTopic, 2)}
</div>

<div class="card2" style="margin-top:22px">
<h3>⑤ 本轮改动（在你上一条拍板的基础上）</h3>
<div style="font-size:13px;line-height:2;color:#3C4A46">
① <b>内容层「第 N 周 / 阶段X」→「天」</b>：data-p1~p6 共改写 <b>106 处</b>。「第 N 周」里的 N = 第 N 个<b>教学周</b>（跳过巩固周、跨 6 个文件连续累加），按课程实际排课换算成日历天——例：<code>第 3 周自检</code> → <code>第 28 天自检</code>；<code>阶段二总复习</code> → <code>中段总复习</code>。另有 <b>11 处是误命中</b>（教育阶段 / 常用词根 / L1-L2-L3 句子复杂度分级 /「此刻、阶段」）已确认保留<br>
② <b>记录卡第二行</b>：当前 L2 常用词 · 第 87 天 → <b>已学单词 N 个</b>；等级（L1~L4）全线下线，今日页标题下的等级行改回<b>星期</b>，设置页「4 个等级」也改成 546 天<br>
③ <b>音标区</b>：底部弹层（整片白遮罩）→ <b>常驻面板</b>（上表选音标、下详情固定不动、默认选中第一个、零遮罩）<br>
④ <b>语法区标题</b>：怎么用 → <b>用法</b> ／ 注意什么 → <b>易错点</b> ／ 例句（点一下朗读）→ <b>例句</b> ／ 课程里讲过 → <b>课程对应</b><br>
⑤ <b>工具页四块顺序</b>：学习记录 → 查单词 → <b>音标</b> → <b>语法</b>（按你的决定交换）<br>
⑥ <b>底栏「工具」图标</b>：工具箱 + 红提手（未选中态整枚单色灰、不含红）
</div>
</div>

<div class="card2">
<h3>⑥ 仍需你确认的点</h3>
<div style="font-size:13px;line-height:2;color:#3C4A46">
1. 工具箱的箱体比例 / 箱缝位置 / 提手弧度是否合适（可微调）<br>
2. 「已学单词 N 个」的口径 = <b>已打卡学习日里出现过的词，去重计数</b>（周日与弹性日不产生新词）；要不要换成别的口径<br>
3. 音标常驻面板默认选中第一个音标 <b>/ɪ/</b>；44 个 chip 与面板同屏，滚动长度是否可接受<br>
4. 内容层那 106 处改写的「周→天」换算我逐条核对过，但<b>语义通顺度</b>建议你抽几条读读（尤其 p3/p5/p6 的阶段总结段）
</div>
</div>
</div></body></html>`;

fs.writeFileSync(OUT, html.replace('<%= n1 %>', GRAM.reduce((a, c) => a + c.topics.length, 0)), 'utf8');
console.log('OK 效果图 → ' + OUT + '  (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB)');

// 附带输出一份「仅音标卡」小页面：无头截图无法滚动，整页长图看不清面板细节，用它做局部核对
const css = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
const htmlPhon = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + css + '</style></head>' +
  '<body><div class="wrap" style="max-width:432px;padding:16px">' +
  phone('音标 · 常驻面板（默认选中第一个音标，零遮罩）', phPanelCard, 2) + '</div></body></html>';
fs.writeFileSync('D:/idea/_reviews/_phon_only.html', htmlPhon, 'utf8');
console.log('OK 音标局部页 → D:/idea/_reviews/_phon_only.html');

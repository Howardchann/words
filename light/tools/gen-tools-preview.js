// gen-tools-preview.js —— 生成「工具页重构」高保真效果图（单文件 HTML）
// 数据全部取自小程序真实文件（phonetic.js / study-cats.js / pkg-study/data/grammar.js），
// 底栏图标直接从 custom-tab-bar/index.wxss 里抽 data-URI —— 效果图 = 真机外观，不是另画的示意。
const fs = require('fs');
const path = require('path');

const MP = path.join(__dirname, '..', 'miniprogram');
const OUT = 'D:/idea/_reviews/工具页效果图_v1.1.70.html';

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

// ── 从 app.wxss 抽真实图标（v1.1.70 起效果图一律用真 SVG，不再用 emoji）──
// 上一版（v1.1.68）效果图里的喇叭是 emoji 🔊，而底栏图标是真 SVG → 同一张图里两套图标，
// 用户看图时就会觉得「播放按钮不一致」。真机代码本身是统一的（喇叭 = .spk-ico 单一来源，
// 只有绿/蓝、明/暗、30/36rpx 尺寸差），是效果图没对齐。这里全部改成从源文件抽。
const appwxss = fs.readFileSync(MP + '/app.wxss', 'utf8');
// ⚠️ 三个坑（都已踩过）：① 不能要求「规则里只含 background-image 一条」——.spk-ico 里有尺寸等声明；
//    ② 不能用简单的子串正则——`.ipa-mod--uk .spk-ico{...}`（英音蓝）出现得比 `.spk-ico{...}`（品牌绿）更早；
//    ③ 必须先剥离 /* */ 注释——否则注释文本会被 ([^{}]+) 吃进选择器串，主定义反而匹配不上，
//       先命中的会变成 @media 里那条只含尺寸的同名规则（图标就空了）。
const appcss = appwxss.replace(/\/\*[\s\S]*?\*\//g, '');
function appIcon(sel) {
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(appcss)) !== null) {
    if (m[1].split(',').map(s => s.trim()).indexOf(sel) < 0) continue;
    const u = m[2].match(/background-image:url\("([^"]+)"\)/);
    if (u) return u[1];
  }
  return '';
}
const SPK = appIcon('.spk-ico');            // 绿喇叭 #176B5B
const SPK_UK = appIcon('.ipa-mod--uk .spk-ico') || SPK;   // 英音蓝喇叭
const SEARCH = appIcon('.ico-search');

// 对错图标（v1.1.70 起为自绘 SVG）：path 与 pkg-study/pages/topic/topic.wxss 的 .fix__mk--* 同源，
// 三处勾形（易错点 / toast / 设置页）完全一致。字符 ✗/✓ 由不同字形族兜底、粗细不一，已是过去式。
const mkUri = (d, color, extra) => 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'' + color + '\' stroke-width=\'2.6\' stroke-linecap=\'round\'' + (extra || '') + '%3E%3Cpath d=\'' + d + '\'/%3E%3C/svg%3E';
const MK_CROSS = mkUri('M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4', '%23C0392B');
const MK_TICK = mkUri('M4.9 12.4l4.9 4.9L19 6.9', '%23176B5B', ' stroke-linejoin=\'round\'');
const MK_TICK_W = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'11\' fill=\'%232E8B72\'/%3E%3Cpath d=\'M6.9 12.2l3.5 3.5L17.1 8.7\' fill=\'none\' stroke=\'%23FFFFFF\' stroke-width=\'2.6\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E';

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
// 音标（v1.1.68 两级筛选）：大类 元音/辅音 → 子类（短元音/长元音/双元音 …）
const PH_VOWEL = PH.filter(p => p.cls === 'vowel');
const PH_CONS = PH.filter(p => p.cls === 'consonant');
const grpNames = list => { const o = []; list.forEach(p => { if (o.indexOf(p.grp) < 0) o.push(p.grp); }); return o; };
const PH_SUBS = grpNames(PH_VOWEL);
// 场景标签（语法速查页筛选条，顺序与 grammar.js 的 TAG_LIST 一致）
const TAGS = ['日常', '闲聊', '书面', '职场', '学习', '出行', '购物', '商务'];

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
      <div class="iparow"><span class="ipamod us"><span class="ipaspk" ${inlineIcon(SPK)}></span>/əˈtʃiːv/</span><span class="ipamod uk"><span class="ipaspk" ${inlineIcon(SPK_UK)}></span>/əˈtʃiːv/</span></div>
      <div class="wex">She worked hard to <b>achieve</b> her goal.</div>
      <div class="wday">第 132 天 ›</div>
    </div>
  </div>
  <div class="wrow">
    <div class="wmain">
      <div class="whead"><span class="wen">achievement</span><span class="wpos">n.</span><span class="wzh">成就；成绩</span></div>
      <div class="iparow"><span class="ipamod us"><span class="ipaspk" ${inlineIcon(SPK)}></span>/əˈtʃiːvmənt/</span></div>
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
  <div class="note">共 ${CATS.reduce((a, c) => a + c.count, 0)} 个语法点：一句人话开场白 + 定义 + 用法 + 易错点 + 例句，能对应上课程的还会挂出「课程里讲过哪几天」。点分类进入；也可以进速查页按「用在什么场合」筛。</div>
</div>`;

// 目标字母切进单词内部 —— 与 pages/tools/tools.js 的 hitSegs() 同源（改一处务必同步另一处）
function hitSegs(w, hit) {
  const src = String(w || ''), h = String(hit || '').toLowerCase();
  if (!src) return [];
  if (!h) return [{ v: src, h: 0 }];
  const raw = [];
  const push = (v, isHit) => {
    if (!v) return;
    const last = raw[raw.length - 1];
    if (last && last.h === (isHit ? 1 : 0)) last.v += v; else raw.push({ v: v, h: isHit ? 1 : 0 });
  };
  if (h.indexOf('-') >= 0) {
    const left = h.split('-').filter(Boolean);
    for (let i = 0; i < src.length; i++) {
      const c = src.charAt(i).toLowerCase();
      const k = left.indexOf(c);
      if (k >= 0) { left.splice(k, 1); push(src.charAt(i), true); } else push(src.charAt(i), false);
    }
  } else {
    const at = src.toLowerCase().indexOf(h);
    if (at < 0) return [{ v: src, h: 0 }];
    push(src.slice(0, at), false); push(src.slice(at, at + h.length), true); push(src.slice(at + h.length), false);
  }
  return raw;
}

// 音标详情面板（两处复用：整卡 / 局部核对页）
// 例词行 v1.1.70：喇叭在行首成一列（方案A）+ 目标字母就地染色（不再有独立蓝标签）。
const exRow = e => `<div class="phex"><span class="pexspk" ${inlineIcon(SPK)}></span><span class="phextxt"><span class="pexw">${hitSegs(e.w, e.hit).map(s => s.h ? `<span class="pexhi">${esc(s.v)}</span>` : esc(s.v)).join('')}</span><span class="pexcn">${esc(e.cn)}</span></span></div>`;
const phPanelInner = `<div class="phhead"><span class="phbig">/${phI.s}/</span><span class="phtag">${phI.grp}</span></div>
  <div class="blk"><div class="blkt">怎么读</div><div class="blkb">${esc(phI.tips)}</div></div>
  <div class="blk"><div class="blkt">易混音</div><div class="blkb">${esc(phI.mix)}</div></div>
  <div class="blk"><div class="blkt">例词</div>${phI.ex.map(exRow).join('')}</div>`;

// 音标卡（v1.1.68：大类 + 子类筛选，网格最多 3 行 → 面板紧跟其下，不必滚到底）
const phCard = `<div class="card">
  <div class="slabel">音标（${PH.length} 个）</div>
  <div class="phhint">点音标看讲解；例词可直接点读（词表里有的词离线也能听）。</div>
  <div class="phclass">
    <div class="phcls on">元音<span>${PH_VOWEL.length}</span></div>
    <div class="phcls">辅音<span>${PH_CONS.length}</span></div>
  </div>
  <div class="phsub">
    <div class="phsubchip on">全部</div>
    ${PH_SUBS.map(g => `<div class="phsubchip">${g}</div>`).join('')}
  </div>
  <div class="phgrid">
    ${PH_VOWEL.map(p => `<span class="phchip${p.s === phI.s ? ' on' : ''}">/${p.s}/</span>`).join('')}
  </div>
  <div class="phpanel">${phPanelInner}</div>
</div>`;

// 局部核对用：只含详情面板（整页/手机框截图无法滚动，面板在音标表下方会被截掉）
const phPanelCard = `<div class="card">
  <div class="slabel">详情面板（当前选中 /${phI.s}/ · 点上方 chip 就地切换）</div>
  <div class="phpanel">${phPanelInner}</div>
</div>`;

// ── 语法速查页 ──
const gramTotal = CATS.reduce((a, c) => a + c.count, 0);
const tagbar = (on) => `<div class="tagbar"><span class="tagchip${on ? '' : ' on'}">全部</span>` +
  TAGS.map(t => `<span class="tagchip${t === on ? ' on' : ''}">${t}</span>`).join('') + `</div>`;

// 场景筛选结果（另一态：场景轴跨体系分类聚合）
const tagHit = [];
GRAM.forEach(c => c.topics.forEach(t => {
  if ((t.tags || []).indexOf('工作职场') >= 0) tagHit.push({ t: t.t, def: t.def, catName: c.name });
}));

const gramPage = `<div class="navtop">‹ 语法速查</div>
<div class="sb2"><span class="sb2i" ${inlineIcon(SEARCH)}></span><span class="sb2ph">搜语法点，如 时态 / 从句 / 冠词</span></div>
${tagbar('')}
<div class="intro">共 ${gramTotal} 个语法点。两种找法：上面按「用在什么场合」筛，下面按 12 个体系分类翻。每个语法点含一句人话开场白、定义、用法、易错点、例句，能对应上课程的还会挂出「课程里讲过哪几天」。</div>
<div class="card catcard">
  <div class="cathead"><div class="catl"><div class="catnm">句子基础</div><div class="catintro">${esc(GRAM[0].intro)}</div></div><span class="catnum">5 个</span><span class="catarrow">›</span></div>
</div>
<div class="card catcard">
  <div class="cathead on"><div class="catl"><div class="catnm">动词与时态</div><div class="catintro">${esc(gTense.intro)}</div></div><span class="catnum">9 个</span><span class="catarrow on">›</span></div>
  ${gTense.topics.map(t => `<div class="tp"><div class="tphead"><span class="tpt">${t.t}</span></div><div class="tpdef">${esc(t.def)}</div></div>`).join('')}
</div>`;

const gramTagPage = `<div class="navtop">‹ 语法速查</div>
<div class="sb2"><span class="sb2i" ${inlineIcon(SEARCH)}></span><span class="sb2ph">搜语法点，如 时态 / 从句 / 冠词</span></div>
${tagbar('职场')}
<div class="intro meta2">「工作职场」场景下共 ${tagHit.length} 个语法点</div>
<div class="card catcard">
  ${tagHit.slice(0, 6).map(o => `<div class="tp"><div class="tphead"><span class="tpt">${o.t}</span><span class="tpcat">${o.catName}</span></div><div class="tpdef">${esc(o.def)}</div></div>`).join('')}
</div>`;

// ── 语法点详情（易错点解析：与 pages/topic/topic.js 的 parseNotes 同一套规则）──
function splitWhy(v) {
  const m = /^([\s\S]*?)\s*（([^（）]*)）\s*$/.exec(v);
  return m ? { v: m[1].trim(), why: m[2].trim() } : { v: String(v).trim(), why: '' };
}
function parseNotes(arr) {
  const out = [];
  (arr || []).forEach(raw => {
    const s = String(raw || '');
    if (s.indexOf('❌') < 0 && s.indexOf('✅') < 0) { out.push({ kind: 'text', v: s }); return; }
    const first = s.search(/[❌✅]/);
    const head = first > 0 ? s.slice(0, first).trim() : '';
    const segs = []; const re = /(❌|✅)([^❌✅]*)/g; let m;
    while ((m = re.exec(s))) segs.push({ t: m[1] === '❌' ? 'bad' : 'good', v: m[2].trim() });
    let why = '';
    if (segs.length) { const r = splitWhy(segs[segs.length - 1].v); segs[segs.length - 1].v = r.v; why = r.why; }
    out.push({ kind: 'fix', head: head, segs: segs, why: why });
  });
  return out;
}

// 语法点详情
const gramTopic = `<div class="navtop">‹ 现在完成时</div>
<div class="card ghead">
  <span class="gcat">动词与时态</span>
  <div class="gtt">${gTopic.t}</div>
  ${gTopic.plain ? `<div class="gplain">${esc(gTopic.plain)}</div>` : ''}
  <div class="gdef">${esc(gTopic.def)}</div>
</div>
<div class="card"><div class="slabel">用法</div>
  ${gTopic.use.map(u => `<div class="li"><i></i><span>${esc(u)}</span></div>`).join('')}
</div>
<div class="card"><div class="slabel">易错点</div>
  ${parseNotes(gTopic.note).map(N => N.kind === 'text'
    ? `<div class="li note"><i></i><span>${esc(N.v)}</span></div>`
    : `<div class="fix">${N.head ? `<div class="fixhead">${esc(N.head)}</div>` : ''}${N.segs.map(S => `<div class="fixrow"><span class="fixico"><span class="fixmk" ${inlineIcon(S.t === 'bad' ? MK_CROSS : MK_TICK)}></span></span><span class="fixtx">${esc(S.v)}</span></div>`).join('')}${N.why ? `<div class="fixwhy">${esc(N.why)}</div>` : ''}</div>`).join('')}
</div>
<div class="card"><div class="slabel">例句</div>
  ${gTopic.ex.map(e => `<div class="gex"><div><div class="gexen">${esc(e.en)}</div><div class="gexcn">${esc(e.cn)}</div></div><span class="gexspk" ${inlineIcon(SPK)}></span></div>`).join('')}
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

// 图标一致性收口（v1.1.70）：这里刻意**不画 emoji**，只展示改后的统一图标 ——
// 上一版效果图正是因为「一部分图标用真 SVG、一部分用 emoji」才让用户看出不一致。
const iconConsist = `<div class="card2">
  <h3>⑦ 播放按钮 / 对错图标 · 一致性收口（本轮）</h3>
  <div class="cmp">
    <div class="cmpcol pick">
      <div class="cmpk">播放按钮：全站同一枚 SVG</div>
      <div class="cmprow">
        <span class="ci" ${inlineIcon(SPK)}></span>
        <span class="ci" ${inlineIcon(SPK_UK)}></span>
        <span class="ci" ${inlineIcon(SEARCH)}></span>
      </div>
      <div class="cmpl">绿=例句 / 例词 / 音标(美) · 蓝=英音 · 搜索同一套线条语言 · 尺寸只有 <b>30 / 36rpx</b> 两档</div>
    </div>
    <div class="cmpcol pick">
      <div class="cmpk">对错图标：同一套自绘 SVG</div>
      <div class="cmprow">
        <span class="ci" ${inlineIcon(MK_CROSS)}></span>
        <span class="ci" ${inlineIcon(MK_TICK)}></span>
        <span class="ci" ${inlineIcon(MK_TICK_W)}></span>
      </div>
      <div class="cmpl">易错点 ✗/✓ + toast 勾 + 设置页选中勾 —— 三处同 stroke、同圆头、同 24 格网格</div>
    </div>
  </div>
  <div class="cmpnote">播放图标在真机本来就只有 <code>.spk-ico</code> 一个来源（尺寸 30/36rpx 是老早就定的），是<b>上一版效果图</b>里混用了 emoji 🔊 才显得两套；对错图标则是<b>真机也存在的</b>问题：✗(U+2717) 与 ✓(U+2713) 没有 emoji 变体，但会被不同字形族接管，各机型粗细/大小不一 —— 已全部换成自绘 SVG。</div>
</div>`;

const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>工具页重构 · 效果图 v1.1.70</title>
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
/* 音标胶囊内的小喇叭：与真机 .ipa-mod .spk-ico 同规格（30rpx=15px，右距 6rpx=3px） */
.ipaspk{display:inline-block;vertical-align:middle;width:15px;height:15px;margin-right:3px;
  background-position:center;background-repeat:no-repeat;background-size:15px 15px}
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
.phex{display:flex;align-items:baseline;padding:8px 7px;border-bottom:1px solid var(--line)}
.phex:last-child{border-bottom:none}
.pexw{font-size:14.5px;font-weight:700}
.pexhi{color:var(--green);border-bottom:3px solid currentColor;padding-bottom:2px}   /* 目标字母就地染色+底线（v1.1.70；纯色对比度仅约2:1，补底线才可辨） */
.pexcn{font-size:12px;color:var(--muted3);margin-left:7px}

/* 语法页 */
.navtop{background:#F3F8EF;padding:10px 16px;font-size:15px;font-weight:600;color:var(--ink);position:sticky;top:0}
.sb2{display:flex;align-items:center;height:38px;background:#fff;border:1px solid var(--cardline);
  border-radius:19px;margin:9px 12px 2px;padding:0 11px}
.sb2i{flex-shrink:0;width:16px;height:16px;margin-right:7px;
  background-position:center;background-repeat:no-repeat;background-size:16px 16px}
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
/* 例句行：喇叭（v1.1.69 收口）= 56×56 热区（28px）+ 36rpx 图标（18px）+ baseline，与今日页同构 */
.gex{display:flex;align-items:baseline;padding:9px 8px;border-bottom:1px solid var(--line)}
.gex:last-child{border-bottom:none}
.gexen{font-size:14px;color:var(--ink3);line-height:1.7}
.gexcn{margin-top:2px;font-size:12px;color:var(--muted3)}
.gexspk{flex-shrink:0;width:28px;height:28px;margin-left:6px;
  background-position:center;background-repeat:no-repeat;background-size:18px 18px}
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
/* ── v1.1.68 增补：音标两级筛选 / 例词行同构 / 场景标签 / 人话开场白 / 易错点自绘 ✗✓ ── */
.phhint{font-size:11.5px;color:var(--muted2);line-height:1.7;margin-top:4px}
.phclass{display:flex;gap:7px;margin-top:7px}
.phcls{flex:1;text-align:center;height:34px;line-height:34px;border-radius:7px;background:var(--soft);font-size:14px;font-weight:700;color:var(--muted3)}
.phcls.on{background:var(--green);color:#fff}
.phcls span{font-size:11px;font-weight:600;margin-left:4px;opacity:.8}
.phsub{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
.phsubchip{padding:4px 10px;border-radius:12px;font-size:12px;background:var(--soft);color:var(--muted3)}
.phsubchip.on{background:var(--soft2);color:var(--green);font-weight:700}
.phgrid{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.phchip{min-width:48px;text-align:center;padding:6px 8px;background:var(--soft);border-radius:7px;font-size:14px;font-weight:700;color:var(--green);font-family:'Times New Roman',Georgia,serif}
.phchip.on{background:var(--green);color:#fff}
/* 例词行（v1.1.69 方案A「左列喇叭」+ v1.1.70 词内染色）：喇叭在行首独立成列，文字左对齐自然宽度。
   喇叭盒 22px（=44rpx），图标仍是 18px（=36rpx，与 .ex-speak .spk-ico 同尺寸）——
   这就是「各区域播放按钮一致」的落点：尺寸只在 30/36rpx 两档，形状/颜色全站同一枚 SVG。 */
.phex{display:flex;align-items:baseline;padding:8px 7px;border-bottom:1px solid var(--line);margin:0;background:none;border-radius:0}
.phex:last-child{border-bottom:none}
.phextxt{flex:1;min-width:0}
.pexspk{flex-shrink:0;width:22px;height:22px;margin-right:7px;background-position:center;background-repeat:no-repeat;background-size:18px 18px}
/* 场景筛选条 */
.tagbar{display:flex;flex-wrap:wrap;gap:6px;margin:8px 12px 0}
.tagchip{padding:5px 11px;border-radius:13px;font-size:12.5px;background:var(--soft);color:var(--muted3)}
.tagchip.on{background:var(--green);color:#fff;font-weight:700}
.meta2{margin:10px 16px 0 !important}
/* 分类数量列：定宽 + 右对齐（原来夹在标题与箭头之间随标题长度浮动） */
.catnum{flex-shrink:0;width:48px;text-align:right;font-size:12.5px;color:var(--green);margin-left:6px}
/* 人话开场白 */
.gplain{margin-top:7px;padding:7px 9px;border-radius:6px;background:var(--soft);font-size:13px;color:var(--ink3);line-height:1.7}
/* 易错点：对错标记 = 自绘 SVG（v1.1.70，取代 ❌✅ emoji 与 ✗/✓ 字符）——
   字符方案在真机由不同字形族兜底、粗细/大小不一，看起来像两套图标；SVG 后同一套 stroke/圆头/24 格网格。
   对齐与全站一致：.fixico 内放零宽空格 strut，.fixmk inline-block + vertical-align:middle。 */
.fix{margin-top:9px}
.fix:first-child{margin-top:2px}
.fixhead{font-size:12px;color:var(--muted3);line-height:1.7}
.fixrow{display:flex;align-items:baseline;margin-top:3px}
.fixico{flex-shrink:0;width:17px;text-align:center;font-size:12.5px}
.fixico::before{content:'\\200B'}
.fixmk{display:inline-block;vertical-align:middle;width:13px;height:13px;background:center/contain no-repeat}
.fixtx{flex:1;min-width:0;font-size:13.5px;color:var(--ink3);line-height:1.75}
.fixwhy{margin-top:2px;padding-left:22px;font-size:11.5px;color:var(--muted2);line-height:1.7}
.tpcat{flex-shrink:0;margin-left:7px;font-size:10.5px;color:var(--ukink);background:var(--ukbg);border-radius:4px;padding:1px 5px}
@media(max-width:760px){.phones{gap:16px}.phone{width:100%}.screen{width:100%;height:600px}}
</style></head>
<body><div class="wrap">
<h1>工具页重构 v4 · 高保真效果图</h1>
<div class="sub">v1.1.70 ｜ 目标字母染进单词 · 播放按钮与对错图标全站统一（自绘 SVG）· 音标例词行左列喇叭 ｜ 数据全部取自小程序真实文件（音标 ${PH.length} 个 / 语法 <%= n1 %> 个 / 喇叭·搜索·勾叉的 data-URI 均从源文件实抽）</div>

${iconCompare}

${iconConsist}

<h2>② 工具页 · 上半（学习记录 + 查单词）</h2>
<div class="phones">
${phone('工具页 · 顶部', recCard + searchCard(false), 2)}
${phone('工具页 · 搜索结果', recCard + searchCard(true), 2)}
${phone('工具页 · 音标 + 语法', phCard + gramCard, 2)}
</div>

<h2 id="phon">③ 音标区重做：两级筛选，讲解面板紧跟网格（原来要滑到底）</h2>
<div class="phones">
${phone('音标 · 元音（默认，20 个 chip 三行，面板紧随）', phCard, 2)}
</div>

<h2>④ 语法速查（分包页）：体系目录 + 场景筛选 + 详情页</h2>
<div class="phones">
${phone('语法速查 · 体系分类', gramPage, 2)}
${phone('语法速查 · 按场景筛（工作职场）', gramTagPage, 2)}
${phone('语法点详情 · 人话开场白 + 易错点自绘', gramTopic, 2)}
</div>

<div class="card2" style="margin-top:22px">
<h3>⑤ 本轮改动（v1.1.70）</h3>
<div style="font-size:13px;line-height:2;color:#3C4A46">
① <b>目标字母染进单词</b>：原来在单词后面挂一个独立蓝色小标签（<code>sit i 坐</code>），现在直接让<b>发这个音的那几个字母在单词内部变绿</b>（s<span style="color:#176B5B">i</span>t）——由 <code>tools.js</code> 的 <code>hitSegs()</code> 预先切成分段，模板只负责 for 出来；4 条开音节（name/time/five/home）是「字母分别染色」<br>
② <b>对错图标改自绘 SVG</b>：emoji ❌✅ → 字符 ✗/✓ → <b>SVG</b>。字符方案在真机由不同字形族接管，粗细/大小/边距都不一样（就是你说的「两个版本」）；顺手把 <b>toast 的绿勾</b>和<b>设置页的选中勾</b>也换成同一套（三处勾形同源）<br>
③ <b>效果图自身的图标统一</b>：上一版效果图里喇叭用 emoji 🔊、底栏图标用真 SVG —— 同一张图两套图标，所以你会觉得「播放按钮不一致」。真机代码其实一直是统一的（喇叭只出自 <code>app.wxss</code> 的 <code>.spk-ico</code> 一个类）。本版效果图<b>喇叭/搜索/勾叉全部从源文件实抽</b>，且不再出现任何 emoji<br>
④ <b>音标例词行</b>：喇叭在行首成一列（方案A），文字左对齐自然宽度 —— 消掉「单词与喇叭之间的大片空白」<br>
⑤ <b>语法详情例句行喇叭</b>：本页私有的 40rpx 裸图标 + 整行垂直居中（全站唯一无理由例外）→ 与今日页同构的 <b>56×56 热区 + 36rpx + baseline</b>
</div>
</div>

<div class="card2">
<h3>⑥ 遗留（仍在等你点头 / 后续排期）</h3>
<div style="font-size:13px;line-height:2;color:#3C4A46">
1. 音标例词行的目标字母现在是<b>纯绿色</b>——要不要再加一点提示（如下划线）？<br>
2. 对错图标统一后的观感（易错点 ✗/✓ · toast 勾 · 设置页勾）<br>
3. 播放按钮现状：绿 / 蓝两色（美音 vs 英音）、30 / 36rpx 两档尺寸<br>
4. 待排期：全量代码扫描专项、语法例句音频全量预生成（含慢速）
</div>
</div>
</div></body></html>`;

fs.writeFileSync(OUT, html.replace('<%= n1 %>', GRAM.reduce((a, c) => a + c.topics.length, 0)), 'utf8');
console.log('OK 效果图 → ' + OUT + '  (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB)');

// 附带输出「局部核对页」：无头截图无法滚动，整页长图看不清细节，用小页面做局部核对
const css = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
const mkLocal = (title, body) => '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + css + '</style></head>' +
  '<body><div class="wrap" style="max-width:432px;padding:16px">' + phone(title, body, 2) + '</div></body></html>';
fs.writeFileSync('D:/idea/_reviews/_phon_only.html', mkLocal('音标 · 两级筛选 + 常驻面板', phCard), 'utf8');
fs.writeFileSync('D:/idea/_reviews/_topic_only.html', mkLocal('语法点详情 · 开场白 + 易错点自绘', gramTopic), 'utf8');
fs.writeFileSync('D:/idea/_reviews/_tagview_only.html', mkLocal('语法速查 · 场景筛选', gramTagPage), 'utf8');
console.log('OK 局部核对页 ×3 → D:/idea/_reviews/_phon_only.html / _topic_only.html / _tagview_only.html');

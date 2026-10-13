// gen-tools-glossary-1194.js —— 「语法术语速查」卡实现后的效果图自检
//   数据/样式取自 utils/glossary.js + tools.wxss（rpx ÷ 2 = px）
const fs = require('fs');
const G = require('D:/idea/words/light/miniprogram/utils/glossary.js');

const POS = G.groups[0], TERM = G.groups[1];

const L = { bg:'#F3F8EF', card:'#FFFFFF', soft:'#F0F7F3', ink:'#24332F', ink4:'#43504C',
  muted3:'#66736E', green:'#176B5B', press:'#DCEFE7', greenPress:'#0F4A3E', line:'#E9F0EC' };
const D = { bg:'#0E1618', card:'#162324', soft:'#142220', ink:'#E4EEEA', ink4:'#BCCBC5',
  muted3:'#93A7A0', green:'#7CD6B4', press:'#233C36', greenPress:'#8FE0C0', line:'#223430' };

function chips(T, list, sel) {
  return list.map(x => `<span class="chip ${x.k === sel ? 'on' : ''}" style="background:${x.k === sel ? T.press : T.soft};color:${x.k === sel ? T.greenPress : T.green}">${x.k}</span>`).join('');
}
function panel(T, it) {
  return `<div class="panel" style="background:${T.soft};border-color:${T.line}">
    <div class="ph"><span class="big" style="color:${T.green}">${it.k}</span></div>
    <div class="bt" style="color:${T.green}">人话</div>
    <div class="bb" style="color:${T.ink4}">${it.d}</div>
    <div class="bt" style="color:${T.green}">例子</div>
    <div class="bb" style="color:${T.ink4}">${it.e}</div>
  </div>`;
}
const grpBar = (T, a, b, on) => `
  <div class="cls">
    <span class="cls1 ${on === a.id ? 'on' : ''}" style="background:${on === a.id ? T.press : T.soft};color:${on === a.id ? T.greenPress : T.muted3}">${a.name}<i style="color:${on === a.id ? T.greenPress : T.muted3}">${a.items.length}</i></span>
    <span class="cls1 ${on === b.id ? 'on' : ''}" style="background:${on === b.id ? T.press : T.soft};color:${on === b.id ? T.greenPress : T.muted3}">${b.name}<i style="color:${on === b.id ? T.greenPress : T.muted3}">${b.items.length}</i></span>
  </div>`;

function screen(title, T, grp, sel) {
  const list = grp.items, it = list.filter(x => x.k === sel)[0];
  return `<div class="item">
  <div class="cap">${title}</div>
  <div class="phone" style="background:${T.bg};color:${T.ink}">
    <div class="card" style="background:${T.card}">
      <div class="sl" style="color:${T.green}">语法术语速查（${POS.items.length + TERM.items.length} 条）</div>
      <div class="hint" style="color:${T.muted3}">${grp.hint}</div>
      ${grpBar(T, POS, TERM, grp.id)}
      <div class="grid">${chips(T, list, sel)}</div>
      ${panel(T, it)}
      <div class="tkn" style="color:${T.muted3}">术语按「词性缩写」和「语法术语」两类收口；词卡上遇到看不懂的标签，来这里查一条就走。</div>
    </div>
  </div></div>`;
}

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}
body{margin:0;padding:24px;background:#EEF3EA;font:13px/1.5 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#24332F}
.grid2{display:flex;gap:20px;align-items:flex-start}
.item{width:360px}
.cap{font-size:13px;font-weight:700;margin-bottom:7px}
.phone{width:360px;border-radius:22px;box-shadow:0 6px 20px rgba(15,74,62,.10);overflow:hidden;padding-bottom:6px}
.card{margin:12px;border-radius:12px;padding:14px;box-shadow:0 2px 9px rgba(23,107,91,.06)}
.sl{font-size:13px;font-weight:700;letter-spacing:.5px;margin-bottom:7px}
.hint{font-size:11.5px;line-height:1.7;margin-bottom:7px}
.cls{display:flex;gap:7px}
.cls1{flex:1;text-align:center;height:34px;line-height:34px;border-radius:7px;font-size:14px;font-weight:700}
.cls1 i{font-style:normal;font-size:12px;font-weight:600;margin-left:4px}
.grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.chip{padding:6px 11px;border-radius:7px;font-size:13px}
.panel{margin-top:12px;padding:11px 13px 9px;border-radius:8px;border:1px solid}
.ph{display:flex;align-items:baseline}
.big{font-size:20px;font-weight:800;line-height:1.15}
.bt{font-size:12px;font-weight:700;margin:10px 0 4px;letter-spacing:.5px}
.bb{font-size:13.5px;line-height:1.75}
.tkn{margin-top:8px;font-size:11.5px;line-height:1.7}
</style></head><body><div class="grid2">
${screen('浅色 · 词性缩写（默认进卡片看到的样子）', L, POS, 'n.')}
${screen('浅色 · 语法术语（点「宾格」）', L, TERM, '宾格')}
${screen('深色 · 语法术语（点「过去分词」）', D, TERM, '过去分词')}
</div></body></html>`;

fs.writeFileSync('D:/idea/_reviews/_tools_glossary_1194.html', html, 'utf8');
console.log('✓ -> D:/idea/_reviews/_tools_glossary_1194.html');

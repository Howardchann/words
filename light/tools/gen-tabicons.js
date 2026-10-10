// 生成 custom-tab-bar 四枚 tab 图标（灰/绿两态）的 data-URI SVG，注入 index.wxss 标记区。
// 改图标形状/颜色只改本文件再 node tools/gen-tabicons.js，勿手改 wxss 里的编码串。
const fs = require('fs');
const path = require('path');

const GREY = '#8B9893', GREEN = '#176B5B', RED = '#D85A30';
const SW = "stroke-width='1.8' fill='none'";

// 爱心中心约 (12,12.2)，缩放 0.70；外圈=单弧300°(缺口右上60°)+末端箭头V(3点钟位,朝上)，箭头-心最小间距 ≈3 格
const HEART_T = "transform='translate(12,12.2) scale(0.70) translate(-12,-12.2)'";

function svg(parts) {
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>${parts}</svg>`;
}
function enc(s) {
  return s.replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/ /g, '%20');
}

const icons = {
  // 选中态：红针依旧指 12 点（V8.5），绿针右下；**绿针后画**——中心尾部绿圆头压在红针尾部上面
  // （红色从绿针底下伸出）。红线若垫绿线会出现"红针露绿帽"（已翻车），故顺序必须是红先绿后。
  clock: (main, red) => svg(
    `<circle cx='12' cy='13' r='8' ${SW} stroke='${main}'/>` +
    (red
      ? `<path d='M12,13V8.5' ${SW} stroke='${RED}' stroke-linecap='round'/>` +
        `<path d='M12,13l3,2' ${SW} stroke='${main}' stroke-linecap='round'/>`
      : `<path d='M12,13V8.5M12,13l3,2' ${SW} stroke='${main}' stroke-linecap='round'/>`) +
    `<path d='M9,3h6' ${SW} stroke='${main}' stroke-linecap='round'/>`
  ),
  // 工具：工具箱（v1.1.67 定稿，取代初版扳手）。用户选定的「工具箱 + 红提手」方案：
  // 红只出现在选中态（未选中态整体单色灰、无红色元素——用户点名要求），选中态提手变红
  // （提手是工具箱最有辨识度的部位，且在最上方，视觉重心与其它三枚一致）。
  // 结构 = 箱体圆角矩形 + 箱缝横线 + 上方提手弧；箱体收窄到 x4~20（宽 16，与 clock 外圆同宽），
  // 提手 5 格宽 —— 初版箱体宽 18 比其它三枚墩一圈，实测对齐后更协调（见 _reviews/_iconalign.png）。
  tool: (main, red) => svg(
    `<rect x='4' y='8' width='16' height='12.5' rx='2.6' ${SW} stroke='${main}'/>` +
    `<path d='M4,13.6h16' ${SW} stroke='${main}'/>` +
    `<path d='M9.5,8V6.9a2.5,2.5 0 0 1 5,0V8' ${SW} stroke='${red ? RED : main}' stroke-linecap='round'/>`
  ),
  // 复习：单弧 300°（缺口在右上 60°），箭头V在弧末端(19.6,12)指向行进方向(上)，即逆时针↺「再来一遍」。
  // v1.1.67 尺寸归一：半径 7.8→7.6、箭头内收（尖端 21.2→20.6），使外接宽 ≈17.8 与另三枚一致。
  // 注意 sweep/large-arc 标志：圆心(12,12)时 3点→1点 逆时针仅存在 60° 小弧，300° 大弧必须 sweep=1
  // （或如现在这样：从1点起 sweep=0 逆时针绕到3点）。之前 sweep=0 从3点起画导致 SVG 换候选圆心(23.7,5.2)，弧变碎块。
  review: (main, red) => svg(
    `<path d='M15.8,5.42A7.6,7.6 0 1 0 19.6,12' ${SW} stroke='${main}' stroke-linecap='round'/>` +
    `<path d='M18.6,13.7L19.6,12L20.6,13.7' ${SW} stroke='${main}' stroke-linecap='round' stroke-linejoin='round'/>` +
    `<path d='M12,16.2c-2.3,-1.7 -4.2,-3.4 -4.7,-5 -0.5,-1.5 0.4,-2.9 1.8,-3.2 1,-0.2 2,0.3 2.9,1.4 0.9,-1.1 1.9,-1.6 2.9,-1.4 1.4,0.3 2.3,1.7 1.8,3.2 -0.5,1.6 -2.4,3.3 -4.7,5z' ${SW} stroke='${red ? RED : main}' stroke-linejoin='round' ${HEART_T}/>`
  ),
  // 设置：双轨滑块。v1.1.67 尺寸归一：轨道 5~19（宽 14）→ 4~20（宽 16），
  // 圆钮 r 2.4→2.8、上下轨 8/16 → 7.2/16.8；外接宽 17.8 / 高 17.0，与 clock 外圆一致。
  // 圆钮正好卡在轨道断口里（轨道让位给圆钮），所以四段轨道的端点必须跟着圆钮圆心走。
  set: (main, red) => svg(
    `<path d='M4,7.2h2.8M12.4,7.2H20M4,16.8h8.2M17.8,16.8H20' ${SW} stroke='${main}' stroke-linecap='round'/>` +
    `<circle cx='9.6' cy='7.2' r='2.8' ${SW} stroke='${main}'/>` +
    `<circle cx='15' cy='16.8' r='2.8' ${SW} stroke='${red ? RED : main}'/>`
  )
};

let css = '\n/* ==== tabicons:auto-start（由 tools/gen-tabicons.js 生成，勿手改） ==== */\n';
// 深色模式变体：灰→亮灰、绿→亮绿、红点缀→亮红（在编码串上直接换色，形状不动）
const darken = s => s.replace(/%238B9893/g, '%238FA39C').replace(/%23176B5B/g, '%237CD6B4').replace(/%23D85A30/g, '%23E8795F');
for (const [key, fn] of Object.entries(icons)) {
  css += `.i-${key}{background-image:url("data:image/svg+xml,${enc(fn(GREY, false))}")}\n`;
  css += `.i-${key}.on{background-image:url("data:image/svg+xml,${enc(fn(GREEN, true))}")}\n`;
  css += `.tabbar-dark .i-${key}{background-image:url("data:image/svg+xml,${darken(enc(fn(GREY, false)))}")}\n`;
  css += `.tabbar-dark .i-${key}.on{background-image:url("data:image/svg+xml,${darken(enc(fn(GREEN, true)))}")}\n`;
}
css += '/* ==== tabicons:auto-end ==== */\n';

const wxssPath = path.join(__dirname, '..', 'miniprogram', 'custom-tab-bar', 'index.wxss');
let text = fs.readFileSync(wxssPath, 'utf8');
const START = '/* ==== tabicons:auto-start', END = '/* ==== tabicons:auto-end ==== */';
const si = text.indexOf(START), ei = text.indexOf(END);
if (si >= 0 && ei >= 0) {
  text = text.slice(0, si) + css.trim() + '\n' + text.slice(ei + END.length);
} else {
  text = text.trimEnd() + '\n' + css;
}
fs.writeFileSync(wxssPath, text);
console.log('OK 已写入', wxssPath, '（8 个图标变体）');

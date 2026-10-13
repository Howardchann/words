// gen-tools-rec-1194.js —— 工具页顶部「学习记录」卡改版效果图（现状 / 方案A 无标题 / 方案B 带标题）
//   配色/尺寸全部取自 app.wxss 与 tools.wxss 的真实规则（rpx ÷ 2 = px）。
//   输出：D:/idea/_reviews/_tools_rec_1194.html
const fs = require('fs');
const MP = 'D:/idea/words/light/miniprogram';

const L = {
  bg: '#F3F8EF', card: '#FFFFFF', soft: '#F0F7F3', soft2: '#E6F4EE',
  ink: '#24332F', ink2: '#5F6D68', muted3: '#66736E', muted4: '#7B8A84',
  green: '#176B5B', line: '#E9F0EC', press: '#DCEFE7', cardLine: '#DCE7DF'
};

// ── 顶部三格（现状 + 新版共用）──
function recRow3(T) {
  const cell = (n, unit, label) => `
      <div class="ri">
        <div class="rn" style="color:${T.green}">${n}<span class="ru">${unit}</span></div>
        <div class="rl" style="color:${T.muted3}">${label}</div>
      </div>`;
  return `<div class="rr">${cell(12, '天', '已学')}<div class="rdiv" style="background:${T.line}"></div>${cell(186, '个', '已学单词')}<div class="rdiv" style="background:${T.line}"></div>${cell(456, '天', '预计还剩')}</div>`;
}

// ── 两个入口格（新版才有）—— 沿用设置页 .stat-item--tap / .stat-num / .stat-arrow 那套视觉 ──
function entryRow(T) {
  const cell = (label, n) => `
      <div class="ei">
        <div class="en" style="color:${T.green}">${n}<i class="go" style="color:${T.muted3}"></i></div>
        <div class="el" style="color:${T.muted3}">${label}</div>
      </div>`;
  return `<div class="er" style="border-top:1px solid ${T.line}">${cell('重点词', 24)}${cell('复习记录', 8)}</div>`;
}

// ── 三块屏 ──
const phone = (title, T, body, cap) => `
<div class="item">
  <div class="cap">${title}</div>
  <div class="phone" style="background:${T.bg};color:${T.ink}">
    <div class="nav">工具</div>
    ${body}
    <div class="ghost" style="background:${T.card}">
      <div class="gl" style="color:${T.green}">查单词</div>
      <div class="gbar" style="background:${T.soft}"><span class="gph" style="color:${T.muted4}">输入单词或中文释义</span></div>
      <div class="ghint" style="color:${T.muted4}">全库共 8115 个单词；只输入前几个字母也能搜到。</div>
    </div>
  </div>
  <div class="note">${cap}</div>
</div>`;

// 现状：工具页只有三格
const cur = `<div class="card" style="background:${L.card}">${recRow3(L)}</div>`;
// 方案A：三格 + 两入口，无卡标题
const va = `<div class="card" style="background:${L.card}">${recRow3(L)}${entryRow(L)}</div>`;
// 方案B：同上 + 卡标题「学习记录」
const vb = `<div class="card" style="background:${L.card}"><div class="sl" style="color:${L.green}">学习记录</div>${recRow3(L)}${entryRow(L)}</div>`;

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}
body{margin:0;padding:24px;background:#EEF3EA;font:13px/1.5 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#24332F}
.grid{display:flex;gap:20px;align-items:flex-start}
.item{width:326px}
.cap{font-size:13px;font-weight:700;margin-bottom:7px}
.note{margin-top:8px;font-size:11.5px;line-height:1.7;color:#53605B}
.phone{width:326px;border-radius:22px;box-shadow:0 6px 20px rgba(15,74,62,.10);overflow:hidden;padding-bottom:4px}
.nav{height:54px;font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center}
/* .card：app.wxss —— radius 24rpx / margin 20rpx 24rpx / shadow */
.card{margin:10px 12px;border-radius:12px;padding:15px 14px 11px;box-shadow:0 2px 9px rgba(23,107,91,.06)}
/* .section-label：26rpx / 700 / margin-bottom 14rpx / letter-spacing 1rpx */
.sl{font-size:13px;font-weight:700;letter-spacing:.5px;margin-bottom:7px}
/* 三格（rec-card 现状样式） */
.rr{display:flex;align-items:center}
.ri{flex:1;text-align:center}
.rdiv{width:1px;height:34px}
.rn{font-size:28px;line-height:1.1;font-weight:800;font-variant-numeric:tabular-nums}
.ru{font-size:12px;font-weight:600;margin-left:3px}
.rl{margin-top:3px;font-size:12px}
/* 两入口格（沿用设置页 .stat-item--tap / .stat-num 40rpx / .stat-arrow 12rpx chevron） */
.er{display:flex;justify-content:space-around;margin-top:14px;padding-top:14px}
.ei{text-align:center;padding:4px 10px;border-radius:6px}
.en{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums}
.go{display:inline-block;width:6px;height:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg);margin-left:4px;vertical-align:4px}
.el{margin-top:3px;font-size:12px}
/* 下一张卡（查单词）示意，压暗表示「在它下面」 */
.ghost{margin:10px 12px;border-radius:12px;padding:12px 14px;opacity:.5}
.gl{font-size:13px;font-weight:700;margin-bottom:7px}
.gbar{height:38px;border-radius:19px;display:flex;align-items:center;padding:0 11px}
.gph{font-size:14px}
.ghint{margin-top:8px;font-size:12px;line-height:1.7}
</style></head><body>
<div class="grid">
  ${phone('现状（今天）', L, cur, '工具页顶部只有三格进度；「重点词 / 复习记录」在<b>设置页</b>顶部，点了才跳复习页，绕路。')}
  ${phone('方案 A · 合并到工具页，不加标题', L, va, '三格进度 + 一条分隔线 + 两个入口格，一张卡讲完。数字仍是主角，卡上没有标题。')}
  ${phone('方案 B · 合并到工具页，加卡标题', L, vb, '同方案 A，加「学习记录」标题 —— 与下方「查单词 / 音标 / 语法速查」每张卡都有标题的做法一致。')}
</div>
</body></html>`;

fs.writeFileSync('D:/idea/_reviews/_tools_rec_1194.html', html, 'utf8');
console.log('✓ HTML -> D:/idea/_reviews/_tools_rec_1194.html');

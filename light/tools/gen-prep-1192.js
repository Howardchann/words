// gen-prep-1192.js —— 准备期方案④（单主按钮 + 文字链接）实现后的效果图自检
//   取值全部来自本次真正写进 today.wxss 的规则（rpx ÷ 2 = px）+ app.wxss 主题 token。
//   输出：D:/idea/_reviews/_prep1192_impl.html（浅色 / 深色两屏，核对实心绿对比度）
const fs = require('fs');
const MP = require('path').join(__dirname, '..', 'miniprogram');

const appNoCmt = fs.readFileSync(MP + '/app.wxss', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const m = appNoCmt.match(/\.ico-heart\s*\{[^}]*?url\("([^"]+)"\)/);
const HEART = m ? m[1] : '';

const L = { bg: '#F3F8EF', card: '#FFFFFF', soft: '#F0F7F3', ink: '#24332F', ink3: '#53605B', muted3: '#66736E', green: '#176B5B', solid: '#176B5B', line: '#DCE7DF' };
const D = { bg: '#0E1618', card: '#162324', soft: '#142220', ink: '#E4EEEA', ink3: '#A9BBB4', muted3: '#93A7A0', green: '#7CD6B4', solid: '#1E5A4B', line: '#223430' };

const screen = (title, T) => `
<div class="item">
  <div class="cap">${title}</div>
  <div class="phone" style="background:${T.bg};color:${T.ink}">
    <div class="nav">今日单词</div>
    <div class="card" style="background:${T.card}">
      <div class="pt" style="color:${T.green}">准备期</div>
      <div class="ps" style="color:${T.muted3}">先熟悉一下，随时可以开始</div>
      <div class="pn" style="color:${T.muted3}">还没有学习记录 · 点「开始学习」即开学</div>
      <div class="tip" style="background:${T.soft}"><span style="color:${T.ink3}">可以先看看第 1 天的单词，熟悉一下操作：点音标模块听发音（美音 / 英音各读各的），点<i class="ih" style="background-image:url('${HEART}')"></i>收藏重点词</span></div>
      <div class="start" style="background:${T.solid}"><span>开始学习</span><i class="go1"></i></div>
      <div class="prev"><span style="color:${T.green}">先看看第 1 天（只预览）</span><i class="go2" style="color:${T.green}"></i></div>
    </div>
    <div class="tabbar" style="background:${T.card};border-top:1px solid ${T.line}">
      <div class="tb on" style="color:${T.green}">Today</div>
      <div class="tb" style="color:${T.muted3}">Review</div>
      <div class="tb" style="color:${T.muted3}">Tools</div>
      <div class="tb" style="color:${T.muted3}">Settings</div>
    </div>
  </div>
</div>`;

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}
body{margin:0;padding:24px;background:#EEF3EA;font:13px/1.5 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif}
.grid{display:flex;gap:22px;align-items:flex-start}
.item{width:326px}
.cap{font-size:13px;font-weight:700;color:#24332F;margin-bottom:6px}
.phone{width:326px;border-radius:22px;box-shadow:0 6px 20px rgba(15,74,62,.10);overflow:hidden}
.nav{height:54px;font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center}
.card{margin:9px 10px;border-radius:11px;padding:26px 13px;text-align:center}
.pt{font-size:17.5px;font-weight:800}
.ps{font-size:12px;margin-top:6px}
.pn{font-size:12px;margin:12px 0 3px}
.tip{border-radius:6px;padding:9px 10px;margin-top:9px;text-align:left;font-size:11.5px;line-height:1.75}
.ih{display:inline-block;width:1em;height:1em;vertical-align:-.125em;margin:0 2px;background-position:center;background-size:contain;background-repeat:no-repeat}
/* ↓↓ 本次真正写进 today.wxss 的 .prestart-start / .prestart-preview（rpx÷2）↓↓ */
.start{display:flex;align-items:center;justify-content:center;height:46px;margin-top:11px;border-radius:999px;box-shadow:0 4px 12px rgba(23,107,91,.22)}
.start span{font-size:15px;font-weight:700;color:#fff}
.go1{width:7px;height:7px;margin-left:8px;border-right:1.5px solid #fff;border-bottom:1.5px solid #fff;transform:rotate(-45deg)}
.prev{display:flex;align-items:center;justify-content:center;margin-top:13px;padding:5px 0}
.prev span{font-size:12.5px;font-weight:600}
.go2{width:6px;height:6px;margin-left:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg)}
.tabbar{height:50px;display:flex}
.tb{flex:1;display:flex;align-items:center;justify-content:center;font-size:10px}
.tb.on{font-weight:700}
</style></head><body><div class="grid">${screen('浅色主题（真机默认）', L)}${screen('深色主题（核对实心绿 + 白字对比度）', D)}</div></body></html>`;

fs.writeFileSync('D:/idea/_reviews/_prep1192_impl.html', html, 'utf8');
console.log('✓ written, heart icon:', HEART ? 'ok' : 'MISSING');

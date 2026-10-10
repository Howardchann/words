// 浮窗 dock 效果图生成（探讨用，不动小程序代码）。
// 图标直接抽自 custom-tab-bar/index.wxss 的 tabicons:auto 段 —— 看到的即真机所得。
// 产出：D:/idea/_reviews/dock-float/index.html（发布到 p6-rewrite-review 预览链接）
const fs = require('fs');

const wxss = fs.readFileSync(__dirname + '/../miniprogram/custom-tab-bar/index.wxss', 'utf8');
function pick(sel) {
  const re = new RegExp(sel.replace(/\./g, '\\.') + '\\{background-image:url\\("([^"]+)"\\)\\}');
  const m = wxss.match(re);
  if (!m) throw new Error('未命中 ' + sel);
  return m[1];
}
// 浮窗选中态可能要「整枚变绿」的效果，这里额外把灰版 SVG 的 stroke 换成品牌绿（仅效果图用）
function toGreen(uri) { return uri.replace(/%238B9893/g, '%23176B5B'); }

const ICO = {
  clock:  pick('.i-clock'),  clockOn:  pick('.i-clock.on'),
  review: pick('.i-review'), reviewOn: pick('.i-review.on'),
  tool:   pick('.i-tool'),   toolOn:   pick('.i-tool.on'),
  set:    pick('.i-set'),    setOn:    pick('.i-set.on'),
};
// 高德式「选中图标整枚变绿」的近似：灰版描边全部替换（clockOn 等本身含橙色点缀，浮窗版不用它们）
const ICO_ALLGREEN = {
  clock: toGreen(ICO.clock), review: toGreen(ICO.review), tool: toGreen(ICO.tool), set: toGreen(ICO.set),
};

const bgCard = '#FFFFFF', line = '#E8EFEB', page = '#F3F7F5', ink = '#26332F', muted = '#8B9893', green = '#176B5B';
const dPage = '#0E1719', dCard = '#131F21', dLine = '#223430', dInk = '#E5EDE9', dMuted = '#7E938B', dGreen = '#7CD6B4';

// 模拟一个今日页的极简内容底（词卡两枚），只为衬托 dock，不代表页面全部内容
function pageBody(dark) {
  const c = dark ? dCard : bgCard, l = dark ? dLine : line, i = dark ? dInk : ink, p = dark ? dPage : page, m = dark ? dMuted : muted;
  return `<div style="background:${p};padding:14px 14px 4px;border-radius:12px 12px 0 0;height:100%;box-sizing:border-box">
  <div style="color:${i};font-weight:700;font-size:15px">今日单词</div>
  <div style="color:${m};font-size:11px;margin:2px 0 10px">第 312 天 · 周五</div>
  <div style="background:${c};border:1px solid ${l};border-radius:12px;padding:10px 12px;margin-bottom:8px">
    <div style="color:${i};font-weight:700;font-size:14px">achieve <span style="color:${m};font-weight:400;font-size:11px">v. 达到；实现</span></div>
    <div style="color:${m};font-size:11px;margin-top:3px">She worked hard to achieve her goal.</div>
  </div>
  <div style="background:${c};border:1px solid ${l};border-radius:12px;padding:10px 12px">
    <div style="color:${i};font-weight:700;font-size:14px">gain <span style="color:${m};font-weight:400;font-size:11px">v. 获得；增加</span></div>
    <div style="color:${m};font-size:11px;margin-top:3px">He gained a lot of experience.</div>
  </div>
</div>`;
}

// ---- dock 渲染 ----
// type: flat 现状 / gaode 高德浮窗 / pill 胶囊 / float-active 浮窗+选中色块
function dock(type, dark, activeIdx) {
  const tabs = [
    { t: 'Today',   n: dark ? '.tabbar-dark .i-clock' : '', ico: ICO.clock,  on: ICO.clockOn  },
    { t: 'Review',  ico: ICO.review, on: ICO.reviewOn },
    { t: 'Tools',   ico: ICO.tool,   on: ICO.toolOn   },
    { t: 'Settings',ico: ICO.set,    on: ICO.setOn    },
  ];
  const c = dark ? dCard : bgCard, l = dark ? dLine : line, m = dark ? dMuted : muted, g = dark ? dGreen : green;
  const shadow = dark ? '0 8px 24px rgba(0,0,0,.5)' : '0 8px 28px rgba(23,107,91,.18)';
  const blur = dark ? 'rgba(19,31,33,.72)' : 'rgba(255,255,255,.82)';

  if (type === 'flat') {
    return `<div style="position:absolute;left:0;right:0;bottom:0;background:${c};border-top:1px solid ${l};display:flex;padding:8px 0 18px">
      ${tabs.map((x, k) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">
        <div style="width:23px;height:23px;background:url('${k === activeIdx ? x.on : x.ico}') center/contain no-repeat"></div>
        <div style="font-size:11px;color:${k === activeIdx ? g : m};font-weight:${k === activeIdx ? 700 : 400}">${x.t}</div>
      </div>`).join('')}</div>`;
  }

  if (type === 'pill') {
    return `<div style="position:absolute;left:50%;transform:translateX(-50%);bottom:26px;background:${blur};backdrop-filter:blur(14px);border:1px solid ${l};border-radius:34px;display:flex;padding:7px 6px;box-shadow:${shadow}">
      ${tabs.map((x, k) => `<div style="width:62px;display:flex;flex-direction:column;align-items:center;gap:1px">
        <div style="width:21px;height:21px;background:url('${k === activeIdx ? x.on : x.ico}') center/contain no-repeat;transform:scale(${k === activeIdx ? 1.08 : 1})"></div>
        <div style="font-size:10px;color:${k === activeIdx ? g : m};font-weight:${k === activeIdx ? 700 : 400}">${x.t}</div>
      </div>`).join('')}</div>`;
  }

  // gaode / float-active 共用浮窗壳
  const inner = tabs.map((x, k) => {
    const on = k === activeIdx;
    const ico = (type === 'float-active') ? (on ? x.on : x.ico) : (on ? ICO_ALLGREEN[['clock','review','tool','set'][k]] : x.ico);
    const scale = on ? 1.12 : 1;
    const pillBg = (type === 'float-active' && on) ? (dark ? 'rgba(124,214,180,.14)' : '#E6F4EE') : 'transparent';
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;background:${pillBg};border-radius:14px;padding:5px 0">
      <div style="width:22px;height:22px;background:url('${ico}') center/contain no-repeat;transform:scale(${scale});transition:transform .2s"></div>
      <div style="font-size:10.5px;color:${on ? g : m};font-weight:${on ? 700 : 400}">${x.t}</div>
    </div>`;
  }).join('');
  return `<div style="position:absolute;left:14px;right:14px;bottom:22px;background:${blur};backdrop-filter:blur(14px);border:1px solid ${l};border-radius:22px;display:flex;padding:5px 4px;box-shadow:${shadow}">${inner}</div>`;
}

function phone(type, dark, label, note) {
  const dp = dark ? dPage : page;
  return `<div style="width:250px;flex-shrink:0">
  <div style="font-size:13px;font-weight:700;color:${dark ? dInk : ink};margin:0 0 2px">${label}</div>
  <div style="font-size:11px;color:${dark ? dMuted : muted};line-height:1.6;margin-bottom:8px;min-height:34px">${note}</div>
  <div style="width:250px;height:430px;border-radius:26px;border:1px solid ${dark ? dLine : line};overflow:hidden;position:relative;background:${dp};box-shadow:0 10px 30px rgba(0,0,0,${dark ? .5 : .08})">
    <div style="height:calc(100% - 0px);overflow:hidden">${pageBody(dark)}</div>
    ${dock(type, dark, 0)}
  </div>
</div>`;
}

const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>浮窗 dock 方案 · ielts-365</title></head>
<body style="margin:0;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;background:#EAF0ED">
<div style="max-width:1140px;margin:0 auto;padding:26px 18px 40px">
  <div style="font-size:20px;font-weight:800;color:#0F4A3E">浮窗 dock 方案对比（4 版 × 明暗）</div>
  <div style="font-size:12.5px;color:#5E6E68;margin:6px 0 4px;line-height:1.8">
    图标全部实抽自 <code>custom-tab-bar/index.wxss</code>，文字为 v1.1.71 的 Today / Review / Tools / Settings；页面内容为今日页示意。真机未动 —— 定稿后才改代码。</div>
  <div style="font-size:12.5px;color:#5E6E68;margin:0 0 18px;line-height:1.8">
    共同代价（4 版都要面对）：4 个 tab 页底部要加「浮窗高度」的内容留白，否则最后一行被遮；safe-area 适配重写；页面背景色与浮窗衔接要调。</div>

  <div style="display:flex;gap:22px;flex-wrap:wrap;margin-bottom:26px">
    ${phone('flat', false, '现状（对照组）', '贴底白条 + 顶部细分割线。所有改动都拿它当基准。')}
    ${phone('gaode', false, '方案 V1 · 高德同款浮窗（推荐）', '悬浮圆角 + 毛玻璃 + 大阴影；选中 = 图标放大 12% + 整枚变绿，不铺色块。最贴近高德/现代 App 观感。')}
    ${phone('pill', false, '方案 V2 · 居中胶囊', '比 V1 更窄、更轻盈，四周留白更多；代价是 4 项挤在中间，两翼空、单手够边距远。')}
    ${phone('float-active', false, '方案 V3 · 浮窗 + 选中色块', '浮窗壳同 V1，但选中项恢复浅绿胶囊底（现状被注释掉的思路）。选中感最强，但和「图标已分双色」的减重决策相悖。')}
  </div>

  <div style="font-size:16px;font-weight:800;color:#0F4A3E;margin:6px 0 12px">深色模式</div>
  <div style="display:flex;gap:22px;flex-wrap:wrap">
    ${phone('flat', true, '现状（对照组）', '深色底 #131F21，选中亮绿 #7CD6B4。')}
    ${phone('gaode', true, '方案 V1 · 高德同款浮窗', '深色毛玻璃（72% 不透明），阴影加重；亮绿描边图标在暗底上对比足够。')}
    ${phone('pill', true, '方案 V2 · 居中胶囊', '深色下胶囊边界更弱，浮空感更强，也更考验阴影。')}
    ${phone('float-active', true, '方案 V3 · 浮窗 + 选中色块', '亮绿 14% 透明底做选中胶囊，暗色下比浅色版更和谐。')}
  </div>

  <div style="margin-top:26px;background:#fff;border:1px solid ${line};border-radius:14px;padding:16px 18px;max-width:640px">
    <div style="font-size:14px;font-weight:700;color:#0F4A3E;margin-bottom:6px">选型参考</div>
    <div style="font-size:12.5px;color:#3C4A46;line-height:2">
      ① 我推荐 <b>V1</b>：浮窗感最完整、图标双色体系不动、深浅两态都稳；<br>
      ② V2 好看但 4 项居中后单手点最右边的 Settings 变远；<br>
      ③ V3 的选中色块会把「去考试色彩」的减重逻辑倒回去一点，除非你更喜欢强选中感；<br>
      ④ 定稿后改动集中在 custom-tab-bar（壳样式）+ 4 页底部 padding，1~2 处媒体查询，工作量小、风险低。
    </div>
  </div>
</div>
</body></html>`;

const outDir = 'D:/idea/_reviews/dock-float';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outDir + '/index.html', html);
console.log('written', outDir + '/index.html', html.length);

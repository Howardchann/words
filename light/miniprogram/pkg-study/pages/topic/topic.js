// pkg-study/pages/topic/topic.js —— 语法点详情（分包页）
// 内容：人话开场白 + 定义 / 用法 / 易错点 / 例句（可朗读）/ 课程对应哪几天（可跳到课程原文）
const GRAMMAR = require('../../data/grammar.js');
const theme = require('../../../utils/theme.js');
const speech = require('../../../utils/speech.js');
const store = require('../../../utils/store.js');

const MAX_DAYS = 24;   // 课程对应天数最多列这么多，超出只提示总数（避免个别基础语法点挂满整页）

// ---------- 易错点解析（v1.1.68 起）----------
// 数据源是一整串自由文本：「❌ 错句 ✅ 对句（原因）」、只有错句、或完全不含标记的提示句，格式不统一。
// 这里只负责把标记切成结构化片段（bad / good + 文本），**显示标记是模板的事**。
// 标记演进：emoji ❌✅（v1.1.67）→ 字符 ✗/✓（v1.1.68）→ 自绘 SVG（v1.1.70）。
// 之所以最终落到 SVG：✗/✓ 两个字符在真机字体里由不同字形族兜底，粗细/大小/边距不一致，像两套图标。
// 注意：数据源里的 ❌✅ 标记保持不变（grammar.js 未改），下面这段正则仍然按 ❌/✅ 切分。
function splitWhy(v) {
  const m = /^([\s\S]*?)\s*（([^（）]*)）\s*$/.exec(v);
  return m ? { v: m[1].trim(), why: m[2].trim() } : { v: String(v).trim(), why: '' };
}
// 易错点正确句的「播放文本」（v1.1.82）——数据里的展示文本常把英文句和中文说明连在一起
// （如「I need some advice. 不可数名词要表示数量用…」），而引擎对含中文文本会跳过 g/ 桶预生成、
// 直接走在线 TTS → 音色与全站不一致且慢（用户真机反馈）。故朗读只取英文部分，显示仍用原文。
// ⚠️ 口径必须与生成脚本 _ipa_build/_sayof.js 完全一致（哈希按文本算，差一个字符就命中不到）。
function sayOf(v) {
  var s = String(v || '').trim();
  if (!s) return '';
  if (!/[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]/.test(s)) {   // 纯英文/数字：原样
    s = s.replace(/[\u2026]+$/, '').trim();
    return /[A-Za-z]/.test(s) ? s : '';
  }
  var m = /[.!?\u2026]/.exec(s);
  var cut = m ? m.index + 1 : s.length;
  var c = /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]/.exec(s);
  if (c && c.index < cut) cut = c.index;
  s = s.slice(0, cut).trim().replace(/\s+/g, ' ').replace(/[\u2026]+$/, '').trim();
  return /[A-Za-z]/.test(s) ? s : '';
}
function parseNotes(arr) {
  const out = [];
  (arr || []).forEach((raw, idx) => {
    const s = String(raw || '');
    if (s.indexOf('❌') < 0 && s.indexOf('✅') < 0) {
      out.push({ k: 'n' + idx, kind: 'text', v: s });
      return;
    }
    const first = s.search(/[❌✅]/);
    const head = first > 0 ? s.slice(0, first).trim() : '';   // 标记前的引导语，如「范围要分清：」
    const segs = [];
    const re = /(❌|✅)([^❌✅]*)/g;
    let m;
    while ((m = re.exec(s))) {
      segs.push({ t: m[1] === '❌' ? 'bad' : 'good', v: m[2].trim(), i: segs.length });
    }
    let why = '';
    if (segs.length) {                                        // 末段若以「（原因）」结尾 → 摘出来单独一行
      const r = splitWhy(segs[segs.length - 1].v);
      segs[segs.length - 1].v = r.v;
      why = r.why;
    }
    segs.forEach(sg => { sg.say = sg.t === 'good' ? sayOf(sg.v) : ''; });   // v1.1.82 播放文本（无英文则空 → 不渲染喇叭）
    out.push({ k: 'n' + idx, kind: 'fix', head: head, segs: segs, why: why });
  });
  return out;
}

Page({
  data: {
    catName: '',
    t: null,
    notes: [],
    days: [],
    dayMore: 0,
    playingText: '',
    toast: '',
  },

  onLoad(query) {
    theme.applyPage(this);
    speech.setRate(store.get('rate'));
    speech.setAccent(store.get('accent') || 'us');
    speech.setEngineMode(store.get('engineMode') || 'auto');
    // 朗读状态订阅（v1.1.68 修复）：此前只在点击时 setData({playingText})，播完没有任何回调复位 →
    // 例句整行常驻深色（用户真机反馈）。现在与今日页/工具页一致，订阅回调、播完自动还原。
    // v1.1.80（治闪动）：撤销卡拉OK逐帧推送 —— 原来每次进度回调（约每秒 4 次）都 setData
    // karaLit/karaRest，整页例句行全部重算重绘，页面中部整块闪（用户真机描述「滑到底部闪上半屏、
    // 滑到顶部闪下半屏」）。现在只在「播放文本」本身变化时才 setData，一次播放最多 2 次。 */
    this._offSpeech = speech.onStateChange((p) => {
      const t = p.playing ? p.text : '';
      if (t !== this.data.playingText) this.setData({ playingText: t });
    });
    const cat = GRAMMAR.filter(c => c.id === (query && query.c))[0];
    const t = cat && cat.topics[Number(query && query.i) || 0];
    if (!cat || !t) { this.tip('内容缺失'); return; }
    const all = (t.days || []).map(d => ({ d: d }));
    // 导航栏短标题（v1.1.80）：本页是系统「原生导航栏」（非自定义），原生标题固定单行 + 超出省略，
    // 长语法点名（如「英语句子的基本结构」）在真机上尾部被截成省略号（用户反馈）。
    // 改用分类名（如「句子基础」）——完整标题本来就在下方头卡里，导航栏只作位置提示。
    wx.setNavigationBarTitle({ title: cat.name });
    const notes = parseNotes(t.note);
    this.setData({
      catName: cat.name,
      t: t,
      notes: notes,
      days: all.slice(0, MAX_DAYS),
      dayMore: Math.max(0, all.length - MAX_DAYS),
    });
    // 易错点正确句的音频预取（v1.1.82）：音频在 g/ 桶（云盘），但 prefetch 此前只认词表编号、
    // 语法例句 ai=0 被挡 → 从未预热，每次点击都要等云函数签名 + 下载（真机「点击很久才播放」）。
    // diskLimit=0：只签链接不落盘（省流量），点击时直接命中已签链接。
    const says = [];
    notes.forEach(n => {
      if (n.kind !== 'fix') return;
      (n.segs || []).forEach(sg => { if (sg.t === 'good' && sg.say && says.indexOf(sg.say) < 0) says.push(sg.say); });
    });
    if (says.length) speech.prefetch(says.map(x => ({ text: x })), 0);
  },
  onShow() { theme.applyPage(this); },
  onHide() { speech.stop(); },
  onUnload() {
    speech.stop();
    if (this._offSpeech) { this._offSpeech(); this._offSpeech = null; }
  },

  onSpeakEx(e) {
    const text = e.currentTarget.dataset.text;
    if (!text) return;
    if (this.data.playingText === text) {
      speech.togglePause();
      this.setData({ playingText: '' });
      return;
    }
    this.setData({ playingText: text });
    // 语法例句无词表编号 → kind 传 's' 且 ai=0，引擎按文本哈希去 g/ 桶取预生成音频，
    // 命中不到才降级在线。音色与今日页/工具页统一（Azure Ava）。
    speech.speak(text, { kind: 's' });
  },

  // 跳到课程里讲过这个语法点的那一天（switchTab 不能带参 → 走 globalData 中转）
  goDay(e) {
    const d = Number(e.currentTarget.dataset.d) || 0;
    if (!d) return;
    speech.stop();
    const app = getApp();
    if (app && app.globalData) { app.globalData.jumpDay = d; app.globalData.jumpWord = ''; }
    wx.switchTab({ url: '/pages/today/today', fail: () => this.tip('跳转失败，请再点一次') });
  },

  tip(msg) {
    this.setData({ toast: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toast: '' }), 1500);
  },
});

// pkg-study/pages/topic/topic.js —— 语法点详情（分包页）
// 内容：人话开场白 + 定义 / 用法 / 易错点 / 例句（可朗读）/ 课程对应哪几天（可跳到课程原文）
const GRAMMAR = require('../../data/grammar.js');
const theme = require('../../../utils/theme.js');
const speech = require('../../../utils/speech.js');
const store = require('../../../utils/store.js');

const MAX_DAYS = 24;   // 课程对应天数最多列这么多，超出只提示总数（避免个别基础语法点挂满整页）

// ---------- 易错点解析（v1.1.68）----------
// 数据源是一整串自由文本：「❌ 错句 ✅ 对句（原因）」、只有错句、或完全不含标记的提示句，格式不统一。
// 进页面时一次性切成结构化片段，模板就能用自绘 ✗/✓ 渲染 —— 不再用系统 emoji ❌✅
// （emoji 与全站线稿图标不是一套，且部分机型字号/基线不稳）。
function splitWhy(v) {
  const m = /^([\s\S]*?)\s*（([^（）]*)）\s*$/.exec(v);
  return m ? { v: m[1].trim(), why: m[2].trim() } : { v: String(v).trim(), why: '' };
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
    this._offSpeech = speech.onStateChange((p) => {
      const t = p.playing ? p.text : '';
      if (t !== this.data.playingText) this.setData({ playingText: t });
    });
    const cat = GRAMMAR.filter(c => c.id === (query && query.c))[0];
    const t = cat && cat.topics[Number(query && query.i) || 0];
    if (!cat || !t) { this.tip('内容缺失'); return; }
    const all = (t.days || []).map(d => ({ d: d }));
    wx.setNavigationBarTitle({ title: t.t });
    this.setData({
      catName: cat.name,
      t: t,
      notes: parseNotes(t.note),
      days: all.slice(0, MAX_DAYS),
      dayMore: Math.max(0, all.length - MAX_DAYS),
    });
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

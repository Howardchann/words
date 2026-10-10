// pkg-study/pages/topic/topic.js —— 语法点详情（分包页）
// 四块内容：用法 / 易错点 / 例句（可朗读）/ 课程对应哪几天（可跳到课程原文）；开头是定义
const GRAMMAR = require('../../data/grammar.js');
const theme = require('../../../utils/theme.js');
const speech = require('../../../utils/speech.js');
const store = require('../../../utils/store.js');

const MAX_DAYS = 24;   // 课程对应天数最多列这么多，超出只提示总数（避免个别基础语法点挂满整页）

Page({
  data: {
    catName: '',
    t: null,
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
    const cat = GRAMMAR.filter(c => c.id === (query && query.c))[0];
    const t = cat && cat.topics[Number(query && query.i) || 0];
    if (!cat || !t) { this.tip('内容缺失'); return; }
    const all = (t.days || []).map(d => ({ d: d }));
    wx.setNavigationBarTitle({ title: t.t });
    this.setData({
      catName: cat.name,
      t: t,
      days: all.slice(0, MAX_DAYS),
      dayMore: Math.max(0, all.length - MAX_DAYS),
    });
  },
  onShow() { theme.applyPage(this); },
  onHide() { speech.stop(); },
  onUnload() { speech.stop(); },

  onSpeakEx(e) {
    const text = e.currentTarget.dataset.text;
    if (!text) return;
    if (this.data.playingText === text) {
      speech.togglePause();
      this.setData({ playingText: '' });
      return;
    }
    this.setData({ playingText: text });
    // ai=0 → 不走预生成，直接在线朗读（引擎链内部自己兜底）
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

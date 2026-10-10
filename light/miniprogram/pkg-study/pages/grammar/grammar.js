// pkg-study/pages/grammar/grammar.js —— 语法速查 · 体系目录（分包页）
//
// 为什么在分包：71 个语法点全文（讲解 + 例句）约 50KB，放主包会顶到 2048KB 上限。
// 主包只留 12 个分类目录（utils/study-cats.js），点分类才把分包拉下来。
//
// 本页刻意不使用任何自定义组件（原生导航栏 + 自绘轻提示）：
// 分包只依赖主包的 JS 模块（require ../../../utils/...），把组件解析的风险降到零。
const GRAMMAR = require('../../data/grammar.js');
const theme = require('../../../utils/theme.js');
const speech = require('../../../utils/speech.js');
const store = require('../../../utils/store.js');

Page({
  data: {
    cats: GRAMMAR,
    open: '',        // 展开的分类 id
    q: '',           // 过滤关键词
    hits: [],        // 过滤命中 [{t, def, c, i, catName}]
    total: GRAMMAR.reduce((a, c) => a + c.topics.length, 0),
    toast: '',
  },

  onLoad(query) {
    theme.applyPage(this);
    speech.setRate(store.get('rate'));
    speech.setAccent(store.get('accent') || 'us');
    speech.setEngineMode(store.get('engineMode') || 'auto');
    // 从工具页点分类进来时带上 ?cat=xxx → 直接展开该分类
    const cat = (query && query.cat) || '';
    if (cat) this.setData({ open: cat });
  },
  onShow() { theme.applyPage(this); },
  onHide() { speech.stop(); },
  onUnload() { speech.stop(); },

  onToggle(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ open: this.data.open === id ? '' : id });
  },

  // 过滤：71 条不建索引，直接现扫（<1ms）；输入框不自动聚焦，不存在键盘闪的问题
  onInput(e) {
    const q = String(e.detail.value || '').trim();
    if (!q) { this.setData({ q: '', hits: [] }); return; }
    const lq = q.toLowerCase();
    const hits = [];
    this.data.cats.forEach(c => {
      c.topics.forEach((t, i) => {
        if (t.t.toLowerCase().indexOf(lq) >= 0 || String(t.def || '').toLowerCase().indexOf(lq) >= 0) {
          hits.push({ t: t.t, def: t.def, c: c.id, i: i, catName: c.name });
        }
      });
    });
    this.setData({ q: q, hits: hits });
  },
  onClear() { this.setData({ q: '', hits: [] }); },

  onTopic(e) {
    const ds = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pkg-study/pages/topic/topic?c=' + ds.c + '&i=' + ds.i,
      fail: () => this.tip('打开失败'),
    });
  },

  tip(msg) {
    this.setData({ toast: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toast: '' }), 1500);
  },
});

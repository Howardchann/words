// pages/search/search.js —— 全库搜索（v1.1.46）
// 设计要点：
// 1. 纯前端内存过滤（8000 词单次遍历 <5ms），无网络请求、离线可用；
// 2. 结果行与今日页词行同构（单词/音标/词性/释义/例句/喇叭），点词条 = 跳到该词所在的 Day 并定位高亮；
// 3. 关键词只存本地 storage，不进 store —— 搜索词是纯 UI 现场，不该混进要上云的业务数据；
// 4. 从结果跳走时本页会被 switchTab 销毁，回来时按存下的关键词自动恢复现场（结果列表即刻重现）。
const plan = require('../../utils/data.js');
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');
const speech = require('../../utils/speech.js');

const KW_KEY = 'ielts-365-search-kw';
const DEBOUNCE = 160;

Page({
  data: {
    dark: theme.isDark(),
    pageStyle: theme.isDark() ? 'background-color:#0E1618;' : '',
    kw: '',
    focus: false,
    total: 0,      // 真实命中数（可能大于 list.length）
    more: false,
    list: [],
    wordTotal: plan.WORD_TOTAL,
    playingText: '',
    playingMode: 'idle',
  },

  onLoad() {
    theme.applyPage(this);
    speech.setRate(store.get('rate'));
    speech.setAccent(store.get('accent') || 'us');
    speech.setEngine(store.get('engine'));
    speech.setEngineMode(store.get('engineMode') || 'auto');
    this._offSpeech = speech.onStateChange((payload) => {
      const upd = { playingText: payload.playing ? payload.text : '', playingMode: payload.mode };
      // 歌词式进度：与今日页同一套（已读部分染绿）
      if (payload.playing && payload.text) {
        const lit = Math.round((payload.progress || 0) * payload.text.length);
        upd.karaLit = payload.text.slice(0, lit);
        upd.karaRest = payload.text.slice(lit);
      } else { upd.karaLit = ''; upd.karaRest = ''; }
      this.setData(upd);
    });
    // 恢复上次关键词（含结果）：本页可能刚被 switchTab 销毁过
    let last = '';
    try { last = wx.getStorageSync(KW_KEY) || ''; } catch (e) { last = ''; }
    if (last) { this.setData({ kw: last }); this._run(last); }
  },

  // 只有「没历史关键词」才自动聚焦：有历史时先让用户看到上次结果，不急着弹键盘
  onReady() { if (!this.data.kw) this.setData({ focus: true }); },

  onUnload() {
    if (this._deb) { clearTimeout(this._deb); this._deb = null; }
    // 本页可能被 switchTab 销毁（从结果跳今日页），落盘保住关键词
    if (typeof this._kw === 'string') {
      try { wx.setStorageSync(KW_KEY, this._kw); } catch (err) { /* 存不下不影响搜索 */ }
    }
    speech.stop();
    if (this._offSpeech) this._offSpeech();
    this._offSpeech = null;
  },

  onBack() { wx.navigateBack(); },

  // ⚠️ focus 只做「同步」不做「控制」：
  //    在输入过程中 setData({ focus:false }) 等价于「主动收起键盘」——实测按一个字母输入法就缩回去，
  //    一个单词都打不完（v1.1.47 修复）。所以 onInput 里绝不碰 focus，只在真实的 focus/blur 事件里回写，
  //    保证 data.focus 与输入框真实状态一致（否则页面重渲染时可能把陈旧的 false 重新应用一次）。
  onFocus() { if (!this.data.focus) this.setData({ focus: true }); },
  onBlur() { if (this.data.focus) this.setData({ focus: false }); },

  onInput(e) {
    const kw = e.detail.value;
    this._kw = kw;
    // 只回写输入内容，focus 一律不动（见上面注释）
    this.setData({ kw: kw });
    if (this._deb) clearTimeout(this._deb);
    this._deb = setTimeout(() => { this._deb = null; this._run(kw); }, DEBOUNCE);
  },

  onConfirm(e) {
    if (this._deb) { clearTimeout(this._deb); this._deb = null; }
    this._run(e.detail.value);
  },

  onClear() {
    if (this._deb) { clearTimeout(this._deb); this._deb = null; }
    this._kw = '';
    try { wx.setStorageSync(KW_KEY, ''); } catch (err) {}
    speech.stop();
    // 这里的 focus:true 是「真想让它聚焦」——输入框此刻通常已是聚焦态，等于无变化；
    // 若用户已手动收起键盘，则借此重新弹起。与 onInput 里的禁用场景不同。
    this.setData({ kw: '', focus: true, total: 0, more: false, list: [] });
  },

  _run(kw) {
    speech.stop();
    // 关键词落盘放在这里（而非每次按键）——同步写存储在安卓上是阻塞调用，打字时不该每键一次
    try { wx.setStorageSync(KW_KEY, kw); } catch (err) { /* 存不下不影响搜索 */ }
    const r = plan.searchWords(kw);
    this.setData({ total: r.total, list: r.list, more: r.total > r.list.length });
  },

  // 点词条 → 跳到该词所在的 Day 并定位高亮。
  // switchTab 不能带参，走 globalData 中转（与周计划点日期跳今日页同一套机制）。
  onJump(e) {
    const w = e.currentTarget.dataset.w;
    const it = (this.data.list || []).find(x => x.w === w);
    if (!it) return;
    speech.stop();
    const app = getApp();
    app.globalData.jumpDay = it.day;
    app.globalData.jumpWord = it.w;
    wx.switchTab({ url: '/pages/today/today' });
  },

  // 喇叭 / 例句：用 catchtap 拦在本页朗读，不触发整行的跳转
  onSpeakWord(e) {
    const ds = e.currentTarget.dataset;
    const text = ds.text;
    if (!text) return;
    if (this.data.playingText === text) {
      const r = speech.togglePause();
      this.setData({ playingText: r === 'paused' ? '' : text });
      return;
    }
    speech.speak(text, { ai: Number(ds.ai) || 0, kind: ds.kind || 'w' });
  },
});

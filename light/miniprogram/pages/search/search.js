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
// 跳转重入锁的有效期 + 看门狗超时（v1.1.49）：锁必须能自愈，见 onJump 注释
const JUMP_LOCK_MS = 1200;
const JUMP_WATCHDOG = 1600;

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
    playingAccent: '',
    playingMode: 'idle',
    jumpingW: '',   // 正在跳转的词（行内显示「跳转中…」，让「点了没反应」不再无声）
  },

  onLoad() {
    theme.applyPage(this);
    speech.setRate(store.get('rate'));
    speech.setAccent(store.get('accent') || 'us');
    speech.setEngine(store.get('engine'));
    speech.setEngineMode(store.get('engineMode') || 'auto');
    this._offSpeech = speech.onStateChange((payload) => {
      // 同值守卫（v1.1.49）：朗读状态回调里带着只有 1~2 个字段变化的数据，而 setData 不做深度 diff，
      // 同值也会把 60 行结果列表整棵重渲染 —— 低端机上就是「播放时卡一下」。
      // 只在真的有变化时才 setData。
      const text = payload.playing ? payload.text : '';
      const accent = payload.accent || '';
      const upd = {};
      if (text !== this.data.playingText) upd.playingText = text;
      if (accent !== this.data.playingAccent) upd.playingAccent = accent;
      if (payload.mode !== this.data.playingMode) upd.playingMode = payload.mode;
      if (text) {
        const lit = Math.round((payload.progress || 0) * text.length);
        // 守卫键 = 文本 + 已亮字符数（v1.1.50 修复）。
        // 旧守卫只比 lit：上一次播放结束时 _lit 已归 0，新播放开始 lit=0 与旧值相等 →
        // karaLit/karaRest 不更新（残留空串）而 playingText 已切换 → 词/例句渲染成空，
        // 等第一个进度回调 lit≥1 才显现 —— 真机表现即「先消失再显现」。
        if (text !== this._karaText || lit !== this._lit) {
          this._karaText = text;
          this._lit = lit;
          upd.karaLit = text.slice(0, lit);
          upd.karaRest = text.slice(lit);
        }
      } else if (this._karaText) {
        this._karaText = '';
        this._lit = 0;
        upd.karaLit = '';
        upd.karaRest = '';
      }
      if (upd.playingText !== undefined || upd.playingAccent !== undefined || upd.playingMode !== undefined || upd.karaLit !== undefined) {
        this.setData(upd);
      }
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
    // switchTab 成功 = 本页被销毁：务必清掉跳转看门狗，否则它会在页面销毁后 setData
    if (this._wd) { clearTimeout(this._wd); this._wd = null; }
    this._jumping = false;
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
    // ⚠️ 这里刻意**不写 focus**：配合 input 的 hold-keyboard，点 × 不会让输入框失焦，
    //    键盘原地保持、无「收起又弹出」的闪动；若用户此前已手动收起键盘，也不强行弹起。
    //    （v1.1.47 曾在这一行 setData focus:true，实测会闪一下：点 × 时输入框先失焦，这一行又把它拉回来。）
    this.setData({ kw: '', total: 0, more: false, list: [] });
  },

  _run(kw) {
    speech.stop();
    // 关键词落盘放在这里（而非每次按键）——同步写存储在安卓上是阻塞调用，打字时不该每键一次
    try { wx.setStorageSync(KW_KEY, kw); } catch (err) { /* 存不下不影响搜索 */ }
    const r = plan.searchWords(kw);
    this.setData({ total: r.total, list: r.list, more: r.total > r.list.length });
  },

  // 点卡片 → 跳到该词所在的 Day 并定位高亮（整张卡片除两个喇叭图标外都是跳转区）。
  // switchTab 不能带参，走 globalData 中转（与等级页点日期跳今日页同一套机制）。
  // 跳转所需数据全部取自 dataset，**不再回头查 this.data.list**：
  // 列表随时可能被防抖、朗读回调 setData 重写，依赖 list 状态是「点了没反应」的隐患之一。
  onJump(e) {
    const ds = e.currentTarget.dataset;
    const w = ds.w;
    const day = Number(ds.day) || 0;
    // 不静默 return：数据缺失也要让用户看见（静默 = 表现为「点了没反应」）
    if (!w || !day) { wx.showToast({ title: '这个词没有所属学习日', icon: 'none' }); return; }
    // 重入锁：并发 switchTab 会被静默打断（没有任何报错）。但锁**必须能自愈** ——
    // 安卓上存在 switchTab「既不回调 success 也不回调 fail」的情况，硬锁一旦卡住，
    // 之后每次点击都会静默失效（现象正是「偶发点了不跳」）。
    const now = Date.now();
    if (this._jumping && now - (this._jumpAt || 0) < JUMP_LOCK_MS) return;
    this._jumping = true;
    this._jumpAt = now;
    if (this._deb) { clearTimeout(this._deb); this._deb = null; }
    speech.stop();
    const app = getApp();
    app.globalData.jumpDay = day;
    app.globalData.jumpWord = w;
    // 行内反馈：「点到了但没跳」与「根本没点到」从此可区分
    this.setData({ jumpingW: w });
    const release = () => {
      this._jumping = false;
      this._jumpAt = 0;
      if (this._wd) { clearTimeout(this._wd); this._wd = null; }
      if (this.data.jumpingW) this.setData({ jumpingW: '' });
    };
    // 看门狗：即便 switchTab 一个回调都不给，也必须解锁
    // （跳转成功时本页会被销毁，onUnload 负责清掉它，不会误触发）
    this._wd = setTimeout(() => {
      if (!this._jumping) return;
      release();
      wx.showToast({ title: '跳转超时，请再点一次', icon: 'none' });
    }, JUMP_WATCHDOG);
    const go = (retried) => {
      wx.switchTab({
        url: '/pages/today/today',
        fail: () => {
          if (!retried) { setTimeout(() => go(true), 220); return; }   // 被切换动画打断 → 220ms 后重试一次
          release();
          wx.showToast({ title: '跳转失败，请再点一次', icon: 'none' });
        },
      });
    };
    go(false);
  },

  // 音标模块 / 例句：用 catchtap 拦在本页朗读，不触发整行的跳转
  onSpeakWord(e) {
    const ds = e.currentTarget.dataset;
    const text = ds.text;
    if (!text) return;
    const accent = ds.accent || '';   // 音标模块带 data-accent；例句不带 → 用全局口音
    if (this.data.playingText === text && (this.data.playingAccent || '') === accent) {
      const r = speech.togglePause();
      this.setData({ playingText: r === 'paused' ? '' : text, playingAccent: r === 'paused' ? '' : accent });
      return;
    }
    speech.speak(text, { ai: Number(ds.ai) || 0, kind: ds.kind || 'w', accent: accent });
  },
});

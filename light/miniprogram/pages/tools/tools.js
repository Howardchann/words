// pages/tools/tools.js —— 工具页（v1.1.67）
//
// 由原「词表 / 计划页」改造而来：等级总览（4 等级磁贴 + 日格）整体下线，
// 页面改为四块工具：① 学习记录 ② 查单词 ③ 音标速查 ④ 语法速查。
//
// 关键设计
// ────────
// 1. 本页是 tab 页（常驻不销毁）——原独立搜索页那套「关键词落盘 + switchTab 回来恢复现场」的
//    绕行逻辑全部删除：输入框内容与结果列表天然保留。跳某一天仍走 globalData.jumpDay/jumpWord。
// 2. 学习记录分母 = 可打卡天数 468（546 天里 78 个弹性日不给打卡），
//    剩余天数因此能随进度真正归零；不再显示百分比（与「还剩几天」语义重复，用户点名去掉）。
//    第二行显示「已学单词 N 个」——等级下线后不再出现 L1~L4（用户：只显示单词就好了）。
// 3. 语法全文放分包 pkg-study（71 个语法点），主包只留 12 个分类目录 —— 避免启动包被撑爆。
// 4. 音标只有 44 个、体积小，直接内联本页；详情用「常驻面板」（上表选音标、下方详情固定不动，
//    默认选中第一个音标所以永不留白、零遮罩），取代初版底部弹层（整片白遮罩太突兀）。
// 5. 音标排在语法之前：音标与查单词同属「即时查一下」（矮、就地看），语法是「系统学一块」
//    （高、要进二级页），高块压在最底部滚动距离更短。
const plan = require('../../utils/data.js');
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');
const speech = require('../../utils/speech.js');
const PHONETIC = require('../../utils/phonetic.js');
const STUDY_CATS = require('../../utils/study-cats.js');

const DEBOUNCE = 160;
// 跳转重入锁（v1.1.49）：switchTab 偶发「既不回调 success 也不回调 fail」，硬锁会把后续点击全卡死
const JUMP_LOCK_MS = 1200;
const JUMP_WATCHDOG = 1600;

// 音标分组：保留「短元音 → 长元音 → 双元音」「爆破 → 摩擦 → 破擦 → 鼻音 → 舌侧 → 近音」的教学顺序，
// 不按字母排（字母序对学习者毫无帮助）
function groupBy(arr) {
  const out = [], idx = {};
  arr.forEach(p => {
    if (!(p.grp in idx)) { idx[p.grp] = out.length; out.push({ name: p.grp, items: [] }); }
    out[idx[p.grp]].items.push(p);
  });
  return out;
}
const VOWEL_GROUPS = groupBy(PHONETIC.filter(p => p.cls === 'vowel'));
const CONS_GROUPS = groupBy(PHONETIC.filter(p => p.cls === 'consonant'));

Page({
  data: {
    // 主题 data 初始化（与 tabBar 同款）：首帧即正确深浅，见 today.js 注释
    dark: theme.isDark(),
    pageStyle: theme.isDark() ? 'background-color:#0E1618;' : '',
    navTitle: '工具',

    // ① 学习记录
    learnedDays: 0,
    leftDays: plan.CHECKIN_DAYS,
    totalCheckin: plan.CHECKIN_DAYS,
    learnedWords: 0,
    todayNum: 0,

    // ② 查单词
    kw: '',
    focus: false,
    total: 0,
    more: false,
    list: [],
    wordTotal: plan.WORD_TOTAL,
    playingText: '',
    playingAccent: '',
    playingMode: 'idle',
    jumpingW: '',
    karaLit: '',
    karaRest: '',

    // ③ 语法速查（主包只放分类目录，全文在分包）
    cats: STUDY_CATS,
    catTotal: STUDY_CATS.reduce((a, c) => a + c.count, 0),

    // ③ 音标（常驻面板：上面选音标，下方详情固定在原位）
    vowelGroups: VOWEL_GROUPS,
    consGroups: CONS_GROUPS,
    phonTotal: PHONETIC.length,
    ph: PHONETIC[0],   // 当前选中音标：默认第一个 → 面板永不为空
  },

  // ---------- 生命周期 ----------
  onLoad() {
    theme.applyPage(this); theme.syncTabBar(this, 2);
    speech.initPlugin();
    speech.setRate(store.get('rate'));
    speech.setAccent(store.get('accent') || 'us');
    speech.setEngine(store.get('engine'));
    speech.setEngineMode(store.get('engineMode') || 'auto');
    this._offSpeech = speech.onStateChange((payload) => {
      // 同值守卫（v1.1.49）：朗读回调只带 1~2 个字段变化，setData 却不做深度 diff，
      // 同值也会把整棵结果列表重渲染 —— 低端机上就是「播放时卡一下」
      const text = payload.playing ? payload.text : '';
      const accent = payload.accent || '';
      const upd = {};
      if (text !== this.data.playingText) upd.playingText = text;
      if (accent !== this.data.playingAccent) upd.playingAccent = accent;
      if (payload.mode !== this.data.playingMode) upd.playingMode = payload.mode;
      if (text) {
        const lit = Math.round((payload.progress || 0) * text.length);
        // 守卫键 = 文本 + 已亮字符数：上一次播完 _lit 已归 0，新播放起点 lit 也是 0，
        // 只比 lit 会漏更新（表现为词「先消失再显现」）
        if (text !== this._karaText || lit !== this._lit) {
          this._karaText = text; this._lit = lit;
          upd.karaLit = text.slice(0, lit); upd.karaRest = text.slice(lit);
        }
      } else if (this._karaText) {
        this._karaText = ''; this._lit = 0;
        upd.karaLit = ''; upd.karaRest = '';
      }
      if (upd.playingText !== undefined || upd.playingAccent !== undefined || upd.playingMode !== undefined || upd.karaLit !== undefined) {
        this.setData(upd);
      }
    });
    // 恢复上次的搜索关键词（tab 页通常不会销毁，这里是「被系统回收后再进来」的兜底）
    let last = '';
    try { last = wx.getStorageSync('ielts-365-search-kw') || ''; } catch (e) { last = ''; }
    if (last) { this._kw = last; this.setData({ kw: last }); this._run(last); }
    this.refreshRecord();
  },

  applyTheme() { theme.applyPage(this); theme.syncTabBar(this); },
  onShow() {
    theme.syncTabBar(this, 2);
    this.applyTheme();
    store.onResume();
    this.refreshRecord();
    // 今日页导航栏的放大镜是「切到工具页并聚焦搜索框」的快捷入口（v1.1.67）
    const app = getApp();
    if (app && app.globalData && app.globalData.toolsFocus) {
      app.globalData.toolsFocus = false;
      this.setData({ focus: true });
    }
  },
  onHide() { speech.stop(); },
  onUnload() {
    if (this._deb) { clearTimeout(this._deb); this._deb = null; }
    if (this._wd) { clearTimeout(this._wd); this._wd = null; }
    speech.stop();
    if (this._offSpeech) this._offSpeech();
    this._offSpeech = null;
  },

  // ---------- ① 学习记录 ----------
  // 已学 = 真实打卡天数；还剩 = 可打卡天数 − 已学（弹性日不打卡、不计入分母）
  refreshRecord() {
    const learnedDays = store.checkedCount();
    const leftDays = Math.max(0, plan.CHECKIN_DAYS - learnedDays);
    const learnedWords = store.checkedWordCount();
    const todayNum = plan.currentDayFromStart(store.get('startDate'));
    theme.sameSet(this, { learnedDays, leftDays, learnedWords, todayNum });
  },

  // ---------- ② 查单词（逻辑同原搜索页，去掉页面销毁相关的绕行） ----------
  // ⚠️ focus 只做「同步」不做「控制」：输入过程中 setData({focus:false}) 等价于主动收起键盘，
  //    实测按一个字母输入法就缩回去、一个单词都打不完。onInput 里绝不碰 focus。
  onFocus() { if (!this.data.focus) this.setData({ focus: true }); },
  onBlur() { if (this.data.focus) this.setData({ focus: false }); },

  onInput(e) {
    const kw = e.detail.value;
    this._kw = kw;
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
    try { wx.setStorageSync('ielts-365-search-kw', ''); } catch (err) {}
    speech.stop();
    // 刻意不写 focus：配合 hold-keyboard，点 × 不会让输入框失焦，键盘原地保持、无「收起又弹出」闪动
    this.setData({ kw: '', total: 0, more: false, list: [] });
  },
  _run(kw) {
    speech.stop();
    try { wx.setStorageSync('ielts-365-search-kw', kw); } catch (err) {}
    const r = plan.searchWords(kw);
    this.setData({ total: r.total, list: r.list, more: r.total > r.list.length });
  },

  // 点结果行 → 跳到该词所在的 Day 并定位高亮（整行除喇叭外都是跳转区）
  onJump(e) {
    const ds = e.currentTarget.dataset;
    const w = ds.w;
    const day = Number(ds.day) || 0;
    if (!w || !day) { this.fb().toast('这个词没有所属学习日'); return; }
    const now = Date.now();
    if (this._jumping && now - (this._jumpAt || 0) < JUMP_LOCK_MS) return;
    this._jumping = true; this._jumpAt = now;
    if (this._deb) { clearTimeout(this._deb); this._deb = null; }
    speech.stop();
    const app = getApp();
    app.globalData.jumpDay = day;
    app.globalData.jumpWord = w;
    this.setData({ jumpingW: w });
    const release = () => {
      this._jumping = false; this._jumpAt = 0;
      if (this._wd) { clearTimeout(this._wd); this._wd = null; }
      if (this.data.jumpingW) this.setData({ jumpingW: '' });
    };
    // 看门狗：即便 switchTab 一个回调都不给也必须解锁（否则之后每次点击都静默失效）
    this._wd = setTimeout(() => {
      if (!this._jumping) return;
      release();
      this.fb().toast('跳转超时，请再点一次');
    }, JUMP_WATCHDOG);
    const go = (retried) => {
      wx.switchTab({
        url: '/pages/today/today',
        fail: () => {
          if (!retried) { setTimeout(() => go(true), 220); return; }
          release();
          this.fb().toast('跳转失败，请再点一次');
        },
      });
    };
    go(false);
  },

  // 朗读：音标模块带 data-accent（各读各的口音），例句不带 → 用全局口音
  onSpeak(e) {
    const ds = e.currentTarget.dataset;
    const text = ds.text;
    if (!text) return;
    const accent = ds.accent || '';
    if (this.data.playingText === text && (this.data.playingAccent || '') === accent) {
      const r = speech.togglePause();
      this.setData({ playingText: r === 'paused' ? '' : text, playingAccent: r === 'paused' ? '' : accent });
      return;
    }
    speech.speak(text, { ai: Number(ds.ai) || 0, kind: ds.kind || 'w', accent: accent });
  },

  // ---------- ④ 语法速查 ----------
  // 本页只做「目录」：点分类进分包页看完整讲解与例句
  onCatTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pkg-study/pages/grammar/grammar?cat=' + id,
      fail: () => this.fb().toast('打开语法页失败'),
    });
  },

  // ---------- ③ 音标（常驻面板：点 chip 就地切换下方详情，无弹层） ----------
  onPhonTap(e) {
    const s = e.currentTarget.dataset.s;
    if (!s || (this.data.ph && this.data.ph.s === s)) return;
    const ph = PHONETIC.filter(p => p.s === s)[0];
    if (!ph) return;
    speech.stop();
    this.setData({ ph: ph });
  },
  // 音标例词：词表里有同形词就用它的预生成音频（可离线），否则退回在线朗读
  onSpeakPhonEx(e) {
    const w = e.currentTarget.dataset.w;
    if (!w) return;
    if (this.data.playingText === w) { speech.togglePause(); this.setData({ playingText: '' }); return; }
    speech.speak(w, { ai: plan.wordAi(w), kind: 'w' });
  },

  fb() { return this.selectComponent('#fb'); },
});

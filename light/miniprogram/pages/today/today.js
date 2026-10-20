// pages/today/today.js —— 今日学习（6 册 / 78 章 / 390 节，v1.1.110）
//
// 单位说明：课程不再按「第 N 天」推进，改为「节」。进度键仍然是 w{章}d{节}（d = 1..5），
// 与旧版逐字节相同 —— 老用户的打卡记录直接落在对应的节上，零迁移。
// 章末自测（旧版的周日自检）挂在每章第 5 节下面，只展示、不打卡、不计进度。
const plan = require('../../utils/data.js');
// 例句精读「可朗读」判定（v1.1.85，与 _ipa_build/mk_g_tasks.js 的 looksSentence 同口径）：
// 含汉字（注释/提示行）、填空 ___、箭头替换、「标签:」开头、无句末标点、英文词 <3 → 都不给喇叭。
// 词数下限 3：第 1 节就有「I'm from China.」这类三词真句，不能按 4 挡。
function exSpk(s) {
  if (!s) return false;
  if (/[\u4e00-\u9fff]/.test(s)) return false;
  if (/[_\u2192\u2191\u2260\u300c\u300d\u21d2\u279c]|->/.test(s)) return false;
  if ((String(s).match(/[A-Za-z']+/g) || []).length < 3) return false;
  if (/^[A-Za-z][A-Za-z ]{0,12}:\s/.test(s)) return false;
  if (/^\d/.test(s)) return false;                          // 日程条目（10:45 - 11:45 writing…）
  if (/^(Day|Box|Minute|Week)\s*\d/i.test(s)) return false; // 打卡/计划条目（Day 5: mixed practice…）
  // 句末允许跟一个短括号补充 —— `The town that I visited was quiet. (not where)` 是语法真例句
  return /[.!?]["']?\s*(\([^)]{0,24}\))?\s*$/.test(String(s).trim());
}
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');
const speech = require('../../utils/speech.js');
const wordforms = require('../../utils/wordforms.js');
const splitSenses = require('../../utils/split-senses.js');

// 「1) 2) 3)」编号拆行（数据源是一整段，无换行符）
function splitPr(s) {
  if (!s) return [];
  return String(s).split(/(?=\d\)\s)/).map(x => {
    const m = x.match(/^(\d+)\)\s*/);
    return { no: m ? m[1] : '', text: m ? x.slice(m[0].length) : x };
  });
}

Page({
  data: {
    // 主题在 data 初始化阶段就确定（与 tabBar 同款）：首帧即正确深浅
    dark: theme.isDark(),
    pageStyle: theme.isDark() ? 'background-color:#0E1618;' : '',
    navTitle: '今日单词',

    viewSec: -1,          // 当前浏览的节（0 基）；-1 = 尚未渲染
    curSec: 0,            // 打卡驱动的「当前进度节」= 第一个未打卡的节
    totalSec: plan.SECTION_TOTAL,
    preStart: false,
    prepPreview: false,   // 准备期点了「先看看第 1 节」：允许预览，但给一条返回准备期的入口

    // 位置（章头 / 目录共用）
    bookNo: 1, chNo: 1, chInBook: 1, kNo: 1, secNo: 1,
    chapterTitle: '', sectionTitle: '', locText: '',

    dayData: null,       // 节内容（已剔除 v）
    prLines: [],
    quizLines: [],
    cards: [],           // 一词一卡：主卡 + sub 副义项合并
    zhOpen: {},          // 例句中文展开表（按卡片 key，主/副分开）
    coreCount: 0,
    extraCount: 0,
    extraStart: -1,
    checked: false,

    hlWord: '', hlVia: '', hlQ: '',

    // 目录（v1.1.110）：只展开一册 / 一章，避免一次 setData 400 个节点
    dirOpen: false,
    dirBooks: [],
    openBook: 0,
    openCh: -1,

    playingText: '', playingKey: '', playingAccent: '',
    wfText: '', wfKey: '',
    playingMode: 'idle',
    karaLit: '', karaRest: '',
    pluginOk: false,
  },

  onLoad() {
    theme.applyPage(this); theme.syncTabBar(this);
    const ok = speech.initPlugin();
    speech.setRate(store.get('rate'));
    speech.setAccent(store.get('accent') || 'us');
    speech.setEngine(store.get('engine'));
    speech.setEngineMode(store.get('engineMode') || 'auto');
    this._offSpeech = speech.onStateChange((payload) => {
      // 词形播放分支：wfText 存在期间主行 playingText/卡拉OK 一律冻结，播完清 wfText
      if (this.data.wfText) {
        if (!payload.playing) { this.setData({ wfText: '', wfKey: '' }); return; }
        if (payload.text === this.data.wfText) {
          if (this.data.playingText || this.data.playingAccent) {
            this.setData({ playingText: '', playingAccent: '' });
          }
          return;
        }
        this.setData({ wfText: '', wfKey: '' });
      }
      const upd = { playingText: payload.playing ? payload.text : '', playingAccent: payload.accent || '', playingMode: payload.mode, playingKey: payload.playing ? this.data.playingKey : '' };
      // 歌词式进度：按朗读进度把当前文本切成「已读/未读」两段，已读染绿
      if (payload.playing && payload.text) {
        const lit = Math.round((payload.progress || 0) * payload.text.length);
        upd.karaLit = payload.text.slice(0, lit);
        upd.karaRest = payload.text.slice(lit);
      } else { upd.karaLit = ''; upd.karaRest = ''; }
      this.setData(upd);
    });
    this.setData({ pluginOk: ok });
  },

  applyTheme() { theme.applyPage(this); theme.syncTabBar(this); },

  onShow() {
    theme.syncTabBar(this, 0);
    this.applyTheme();
    store.onResume();
    // 跨页跳转（搜索页点结果 / 语法点「课程里讲过」）：switchTab 不能带参，走 globalData 中转。
    const app = getApp();
    const rawJump = app.globalData.jumpSec;
    const hasJump = typeof rawJump === 'number' && rawJump >= 0;
    const jump = hasJump ? rawJump : -1;
    const jumpWord = app.globalData.jumpWord || '';
    const jumpVia = app.globalData.jumpVia || null;
    app.globalData.jumpSec = -1;
    app.globalData.jumpWord = '';
    app.globalData.jumpVia = null;

    const started = !!store.get('startDate');
    const cur = store.firstUnfinishedSection();
    const curSec = cur >= 0 ? cur : plan.SECTION_TOTAL - 1;
    const d0 = new Date();
    const dateKey = d0.getFullYear() + '-' + (d0.getMonth() + 1) + '-' + d0.getDate();
    // 切 tab 返回（无 jump 且页面未销毁）：保持离开时的浏览位置，只刷新打卡/同步数据
    if (!hasJump && this.data.viewSec >= 0 && this._browseDate === dateKey) {
      this._browseDate = dateKey;
      theme.sameSet(this, { curSec: curSec, preStart: !started });
      this.renderSec(this.data.viewSec);
      if (jumpWord) this._scrollToWord(jumpWord, 0, jumpVia);
      return;
    }
    this._browseDate = dateKey;
    theme.sameSet(this, { curSec: curSec, preStart: !started });
    // 准备期不渲染节内容：日数据由「先看看第 1 节」入口按需渲染
    if (!started && !hasJump) { this._setTitle(); return; }
    const target = hasJump ? jump : curSec;
    this.renderSec(Math.max(0, Math.min(plan.SECTION_TOTAL - 1, target)));
    if (jumpWord) this._scrollToWord(jumpWord, 0, jumpVia);
  },

  onUnload() {
    this._clearHl();
    speech.stop();
    if (this._offSpeech) this._offSpeech();
    this._offSpeech = null;
  },

  // 搜索入口：切到工具页并让输入框聚焦（switchTab 不能带参，走 globalData）
  goSearch() {
    const app = getApp();
    if (app && app.globalData) app.globalData.toolsFocus = true;
    wx.switchTab({
      url: '/pages/tools/tools',
      fail: () => {
        if (app && app.globalData) app.globalData.toolsFocus = false;
        this.fb().toast('打开工具页失败');
      },
    });
  },

  // 词形标签点读：变体音频走 g/ 桶（按文本哈希）；词表内的形式走 w/ 桶
  onSpeakWfToday(e) {
    const t = e.currentTarget.dataset.text;
    const key = e.currentTarget.dataset.key || t;
    if (!t) return;
    if (this.data.wfKey === key) { speech.togglePause(); return; }
    if (this.data.playingText || this.data.playingAccent) {
      this.setData({ playingText: '', playingAccent: '' });
    }
    this.setData({ wfText: t, wfKey: key });
    const wfAi = plan.wordAi(t);
    speech.speak(t, wfAi ? { ai: wfAi, kind: 'w' } : { kind: 'g' });
  },

  _scrollToWord(w, tries, via) {
    const n = tries || 0;
    const idx = (this.data.cards || []).findIndex(v => v.w === w);
    if (idx < 0) { if (n < 5) setTimeout(() => this._scrollToWord(w, n + 1, via), 120); return; }
    if (n === 0) {
      this._clearHl();
      this.setData({ hlWord: w, hlVia: (via && via.via) || '', hlQ: (via && via.q) || '' });
      this._hlTimer = setTimeout(() => { this._hlTimer = null; this.setData({ hlWord: '', hlVia: '', hlQ: '' }); }, 2000);
    }
    setTimeout(() => {
      wx.createSelectorQuery()
        .select('#w' + idx).boundingClientRect()
        .selectViewport().scrollOffset()
        .exec(res => {
          const rect = res && res[0], sv = res && res[1];
          if (!rect || !sv) { if (n < 5) this._scrollToWord(w, n + 1, via); return; }
          wx.pageScrollTo({ scrollTop: Math.max(0, rect.top + sv.scrollTop - 140), duration: 320 });
        });
    }, n === 0 ? 180 : 160);
  },

  _clearHl() { if (this._hlTimer) { clearTimeout(this._hlTimer); this._hlTimer = null; } },

  _setTitle() { theme.sameSet(this, { navTitle: '今日单词' }); },

  // ── 渲染一节 ──────────────────────────────────────────────
  renderSec(si) {
    const info = plan.sectionInfo(si);
    if (!info) return;
    const raw = plan.getSection(si);
    // dayData 里剔除词汇数组 v，避免与 cards 重复 setData 两份
    const dayData = raw ? Object.assign({}, raw) : null;
    if (dayData) delete dayData.v;
    // 一词一卡（v1.1.110）：splitSenses.cards 把主卡与副义项合成一张卡（副义项挂在 .sub）
    const cards = splitSenses.cards((raw && raw.v ? raw.v : []).map(v => Object.assign({}, v, {
      starred: store.isStarred(v.w),
      // 只带 wfNotes（词形要点：不规则形 + 读音提醒）；完整屈折表在工具页搜索结果里给，
      // 今日页 30 个词全列 4 个变形会把卡片撑爆（用户要的「百度式变形」是搜索场景）。
      wf: wordforms.wfNotes(v.w, v.p),
    })));
    const coreCount = dayData ? dayData.coreCount || 0 : 0;
    let extraStart = -1;
    cards.forEach((v, i) => { if (extraStart < 0 && !v.core) extraStart = i; });
    // 例句精读：含汉字的句子没有可朗读的英文 → spk=false，模板据此不渲染喇叭
    let gEx = [];
    if (dayData && dayData.g) {
      const ex = (dayData.g.ex || []).map(s => ({ v: s, spk: exSpk(s) }));
      gEx = ex.filter(x => x.spk);
      const gLabel = gEx.length ? '例句精读' : '今日要点';
      dayData.g = Object.assign({}, dayData.g, { ex: ex, label: gLabel, plain: !gEx.length });
    }
    const prLines = splitPr(dayData && dayData.pr);
    const quizLines = splitPr(dayData && dayData.quiz && dayData.quiz.pr);
    const sig = [si, store.isChecked(info.ch + 1, info.k + 1) ? 1 : 0, cards.map(v => v.starred ? 1 : 0).join('')].join('|');
    if (sig === this._secSig) {
      theme.sameSet(this, { curSec: this.data.curSec, preStart: false });
      return;
    }
    this._secSig = sig;
    this.setData({
      viewSec: si,
      bookNo: info.bookNo, chNo: info.chNo, chInBook: info.chInBook, kNo: info.kNo, secNo: info.no,
      chapterTitle: info.chapterTitle, sectionTitle: info.title, locText: info.loc,
      dayData: dayData,
      prLines: prLines,
      quizLines: quizLines,
      cards: cards,
      extraStart: extraStart,
      coreCount: coreCount,
      extraCount: cards.length - coreCount,
      checked: store.isChecked(info.ch + 1, info.k + 1),
    });
    this._setTitle();
    // 后台把本节音频预拉进本地缓存（静默，失败不影响播放）
    if (cards.length) {
      const items = [];
      cards.forEach(v => {
        items.push({ ai: v.ai, kind: 'w' }); items.push({ ai: v.ai, kind: 's' });
        if (v.sub) { items.push({ ai: v.sub.ai, kind: 'w' }); items.push({ ai: v.sub.ai, kind: 's' }); }
      });
      speech.prefetch(items.slice(0, 40), 0);
      if (gEx.length) speech.prefetch(gEx.map(x => ({ text: x.v })), 0);
      this._prefetchWindow(0);
    }
  },

  prevSec() {
    if (this.data.viewSec > 0) { speech.stop(); this.renderSec(this.data.viewSec - 1); wx.pageScrollTo({ scrollTop: 0, duration: 0 }); }
  },
  nextSec() {
    if (this.data.viewSec >= 0 && this.data.viewSec < plan.SECTION_TOTAL - 1) {
      speech.stop(); this.renderSec(this.data.viewSec + 1); wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    }
  },

  // 准备期唯一「开学」入口：写 startDate=今天 → 今日页立刻进入第 1 节，打卡放开
  startLearning() {
    const pad = n => ('0' + n).slice(-2);
    const d = new Date();
    const iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    store.set('startDate', iso);
    getCurrentPages().forEach(pg => { if (pg.resetView) pg.resetView(); });
    speech.stop();
    this._secSig = null;
    this.setData({ preStart: false, prepPreview: false, viewSec: -1 });
    this.onShow();
    this.fb().toast('已开始 · 第 1 节', 1500);
  },
  // 准备期预览入口「先看看第 1 节」：直接渲染（不打卡、不写 startDate）
  backToToday() {
    speech.stop();
    this.setData({ preStart: false, prepPreview: !store.get('startDate') });
    this.renderSec(0);
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },
  backToProgress() {
    speech.stop();
    const t = Math.max(0, Math.min(plan.SECTION_TOTAL - 1, this.data.curSec || 0));
    this.setData({ preStart: false });
    this.renderSec(t);
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },
  resetView() { this._secSig = null; this.setData({ viewSec: -1 }); },
  backToPrep() {
    speech.stop();
    this._secSig = null;
    this.setData({ preStart: true, prepPreview: false, viewSec: -1 });
    this._setTitle();
  },

  // ── 目录 ─────────────────────────────────────────────────
  _dirData() {
    const ck = store.get('checkedDays');
    return plan.bookTree(ck, this.data.openBook, this.data.openCh, this.data.viewSec);
  },
  onDirToggle() {
    if (this.data.dirOpen) { this.setData({ dirOpen: false }); return; }
    // 打开时默认定位到当前所在的册 / 章
    const si = this.data.viewSec >= 0 ? this.data.viewSec : 0;
    const info = plan.sectionInfo(si) || { book: 0, ch: 0 };
    this.setData({ dirOpen: true, openBook: info.book, openCh: info.ch }, () => {
      this.setData({ dirBooks: this._dirData() });
    });
  },
  onDirBook(e) {
    const b = Number(e.currentTarget.dataset.book);
    // 再点一次 = 收起该册（openBook=-1 时 bookTree 对所有册都返回空 chapters）
    const nb = b === this.data.openBook ? -1 : b;
    this.setData({ openBook: nb, openCh: -1 }, () => this.setData({ dirBooks: this._dirData() }));
  },
  onDirCh(e) {
    const ch = Number(e.currentTarget.dataset.ch);
    this.setData({ openCh: ch === this.data.openCh ? -1 : ch }, () => this.setData({ dirBooks: this._dirData() }));
  },
  onDirSec(e) {
    const si = Number(e.currentTarget.dataset.si);
    if (!(si >= 0)) return;
    speech.stop();
    this.setData({ dirOpen: false });
    this.renderSec(si);
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },

  fb() { return this.selectComponent('#fb'); },

  onCheckin() {
    // 准备期只预览不打卡
    if (this.data.preStart) { this.fb().toast('开始后才能打卡', 1200); return; }
    const info = plan.sectionInfo(this.data.viewSec);
    if (!info) return;
    const now = store.toggleCheck(info.ch + 1, info.k + 1);
    this.setData({ checked: now });
    if (now) this.fb().toast('打卡成功', 900);
    this._secSig = null;
  },

  // ---- 朗读 ----
  onSpeakWord(e) {
    const ds = e.currentTarget.dataset;
    const text = ds.text || ds.example || ds.word;
    if (!text) return;
    if (this.data.wfText) this.setData({ wfText: '', wfKey: '' });
    const accent = ds.accent || '';
    const key = ds.k || '';
    const same = this.data.playingText === text && (this.data.playingAccent || '') === accent && this.data.playingKey === key;
    if (same) {
      const r = speech.togglePause();
      this.setData({ playingText: r === 'paused' ? '' : text, playingAccent: r === 'paused' ? '' : accent, playingKey: r === 'paused' ? '' : key });
      return;
    }
    const ai = Number(ds.ai) || 0;
    this.setData({ playingKey: key });
    speech.speak(text, { ai: ai, kind: ds.kind || 's', accent: accent });
    const vi = this.data.cards.findIndex(v => v.ai === ai);
    if (vi >= 0) this._prefetchWindow(vi);
  },

  onSpeakAll() {
    if (!this.data.cards.length) return;
    if (this.data.playingMode === 'queue') { speech.stop(); return; }
    const items = [];
    this.data.cards.forEach(v => {
      items.push({ text: v.w, ai: v.ai, kind: 'w' });
      if (v.e) items.push({ text: v.e, ai: v.ai, kind: 's' });
      if (v.sub) {
        items.push({ text: v.w, ai: v.sub.ai, kind: 'w' });
        if (v.sub.e) items.push({ text: v.sub.e, ai: v.sub.ai, kind: 's' });
      }
    });
    speech.speakQueue(items);
    this._prefetchWindow(0);
  },

  onStar(e) {
    const i = e.currentTarget.dataset.index;
    const v = this.data.cards[i];
    if (!v) return;
    const starred = store.toggleStar(v);
    this.setData({ ['cards[' + i + '].starred']: starred });
  },

  _prefetchWindow(startIdx) {
    const list = this.data.cards;
    if (!list.length) return;
    const items = [];
    for (let i = startIdx; i < Math.min(startIdx + 3, list.length); i++) {
      const v = list[i];
      if (v && v.ai) {
        items.push({ ai: v.ai, kind: 'w', slow: false });
        items.push({ ai: v.ai, kind: 'w', slow: true });
        if (v.e) items.push({ ai: v.ai, kind: 's' });
      }
      if (v && v.sub && v.sub.ai) {
        items.push({ ai: v.sub.ai, kind: 'w', slow: false });
        items.push({ ai: v.sub.ai, kind: 'w', slow: true });
        if (v.sub.e) items.push({ ai: v.sub.ai, kind: 's' });
      }
    }
    speech.prefetch(items);
  },

  // 例句中文眼睛开关：按卡片 key（主/副分开）
  onToggleExZh(e) {
    const k = e.currentTarget.dataset.k;
    if (!k) return;
    const m = Object.assign({}, this.data.zhOpen);
    if (m[k]) delete m[k]; else m[k] = 1;
    this.setData({ zhOpen: m });
  },
});

// pages/today/today.js —— 今日学习计划
const plan = require('../../utils/data.js');
// 例句精读「可朗读」判定（v1.1.85，与 _ipa_build/mk_g_tasks.js 的 looksSentence 同口径）：
// 含汉字（注释/提示行）、填空 ___、箭头替换、「标签:」开头、无句末标点、英文词 <3 → 都不给喇叭。
// 词数下限 3：Day1 就有「I'm from China.」这类三词真句，不能按 4 挡。
function exSpk(s) {
  if (!s) return false;
  if (/[\u4e00-\u9fff]/.test(s)) return false;
  if (/[_\u2192\u2191\u2260\u300c\u300d\u21d2\u279c]|->/.test(s)) return false;
  if ((String(s).match(/[A-Za-z']+/g) || []).length < 3) return false;
  if (/^[A-Za-z][A-Za-z ]{0,12}:\s/.test(s)) return false;
  if (/^\d/.test(s)) return false;                          // 日程条目（10:45 - 11:45 writing…）
  if (/^(Day|Box|Minute|Week)\s*\d/i.test(s)) return false; // 打卡/计划条目（Day 5: mixed practice…）
  // v1.1.86：句末允许跟一个短括号补充 —— `The town that I visited was quiet. (not where)`
  // 是语法真例句（对照 where/that 的用法），此前被「以 ) 结尾 = 没有句末标点」误挡掉喇叭。
  return /[.!?]["']?\s*(\([^)]{0,24}\))?\s*$/.test(String(s).trim());
}
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');
const speech = require('../../utils/speech.js');
const wordforms = require('../../utils/wordforms.js');

Page({
  data: {
    // 主题在 data 初始化阶段就确定（与 tabBar v1.1.7 同款）：首帧即正确深浅，
    // onLoad 的 setData 实测晚 1-3 帧才上屏（09-26 录屏 f103/116/128 白光根因）
    dark: theme.isDark(),
    pageStyle: theme.isDark() ? 'background-color:#0E1618;' : '',
    // 自定义导航栏（v1.1.33）：标题走 data 绑定 <nav-bar title>，不再调 setNavigationBarTitle
    navTitle: '今日单词',
    // ⚠️ 必须初始化为 0（falsy）：首次 onShow 才会走「默认落点」分支（准备期倒计时卡/
    // 第一个未完成日）。若是 1，冷启动直接命中「保持浏览位置」分支，准备期用户永远
    // 看到 Day 1——09-26 用户实测清除记录/改日期后仍显示 Day 1 的根因之一
    viewDay: 0,
    totalDays: plan.TOTAL_DAYS,
    todayNum: 0,
    preStart: false,
    daysToStart: 0,
    dayNum: 1,
    dowText: '',       // 日期副标题：星期（周一~周日）；等级模块下线后，这行从「等级名」改回星期
    theme: '',
    dayData: null,
    vocab: [],
    zhOpen: {},        // 例句中文展开表 { 单词: 1 }（v1.1.53，默认不显示）
    extraStart: -1,   // 扩展词在 vocab 中的起始下标（-1 表示全是核心词）
    coreCount: 0,
    extraCount: 0,
    checked: false,
    hlWord: '',       // 从搜索页跳来时的定位高亮词（v1.1.46），2s 后自动清空
    hlVia: '',        // 变体标注（v1.1.75）：『took』是它的过去式 —— 搜索结果卡的标注在定位行下延续
    hlQ: '',          // 用户当时输入的查询词（标注主语）
    playingText: '',
    playingAccent: '',
    wfText: '',      // 词形小标签播放态（v1.1.78）：与词条播放态隔离，防变体文本撞词条误亮词卡
    wfKey: '',       // 词形高亮唯一键（v1.1.81）：词+':'+形式，防多卡同 form 串亮
    playingMode: 'idle',
    pluginOk: false,
  },

  onLoad() {
    // 同值守卫：data 已初始化为主题值，此处通常 0 次 setData
    theme.applyPage(this); theme.syncTabBar(this);
    const ok = speech.initPlugin();
    speech.setRate(store.get('rate'));
    speech.setAccent(store.get('accent') || 'us');
    speech.setEngine(store.get('engine'));
    speech.setEngineMode(store.get('engineMode') || 'auto');
    this._offSpeech = speech.onStateChange((payload) => {
      // 词形播放分支（v1.1.78）：wfText 存在期间主行 playingText/卡拉OK 一律冻结，播完清 wfText
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
      const upd = { playingText: payload.playing ? payload.text : '', playingAccent: payload.accent || '', playingMode: payload.mode };
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
    // 跨页跳天（等级页点某天 / 搜索页点结果）：switchTab 不能带参，一律走 globalData 中转。
    // jumpWord 只有搜索页会设，消费后立即清掉 —— 否则下次切 tab 回来会再定位一次。
    const app = getApp();
    const jump = app.globalData.jumpDay || 0;
    const jumpWord = app.globalData.jumpWord || '';
    const jumpVia = app.globalData.jumpVia || null;
    app.globalData.jumpDay = 0;
    app.globalData.jumpWord = '';
    app.globalData.jumpVia = null;
    const todayNum = plan.currentDayFromStart(store.get('startDate'));
    // 切 tab 返回（无 jump 且页面未销毁）：保持离开时的浏览位置与准备期预览态，仅刷新打卡/同步数据。
    // 重新冷启动小程序才回到默认落点（第一个未完成日 / 准备期卡片）。
    if (!jump && this.data.viewDay) {
      // 同值守卫：todayNum/daysToStart 多数时候没变，裸 setData 会整树重渲染（切 tab 闪屏）
      theme.sameSet(this, { todayNum, daysToStart: this._daysToStart() });
      this.renderDay(this.data.viewDay);
      // 防御：理论上 jump 与 jumpWord 同生共死，走不到这条分支；万一 jumpDay 被别的入口清了，
      // jumpWord 仍应生效（搜索页的定位不该因为绕路而丢）
      if (jumpWord) this._scrollToWord(jumpWord, 0, jumpVia);
      return;
    }
    // 默认落点 = 第一个未完成的学习日（打卡驱动）：没学/没学完，第二天仍停在这一天；
    // 全部完成时回退自然日 todayNum。从等级页跳转（jump）或手动翻页不受影响。
    const preStart = todayNum === 0 && !jump;
    theme.sameSet(this, { todayNum, preStart, daysToStart: this._daysToStart() });
    // 准备期不渲染日内容：renderDay 会把标题改成「第 N 天 · 等级」，
    // 准备期标题应保持「今日单词」；日数据由「先看看第 1 天」入口按需渲染
    if (preStart) { this._setTitle(null); return; }
    let viewDay = jump || store.firstUnfinishedDay() || todayNum || 1;
    if (viewDay < 1) viewDay = 1;
    if (viewDay > plan.TOTAL_DAYS) viewDay = plan.TOTAL_DAYS;
    this.renderDay(viewDay);
    if (jumpWord) this._scrollToWord(jumpWord, 0, jumpVia);
  },

  onUnload() {
    this._clearHl();
    speech.stop();
    if (this._offSpeech) this._offSpeech();
    this._offSpeech = null;
  },

  // 搜索入口（v1.1.67）：搜索已并入「工具」tab 页 —— 这里切到工具页并让输入框聚焦。
  // switchTab 不能带参，走 globalData 中转（工具页 onShow 消费后立即清标记，避免下次切 tab 又弹键盘）。
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

  // 从搜索页跳来时的定位（v1.1.46）：等渲染上屏 → 量目标行位置 → 滚进视口 → 闪一下。
  // renderDay 的 setData 是异步的，量不到（还没上屏）就重试，最多 5 次（v1.1.49 由 3 次放宽，
  // 低端机上首屏渲染慢于 360ms 时不会再把定位丢掉）；高亮只在首次进入时设，重试不重复设。
  // 词形标签点读（v1.1.77）：与工具页 onSpeakWf 同构，变体音频走 g/ 桶（按文本哈希）
  onSpeakWfToday(e) {
    const t = e.currentTarget.dataset.text;
    const key = e.currentTarget.dataset.key || t;   // v1.1.81：唯一键=词+':'+形式 —— were/was/been 三卡同有「be」，纯 form 键会三处同亮
    if (!t) return;
    if (this.data.wfKey === key) { speech.togglePause(); return; }   // 再点同标签 = 暂停
    if (this.data.playingText || this.data.playingAccent) {
      this.setData({ playingText: '', playingAccent: '' });         // 词条→词形切换：清主行态
    }
    this.setData({ wfText: t, wfKey: key });
    const wfAi = plan.wordAi(t);
    speech.speak(t, wfAi ? { ai: wfAi, kind: 'w' } : { kind: 'g' });   // 词表内形式（be/do/take…）走 w/ 桶 = 与单词同一文件（v1.1.85）
  },

  _scrollToWord(w, tries, via) {
    const n = tries || 0;
    const idx = (this.data.vocab || []).findIndex(v => v.w === w);
    // 词还没上屏（renderDay 的 setData 尚未落到视图层）→ 稍后重试，别静默放弃（v1.1.48）
    if (idx < 0) { if (n < 5) setTimeout(() => this._scrollToWord(w, n + 1), 120); return; }
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
          if (!rect || !sv) { if (n < 5) this._scrollToWord(w, n + 1); return; }
          // 上移 140px：让目标行落在导航栏下方一点，而不是贴着屏幕顶端
          wx.pageScrollTo({ scrollTop: Math.max(0, rect.top + sv.scrollTop - 140), duration: 320 });
        });
    }, n === 0 ? 180 : 160);
  },

  _clearHl() { if (this._hlTimer) { clearTimeout(this._hlTimer); this._hlTimer = null; } },

  // 导航标题统一出口（v1.1.33 起为自定义导航栏）：恒为「今日单词」。
  // v1.1.68：不再随天数变化 —— 导航栏的「第 N 天」与下方 day-head 卡里的「第 N 天」是同一个数，
  // 并排显示属重复（用户真机指出）。标题是 data 字段，经 sameSet 同值守卫绑定到 <nav-bar>，换 tab 不会串。
  _setTitle() {
    theme.sameSet(this, { navTitle: '今日单词' });
  },

  _daysToStart() {
    const sd = new Date((store.get('startDate') || plan.DEFAULT_START) + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.ceil((sd - today) / 86400000));
  },

  renderDay(day) {
    const info = plan.dayInfo(day);
    const week = plan.WEEKS[info.wIdx];
    const raw = plan.getDay(day);
    // dayData 里剔除词汇数组 v，避免与 vocab 重复 setData 两份（传输量翻倍）
    const dayData = raw ? Object.assign({}, raw) : null;
    if (dayData) delete dayData.v;
    // 词形标签（v1.1.80）：换成 wfNotes —— 正向（原形→不规则变化）+ 反向（变体→原形，如 were→原形 be）。
    // 原来只用 noteFor，功能词包里的 was/were/been/am/is/are 作今日单词时词形行是空的。
    const list = (raw && raw.v ? raw.v : []).map(v => Object.assign({}, v, { starred: store.isStarred(v.w), wf: wordforms.wfNotes(v.w) }));
    // 例句精读（v1.1.85）：这些句子在模板里是 `data-kind="g"` 且**没有词表编号** → 走文本哈希（g/ 桶）。
    // ⚠️ 两点：① 含汉字的句子（「每天 5 分钟回忆，胜过 20 分钟抄写。」）没有可朗读的英文 → 标 spk=false，
    //    模板据此不渲染喇叭（此前它们带喇叭，点下去是在线 TTS 读中文）；② 句子文本要提前收进 g/ 桶，
    //    否则真机点一次就等一次云函数签名 + 下载（与 v1.1.82 语法例句同一类问题）。
    let gEx = [];
    if (dayData && dayData.g) {
      const ex = (dayData.g.ex || []).map(s => ({ v: s, spk: exSpk(s) }));   // 注释类（提示/例词清单/Tag/日程）一律不给喇叭
      gEx = ex.filter(x => x.spk);
      // v1.1.87：这张卡只在「确实有可朗读的英文例句」时才叫「例句精读」。
      // 纯方法日（主动回忆法/影子跟读/时间安排……）的讲解里没有任何英文语言点，
      // 例句是中文要点、也不给喇叭 → 标题改叫「今日要点」，避免名不副实。
      const gLabel = gEx.length ? '例句精读' : '今日要点';
      dayData.g = Object.assign({}, dayData.g, { ex: ex, label: gLabel });   // 浅拷贝后换新对象，避免污染 plan 的缓存数据
    }
    const coreCount = dayData ? dayData.coreCount || 0 : 0;
    // 练习任务按 "1) 2) 3)" 编号拆行（数据源里是一整段，无换行符）
    const prLines = dayData && dayData.pr ? String(dayData.pr).split(/(?=\d\)\s)/).map(s => { const m = s.match(/^(\d+)\)\s*/); return { no: m ? m[1] : '', text: m ? s.slice(m[0].length) : s }; }) : [];
    // 同日同状态（打卡/收藏位未变）直接跳过整页 setData：
    // 微信 setData 不做深度 diff，同值也会整树重渲染 —— 这就是切 tab 回页「闪一下像重新渲染」的根源
    const sig = [day, store.isChecked(info.wIdx + 1, info.k) ? 1 : 0, list.map(v => v.starred ? 1 : 0).join('')].join('|');
    if (sig === this._daySig) {
      this._setTitle(day);
      return;
    }
    this._daySig = sig;
    this.setData({
      viewDay: day,
      dayNum: day,
      dowText: info.dow,
      theme: week.theme,
      dayData,
      prLines,
      vocab: list,
      extraStart: coreCount < list.length ? coreCount : -1,
      coreCount: coreCount,
      extraCount: list.length - coreCount,
      checked: store.isChecked(info.wIdx + 1, info.k),
    });
    this._setTitle(day);
    // 后台把当天音频预拉进本地缓存（静默，失败不影响播放）
    if (list.length) {
      const items = [];
      list.forEach(v => { items.push({ ai: v.ai, kind: 'w' }); items.push({ ai: v.ai, kind: 's' }); });
      speech.prefetch(items.slice(0, 40), 0);   // 全天只签链接（v1.1.72），落盘交给滑动窗口
      if (gEx.length) speech.prefetch(gEx.map(x => ({ text: x.v })), 0);   // 例句精读（v1.1.85）：走 g/ 桶哈希
      this._prefetchWindow(0);
    }
  },

  prevDay() { if (this.data.viewDay > 1) { speech.stop(); this.renderDay(this.data.viewDay - 1); } },
  nextDay() {
    if (this.data.viewDay < plan.TOTAL_DAYS) { speech.stop(); this.renderDay(this.data.viewDay + 1); }
  },
  backToToday() {
    const t = this.data.todayNum || 1;
    speech.stop();
    // 准备期（preStart）点「先看看第 1 天」：必须退出准备期卡片，否则 renderDay 渲染了也被 wx:if 盖住
    this.setData({ preStart: false });
    this.renderDay(t);
  },

  resetView() {
    // 清除记录/改开始日期后由设置页调用：丢弃浏览位置，下次 onShow 走默认落点
    // （startDate 重置为今天 → todayNum=1，直接进第 1 天；开始日被设到未来时才进准备期倒计时卡）
    this._daySig = null;
    this.setData({ viewDay: 0 });
  },

  backToPrep() {
    // 准备期浏览某天后返回倒计时卡（todayNum=0 时今日页顶部「回到准备期」入口）
    speech.stop();
    this._daySig = null;
    this.setData({ preStart: true, viewDay: 0 });
    this._setTitle(null); // 标题同步回「今日单词」，否则残留「第 N 天」
  },

  fb() { return this.selectComponent('#fb'); },

  onCheckin() {
    // 准备期只预览不打卡：打卡会把「还没开学的日子」记成已完成，进度与云同步全乱
    if (this.data.todayNum === 0) { this.fb().toast('开始后才能打卡', 1200); return; }
    const info = plan.dayInfo(this.data.viewDay);
    const now = store.toggleCheck(info.wIdx + 1, info.k);
    this.setData({ checked: now });
    // 反馈统一走 feedback 组件白卡轻提示（原生黑块已废除）
    if (now) this.fb().toast('打卡成功', 900);
  },

  // ---- 朗读 ----
  // 一个 handler 通吃：音标模块（带 data-accent=us|uk）、例句、语法例句（不带 accent → 用全局口音）
  onSpeakWord(e) {
    const ds = e.currentTarget.dataset;
    const text = ds.text || ds.example || ds.word;
    if (!text) return;
    if (this.data.wfText) this.setData({ wfText: '', wfKey: '' });   // 词形→词条切换：先收词形态
    const accent = ds.accent || '';
    const same = this.data.playingText === text && (this.data.playingAccent || '') === accent;
    if (same) {
      const r = speech.togglePause();
      this.setData({ playingText: r === 'paused' ? '' : text, playingAccent: r === 'paused' ? '' : accent });
      return;
    }
    const ai = Number(ds.ai) || 0;
    speech.speak(text, { ai: ai, kind: ds.kind || 's', accent: accent });
    // 滑动窗口（v1.1.72）：以正在播的词为基点，往后备 2 个词的音频
    const vi = this.data.vocab.findIndex(v => v.ai === ai);
    if (vi >= 0) this._prefetchWindow(vi);
  },

  onSpeakAll() {
    if (!this.data.vocab.length) return;
    if (this.data.playingMode === 'queue') { speech.stop(); return; }
    const items = [];
    this.data.vocab.forEach(v => {
      items.push({ text: v.w, ai: v.ai, kind: 'w' });
      if (v.e) items.push({ text: v.e, ai: v.ai, kind: 's' });
    });
    speech.speakQueue(items);
    this._prefetchWindow(0);
  },

  onStar(e) {
    const i = e.currentTarget.dataset.index;
    const v = this.data.vocab[i];
    if (!v) return;
    const starred = store.toggleStar(v);
    const patch = {};
    patch['vocab[' + i + '].starred'] = starred;
    this.setData(patch);
  },

  // 滑动窗口预取（v1.1.72）：从 startIdx 起连 3 个词，各备 3 个文件 =
  // 单词正常速 + 单词慢速 + 例句（例句速度跟全局慢速开关）。约 150KB，失败静默。
  // 用户往下听时窗口跟着滚 —— 连续听不打断，慢速首播也不走网络。
  _prefetchWindow(startIdx) {
    const list = this.data.vocab;
    if (!list.length) return;
    const items = [];
    for (let i = startIdx; i < Math.min(startIdx + 3, list.length); i++) {
      const v = list[i];
      if (!v || !v.ai) continue;
      items.push({ ai: v.ai, kind: 'w', slow: false });
      items.push({ ai: v.ai, kind: 'w', slow: true });
      if (v.e) items.push({ ai: v.ai, kind: 's' });
    }
    speech.prefetch(items);
  },

  // 例句中文眼睛开关（v1.1.53）：按词记展开态，默认不显示。
  // 用「整对象替换」而不是 setData({'zhOpen.' + w: ...}) —— 词条含空格（get up）等字符，
  // 拼数据路径不可靠；整表只有当天十几~几十个词，开销可忽略。
  onToggleExZh(e) {
    const w = e.currentTarget.dataset.w;
    if (!w) return;
    const m = Object.assign({}, this.data.zhOpen);
    if (m[w]) delete m[w]; else m[w] = 1;
    this.setData({ zhOpen: m });
  },
});

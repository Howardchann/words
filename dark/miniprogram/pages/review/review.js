// pages/review/review.js —— 复习：随机抽查 + 重点词
const plan = require('../../utils/data.js');
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');
const speech = require('../../utils/speech.js');
const wordforms = require('../../utils/wordforms.js');

// 收藏词在 store 里是快照（v1.1.44 之前的存量没有 ipa 字段）→ 渲染前按词反查词表补全。
let _ipaMap = null;
function ipaOf(w) {
  if (!_ipaMap) { _ipaMap = {}; plan.allWords().forEach(x => { if (x.ipa) _ipaMap[x.w] = x.ipa; }); }
  return _ipaMap[w] || '';
}
// 同理：收藏快照（store.toggleStar）只存 {w,m,p,e,ai,ts}，没有 cn，渲染前按词反查补全（v1.1.53）
let _cnMap = null;
function cnOf(w) {
  if (!_cnMap) { _cnMap = {}; plan.allWords().forEach(x => { if (x.cn) _cnMap[x.w] = x.cn; }); }
  return _cnMap[w] || '';
}
// 收藏快照同样没有 uk（英音音标，v1.1.51 加入）——重点词磁贴只显示美音胶囊的根因，渲染前反查补全
let _ukMap = null;
function ukOf(w) {
  if (!_ukMap) { _ukMap = {}; plan.allWords().forEach(x => { if (x.uk) _ukMap[x.w] = x.uk; }); }
  return _ukMap[w] || '';
}

Page({
  data: {
    // 主题 data 初始化（与 tabBar 同款）：首帧即正确深浅，见 today.js 注释
    dark: theme.isDark(),
    pageStyle: theme.isDark() ? 'background-color:#0E1618;' : '',
    // 自定义导航栏（v1.1.34）：标题走 data 绑定 <nav-bar title>
    navTitle: '复习巩固',
    poolSize: 0,
    dueCount: 0,
    // v1.1.38 串卡修复：随机/到期两个 tab 各记各的当前词，互不串显。
    // 旧版共用一份 current —— 到期页设的词切到随机页还在（wxml 两块卡片都绑 {{current}}）
    currentRandom: null,   // {w, m, p, e, ai, starred}
    currentDue: null,
    showZh: false,
    starred: [],
    playingWord: '',
    playingAccent: '',
    // 词形标签独立播放态（v1.1.80，同今日页 v1.1.78）：词形朗读文本可能与卡片上的单词/例句撞车，
    // 用独立键记「正在播的是哪个标签」→ 只亮标签自己，不误亮卡片上的其他元素。
    wfText: '',
    wfKey: '',          // 词形高亮唯一键（v1.1.81）：词+':'+形式，防磁贴列表同 form 串亮
    dueHint: null,      // 四档各自的下次间隔提示（Anki 式按钮副标题）
    cloze: null,        // 中文例句挖空：当前题 {zh, en, answer, options, done, right}
    clozePoolSize: 0,   // 可出填空题的词数（词库有中文例句的）
    zhOpen: {},         // 例句中文展开表 { 单词: 1 }（v1.1.53，默认不显示）
    tab: 'random',      // random | due | cloze | starred
  },

  onLoad() {
    // 同值守卫：data 已初始化为主题值，此处通常 0 次 setData
    theme.applyPage(this); theme.syncTabBar(this);
    // 监听器返回取消函数，页面卸载时注销（旧实现会永久堆积回调）
    this._offSpeech = speech.onStateChange((payload) => {
      const upd = { playingWord: payload.playing ? payload.text : '', playingAccent: payload.playing ? (payload.accent || '') : '' };
      if (payload.playing && payload.text) {
        const lit = Math.round((payload.progress || 0) * payload.text.length);
        upd.karaLit = payload.text.slice(0, lit);
        upd.karaRest = payload.text.slice(lit);
      } else { upd.karaLit = ''; upd.karaRest = ''; }
      // 词形播放分支（v1.1.93 对齐今日页 v1.1.78 语义）：wf 播放中词条态冻结（onSpeakWf 切换时已先清词条态），播完清 wf 态。
      // 旧写法「if (...) upd.wfText=空; upd.wfKey=空;」少花括号 → wfKey 每次回调都被清，词形磁贴高亮一点就灭（v1.1.81 起，真机 be→were 反馈）。
      if (this.data.wfText) {
        if (!payload.playing) { this.setData({ wfText: '', wfKey: '' }); return; }
        if (payload.text === this.data.wfText) return;   // wf 自己的进度回调：保持冻结（词形磁贴只亮 --on，无卡拉OK 渲染位）
        this.setData({ wfText: '', wfKey: '' });      // 用户点了别的（词条）：收掉 wf 态，落入下方正常分支
      }
      this.setData(upd);
    });
  },

  onUnload() {
    speech.stop();
    if (this._offSpeech) this._offSpeech();
    this._offSpeech = null;
  },

  applyTheme() { theme.applyPage(this); theme.syncTabBar(this); },
  onHide() {
    // 盖罩上幕（v1.1.32）：页面被盖住的瞬间就罩纯背景罩。隐藏期间合成器有充足时间把罩
    // 合成入帧——之后无论从哪切回（底部 tab / 设置页 deep-link），切换瞬间的残帧必然是
    // 纯背景色，旧 tab 内容物理上无帧可现。（v1.1.28~31 三轮证明：渲染回调后 switchTab
    // 仍会补出盖罩前旧帧，录屏 s128 实锤——残帧在合成器层，JS 时序赌不赢，只能提前布景）
    if (!this.data.veil) this.setData({ veil: true });
  },

  onShow() {
    // 撤罩与换 tab 合并成一次原子 setData（v1.1.32）：不存在「先撤罩露旧 tab、再换 tab」
    // 的中间帧。普通返回（无 flag）只撤罩，罩下就是当前 tab 内容，一帧内恢复。
    // 设置页「学习进度」跳转指定 tab（v1.1.27）：重点词→starred、复习记录→random。
    // switchTab 无法带参 → 经 globalData.reviewTab 传递，消费后立即清掉（不影响正常切 tab）
    const app = getApp();
    const flag = app && app.globalData && app.globalData.reviewTab;
    if (flag) app.globalData.reviewTab = null;
    if (flag && flag !== this.data.tab) {
      this.setData({ tab: flag, veil: false });
      if (flag === 'due' && !this.data.currentDue) this.onNextDue();
      if (flag === 'cloze' && !this.data.cloze) this.onNextCloze();
    } else if (this.data.veil) {
      this.setData({ veil: false });
    }
    // 暴露实例给跨栈预切换（v1.1.28）：tab 页常驻不卸载，设置页在 switchTab「之前」直接对
    // 本实例 setData 换 tab，切过来首帧即目标 tab——否则 webview 先恢复上次旧 tab 的 DOM、
    // onShow 的 setData 晚一帧才换，出现「random→starred 瞬移」闪现（v1.1.27 真机实锤）
    if (app && app.globalData) app.globalData._reviewPage = this;
    theme.syncTabBar(this, 1);
    this.applyTheme();
    store.onResume();
    this._pool = null;
    this.refreshPool();
    // 收藏列表同值守卫（新数组实例同值也会触发重渲染）；ipa/uk/cn 渲染时反查补全（v1.1.50）
    // wf（其他词形，v1.1.80）是派生字段、快照里没有 → 每次渲染都算
    const raw = store.get('starredWords') || [];
    const starred = raw.map(v => {
      const canonical = plan.normalizeWord(v);
      return Object.assign({}, canonical, {
        ipa: canonical.ipa || ipaOf(v.w), uk: canonical.uk || ukOf(v.w), cn: canonical.cn || cnOf(v.w),
        wf: wordforms.wfNotes(v.w, canonical.p), starred: true,
      });
    });
    const sj = JSON.stringify(starred);
    if (sj !== this._starredJson) { this._starredJson = sj; this.setData({ starred }); }
  },

  refreshPool() {
    if (!this._pool) this._pool = plan.learnedWords(store.get('checkedDays'));
    // 同值不 setData（setData 无 diff，同值也整树重渲染 → 切 tab 闪屏）
    const p = this._pool.length, d = store.dueWords(this._pool).length;
    const z = this._pool.filter(x => x.cn && plan.clozeSentence(x)).length;   // 有中文例句且能挖空 → 可出题
    if (p !== this.data.poolSize || d !== this.data.dueCount || z !== this.data.clozePoolSize) {
      this.setData({ poolSize: p, dueCount: d, clozePoolSize: z });
    }
    return this._pool;
  },

  onTab(e) {
    const t = e.currentTarget.dataset.tab;
    this.setData({ tab: t });
    // v1.1.38：首次进到期页抽一个词（不自动朗读）；已在到期页再点不再换词（保持当前词）
    if (t === 'due' && !this.data.currentDue) this.onNextDue();
    if (t === 'cloze' && !this.data.cloze) this.onNextCloze();
    // v1.1.80：切到重点词 tab 就把首屏磁贴的音频备好（下面 _prefetchAllStarred 有说明）
    if (t === 'starred') this._prefetchAllStarred();
  },

  // 四档下次间隔提示（<=0 天 = 仍在 10 分钟学习步）
  _hints(w) {
    const p = store.gradePreview(w);
    const f = d => d <= 0 ? '10 分钟'
      : (d === 1 ? '1 天'
      : (d < 30 ? d + ' 天'
      : (d < 365 ? Math.round(d / 30) + ' 个月' : (d / 365).toFixed(1) + ' 年')));
    return { again: f(p.again), hard: f(p.hard), good: f(p.good), easy: f(p.easy) };
  },

  fb() { return this.selectComponent('#fb'); },

  onNextDue() {
    const pool = store.dueWords(this.refreshPool());
    if (!pool.length) {
      this.setData({ currentDue: null });
      this.fb().toast('今天没有到期词，继续学习即可');
      return;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    // v1.1.38：去掉自动朗读 —— 朗读统一走卡片上的喇叭（onSpeakCurrent），点进卡片是静默的
    // v1.1.91：重点词快照只存 {w,m,p,e,ai,ts}，无 ipa/uk（store.js 注释同）——随机/到期卡抽到收藏词时
    // 此前不反查，导致美音胶囊无字、英音胶囊整块不渲染（真机反馈 were 只有一个读音）。此处与收藏列表同口径补齐。
    const canonical = plan.normalizeWord(item);
    const c = Object.assign({}, canonical, {
      ipa: canonical.ipa || ipaOf(item.w), uk: canonical.uk || ukOf(item.w), cn: canonical.cn || cnOf(item.w),
      starred: store.isStarred(item.w), wf: wordforms.wfNotes(item.w, canonical.p),
    });
    this.setData({ currentDue: c, showZh: false, dueHint: this._hints(item.w), wfText: '', wfKey: '' });
    this._prefetchCard(c);   // v1.1.80：抽到词就把音频备好，第一次点即出声
  },

  onReviewResult(e) {
    const grade = e.currentTarget.dataset.grade || 'good';
    const c = this.data.currentDue;
    if (!c) return;
    store.reviewWord(c.w, grade);
    // 长文字 toast 在快速连按时反复弹出，像整个模块在闪 —— 改短文案+短时长
    this.fb().toast(grade === 'again' ? '10 分钟后再考你一次' : '已记录', 800);
    // 到期 tab：先算好下一词、一次 setData 直接切换。
    // 旧写法先 setData({current:null}) 再 onNextDue()，中间会渲染一帧
    // 「目前没有到期复习词」空状态 —— 连按闪现整个模块的真凶就是它。
    const pool = store.dueWords(this.refreshPool());
    if (pool.length) {
      const item = pool[Math.floor(Math.random() * pool.length)];
      const canonical = plan.normalizeWord(item);
      const next = Object.assign({}, canonical, {
        ipa: canonical.ipa || ipaOf(item.w), uk: canonical.uk || ukOf(item.w), cn: canonical.cn || cnOf(item.w),
        starred: store.isStarred(item.w), wf: wordforms.wfNotes(item.w, canonical.p),
      });
      this.setData({ currentDue: next, showZh: false, dueHint: this._hints(next.w), wfText: '', wfKey: '' }); // v1.1.38：下一词同样不自动朗读
      this._prefetchCard(next);
      return;
    }
    // 真正没有下一词（到期答完）才显示空状态卡片
    this.setData({ currentDue: null, showZh: false });
  },

  // ---- 中文例句挖空（看中文例句 → 选英文单词；对错直接进 SM-2）----
  onNextCloze() {
    const pool = this.refreshPool();
    const cand = pool.filter(x => x.cn && plan.clozeSentence(x));
    if (!cand.length) {
      this.setData({ cloze: null });
      this.fb().toast('中文例句数据还没准备好', 1400);
      return;
    }
    const it = cand[Math.floor(Math.random() * cand.length)];
    const opts = plan.clozeOptions(it, pool, 4).map(w => ({ w: w, state: '' }));
    this.setData({
      cloze: { zh: it.cn, blank: plan.clozeSentence(it), en: it.e, ai: it.ai, answer: it.w, options: opts, done: false, right: false }
    });
    this._prefetchCard(it);   // v1.1.80：出题即预取该词音频（答对后要读整句）
  },

  onClozePick(e) {
    const c = this.data.cloze;
    if (!c || c.done) return;
    const w = e.currentTarget.dataset.w;
    const right = w === c.answer;
    store.reviewWord(c.answer, right ? 'good' : 'again');
    const options = c.options.map(o => ({
      w: o.w,
      state: o.w === w ? (right ? 'ok' : 'bad') : (o.w === c.answer ? 'reveal' : ''),
    }));
    this.setData({ cloze: Object.assign({}, c, { options: options, done: true, right: right }) });
    this.fb().toast(right ? '答对了' : '正确答案：' + c.answer, right ? 800 : 1500);
    this.refreshPool();
  },

  // 抽一个词：优先重点词（30%），并尽量避开上一次抽到的词
  pickItem(pool, starred, avoidWord) {
    let item = null;
    for (let tries = 0; tries < 4; tries++) {
      if (starred.length && Math.random() < 0.3) {
        item = starred[Math.floor(Math.random() * starred.length)];
      } else {
        item = pool[Math.floor(Math.random() * pool.length)];
      }
      if (!avoidWord || item.w !== avoidWord || pool.length < 2) break;
    }
    return item;
  },

  // ---- 随机复习 ----
  onNext() {
    const pool = this.refreshPool();
    if (!pool.length) {
      this.setData({ currentRandom: null });
      this.fb().toast('先打卡一两节，词汇池才有内容');
      return;
    }
    const starred = store.get('starredWords') || [];
    const item = this.pickItem(pool, starred, this._lastWord);
    this._lastWord = item.w;
    // 重点词池里的对象是副本，没有 starred 字段 —— 必须按单词实际状态回填，否则已收藏的词永远显示"未收藏"
    // v1.1.38：去掉自动朗读，与到期 tab 统一为手动喇叭
    // v1.1.91：重点词快照只存 {w,m,p,e,ai,ts}，无 ipa/uk（store.js 注释同）——随机/到期卡抽到收藏词时
    // 此前不反查，导致美音胶囊无字、英音胶囊整块不渲染（真机反馈 were 只有一个读音）。此处与收藏列表同口径补齐。
    const canonical = plan.normalizeWord(item);
    const c = Object.assign({}, canonical, {
      ipa: canonical.ipa || ipaOf(item.w), uk: canonical.uk || ukOf(item.w), cn: canonical.cn || cnOf(item.w),
      starred: store.isStarred(item.w), wf: wordforms.wfNotes(item.w, canonical.p),
    });
    this.setData({ currentRandom: c, showZh: false, wfText: '', wfKey: '' });
    this._prefetchCard(c);   // v1.1.80：切词即预取
  },

  // 释义/例句中文显隐开关（v1.1.64 用户定稿）：点击在「显示/隐藏」之间切换（对应卡片底部的眼睛图标，闭上=未显示、睁开=已显示）
  onShowZh() { this.setData({ showZh: !this.data.showZh }); },

  // 例句中文眼睛开关（v1.1.53）：按词记展开态，切词后各自独立；默认不显示。
  onToggleExZh(e) {
    const w = e.currentTarget.dataset.w;
    if (!w) return;
    const m = Object.assign({}, this.data.zhOpen);
    if (m[w]) delete m[w]; else m[w] = 1;
    this.setData({ zhOpen: m });
  },

  // v1.1.38：当前卡片随 tab 走 —— 两块卡片各绑各的数据，朗读/收藏/释义操作都作用在本 tab 的词上
  _cur() { return this.data.tab === 'due' ? this.data.currentDue : this.data.currentRandom; },

  // ---- 音频预取（v1.1.80，C1）----
  // 复习页此前完全没有预取：点播放才现场向云函数要签名链接（往返 1~3 秒）才开始下载，
  // 用户以为没点中又点一次 → 第一次的异步结果被丢弃（但链接已缓存）→ 就是「点好多次、等很久才出声」。
  // 修复：抽到/切到某个词时，就把它要用的音频提前签链接（顺带落盘）——看到卡片时音频已就绪，第一次点即出。
  // 备：美音正常速 + 美音慢速 + 英音正常速 + 例句；失败静默（speech.prefetch 内部逐项兜底）。
  _prefetchCard(c) {
    if (!c || !c.ai) return;
    const items = [
      { ai: c.ai, kind: 'w', slow: false },
      { ai: c.ai, kind: 'w', slow: true },
    ];
    if (c.uk) items.push({ ai: c.ai, kind: 'w', slow: false, accent: 'uk' });
    if (c.e) items.push({ ai: c.ai, kind: 's' });
    speech.prefetch(items);
  },

  // 重点词磁贴批量预取：只备首屏 6 个（一屏里看得见的那些），避免一次签太多链接。
  _prefetchAllStarred() {
    const items = [];
    (this.data.starred || []).slice(0, 6).forEach(v => {
      const ai = this._aiOf(v);
      if (!ai) return;
      items.push({ ai: ai, kind: 'w' });
      if (v.e) items.push({ ai: ai, kind: 's' });
    });
    if (items.length) speech.prefetch(items);
  },

  // 其他词形标签朗读（v1.1.80）：走 g/ 桶（按文本哈希预生成），与今日页/工具页同款。
  // 独立 wfText 态 —— 词形朗读文本可能与卡片上的单词/例句相同，只亮标签自己
  //（与 v1.1.78 治「点 been 误亮结果卡」同一套做法）。
  // 多义词副义项点读：使用副卡 ai 编号，不复用主卡音频。
  onSpeakAltSense(e) {
    const ds = e.currentTarget.dataset;
    if (!ds.text || !Number(ds.ai)) return;
    speech.speak(ds.text, { ai: Number(ds.ai), kind: 'w', accent: ds.accent || '' });
  },

  onSpeakWf(e) {
    const t = e.currentTarget.dataset.text;
    const key = e.currentTarget.dataset.key || t;   // v1.1.81：唯一键=词+':'+形式，防磁贴列表同 form 串亮
    if (!t) return;
    if (this.data.wfKey === key) { speech.togglePause(); this.setData({ wfText: '', wfKey: '' }); return; }
    const upd = { wfText: t, wfKey: key };
    if (this.data.playingWord) upd.playingWord = '';   // 词形→词条切换：先收词条播放态
    this.setData(upd);
    const wfAi = plan.wordAi(t);
    speech.speak(t, wfAi ? { ai: wfAi, kind: 'w' } : { kind: 'g' });   // 词表内形式（be/do/take…）走 w/ 桶 = 与单词同一文件（v1.1.85）
  },

  // 填空答对后朗读英文原句（v1.1.80，C6）：kind:'s' + 该词编号 → 命中例句预生成音频，音色与卡片一致。
  // 选项不加喇叭（一读出来就能听音猜词 → 泄题）。
  onSpeakClozeEn() {
    const c = this.data.cloze;
    if (!c || !c.en) return;
    if (this.data.playingWord === c.en) { speech.togglePause(); this.setData({ playingWord: '' }); return; }
    if (this.data.wfText) this.setData({ wfText: '', wfKey: '' });
    speech.speak(c.en, { ai: c.ai || 0, kind: 's' });
  },

  // accent 由音标模块的 data-accent 带入（us/uk）；无则用全局口音
  onSpeakCurrent(e) {
    const c = this._cur();
    if (!c) return;
    if (this.data.wfText) this.setData({ wfText: '', wfKey: '' });   // 词形→词条切换：先收词形态
    const accent = (e && e.currentTarget && e.currentTarget.dataset.accent) || '';
    if (this.data.playingWord === c.w && (this.data.playingAccent || '') === accent) {
      const r = speech.togglePause();
      this.setData({ playingWord: r === 'paused' ? '' : c.w, playingAccent: r === 'paused' ? '' : accent });
      return;
    }
    speech.speak(c.w, { ai: c.ai, kind: 'w', accent: accent });
    this.setData({ playingWord: c.w });
  },

  onSpeakExample() {
    const c = this._cur();
    if (!c || !c.e) return;
    if (this.data.wfText) this.setData({ wfText: '', wfKey: '' });
    speech.speak(c.e, { ai: c.ai, kind: 's' });
  },

  onStarCurrent() {
    const key = this.data.tab === 'due' ? 'currentDue' : 'currentRandom';
    const c = this.data[key];
    if (!c) return;
    const starred = store.toggleStar(c);
    this.setData({
      starred: store.get('starredWords') || [],
      [key + '.starred']: starred,
    });
  },

  // ---- 重点词列表 ----
  // 音频编号兜底（v1.1.40）：旧收藏记录（本版之前）没存 ai → 朗读走在线 TTS，
  // 与今日页预生成音频音色不一致（hello 两个音色的根因）。缺失时按单词从词库补查。
  _aiOf(it) {
    if (it && it.ai) return it.ai;
    if (!this._aiMap) {
      const m = {};
      plan.allWords().forEach(x => { m[x.w] = x.ai; });
      this._aiMap = m;
    }
    return it ? this._aiMap[it.w] || 0 : 0;
  },

  onSpeakStarred(e) {
    const w = e.currentTarget.dataset.word;
    const accent = e.currentTarget.dataset.accent || '';
    if (this.data.wfText) this.setData({ wfText: '', wfKey: '' });
    if (this.data.playingWord === w && (this.data.playingAccent || '') === accent) {
      const r = speech.togglePause();
      this.setData({ playingWord: r === 'paused' ? '' : w, playingAccent: r === 'paused' ? '' : accent });
      return;
    }
    // 重点词列表只传了单词文本，需从收藏数组里取回音频编号（旧记录经 _aiOf 从词库补）
    const it = (this.data.starred || []).filter(x => x && x.w === w)[0];
    speech.speak(w, { ai: this._aiOf(it), kind: 'w', accent: accent });
    this.setData({ playingWord: w });
  },

  // 重点词例句朗读（v1.1.40）：对齐今日页——点例句或右侧喇叭都可播，kind:'s' 命中例句预生成音频
  onSpeakStarredEx(e) {
    const w = e.currentTarget.dataset.word;
    if (this.data.wfText) this.setData({ wfText: '', wfKey: '' });
    if (this.data.playingWord === w) {
      const r = speech.togglePause();
      this.setData({ playingWord: r === 'paused' ? '' : w });
      return;
    }
    const it = (this.data.starred || []).filter(x => x && x.e === w)[0];
    speech.speak(w, { ai: this._aiOf(it), kind: 's' });
    this.setData({ playingWord: w });
  },

  onRemoveStarred(e) {
    const i = e.currentTarget.dataset.index;
    const starred = store.get('starredWords') || [];
    if (i >= 0 && i < starred.length) {
      store.toggleStar(starred[i]);
      this.setData({ starred: store.get('starredWords') || [] });
      this.fb().toast('已移除');
    }
  },
});

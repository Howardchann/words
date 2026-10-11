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
    segs.forEach(sg => {
      sg.say = sg.t === 'good' ? sayOf(sg.v) : '';   // v1.1.82 播放文本（无英文则空 → 不渲染喇叭）
      // v1.1.83 卡拉OK 显示切分：数据里常把「英文句 + 中文说明」连写（如「I need some advice. 不可数名词…」），
      // 而播放文本 say 只取英文部分。若直接按 say 切片染色，会和显示文本错位 → 这里把显示文本拆成
      // 「可点亮的英文前缀 say」+「不参与点亮的尾巴 tail」。say 不是 v 的前缀时（归一化差异）关掉本条卡拉OK。
      const sv = String(sg.v || '');
      sg.kara = !!(sg.say && sv.indexOf(sg.say) === 0);
      sg.tail = (sg.kara && sg.say !== sv) ? sv.slice(sg.say.length) : '';
    });
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
    karaLit: '',      // 卡拉OK：已读部分（v1.1.83）
    karaRest: '',     // 卡拉OK：未读部分
    toast: '',
  },

  onLoad(query) {
    theme.applyPage(this);
    speech.setRate(store.get('rate'));
    speech.setAccent(store.get('accent') || 'us');
    speech.setEngineMode(store.get('engineMode') || 'auto');
    // 朗读状态订阅（v1.1.68 修复）：此前只在点击时 setData({playingText})，播完没有任何回调复位 →
    // 例句整行常驻深色（用户真机反馈）。现在与今日页/工具页一致，订阅回调、播完自动还原。
    // v1.1.80（治闪动）：曾把卡拉OK 整个撤掉 —— 原因是当时 karaLit/karaRest 被**页面上每一个**
    //   例句行引用，进度回调（每秒约 3~4 次）会让整页所有行一起重算重绘（用户描述「滑到底闪上半屏、
    //   滑到顶闪下半屏」）。
    // v1.1.83（卡拉OK 回归，但换了渲染结构）：两个关键约束 ——
    //   ① wxml 里用 wx:if 双分支：**只有正在播放的那一行**才渲染 karaLit/karaRest，其余行是纯文本节点、
    //      完全不引用这两个字段 → 进度帧的重绘范围从「整页所有行」压到「该行的两个 text 节点」；
    //   ② 已读/未读两段拼起来 == 整句原文（只是切分点移动），文本总长度不变 → 断行点不变 → 无重排。
    //   这两点合起来才是「今日页卡拉OK 不闪、语法区当初会闪」的差别所在。
    this._offSpeech = speech.onStateChange((p) => {
      const t = p.playing ? p.text : '';
      const upd = {};
      if (t !== this.data.playingText) upd.playingText = t;
      if (t) {
        const lit = Math.round((p.progress || 0) * t.length);
        const a = t.slice(0, lit), b = t.slice(lit);
        if (a !== this.data.karaLit) upd.karaLit = a;
        if (b !== this.data.karaRest) upd.karaRest = b;
      } else if (this.data.karaLit || this.data.karaRest) {
        upd.karaLit = ''; upd.karaRest = '';
      }
      if (upd.playingText !== undefined || upd.karaLit !== undefined || upd.karaRest !== undefined) this.setData(upd);
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
      this.setData({ playingText: '', karaLit: '', karaRest: '' });
      return;
    }
    // 换句播放：卡拉OK 从零起步（progress 首帧前先用空切片，避免上一句的染色残留一帧）
    this.setData({ playingText: text, karaLit: '', karaRest: '' });
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

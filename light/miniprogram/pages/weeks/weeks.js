// pages/weeks/weeks.js —— 学习等级总览（L1–L4 / 546 天 / 8000 词）
// v1.1.66 等级制重构：「周」不再作为对外单位。页面按 4 个等级组织，进度一律以「天」计，
// 展开后是连续日格（每 7 格一组，第 6、7 格为复习日），不再出现「第 X 周」。
const plan = require('../../utils/data.js');
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');

Page({
  data: {
    // 主题 data 初始化（与 tabBar 同款）：首帧即正确深浅，见 today.js 注释
    dark: theme.isDark(),
    pageStyle: theme.isDark() ? 'background-color:#0E1618;' : '',
    // 自定义导航栏（v1.1.34）：标题走 data 绑定 <nav-bar title>
    navTitle: '学习等级',
    pressed: '',      // 手动按压态：当前按下的 pk（见 onTileDown）
    levels: [],       // [{lv,name,label,rangeText,days,words,doneCount,percent,isCurrent}]
    openLevel: 0,     // 当前展开的等级（0=全部折叠）
    openDays: [],     // 展开等级的日格 [{d,done,rest}]
    openTitle: '',
    curLabel: '',     // 顶部卡：当前所在等级
    curDayText: '',   // 顶部卡：第 N 天 / 尚未开始
    curDone: 0,
    curDays: 0,
    curPercent: 0,
    todayNum: 0,
    daysToStart: 0,   // 准备期横幅（todayNum=0 时显示）
    startDateText: '',
    totalChecked: 0,
    totalDays: plan.TOTAL_DAYS,
    totalPercent: '0.0',  // WXML 的 {{}} 不支持函数调用（如 toFixed），必须在 JS 算好再传入
  },

  applyTheme() { theme.applyPage(this); theme.syncTabBar(this); },
  onLoad() { theme.applyPage(this); theme.syncTabBar(this); },
  onShow() {
    // 按压态兜底清零放最前：万一 DOM 随旧帧带回 tint，这里的清除渲染越早发出闪现越短
    if (this.data.pressed) this.setData({ pressed: '' });
    theme.syncTabBar(this, 1);
    this.applyTheme();
    store.onResume();
    this.refresh();
  },

  refresh() {
    const todayNum = plan.currentDayFromStart(store.get('startDate'));
    // 准备期（todayNum=0）：顶部横幅需要开始日期与倒计时天数
    const startDate = store.get('startDate') || plan.DEFAULT_START;
    let daysToStart = 0, startDateText = '';
    if (todayNum === 0) {
      const sd = new Date(startDate + 'T00:00:00');
      const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      daysToStart = Math.max(0, Math.ceil((sd - today) / 86400000));
      startDateText = (sd.getMonth() + 1) + ' 月 ' + sd.getDate() + ' 日';
    }

    const cur = plan.levelOfDay(todayNum || 1);
    const levels = plan.LEVELS.map(L => {
      let done = 0;
      for (let d = L.startDay; d <= L.endDay; d++) {
        const info = plan.dayInfo(d);
        if (store.isChecked(info.wIdx + 1, info.k)) done++;
      }
      return {
        lv: L.lv,
        name: L.name,
        label: L.label,
        rangeText: L.rangeText,
        days: L.days,
        words: L.words,
        doneCount: done,
        percent: Math.round(done * 100 / L.days),
        isCurrent: L.lv === cur.lv,
      };
    });

    const totalChecked = store.checkedCount();
    const totalPercent = totalChecked >= plan.TOTAL_DAYS
      ? '100.0'
      : (totalChecked * 100 / plan.TOTAL_DAYS).toFixed(1);

    // 同值守卫：本页状态全由 checkedDays 派生，无变化就不再整树 setData（切 tab 闪屏根源）
    const sig = [totalChecked, todayNum, startDate].join('|');
    if (sig === this._weeksSig) { this.syncOpenDays(); return; }
    this._weeksSig = sig;

    const ci = levels[cur.lv - 1] || levels[0];
    this.setData({
      levels,
      todayNum,
      daysToStart,
      startDateText,
      totalChecked,
      totalDays: plan.TOTAL_DAYS,
      totalPercent,
      curLabel: cur.label,
      curDayText: todayNum > 0 ? ('第 ' + todayNum + ' 天') : '尚未开始',
      curDone: ci.doneCount,
      curDays: ci.days,
      curPercent: ci.percent,
    });
    this.syncOpenDays();
  },

  // 展开等级的日格：只在展开时构建，避免 546 个节点常驻 data
  syncOpenDays() {
    const lv = this.data.openLevel;
    if (!lv) {
      if (this.data.openDays.length) this.setData({ openDays: [], openTitle: '' });
      return;
    }
    const L = plan.LEVELS[lv - 1];
    if (!L) return;
    const list = [];
    for (let d = L.startDay; d <= L.endDay; d++) {
      const info = plan.dayInfo(d);
      list.push({ d: d, done: store.isChecked(info.wIdx + 1, info.k), rest: info.k >= 6 });
    }
    this.setData({
      openDays: list,
      openTitle: L.label + ' · ' + L.rangeText + ' · ' + L.words + ' 词',
    });
  },

  // 磁贴按压：手动管理（替代原生 hover-class，v1.1.19）。原因有二：
  // ① 原生 hover 会沿节点链激活——点日格连父级一起亮；
  // ② switchTab 跳转时 hover 清理不可靠，返回本页后按压底色残留（实机翻车）。
  // touchmove 也清：在磁贴上起手滑动（滚动列表）时不该亮按压态。
  // touchend 的清除 setData 可能来不及在页面隐藏前刷到渲染层（数据已清、DOM 还带 tint）
  // → jumpToDay 跳转前同步清 pressed + 延迟 100ms 再 switchTab（保证清除渲染先落），
  //    onHide/onShow 各再兜底一次。
  onTileDown(e) {
    const k = e.currentTarget.dataset.pk;
    if (this.data.pressed !== k) this.setData({ pressed: k });
  },
  onTileUp() {
    if (this.data.pressed) this.setData({ pressed: '' });
  },
  // —— 日格「按压-确认」模式 ——
  // 按住亮按压色、松手才跳转；touchend 不灭灯，tint 一直保持到 jumpToDay 主动清掉，
  // 观感=「按住保持、松手跳转」且切页前 DOM 已清干净、返回无残留闪现。
  // touchmove 仅灭灯（滚动不拖着亮块走）；大幅滑动时 tap 不派发，由 onChipEnd 的 350ms 兜底灭灯。
  onChipDown(e) {
    const k = e.currentTarget.dataset.pk;
    if (this.data.pressed !== k) this.setData({ pressed: k });
  },
  onChipMove() {
    if (this.data.pressed) this.setData({ pressed: '' });
  },
  onChipEnd() {
    clearTimeout(this._chipTimer);
    this._chipTimer = setTimeout(() => { if (this.data.pressed) this.setData({ pressed: '' }); }, 350);
  },
  onChipCancel() {
    clearTimeout(this._chipTimer);
    if (this.data.pressed) this.setData({ pressed: '' });
  },
  onHide() {
    // 离开本页即清按压态：switchTab 期间 touchend 可能没跑，数据层不留脏状态
    if (this.data.pressed) this.setData({ pressed: '' });
  },

  // 展开/收起某个等级
  onLevelTap(e) {
    const lv = Number(e.currentTarget.dataset.lv);
    this.setData({ openLevel: this.data.openLevel === lv ? 0 : lv });
    this.syncOpenDays();
  },

  // 跳转到某一天：today 是 tabBar 页面，必须用 switchTab（旧实现用 navigateTo，必然失败）。
  // 跳转前同步清 pressed + 延迟 100ms 再 switchTab（v1.1.21 铁律）——保证「清除 tint」的渲染
  // 先于页面隐藏落到渲染层。因 touchend 不灭灯（按压-确认模式），tint 实际显示 = 按住时长 + 100ms。
  jumpToDay(day) {
    const app = getApp();
    if (this.data.pressed) this.setData({ pressed: '' });
    if (app && app.globalData) app.globalData.jumpDay = day;
    setTimeout(() => { wx.switchTab({ url: '/pages/today/today' }); }, 100);
  },

  // 点某一天（日格是唯一跳转入口）
  onDayTap(e) {
    this.jumpToDay(Number(e.currentTarget.dataset.d));
  },
});

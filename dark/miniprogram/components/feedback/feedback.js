// components/feedback —— 轻提示（白卡 toast）+ 白卡弹窗（替代 wx.showToast / wx.showModal）
const theme = require('../../utils/theme.js');
Component({
  options: { styleIsolation: 'isolated' },
  data: {
    toast: { show: false, msg: '', dark: false },
    modal: { show: false, title: '', content: '', confirmText: '确定', cancelText: '取消', danger: false, showCancel: false }
  },
  lifetimes: { detached() { if (this._timer) clearTimeout(this._timer); } },
  methods: {
    /* 轻提示：白底圆角小卡 + 绿勾，默认 1400ms 自动消失；toast(msg, duration)。
       dark 在每次弹出时读一次主题（toast 存活仅 1.4s，弹出瞬间读足够准）：
       勾是 background-image 里的 SVG，吃不到 CSS 变量继承，只能靠类名切深色图。 */
    toast(msg, duration) {
      if (this._timer) clearTimeout(this._timer);
      this.setData({ 'toast.show': true, 'toast.msg': msg || '', 'toast.dark': theme.isDark() });
      this._timer = setTimeout(() => this.setData({ 'toast.show': false }), duration || 1400);
    },
    /* 白卡弹窗：modal({title, content, confirmText, cancelText, danger, showCancel, onConfirm}) */
    modal(opts) {
      opts = opts || {};
      this._onConfirm = opts.onConfirm || null;
      this.setData({
        'modal.show': true,
        'modal.title': opts.title || '',
        'modal.content': opts.content || '',
        'modal.confirmText': opts.confirmText || '确定',
        'modal.cancelText': opts.cancelText || '取消',
        'modal.danger': !!opts.danger,
        'modal.showCancel': opts.showCancel !== false
      });
    },
    onConfirm() {
      this.setData({ 'modal.show': false });
      if (this._onConfirm) { const cb = this._onConfirm; this._onConfirm = null; cb(); }
    },
    onCancel() { this._onConfirm = null; this.setData({ 'modal.show': false }); },
    noop() {}
  }
});

# light → cloud / dark 内核同步清单

> ⚠️ **本清单已于 2026-10-16（light v1.1.103）换代。**
> 旧版「A~H 八类 · 逐处字符串替换」口径**已作废**——它只覆盖 v1.1.45 时代的约 7 处差异，收不了 63 个版本的差距（v1.1.45 → v1.1.103 新增了工具页、`pkg-study` 分包、5 个 utils、4 tab 英文化、`pages/weeks` 移除等）。
> 旧版留档：`_ipa_build/_backup_1016/SYNC-CHECKLIST.md.bak`（追溯当时的逐处判定表用）。
>
> **新口径 = 整树铺 + 按实例回填外观层**，参考实现 `_ipa_build/_sync_1103.js`。

---

## 0. 一句话口径

**把 `light/miniprogram` 整棵树复制到目标实例，再把「外观层」按目标实例的语义回填回去。**

不再逐处甄别「这个类算不算功能类」——因为 light 的 `app.wxss` **本身已含完整 `.theme-dark` token 组**，三实例 `app.wxss` 已逐字节相同，外观差异**只集中在 6 个文件**（见 §2）。

---

## 1. 三实例分工与同步边界

| 实例 | 主题形态 | 同步角色 |
|---|---|---|
| `light/` | 纯浅色（定死） | **源**（唯一开发入口） |
| `cloud/` | 三态 auto / 浅色 / 深色 + 手动切换 | 收（回填三态外观层） |
| `dark/` | 纯深色（定死） | 收（回填静态深色外观层） |
| `original/` | 2026-09-25 历史快照 | **不参与**（永久冻结，不发布不修改） |

---

## 2. 同步后「应该剩下多少差异」——这是验收标准

| 对比 | 允许存在的差异文件 |
|---|---|
| `light` ↔ `cloud` | **6 个**：`miniprogram/app.js` · `miniprogram/app.json` · `pages/settings/settings.js` · `pages/settings/settings.wxml` · `miniprogram/theme.json` · `utils/theme.js` |
| `light` ↔ `dark` | **2 个**：`miniprogram/app.json` · `utils/theme.js` |
| `light` ↔ `cloud` ↔ `dark` 的 `cloudfunctions/` | **完全一致**（零差异） |
| 三实例 `miniprogram/app.wxss` | **逐字节相同**（md5 一致） |

**任何超出这个清单的差异 = 同步没做干净，必须查。**

核对命令：

```bash
diff -rq light/miniprogram cloud/miniprogram
diff -rq light/miniprogram dark/miniprogram
diff -rq light/cloudfunctions cloud/cloudfunctions    # 应无输出
diff -rq light/cloudfunctions dark/cloudfunctions     # 应无输出
md5sum light/miniprogram/app.wxss cloud/miniprogram/app.wxss dark/miniprogram/app.wxss
```

---

## 3. 操作步骤

### 3.1 前置

- 确认 light 侧已盖章、工作区干净（`git status`）
- **备份**目标实例的 6 个外观文件：`utils/theme.js`、`theme.json`、`app.js`、`app.json`、`pages/settings/settings.js`、`pages/settings/settings.wxml`

### 3.2 铺树

```bash
cp -r light/miniprogram/. cloud/miniprogram/
cp -r light/miniprogram/. dark/miniprogram/
```

### 3.3 回填外观层（**漏一步就白铺**）

1. **还原 `utils/theme.js`** —— cloud 用三态版、dark 用定死深色版。
   ⚠️ 铺树会把 light 的**定死浅色**版带过去 → **必须立刻还原**（这是最致命的一步，且 `verify-structure.js` 查不出来）。
2. **确认无 `pages/weeks` 残留**（同步时若树里还在，要删）。
3. **cloud 专属 5 处**：
   - `app.js`：补 `wx.onThemeChange` 广播
   - `app.json`：补 `"backgroundColor": "@winBg"`、`"backgroundColorContent": "@bgContent"`、`"darkmode": true`、`"themeLocation": "theme.json"`
   - 复原 `theme.json`
   - `pages/settings/settings.js`：补 `onAppearance`，以及 `onShow` 里的 `theme.sameSet(this, { appearanceMode: theme.mode() })`
   - `pages/settings/settings.wxml`：补「外观」卡片
4. **dark 专属 7 处**：`app.json` 的静态深色值——`#0E1618`（窗口底）、`#5E6B66`（未选中）、`#58B394`（选中）、`borderStyle: "black"`、`backgroundTextStyle: "light"` 等。

### 3.4 带出配套文件

```bash
cp light/tools/verify-structure.js cloud/tools/
cp light/tools/verify-structure.js dark/tools/
cp light/cloudfunctions/audio-url/index.js cloud/cloudfunctions/audio-url/    # 若云函数有变
```

---

## 4. 同步后必跑的自检

```bash
cd light && node tools/verify-structure.js
cd cloud && node tools/verify-structure.js
cd dark  && node tools/verify-structure.js
```

六项 = JS 语法 / app.json / WXML 标签配对 / WXSS 花括号 / usingComponents / 旧页面残留。
**六项全过 ≠ 外观正确**（它只查结构），外观必须靠 §2 的 diff 清单核对。

---

## 5. 绝对不要同步的东西

| 项 | 原因 |
|---|---|
| `utils/theme.js`、`theme.json`、`app.js`、`app.json`、`pages/settings/settings.*` | 外观层，各实例语义不同（见 §2） |
| `utils/build-info.js` | 各实例自己 `node tools/stamp-build.js` 盖章 |
| `AI-CONTEXT.md` / `CHANGELOG.md` / `README.md` | 各实例独立维护，内容按自身实况写 |
| `light/tools/*.html`、`light/tools/gen-*.js` | 设计稿与效果图脚本，仅 light 保留 |
| `project.private.config.json` | 各实例的本地调试配置，各自维护（**注意：三实例均已纳入版本管理，不要再把它加回忽略**） |
| `original/` 整目录 | 历史快照，永久冻结 |

---

## 6. 已知坑（踩过的）

1. **CRLF / LF 混用**：**CRLF** = `tools.*` · `today.js` · `words.js` · `data.js` · `speech.js` · `app.js` · `app.json`；**LF** = `today.wxml` · `split-senses.js` · `wordforms.js` · `glossary.js` · `CHANGELOG.md`。改前用 node 实测（`indexOf('\r\n')`），按**子串唯一性**替换，不要按行定位。
2. **`theme.js` 不还原 = 静默毁外观**：cloud 会退回定死浅色、dark 会变浅色，而结构自检**全过**（查不出来）。只能靠 §2 的 diff 清单发现。
3. **锚点替换在 CRLF 文件上会静默命中 0**：写替换脚本时要先把 `from/to` 的 `\n` 转成目标文件的 EOL，并做「已应用则 SKIP」的幂等判断。
4. **改共享机制必须三实例同改**：例如 `speech.js` 的 `CACHE_ROOT`（当前 `au6`）——换了就必须三实例一致，否则老设备继续播旧缓存。
5. **`words.js` 字段改动安全**：只改字段内容、不增删行 → 8115 条不变，索引 / 快照 / `WORD_TOTAL` 全部安全。
6. **云函数改动要单独部署**：本地改了 `cloudfunctions/` 不等于云端生效，需在开发者工具里「上传并部署」，或 `tcb fn deploy <name> --force -e <envId>`。

---

## 7. 提交与发布节奏

- 同步完成后**单独提交一次**（例：`sync: light v1.1.103 内核整树同步 cloud/dark`），便于出问题时回滚到同步前。
- **推送 GitHub 与上传体验版都攒批**：改完只做本地盖章，等用户明确说「推 / 传」再动作。

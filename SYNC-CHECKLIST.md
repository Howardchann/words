# light → cloud / dark 内核同步清单

> 生成时间：2026-10-09（对应 light v1.1.59）
> 用途：把 light 实例累积的功能内核同步到 cloud（三主题）与 dark（纯深色），**外观配色一律不同步**。
> 本清单由 `git diff --no-index light cloud` 逐文件甄别得出（共 31 个源码/数据文件，另有文档与设计稿）。

## 判定口径

| 类别 | 含义 | 同步方式 |
|---|---|---|
| **A 纯内核** | 无任何外观成分 | **整文件覆盖**（安全） |
| **B 页面逻辑** | `.js`，纯逻辑 | 整文件覆盖（覆盖前逐行确认无主题分支） |
| **C 结构文案** | `.wxml`，功能结构 + 少量文案 | 逐处替换 / 覆盖后人工复核 |
| **D 样式混装** | `.wxss`，配色 token **与**功能规则同文件 | **禁止整文件覆盖**，逐处字符串替换 |
| **E 目标独有** | cloud/dark 特有的主题机制 | **绝不动** |
| **F 目标缺失** | light 新增、目标还没有 | 新增文件 + 注册 |
| **G 数据** | 词库字段 | 整文件覆盖（须先证明目标无独有内容） |
| **H 产物/文档** | 盖章、说明文档、设计稿 | 各自维护，不同步 |

## A 类 · 纯内核（4）

| 文件 | light 独有 / 目标独有 | 内容 |
|---|---|---|
| `miniprogram/utils/speech.js` | +72 / −32 | 英音路由（`wuk/`）、慢速取 s 文件、百度只挂美音、`accent` 通道、`BAD_PREGEN_AI` |
| `miniprogram/utils/data.js` | +89 / −5 | 单词搜索、英文例句挖空、`ipa`/`uk`/`cn` 字段、`PHASE_NAMES` 去雅思化 |
| `miniprogram/utils/store.js` | +94 / −21 | **SM-2 四档 SRS**（`ef/ivl/step/reps`）+ 老数据惰性迁移 + `sanitizeReviewStats` 扩字段（**不扩会云同步丢 ef/ivl**） |
| `cloudfunctions/audio-url/index.js` | +1 / −2 | 路径白名单放行 `wuk/[0-8]/\d{4}s?\.mp3` |

> A 类已逐行确认：目标侧「独有行」全部是**旧实现**，无目标专属功能。

## B 类 · 页面逻辑（5）

| 文件 | light 独有 | 内容 | 备注 |
|---|---|---|---|
| `pages/today/today.js` | +69 | `zhOpen` / `onToggleExZh`、点音标模块按口音朗读、`jumpDay`+`jumpWord` 定位 | 需查是否含主题分支 |
| `pages/review/review.js` | +94 | 复习「填空」tab、`cnOf` 反查补全、SM-2 四档 `gradePreview()` | 同上 |
| `pages/settings/settings.js` | +4 | 「默认口音」卡逻辑 | |
| `components/nav-bar/index.js` | +8 | `back` 返回键属性（搜索页用） | |
| `pages/weeks/weeks.js` | +1 | 「18个月计划总览」标题文案 | 纯文案 |

## C 类 · 结构与文案（5）

| 文件 | light 独有 | 内容 |
|---|---|---|
| `pages/today/today.wxml` | +21 | 词行**方案 B**（单词+词性+释义+双音标 flex-wrap 流）、眼睛图标、`.ipa-mod` 双音标模块 |
| `pages/review/review.wxml` | +39 | 重点词磁贴同构改造 + 填空 tab 面板 |
| `pages/settings/settings.wxml` | +1 | 口音卡说明文案（英音单词走离线音频） |
| `pages/weeks/weeks.wxml` | +2 | 「学习计划总览」文案（原「词表总览」） |
| `components/nav-bar/index.wxml` | +1 | 左区默认 slot（放放大镜） |

## D 类 · 样式（**混装，逐处替换**）（5）

| 文件 | light 独有 | 该同步的功能规则 | 不能动的配色 |
|---|---|---|---|
| `miniprogram/app.wxss` | +105 / −15 | `.ex-speak .spk-ico` 36rpx、`.ex-eye` 基线 strut、闭眼图标路径、`.word-head`/`.ipa-row` 版式、绿色喇叭深色变体 | `--nav-fg`、`--win-bg` 等全部配色 token |
| `pages/review/review.wxss` | +39 | 填空 tab 样式、磁贴版式 | 配色 |
| `pages/today/today.wxss` | +15 | 词行版式相关 | 配色 |
| `components/nav-bar/index.wxss` | +9 | 左区 slot 的 `box-sizing` / `padding-left` | 前景色 |
| `custom-tab-bar/index.wxss` | +4 | 图标尺寸（若与 i-book 相关） | 配色 |

> ⚠️ 铁律（已写入 `light/AI-CONTEXT.md`）：`app.wxss` 是**混装文件**，必须逐处字符串替换，**禁止整文件覆盖**，否则会把 cloud 的换肤与 dark 的深色改坏。

## E 类 · 目标独有（**绝不动**）（6+）

| 文件 | 内容 |
|---|---|
| `miniprogram/utils/theme.js` | 三主题引擎（light 无此文件逻辑） |
| `miniprogram/theme.json` | 主题 token 映射（light 无此文件） |
| `miniprogram/app.js` | `wx.onThemeChange` 跟随系统换肤栈通知 |
| `miniprogram/app.json` 的 `darkmode` / `themeLocation` / `@winBg` | 主题声明 |
| 各页 `*.json` 的 `navigationBarTextStyle` | light=`black`、cloud/dark 各不同（**顶部闪白方案的关键，改错会复发**） |
| `pages/today/today.wxss` 等零散深浅色规则 | 由 `tools/darkicons.js` 生成 |

## F 类 · 目标缺失，需新增（4 + 注册）

| 文件 | 内容 |
|---|---|
| `pages/search/search.{js,json,wxml,wxss}` | 单词搜索页（v1.1.46） |
| `app.json` | 注册 `pages/search/search` |
| `custom-tab-bar` / `nav-bar` | 搜索入口与返回键（已含在 B/C 类） |

## G 类 · 数据（1）

| 文件 | light 独有 | 内容 |
|---|---|---|
| `miniprogram/utils/words.js` | +4 / −4 | 第 6/7/8 字段（美音音标 / 英音音标 / 中文例句）。**整文件覆盖前必须 `git diff --no-index` 证明目标无独有内容**（历史踩坑：同实例内 `review.js` 是 CRLF、其余 LF） |

## H 类 · 产物与文档（不同步）

- `miniprogram/utils/build-info.js` —— 各实例自己 `node tools/stamp-build.js` 盖章
- `AI-CONTEXT.md` / `CHANGELOG.md` / `README.md` —— 各实例独立维护（light 的内容不直接倒过去）
- `light/tools/*.html` —— 设计稿（效果图），仅 light 保留

## 建议的同步批次

1. **第 1 批（低风险）**：A 类 4 个文件整文件覆盖 + 冒烟（朗读三档、搜索、复习四档、音标点读）
2. **第 2 批（中风险）**：B 类 5 个 `.js` —— 覆盖后逐行确认无主题分支
3. **第 3 批（高风险）**：C 类 WXML + F 类新增搜索页 —— 涉及 `app.json` 注册与 nav-bar 改动
4. **第 4 批（最高风险）**：D 类 `.wxss` 逐处替换 —— 每处替换后立刻在看板里核对外观，**最后做**

> 每批完成后单独提交 + 盖章，便于出问题时回滚到上一批。

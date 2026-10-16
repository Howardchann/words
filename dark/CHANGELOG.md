# CHANGELOG —— dark 实例

> 本实例由 cloud 实例 v1.1.38（仓库提交 `dbe76dc` 的 cloud/ 树）派生，**共享全部产品与机制历史**——完整变更史见 `../cloud/CHANGELOG.md`，此处只记录本实例自身的差异与后续变更。

## 2026-09-29 · 从 light 同步功能内核（音标 / 复习例句朗读 / 音色兜底），外观配色不同步

**背景**：light 实例 09-29 推进到 v1.1.45。用户拍板**只同步功能内核**：dark / cloud 补功能、不补外观；`original/` 落后多代、不发布，不参与同步。

**本次承接（逐处字符串替换，未动任何深色 token）**：

1. `utils/words.js` — 整文件覆盖为 light 版（全量 8000 词含音标，642KB → 762KB）；覆盖前已证本实例在该文件上无独有内容。
2. `utils/data.js` — 带出第 6 字段 `ipa`。
3. `pages/today/today.wxml` — 词头容器改 `.word-head`，新增纯文本音标 `<text class="word-ipa">`。
4. `app.wxss` — **仅**新增 `.word-head` / `.word-ipa`（24rpx，大屏 12px）两条功能规则；浅灰顶、`--card-line`、`.card.tip-box`、窗口底色等**一律未同步**（深色形态有自己的 token 组）。
5. `pages/review/review.js` — 新增 `_aiOf()`（音色兜底）与 `onSpeakStarredEx()`（重点词例句朗读）。
6. `pages/review/review.wxml` / `review.wxss` — 例句行改与今日页同款，`align-items:center`。
7. `utils/store.js` — `toggleStar` 入库补存 `ai`。

**验收**：与 light 的剩余差异收敛为 9 个文件（app.js / app.json / app.wxss / 4 个页面 json / theme.js / build-info.js），**全部为深色主题机制、外观与版本号**；功能类文件已从差异列表全部消失。

⚠️ 深色真机验收从严（沿用本实例铁律）：本次改动涉及今日页词头布局与复习页例句行，**须深色真机过一遍今日页词行 + 复习页重点词例句朗读**（深色态下历史多次只在深色暴露问题）。

---

## 2026-10-16 · 功能内核一次性同步至 light v1.1.103（63 版差距收口）

**背景**：light 自 09-29（v1.1.45）起独立演进 63 个版本（v1.1.103），本实例停在同一批同步（85bd0cf）。用户拍板一次性收口：**功能内核 = light 整树铺过来，外观层保留本实例定死深色语义**。

**功能清单**：与 cloud 实例同批（见 cloud/CHANGELOG.md 2026-10-16 节）：8115 词、剑桥官方音频、工具页、pkg-study 分包、wordforms/split-senses/glossary、dock 栏、au6 缓存、4 tab 英文化、weeks 页移除、audio-url PATH_RE 补 wuk/。

**外观层保留（未同步）**：
- utils/theme.js 定死深色版保留（isDark 恒真，根 view 恒挂 .theme-dark）
- app.json 窗口/tabBar 静态深色（#0E1618 / #58B394）重排进 light 的新 4 tab 结构；无 darkmode/theme.json
- 设置页**无**外观选择卡（定死深色实例不需要）；app.js 无 onThemeChange
- 深色 token 适配：light 的 app.wxss 本就持续维护 .theme-dark token 组（含 v1.1.42 --card-line、v1.1.51 双音标 us-*/uk-* 的深色值），随树直接生效；深色图标 darkicons auto 块同样随树同步

### 同日追加 · 仓库卫生与文档整理（承接分类全量扫描）

- **app.wxss 同步清理**：删 13 个死样式类共 29 行（品牌头 `.brand-head/.brand-logo/.brand-copy/.brand-name/.brand-sub`、被取代的 `.ico-eye`/`.ico-ask`/`.icon-button`/`.icon-star`/`.icon-star--on`/`.icon-remove`/`.icon-speaker`、`.hover-tint`），340 → 311 行；清理后三实例 `app.wxss` 仍**逐字节相同**。
- **删死资源** `miniprogram/images/logo.svg`（「开溜」品牌图，全项目零引用）。
- **`.gitignore` 放开** `project.private.config.json` 并纳入版本管理（换机 clone 后开发者工具的本地设置与旧机一致）。
- **移出** `tools/_rec3_all` / `_rec3_zoom` / `_rec3_frames` / `_rec4_frames` 逐帧目录（各 199 文件 / 约 23 MB，结论已归档）；**保留** `_rec*.mp4`、拼图与证据 png、4 个分析脚本（闪白 / deep-link 残影仍标「待解决」，属原始证据）。
- **`tools/cloudsync-test/README.md`** 的旧路径 `D:/idea/ielts-365/...` 改为正确绝对路径（三实例同步）。
- 根 `SYNC-CHECKLIST.md` 重写为「**整树铺 + 外观层回填**」口径（旧 A~H 逐处替换口径作废）；本实例 `AI-CONTEXT.md` 的「当前进度快照」同步更新至 v1.1.103。

### 同日追加 ② · 存储键名统一 ielts-365 → words

**决策依据（用户 2026-10-16）**：尚未上线发布，测试用户只有本人 → 不存在「改动导致用户丢数据」的顾虑；同日追加 ① 里未提及，本实例此前文档中的「键名永久保留」口径**据此作废**。

- `store.js`：`KEY` `'ielts-365-store'` → `'words-store'`；`BACKUP_TAG` `'ielts-365'` → `'words'`。`tools.js` 搜索关键词键 → `'words-search-kw'`（3 处）。
- **零风险迁移**：新增 `LEGACY_KEY`（只读不写）—— 启动先读新键、读不到再读旧键，读到即写回新键（一次性迁移）；**旧键不清除**，回滚旧版本仍能读到。新增 `LEGACY_BACKUP_TAGS=['ielts-365']` —— 导入校验放行旧 tag，**改动前导出的备份仍可导入**；导出统一写新 tag。
- 文档同步：本实例 `README.md` 目录树 + 存储键说明、`tools/backup-test/备份导入导出测试清单.md`（3 处）；`tools/cloudsync-test/run_tests.js` 的 `app:'ielts-365'` **故意保留**作为兼容分支回归用例。
- 验证：本实例 `store.js` / `tools.js` 与 light 改动后**逐字节相同**；`verify-structure.js` 六项全过；`cloudsync-test/run_tests.js` **75/75**；键名迁移专项 12 项全过。

## 2026-09-27 · 首点闪白定性更新（light 录屏结论同步，文档修订）

- light 实例 v1.1.39 真机录屏逐帧定性「首点 4 tab 闪白」：**与色系无关**，冷启动（后台无小程序）后首访各 tab 即闪，1~2 帧容器底色帧（webview 冷创建首绘帧）；首页不闪；
- 本实例旧定性「系统浅色才闪」被推翻，AI-CONTEXT 已改写；深色实例下底色帧与深色页面色差更大，预期观感更明显；
- 候选方案见 light/AI-CONTEXT（均未实施）；深色形态实验垫色类方案须真机逐帧从严验证（过渡桥教训）；
- 本次仅文档修订，无代码变更。

## 2026-09-27 · 问题边界重新定性（用户拍板）

- 本实例待解决问题收敛为两项：① **deep-link 残影**（仍在，深色形态下观感非常不明显；过渡帧方案在深色会闪白，不可用）；② **系统浅色时首次进入/首次切换 4 个 tab 闪白**（与 cloud 跨主题翻转闪白同族、方向相反，机制待录屏定性）——均**待解决**；
- 此前文档「跨主题翻转闪白在本实例结构性不存在」的判断被用户定性推翻，已修正。

## 2026-09-27 · 派生

- 自 cloud 实例 v1.1.38 派生，主题定死**深色**；
- 删除色系调整模块：`theme.js` 定死 dark、app.json 去 darkmode/themeLocation 改静态深色（backgroundTextStyle 改 light、tabBar 静态色改深）、theme.json 删除、app.js 删 onThemeChange、设置页删「外观」卡片与 onAppearance；
- 闪白问题家族（切主题闪旧主题/容器首帧错色/跟随系统翻转闪白）在本实例**结构性不存在**，详见本实例 AI-CONTEXT「问题边界」；
- ⚠️ 历史教训：deep-link 过渡桥方案在 cloud 实例**深色态持续闪白**被证伪——深色形态下任何新建页面垫帧类方案需从严真机验证；
- 后续变更从本节往下追加。

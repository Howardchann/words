# CHANGELOG —— light 实例

> 本实例由 cloud 实例 v1.1.38（仓库提交 `dbe76dc` 的 cloud/ 树）派生，**共享全部产品与机制历史**——完整变更史见 `../cloud/CHANGELOG.md`，此处只记录本实例自身的差异与后续变更。

## 2026-10-17 · 学习数据一致性审查（候选 v1.1.104，独立分支，未合并/未上传）

> 基线：`cloud-sync` HEAD `ae2755c03984a5c4ae3a42444a9ef9e32bbcb67e`；工作分支 `audit/light-learning-data-2026-10-17`。不改小程序名称，不重构 546 天课程，不改云同步进度身份标识。

### 内容与逻辑修正

- 词表运行时仍为 **8115 条**，不增删行；通过 `utils/learning-corrections.js` 修正 isle/aisle 混淆、catching、reinforced、bitumen、oblong、conservatory、expedient、moderate、sow、recount、tear、use、go、make、one、think、some 等词条的例句、词性或释义。
- 修正 `what/where/when/why/which` 的美音音标为常见 General American `/w/` 读法；英音字段不变。对应的功能词输入清单同步更新；仍需后续对照真实云端音频核听。
- `split-senses.js` 的编号说明更新为 8200–8245；修正 addict / alternate 副卡例句，并暴露同一副卡查询接口，今日、搜索、复习页复用统一的主/副义数据。
- `wordforms.js` 不再把 read/cut/cost 等同拼写形式显示成可点读的重复标签；`must` 不应被标成普通过去式。read 的过去式与原形拼写相同但读音不同，待有读音专用呈现方式后再单独教。
- 音标教学 `/r/` 示例换为 `right`，`/w/` 示例避免把 `qu` 整体高亮；通过 `phonetic-corrections.js` 覆盖例词，页面明确音标表以英式 RP 为参照、例词播放口音随当前设置变化。
- 术语词典拆分物主限定词与名词性物主代词，修正 auto- 前缀例词；搜索和复习页增加副读音义项展示与对应音频路由。
- 新增 `tools/learning-data-audit.js`：核对 8115 条、字段完整性、唯一拼写、46 个副卡编号、词形边界、12 类 / 71 个语法知识点，以及 31 个策略/复盘日的空例句豁免；未来新增空例句需显式审核。

### 音频交接状态（尚未完成）

- 新增 `tools/audio-pipeline/AUDIO-AUDIT.md` 与 `data/pending-sentence-audio.json`，列出 14 条因例句改文需要重生成的 `s/` 正常速/慢速资产。
- 本轮只更新代码文本与路由，不生成、不上传、不声称已听核音频。`asset-generated` / `asset-uploaded` / `listened-verified` 均待负责音频的 AI 完成并提供证据。
- `utils/words.js` 的历史生成源与 `utils/phonetic.js` 的历史生成源未包含在仓库中：词条正文由 `utils/learning-corrections.js` 运行时覆盖层修正，音标例词由 `utils/phonetic-corrections.js` 覆盖；恢复源脚本后必须回填修正。`words.js` 首行注释仍遗留「8000 词表」，但运行时数据与审计均为 8115 条；本次未整文件重写 1.17MB 生成文件。

### 验证状态（需在本地工作区复跑）

- **本轮候选分支的自动化脚本尚未在此执行环境实际运行**：GitHub 连接器可以读写仓库文件，但不能直接在远程分支启动 Node.js 或微信开发者工具。因此，不把既有分支/历史版本曾有的测试结果冒充为本轮通过。
- 待在本地检出 `audit/light-learning-data-2026-10-17` 后运行：`node tools/verify-structure.js`、`node tools/cloudsync-test/run_tests.js`、`node tools/audio-pipeline/selftest.js`、`node tools/learning-data-audit.js`。逐项记录真实退出码与输出，再决定是否合并。
- 尚未执行微信开发者工具真机/预览验收；正式预览/上传前必须在真实 Git 工作区运行 `node tools/stamp-build.js` 重新生成 `utils/build-info.js`。

## 2026-10-16 · B 档例句修复 + addict 副卡换官方音频 + 缓存 au6（v1.1.103，未上传）

> **触发**：10 月需求盘点 B 组三项用户拍板——B 档 7 词例句修复；take/taken 变体核对（结论：机制已存在，无需改）；addict 副卡告别 TTS 例外。

### ① B 档 7 词例句修复（`words.js`，只改字段内容，8115 条不变）

| 词 | ai | 原句（不地道） | 新句 |
|---|---|---|---|
| child | 39 | The children are in need of you. | Every child needs love and care. |
| seem | 72 | It just seems like that to you. | You seem very happy today. |
| case | 86 | Is it the case for you? | Is that really the case? |
| far | 137 | This is far the best of all. | This is by far the best of all. |
| face | 196 | You have a face of a child. | You have the face of a child. |
| second | 236 | The second is the unit of time. | Please wait a second. |
| eagle | 7940 | The eagle is the king of the air. | The eagle flew high above the mountains. |

- 中文例句同步更新 7 条（face 中例本就通顺，不动）。
- ⚠️ `second` 的新句带 ai 锚点替换：原句「The second is the unit of time.」在表内出现 **2 次**（`unit`(719) 复用同一句——对 unit 语义成立，保留未动）。
- 例句音频重生成 14 个（Ava +0%/-30%，44100Hz/96kbps）并上传：`s/0/0039|0072|0086|0137|0196|0236(mp3/s)` + `s/7/7940(mp3/s)`，云端 key 逐字节核对一致。

### ② addict 副卡（8201）换权威音频

- **复查推翻旧结论**：「全网无 /əˈdɪkt/ 公开音频」有误——**Merriam-Webster 有官方真人动词音频**（addict01.mp3，0.55s）。剑桥确认只有名词块（2026-10-16 抓原始 HTML 复核）；朗文/柯林斯反爬拦截。
- 美音 `w/8/8201(mp3/s)`：MW 官方音频（慢速 = atempo 0.78，同剑桥口径）。
- 英音 `wuk/8/8201(mp3/s)`：MW 无英音 → Sonia 载体短语 "to addict" + WordBoundary 裁词（v1.1.99 新口径，前置余量 ≤10ms；原 v1.1.98 旧口径版会吃进 "to" 尾音）。
- **裁词/逼音手法的例外清单就此清零**：全表 8245 个编号不再有 TTS 裁词残留（addict 英音是唯一保留的 Sonia 裁词卡，因官方源客观不存在）。

### ③ 缓存版本化

- `speech.js` CACHE_ROOT **au5 → au6**（旧链 au5/au4/au3 启动即清）：同路径同名替换了 14 例句 + 4 单词音频，不换根老设备会继续播旧缓存。
- 踩坑记录：`tcb storage upload` 把 synth 的 raw 中间文件（`*.mp3.raw.mp3`）一并铺上云 → 已删 16 个（s/0 ×12、s/7 ×2、wuk/8 ×2）。后续上传前先清 raw 或改输出目录隔离。

### ④ 内核同步 cloud/dark（本版本内完成）

light v1.1.103 功能内核已整树同步到 cloud/dark（63 版差距一次性收口）：cloud 保留三态外观（theme.js/theme.json/darkmode/设置页外观卡/onThemeChange），dark 保留定死深色（静态色 app.json）；weeks 旧页两实例均已移除；云函数 audio-url 的 PATH_RE 补 wuk/；verify-structure 两实例全过。文档：cloud/dark 各自 CHANGELOG/README/AI-CONTEXT 已记同步。

### ⑤ 仓库卫生与文档整理（同日追加，未上传）

> 触发：分类全量代码扫描（报告 `D:\idea\_ipa_build\_SCAN_1103_REPORT.md`）后的逐条定性执行。

**代码层**

- 删除死资源 `miniprogram/images/logo.svg`——2026-09-21（`2f96be8`「更新开溜主Logo为飞机与张嘴插画风格」）定稿的「开溜 / Kailliu」品牌图，四实例同一份（md5 `a5f6a98c…`），**当前零引用**（唯一相关样式 `.brand-logo` 也无 wxml 使用）。
- 删除 `app.wxss` 中 **13 个死样式类、29 行**（三实例同步，340 → 311 行，删后三份仍逐字节相同）：`.brand-head` / `.brand-logo` / `.brand-copy` / `.brand-name` / `.brand-sub`（品牌头整块已从 wxml 移除）、`.ico-eye` / `.ico-ask`（已被 `eye-ico` 取代，含 `.theme-dark` 变体）、`.icon-button` / `.icon-star` / `.icon-star--on` / `.icon-remove` / `.icon-speaker`（已被 `spk-ico` / `star-ico` 等取代）、`.hover-tint`（其注释所述的 weeks 页手动按压模式已随 `pages/weeks` 移除）。
  - 判据：全项目 `js` / `wxml` / `wxss` / `json` 交叉验证「零引用」。`chev`、`word-speak` 因被页面 wxss（settings / grammar / review / topic）引用而**保留**。
  - ⚠️ 纯样式删除、逻辑零风险，但**视觉效果需真机过一遍确认**。

**仓库层**

- `light|cloud|dark/.gitignore` 放开 `project.private.config.json`（改为一行注释说明），并把 3 个 `project.private.config.json` 纳入版本管理——目标：**换机 clone 后开发者工具的本地设置与旧机一致**。
- 4 个此前未跟踪的 `tools/gen-*.js` 一并入库。
- `tools/gen-*.js` 里硬编码的 `D:/idea/ielts-365/light/miniprogram` 全部改为 `path.join(__dirname, '..', 'miniprogram')`（7 个文件）→ **以后再改名、换机都不会坏**；`tools/cloudsync-test/README.md` 的旧路径改为正确绝对路径（三实例同步）。
- 移出三实例 `tools/_rec3_all`、`_rec3_zoom`、`_rec3_frames`、`_rec4_frames` 逐帧目录（各 199 文件 / 约 23 MB，合计约 69 MB；结论已归档进文档）。**保留** `_rec*.mp4`、拼图/证据 png 与 4 个分析脚本——闪白 / deep-link 残影在 AI-CONTEXT 仍标「待解决」，属原始证据。

**文档层**

- 根 `SYNC-CHECKLIST.md` **整篇重写**：旧的「A~H 八类 · 逐处替换」口径作废（只覆盖 v1.1.45 时代约 7 处差异），改为 v1.1.103 起的「**整树铺 + 外观层回填**」，含验收标准（同步后允许剩余哪些差异文件）与踩坑表。
- `cloud/AI-CONTEXT.md`：「当前进度快照」由 v1.1.37/38（09-26）改写为 **v1.1.103 当前态**，旧快照降格为「📜 历史快照 · 仅作追溯」；顺带修掉引言处一处拼接破损（`…成为主项的原因）。：复习页三修…`）。
- `light` / `dark` 的 `AI-CONTEXT.md` 头部各补「当前版本」指向。
- `original/`（历史快照，不发布）：README / AI-CONTEXT / CHANGELOG 三份**头部统一加「⚠️ 历史快照 · 不再维护」声明**并指向 light / cloud / dark；**技术内容一字不改**，保持快照原貌。

### ⑥ 存储键名统一 ielts-365 → words（同日二轮追加，未上传）

> **决策依据（用户 2026-10-16）**：尚未上线发布，测试用户只有本人 → 不存在「改动导致用户丢数据」的顾虑。⑤ 里「运行时键名永久保留旧名」的结论**据此作废**。

- `store.js`：`KEY` `'ielts-365-store'` → `'words-store'`；`BACKUP_TAG` `'ielts-365'` → `'words'`。
- `tools.js`：搜索关键词键 `'ielts-365-search-kw'` → `'words-search-kw'`（读 / 清 / 写共 3 处）。
- **零风险迁移**（顾虑消失也不裸改）：
  - `LEGACY_KEY` **只读不写** —— 启动时先读新键，读不到再读旧键，读到即写回新键（一次性迁移）；**旧键不清除**，回滚到旧版本时仍能读到数据。
  - `LEGACY_BACKUP_TAGS = ['ielts-365']` —— 导入校验**放行旧 tag**，2026-10-16 之前导出的备份**仍然可以导入**；非本应用的 tag 依旧被拒（校验没被放宽成「什么都收」）。导出统一写新 tag。
- 文档同步：三份 README 的目录树与存储键说明、`cloud/AI-CONTEXT.md`（存储键 2 处 + 目录树 1 处）、`light/AI-CONTEXT.md`（1 处）、三份 `tools/backup-test/备份导入导出测试清单.md`（各 3 处）；`tools/cloudsync-test/run_tests.js` 里的 `app:'ielts-365'` **故意保留**，作为「旧备份仍可导入」的常驻回归用例。
- `original/` 不动（历史快照，本就含旧键名，保持原貌）。
- **验证**：三实例 `store.js` / `tools.js` 改动后仍**逐字节相同**；`verify-structure.js` 三实例六项全过；`cloudsync-test/run_tests.js` 三实例 **75/75**；另跑键名迁移专项 12 项（旧键读→迁移写新键→旧键保留→旧 tag 导入→新 tag 导入→无关 tag 拒绝→导出带新 tag）三实例全过。

### ⑦ 音频生成管线入库（同日三轮追加，未上传）

> **决策依据（用户 2026-10-16）**：「所有文件都放 GitHub，换台新电脑 clone 下来就能像旧电脑一样调试」。管线原先只活在开发机 `D:\idea\_ipa_build`（**仓库外**）——换机后拿得到小程序、拿不到「怎么造音频」，这正是该诉求真正断掉的地方。

- **新建 `tools/audio-pipeline/`**（本实例独有，cloud/dark 不复制 —— 管线产物是三实例共用的云端桶）：
  - `_env.js` / `_env.py`：**路径解析唯一出口**（`HERE` / `WORK` / `MP` / `FFMPEG`），全部脚本从这里取路径。
  - **13 个脚本零硬编码**：原 `D:/idea/_ipa_build/**`、`D:/idea/words/light/miniprogram/**`、`D:/idea/ielts-365/light/...`（旧仓库名残留，一并根治）、`C:/.../ffmpeg.exe`、edge-tts site-packages 路径全部改写；支持 `AUDIO_WORK` / `FFMPEG` / `TCB_ENV` / `TCB_CLI` 覆盖。
  - Cambridge 线：`cam-fetch` / `cam-pick` / `cam-rebuild` / `cam-ipa-audit`；TTS 线：`gen-g-audio` / `gen-fw-audio` / `gen-uk` / `gen-uk-slow` / `regen-us` / `gen-new-audio` / `gen-special-fix`（单点修正模板）/ `patch-edge-tts-403`。
  - 工具：`selftest.js`（依赖与路径自检）、`mk-manifest.js`（拉云端清单 + 缺口分析）。
  - `data/`：剑桥抓取存档 141KB · 英音词表 203KB · 功能词表 · 任务源等 **6 份输入数据**。
  - `README.md`：桶结构 / 音源口径 / 脚本清单 / 换机三步 / **已知坑 11 条**。
- **云端清单入库** `cloud-manifest.json`（1.05MB / 51734 个 key）：`*.mp3` 本体约 1.03GB 永远不进 git，改用这份纯文本清单让「云端有什么」离线可查。
- **云端现状（本次核验）**：`w` 16322 个 / 249MB · `wuk` 16322 / 144.6MB · `s` 16322 / 540MB · `g` 2768 / 99.3MB = **51734 个 / 1032.9MB**；词卡 **8161 个 ai 号 × 6 维度零缺口**。⚠️ 容量已占约 1.03GB，新增音频前先确认额度。
- `.gitignore` 三实例追加 `tools/audio-pipeline/_work/`（中间产物，可随时删）。
- **验证**：13 脚本 + `_env` 语法全过（py `ast.parse` / js `new Function`）；残留旧路径扫描为 0；`selftest.js` 全绿（data 6/6 · 内核 7/7）；`mk-manifest.js --from-dir` 复现结果与原始清单逐字节一致。
- 提交 `cd5d5e6`（28 文件）。

## 2026-10-15 · 剑桥音频选块修正 + 量词 + 抓取截断修复（v1.1.102，已上传体验版）

> **触发**：v1.1.101 验收反馈「abuse 名词/动词音还是不对，美音反倒用重音区分」。「abuse 音标维度本来就对」的旧结论让我回头审 v1.1.101 的**选块脚本**——查出**系统性 bug**：v1.1.101 上传的 104 卡里有 **11 张拿到了错误词性的录音**（abuse 名词卡播的是动词音）。

### ① 选块脚本两处 bug（根因）

- **`norm()` 比较永不成立**：剑桥音标抓取时被截断（见 ③），`norm(剑桥 IPA) === norm(卡面 IPA)` 精确相等几乎不可能命中。
- **重音索引错位 1**：比较时拿「**带斜杠**的卡面 target」`/dɪˈlɪbərət/`（ˈ 在 index 3）比「**不带斜杠**的剑桥 IPA」`dɪˈlɪb.ər.ət`（ˈ 在 index 2）→ 永真不成立。
- **后果**：两个判据 `sc` 恒为 0 → 退化成「**剑桥第一个有音频的块直接胜出**」。剑桥列块顺序不保证是主读音（abuse 页 verb 块排在 noun 前），于是名词卡拿到动词录音。
- **修法**（`_cam_pick.js`）：① **词性为主键**（卡面实际显示词性 ↔ 剑桥块 pos，+5）② 音标骨架精确相等（+4）③ 重音位置相等（+2）④ **编辑距离相似度连续加权**（同词性多块时决胜，如 `tear` 的「眼泪/撕裂」两个 noun 块）。
- **卡面词性口径**：主卡用 `split-senses` overlay 覆盖后的 `p1`（如 `alternate` 主卡实际是 `v.`，不是 words.js 里的 `adj./v.` 首项）；复合值 `"n./adj."` 取斜杠前项。

### ② 11 张卡音源修正（其余 94 张原本就对）

| 卡 | 词性 | 修正为（剑桥块） |
|---|---|---|
| `abuse` 主 | noun | 美/英 `əˈbjuːs`（原为动词 `-z` 录音） |
| `alternate` 副 | adj. | 美 `ˈɔl·tər·nət` · 英 `ɒlˈtɜːnət` |
| `deliberate` 主 | adj. | 美 `dɪˈlɪb·ər·ət` |
| `elaborate` 主 | v. | 美 `ɪˈlæb·əˌreɪt` · 英 `iˈlæbəreɪt` |
| `graduate` 主 | v. | 美 `ˈɡrædʒueɪt` |
| `moderate` 副 | v. | 英 `ˈmɒdəreɪt` |
| `record` 主 | noun | 美 `ˈrekərd` |
| `permit` 主 | noun | 美 `ˈpɝːmɪt` |
| `upset` 主 | adj. | 美 `ˌʌpˈset` |
| `invalid` 主 | noun | 美 `ˈɪnvəlɪd` |
| `coordinate` 主 | noun | 美 `koʊˈɔːrdənət` · 英 `kəʊˈɔːdɪnət` |

### ③ 剑桥音标抓取截断修复（`_cam_fetch3.js`）

- 剑桥 IPA 的 span **内嵌音节标签**：`<span class="ipa dipa…">dɪˈlɪb.<span class="sp dsp">ə</span>r.ət</span>/`，旧正则 `[^<]+` 在第一个 `<` 断开 → 旧库存的是残值（`dɪˈlɪb.`）。
- 修法：以 `</span>/` 为终点匹配，再剥内部标签、去音节点 → `_cambridge_db3.json`（59 词，完整；旧库 129 处为截断/dot 差异，非真差异）。

### ④ 音标修正（1 处）

- `alternate` 副卡（adj.）英音 `/ˈɔːltənət/` → **`/ɔːlˈtɜːnət/`**：原值用的是剑桥**名词**块的 UK 音（重音在第 1 音节），形容词块 UK 重音在第 2 音节——**美/英两栏取到不同词性**的典型残留。

### ⑤ 留档：9 处「记法差异」（同读音，不动）

`abuse/us`(ˈəb- 位置) · `misuse/us` · `recount/us` · `upset/uk` · `graduate/us` · `segment#sub/us` · `tear/uk` · `tear#sub/uk` —— 均为「我们的记法 vs 剑桥记法」或英美变体（我们 UK 栏统一省 r，如 `/tɪə/` vs 剑桥 `tɪər`），**读音一致**；`segment` 美音动词重音属英美变体，维持。

### ⑥ 缓存根 au4 → au5

同路径覆盖了 11 张卡的音频 → 必须换根，否则老设备继续播 v1.1.101 的错误录音。`speech.js` OLD 链 = au4/au3/au2（启动即清）。

### ⑦ 工具页「学习记录」卡入口补量词

- 「重点词 **42 个**」「复习记录 **128 次**」——量词 `24rpx / 600 / margin-left 6rpx`，与第一行统计数 `.rec-unit` **逐属性一致**，颜色继承 `--green`，无底色、不换行、不撑高。

### ⑧ 闪烁修复随本版一并上传

v1.1.101 提交 `4cc342a` 时漏 `today.js`（工作区有改动但未 `git add`）→ 本版补入（见 v1.1.101 ③）。

### ⑨ 音频文件命名 bug（本轮第二个关键发现）

- **现象**：`w/0/0888.mp3`（conduct 主卡）云端 mtime 停在旧日期——App 取不到新音频。
- **根因**：`speech.js` 的 `fname()` 是 **4 位补零**（`('0000'+ai).slice(-4)` → `0888.mp3`），而 v1.1.101 的构建脚本写的是 `c.ai + '.mp3'` → **`888.mp3`（3 位）**。**ai < 1000 的 15 张主卡**（`use`26 / `live`103 / `lead`188 / `read`200 / `research`222 / `record`350 / `project`365 / `produce`372 / `close`462 / `increase`472 / `wind`825 / `object`880 / `conduct`888 / `refuse`957 / `contract`974）的剑桥音频**从未被 App 取到**，一直在播旧文件。
- **影响面**：v1.1.101 上传的这 15 张卡（60 个文件）实际是**孤儿**（3 位名，App 永不请求）；其中包含用户反馈的 `conduct`。
- **修法**：构建脚本改用 `String(ai).padStart(4,'0')` 与 `fname()` 对齐；重生成 416 文件重新上传；云端 60 个 3 位名孤儿文件清理。
- ⚠️ **教训**：覆盖率自校验若用「本地产出的文件名」做期望集，**永远会自证通过**——必须与 `speech.js` 的 `relPath()` 对齐，或直接抓云函数真实请求路径。

### ⑩ 说明：v1.1.101「已上传」但 15 张卡音频实际未生效

即上述命名 bug —— v1.1.101 的 CHANGELOG 说「104 卡 416 文件全部换剑桥音频」，实际对这 15 张主卡**未生效**。本版已补齐。

---

## 2026-10-15 · 音频基准切换 Cambridge 官方 + 音标二轮对齐（v1.1.101，已上传体验版）

> **触发**：v1.1.100 真机验收反馈——①abuse 主副卡听感「重音不同」（实际音标维度没错，是裁词音频韵律失真）②conduct 美音截断 ③点主卡喇叭时副卡音标闪一帧。三案并结：**单词音频全面切换 Cambridge 官方真人音频**（用户拍板方案 A），裁词/逼音手法就此退役。
>
> ⚠️ **本版音频选块脚本有系统性 bug，104 卡里 11 张拿错词性录音**——见 v1.1.102 ①。下述「按卡面音标↔剑桥词性分块选块」的**设计意图**成立，但实现失效，已在 v1.1.102 修复。

### ① 音频方案 A 落地（104 卡 / 416 文件）

- **范围**：全部异音相关卡 = 46 张副卡 + 对应主卡 + B 类 10 词主卡（`_cam_plan.json` 留档），每卡 4 文件（美/英 × 正常/慢速 0.78）。
- **读音选择**：按「卡面音标 ↔ 剑桥词性分块 IPA 归一匹配」选块，含重音位置评分兜底——**主卡/副卡各用各自词性块的官方音频**，物理上不可能再串读音。
- **特例**：
  - `read` 副卡（adj. /red/）：剑桥 read 主页无形容词块 → 用 **`red` 的官方音频**（读音完全相同）。
  - `addict` 副卡（v. /əˈdɪkt/）：剑桥/牛津/MW 均无公开音频 → **保留 TTS 逼音版**（唯一例外，后续找到权威源再换）。
- **慢速版**：`atempo=0.78`（音调不变）；416 文件 ffprobe 体检 0 异常。
- **缓存根 au3 → au4**（`speech.js`，同路径换音频必须版本化；旧 au3/au2/au 启动即清）——老设备首播会重新下载。

### ② 音标二轮对齐（8 处，Cambridge 为准）

| 词 | 改动 | 说明 |
|---|---|---|
| aggregate | 美 `/ˈægrɪgət/` → `/ˈægrəɡət/`（主）· 副卡美音同步 | 剑桥美音弱化 ɪ→ə；**英音 ɪ 保留**（英美弱化体系差异，v1.1.100 的结论修正） |
| delegate | 美 `/ˈdɛlɪgət/` → `/ˈdɛləɡət/`（主）· 副卡美音同步 | 同上 |
| intimate | 美 `/ˈɪntɪmət/` → `/ˈɪntəmət/`（主）· 副卡美音同步 | 同上 |
| research | 英 `/ˈrisɜːtʃ/` → **回滚** `/rɪˈsɜːtʃ/` | **v1.1.100 误修**：research 英美重音本就不同（美 `ˈriːsɜːtʃ` / 英 `rɪˈsɜːtʃ`），当时把英美差异误判为取音错误 |

### ③ 闪烁 bug 修复（`today.js`）

- 现象：点主卡喇叭瞬间，副卡音标区闪一帧「双亮」。
- 根因：`onSpeakWord` 里 `setData({playingKey})` 写在 `speech.speak()` **之后**，而 speak 内 `notify()` 是同步回调——回调先按旧 `playingKey('')` 渲染一帧主副同亮，随后补设才熄灭副卡。
- 修法：`setData({playingKey})` 挪到 `speak()` 之前（先亮对、再出声）。

### ④ 基准与工具链（留档）

- **音标/音频基准 = Cambridge Dictionary**（`_cambridge_db.json` 61 词存档 + `_cam_fetch.js`/`_cam_check.js`/`_cam_audio_build.js`）。
- 复扫结论不变：46 副卡无一同音误拆；abuse 族（close/diffuse/misuse/use）维度本来就对，错在音频韵律——随方案 A 一并解决。


## 2026-10-14 · 36 词异音全量复扫：3 词补拆卡 + 10 词音标修正 + 76 音频（v1.1.100，已上传体验版）

> **触发**：v1.1.99 验收反馈里用户追问「record 这种是否还有其他单词也有同样的情况」。全量复扫后，词表内异音词共 76 个，其中 **36 个未拆卡**（`_hetero82.txt` 白名单只覆盖 191 词，扫不到）。用户授权「按之前的逻辑实施就行」。
> **处置口径**（沿用 v1.1.98）：**看「另一读音的义项有没有收进释义」** —— 收了就拆卡；没收就不拆，但必须保证音标/释义/例句三者落在同一读音上。

### ① 分类结论：36 词 = 3 拆卡 + 10 修音标 + 23 自洽不动

| 类别 | 数量 | 判据 |
|---|---|---|
| **A · 补拆卡** | 3 | 释义收了两个读音的义项（或例句与释义的读音互相矛盾） |
| **B · 只修音标** | 10 | 释义只一个读音的义项，但音标的**美/英两栏各自取了不同读音** |
| **C · 自洽不动** | 23 | 音标（两栏）/释义/例句全部落在同一读音上 |

**根因**：词表的**美音音标**与**英音音标**来自两套源，各自取「首读音」，而两套源的读音排序不同 → 同一个词的美/英两栏会指向**两个不同读音**（例：conduct 美 `/ˈkɑndəkt/` 是名词、英 `/kənˈdʌkt/` 是动词）。这**不是英美差异**，是取音错误。

- **A 类**：conduct、digest、permit
- **B 类**：content、discharge、exploit、export、import、increase、insult、research、transfer、upset
- **C 类（23）**：attribute、bow、compound、conflict、contrast、decrease、duplicate、entrance、excuse、frequent、house、invalid、minute、perfect、present、progress、resume、row、separate、sewer、subject、suspect、survey

### ② A 类 · 3 词补拆卡（改 `words.js` + `split-senses.js`）

| 词 | 主卡（改后） | 副卡（新增，ai 号段 8243~8245） |
|---|---|---|
| conduct | n. 行为；举动；为人 · 美 `/ˈkɑndəkt/` 英 `/ˈkɒndəkt/`（**英音由动词音改为名词音**） | v. 实施；进行；指挥 · `/kənˈdʌkt/` · **8243** |
| digest | n. 文摘 · 美 `/ˈdaɪdʒɛst/` 英 `/ˈdaɪdʒɛst/`（**英音由动词音改为名词音**） | v. 消化；理解 · `/daɪˈdʒɛst/` · **8244** |
| permit | n. 许可证 · 美 `/ˈpɜrˌmɪt/` 英 `/ˈpɜːmɪt/`（**英音由动词音改为名词音**） | v. 许可；允许 · 美 `/pərˈmɪt/` 英 `/pəˈmɪt/` · **8245** |

- **conduct 主卡例句被换掉**：原例句 "The study was conducted in 2022." 是动词用法，与主卡的名词释义/音标矛盾 → 主卡改为 "His conduct at the meeting was excellent."，动词义另立副卡；digest / permit 同理换了主卡名词例句，原动词例句移给副卡。
- 副卡数 **43 → 46**，号段 8200~8245 **连续无断档**。
- **实现边界**：主卡词性/释义收敛走 overlay 的 `p1`/`m1`（与既有 43 张同款）；**音标与例句 overlay 无对应字段，必须改 `words.js`**（本轮共 22 处字段）。
- 主表 `words.js` 条数仍 **8115**（只改字段内容，不增删行）；搜索 / 复习 / 云同步快照仍以主卡为准。

### ③ B 类 · 10 词音标修正（13 处，全部改 `words.js`）

| 词 | 改前 | 改后 | 依据 |
|---|---|---|---|
| content | 美 `/ˈkɑntɛnt/` 英 `/ˈkɒntɛnt/` | 美/英 `/kənˈtent/` | 形容词「满足的」重音在第二音节 |
| discharge | 美 `/ˈdɪsˌtʃɑrdʒ/` | 美 `/dɪsˈtʃɑrdʒ/` | 例句 "Factories discharge…" 是动词 |
| exploit | 美 `/ˈɛksˌplɔɪt/` | 美 `/ɪkˈsplɔɪt/` | 词性 v. + 例句是动词 |
| export | 美 `/ˈɛkspɔrt/` 英 `/ˈɛkspɔːt/` | 美 `/ɪkˈspɔrt/` 英 `/ɪkˈspɔːt/` | 例句 "China exports…" 是动词 |
| import | 美 `/ˈɪmˌpɔrt/` 英 `/ˈɪmpɔːt/` | 美 `/ɪmˈpɔrt/` 英 `/ɪmˈpɔːt/` | 例句 "The UK imports…" 是动词 |
| increase | 美 `/ˈɪnˌkris/` | 美 `/ɪnˈkris/` | 例句 "Sales increased…" 是动词 |
| insult | 英 `/ɪnˈsʌlt/` | 英 `/ˈɪnsʌlt/` | 例句 "It is an insult…" 是名词 |
| research | 英 `/rɪˈsɜːtʃ/` | 英 `/ˈrisɜːtʃ/` | 例句 "The research lasted…" 是名词 |
| transfer | 美 `/ˈtrænsfər/` | 美 `/trænsˈfɜr/` | 例句 "She was transferred…" 是动词 |
| upset | 美 `/ˈʌpˌsɛt/` | 美 `/ˌʌpˈsɛt/` | upset 重音固定在第二音节 |

### ④ 音频 · 76 个文件（`w/` 32 + `wuk/` 32 + `s/` 12）

- **A 类 6 张卡的单词音频一律「从该卡自己的例句裁词」**（载体 = 例句本身，`cut` = 目标词）→ 单词读音与例句读音**同源**，物理上不可能矛盾，**不依赖声学推断**。
  - conduct 副卡为此换了含原形的例句："She will conduct the survey next week." / 她下周将进行这项调查。
- **B 类 10 词**用载语逼音（名词 `an insult` / `the research`，动词 `to discharge` / `to export` / `to import` / `to increase` / `to transfer`，形/动 `he is content`、`to be upset`、`to exploit`）—— 与 v1.1.98 主卡同法。
- 云端校验 **76/76 命中、0 缺失、0 陈旧**。

**验证留档（诚实记录）**：
- `_probe_stress_1100.py`（能量质心）+ `_probe_syll_1100.py`（音节时长）两个声学指标**只能部分判读**：conduct / permit 的名词版与动词版差异明显（0.226 / 0.159，来自元音音段不同）；**digest 因两个读音的音段完全相同**（只重音移位）指标不敏感——这正是把 digest 改成「例句裁词」的原因。
- `_diag_cut_1100.py` 证明**裁词边界没有切掉词尾**：permit 在句中 TTS 的真实时长就是 0.362s（下一个词 `to` 的起点紧接在 0.762s，没有可扩空间）。句中 0.39s 与载语版 0.64s 都是正确读音，只是语速不同。

### ⑤ 未动范围（供后续参考）

- **C 类 23 词**：音标/释义/例句自洽，且都只教一个读音 → 不动。
- **次要项（非错误、属「不完整」）**：`conflict`/`contrast`/`progress`/`survey` 等词性标了 `n./v.` 而音标只给名词读音；`excuse` 释义含名词义「申辩；致歉」而音标是动词读音（差异仅词尾 s/z）；`frequent` 释义含罕用动词义「时常来访」。改这类需要动 `words.js` 的词性字段（overlay 的 `p1` 只在有 `sub` 时生效）。



> **触发**：v1.1.98 真机验收反馈 —— ①工具页量词层层重复（标题「44 个」+ 段控「20 / 24」+ 卡片「5 个」）②拆卡「点单张卡喇叭、主副两张一起亮」③「A1 里 record 的异音指什么」（我的判定期漏了它）④「project 英音开头像多读了个 the」⑤三区「标题下 + 卡片末尾」两条注释重复或不一致。
> 用户授权：「以上修复完直接盖章上传，开发者工具现在上传就是覆盖了旧的体验版不需要去后台选择」。用户认可项：收藏按钮两卡同收、中文两卡同显 —— 本轮**保留不动**。

### ① 工具页：量词全部下移到各区末尾注释（`pages/tools/tools.wxml`，+7/-9 行）

三区统一为「标题不带量词、分类段控不带量词、卡片不带计数，只在**区末尾一条注释**里给总量」：

| 位置 | 改前 | 改后 |
|---|---|---|
| 音标区标题 | 音标（44 个） | 音标 |
| 元音/辅音段控 | 元音 **20** / 辅音 **24** | 元音 / 辅音 |
| 术语区标题 | 术语小词典（40 个） | 术语小词典 |
| 词性缩写/语法术语段控 | 各带分类条数 | 不带 |
| 语法速查每格 | 「5 个」 | 不带 |

排版未受影响：`.ph-cls` 是等宽 flex 段控（`text-align:center`），`.cat-cell` 里 `.cat-name` 已是 `flex:1` + 箭头贴右 —— 去掉数字后都自然收口，无需改样式。`.ph-cls__n` / `.cat-count` / `.ph-hint` 三条 CSS 规则因此**成为死规则**（v1.1.97 专门调过的「数字与标签同号同重」现在整个命题消失），本轮按「不动样式、缩小改动面」处理，保留未删。

### ② 三区注释统一为「区末尾一条 + 三段式」（`pages/tools/tools.wxml`、`tools.js`）

统一三件事：**位置**（只在区末尾一条，标题下不再有）、**结构**（总量 → 说明 → 怎么用）、**语气**（第二人称、无主语、口语化）。

| 区域 | 改前（标题下 / 末尾） | 改后（只在末尾一条） |
|---|---|---|
| 音标区 | 「点任意音标看讲解；例词可直接点读（离线也能听）。」/ 无 | 共 44 个音标（元音 20 / 辅音 24）。点任意音标看讲解，例词可直接点读（离线也能听）。 |
| 术语区 | `{{glHint}}`（**随分组切换的动态说明**）/「共 40 个术语，分两类…」 | 共 40 个术语。词性缩写 = 单词卡上单词后的小标签（n. / v. / adj. …）；语法术语 = 释义括弧、语法讲解里的行话。卡上遇到看不懂的小字，来这里查一条就走。 |
| 语法区 | 无 /「共 71 个语法点：…」 | **不变**（本来就只有末尾一条，作为三段式的基准样板） |

- **为什么不定在标题下方**：工具页内容区 ≈686rpx、注释字号 23rpx → 一行约 **29~30 个中文字**；原三区注释 82 / 116 / 95 字 = **3~4 行**，放标题下会把段控与卡片推到折叠线以下。要放进去必须砍到 ≤55 字（2 行内），总量与分类说明就保不住 → 位置定在末尾。
- **风格对齐两处（2026-10-14 下午，用户拍板后追加）**：
  1. **顺序**：音标区原是「怎么用 → 总量」（三区里唯一倒着的），改总量起头。
  2. **长度**：术语区 116 字 → 87 字。多出的 20+ 字来自把两组 `hint` 全文拼接（连"说明这个词属于哪一类词""都在这里"这类语气尾也留着）＋重述「分两类」（段控按钮上已经写着两个分类名）→ 改用 `A = B` 直给定义。
- **动态 → 静态**：原标题下那条 `{{glHint}}` 是随分组切换的；挪到末尾若保留动态，每点一次段控区域底部那句话就换一次（高度抖动）→ 定为**静态**，点两个分组看到同一句。
- `tools.js` 的 `glHint` 字段（`data` 初始化 + `onGlGrp` 的 setData 各一处）确认全项目无引用后**已删除**；`glossary.js` 的 `groups[].hint` **保留**（分组自带描述，语义上属数据层）。

### ③ 拆卡播放隔离：点单卡喇叭只亮该卡（`pages/today/today.js` +6/-3、`today.wxml` +5/-5）

- **根因**：`playingText` 只按 `item.w` + accent 比对，而主/副两卡的 `w` **完全相同** → 点任一张的喇叭，两张的喇叭与卡拉 OK 都亮。
- **做法**：新增 `data.playingKey`（取值 `item.k`：主卡 = 单词、副卡 = `单词~2`）；所有播放态判断加 `(playingKey === '' || playingKey === item.k)`；点单卡喇叭时 `setData({ playingKey: key })` 即刻落键（`playingText` 等 speech 回传）。**「朗读全部」不传 key（空）** → 走旧逻辑、两张同亮作进度指示（原行为不变）。
- 与既有语义一致：`playingAccent` 仍在 togglePause 分支里同步清零。

### ④ record 补第 43 张副卡（`utils/split-senses.js` +8 行 + 音频）

- **为什么漏**：`拆卡清单_1013.md` 把 record 归入「不拆（另一读音义项未收录）」。但真机看主卡：词性 `n./v./adj.`、释义只有名词义「记录；履历；记载」、英例 "You can take this for the record." 也是名词用法 —— **词性字段与释义自相矛盾**，用户会以为副卡丢了。
- **处置**：补副卡 `v. 记录；录制`（美 `/rɪˈkɔːrd/`、英 `/rɪˈkɔːd/`，`ai=8242`，例 "She likes to record her own songs."）；主卡词性由 overlay 收敛为 `n.`。号段 **8200~8242 连续**，主表 `words.js` 仍零改动。
- **音频**：`w/8/8242.mp3(+s)`、`wuk/8/8242.mp3(+s)`、`s/8/8242.mp3(+s)` 共 6 文件已上传（其中例句 2 文件是本轮补跑，上一轮 `--cut-only` 跳过了例句）。

### ⑤ 裁词余量修正：project 英音开头多出的「to」（212 个单词文件全量重做）

- **根因**：载体短语裁词原用 `ss = start - 0.05`（50ms 前置余量）。实测英美连读时**载体词尾与目标词之间只有 0~13ms gap** → 50ms 必然吃进载体词尾音。project 英音（载体 `to project`）正是把 `to` 的尾音带了进来。
- **修正**：`ss = max(0, start - 0.01)`、`dur = (end - start) + 0.03`。实测 project：新余量 us **0.680s** / uk **0.837s** ≈ project 本体；旧余量 us 0.750s / uk 0.907s（多 ~70ms）。
- **全量重做**：42 副卡 + 10 主卡共 **212 个单词文件**（`w/` 106 + `wuk/` 106）重生成并上传，另补 record 例句 2 文件 → **共 214 文件**。
- **云端复核**：214/214 命中、全部为本次上传时间，**0 缺失 / 0 陈旧**（脚本 `_ipa_build/_cover_1199.js`）。上传踩坑复核：`tcb storage upload <本地目录> <云端目录>` = 把目录**内容**铺到云端目录下，实测 key 为 `w/8/8242.mp3`（无多一层 `w/`）。
- **排除的 ASR 误报**：abuse 英音被转写成 "To abuse"、console 为 "The console" —— 时长对照显示两者**英音反而比美音短**，属 ASR 对 `/prə/` 开场的误判，非残留。

### ⑥ 顺带订正两条过期版本状态

v1.1.96 / v1.1.98 标题原写「仅本地未上传」，实际均已上传体验版 → 订正为「已上传体验版」。

### ⏳ 未决：37 个「词表内异音词但未拆卡」的词（本轮未动）

`_hetero82.txt` 白名单只覆盖 191 词。重扫全词表（`_ipa_build/_scan_hetero_1199.js`）得 **76 个异音词，其中 37 个未拆卡**（conduct / content / exploit / permit / transfer / increase / insult / digest / discharge / research …）。

这批词的问题比「缺副卡」更重：**主卡音标取的是名词读音，但例句/释义是动词用法** —— 如 conduct 例句 "conducted" 是动词、美音标却是名词 `/ˈkɑndəkt/`，即「读音与例句对不上」。

⚠️ 影响面 = 37 词 ×（音标 + 例句 + 音频），需先定范围（全拆成主+副 / 只修音标与例句 / 维持现状），**故本轮不动**。

---

## 2026-10-14 · 异音多义词拆卡 42 张副卡 + 10 词主卡音频对齐 + 4 处数据修正（v1.1.98，已上传体验版）

> **触发**：v1.1.97 报告里的拆卡四问，用户全部拍板 —— ①37 词**全拆**（「有两个音肯定要拆成两个单词，音频音标例句释义都对得上」）②wind/tear/wound/live/extract **补副卡**（「另一读音也要补进副卡」）③abuse/misuse 释义**怎么收都行**（「只要能分辨且音标读音例句释义都统一」）④第三节 4 处数据问题**一起修**。另确认「回到当前进度」跳转逻辑（v1.1.97 的 B/C）正确无误。

### ① 拆卡 overlay（新增 `utils/split-senses.js` + `pages/today/today.js/.wxml`）

- **主表零改动**：`words.js` 一条不动 —— `WORD_TOTAL = sum(RAMP)×5`、`DAY_OFF` 索引、云同步快照全部不受影响（副卡号段 8200~8241 也避开了 8001~8115）。
- **范围**：37 词拆卡 + 5 词补副卡（wind/tear/wound/live/extract 另一读音义项原未收录）= **42 张副卡**。
- **渲染层展开**：`renderDay` 里 `splitSenses.expand(list)` 把命中词拆成主卡在前、副卡紧跟的两张卡。卡片字段（p/m/ipa/uk/ai/e/cn）与主卡完全同构 → **wxml 除 `wx:key` 外零改动**。
- **唯一键**：主卡 `k = 单词`、副卡 `k = 单词~2`；`wx:key="w"` → `wx:key="k"`（同词两卡会导致 key 重复）。
- **分组标签**：`extraStart` 改为按展开后「第一个非核心词」的下标定位，跨核心/扩展边界不串位。
- **收藏态同步**：`onStar` 按 `w` 把 `starred` 同时写进主/副两卡。
- **踩坑记录**：词表里有单词 **expand**，会撞上 `module.exports.expand` 函数名 → 查表加 `typeof sp !== 'object'` 守卫（首次跑测试直接崩在这里）。
- **范围边界**：搜索（`data.js searchWords`）、随机复习/重点词（`learnedWords`）仍只认主卡，本轮不动。

### ② 主卡释义/词性收敛（四要素一致）

主卡保留原例句与原读音，另按读音把释义收敛到该读音的义项（如 object 主卡 `v.` 只留「反对」，物体/目标归副卡），词性同步收敛（`m1`/`p1`）。abuse / misuse 正好可用**词性**区分：主卡 `n.`（例句 Drug abuse… 本就是名词用法，音标就是名词读音）+ 副卡 `v.`。

### ③ 音频：42 副卡 × 6 + 10 词主卡单词音频跟音标走（方案 A）

- **副卡 168 单词文件 + 84 例句文件**：美音 Ava +0%/-30%（`w/8/`、`s/8/`）、英音 Sonia -4%/-33%（`wuk/8/`）。
- **10 词主卡重做**（object/project/console/attribute/extract/appropriate/advocate/aggregate/duplicate/contest）：只重做**单词**音频（`w/`、`wuk/`），例句音频不动 —— 孤立词 TTS 会自选高频读音，正是「音标改了音频没跟上」的根因。
- **逼音手法**：单词一律走「**载体短语 + WordBoundary 裁词**」（`to object` → 裁出 object）。踩坑：新端点 `api.msedgeservices.com` **默认只回 SentenceBoundary**，edge_tts 必须显式传 `boundary='WordBoundary'`。
- **生产链路踩坑**：本机沙箱对 `os.remove` 有「每轮删除数 >50 即中断进程」的守卫 → 生成脚本改为**每 worker 一个固定临时文件、反复覆盖**（零删除），并改 6 并发（实测 3 并发 6.8s 出 3 个文件，远超串行）。
- 音频清单与复核脚本：`_ipa_build/_gen_1198_audio.py`、`_verify_1198_audio.js`、`_stage_up_1198.js`。

### ④ 缓存根目录 `/au2` → `/au3`（`utils/speech.js`）

10 个主卡音频是**同名同路径替换**，老设备本地缓存会继续播旧读音（v1.1.74 功能词事故的同一坑）→ 照 v1.1.76 手法换缓存根目录，并同时清理旧 `/au2`、`/au`。

### ⑤ 4 处数据修正（`utils/words.js`，8115 条恒等）

| 词 | 修正 |
|---|---|
| invalid | 英音 `/ɪnˈvælɪd/`（「无效的」读音）→ `/ˈɪnvəlɪd/`（与释义「病人」、美音一致） |
| coordinate | 释义补动词义「协调」（现音标与例句都是动词用法，释义只有名词/形容词义） |
| nominate | 美音 `/ˈnɑməˌneɪt/` → `/ˈnɑmɪˌneɪt/`（常见读音） |
| intimate | 美音笔误 `/ˈɪnəmət/` → `/ˈɪntɪmət/` |

> 备注：abuse / misuse 的「主副义项同形」随拆卡按词性切分解决，不单列改动。



> **触发**：用户真机反馈四条 —— ①「昨天点了开始学习、Day1 没打卡，今天打开显示第 2 天」②音标卡量词「个」/术语卡「条」不统一、分类数字与标签字号观感不一致 ③「语法术语速查」标题拗口、面板标签「人话」不妥 ④拆卡走低风险 overlay（清单另出）。用户选定：字号统一 = 完全一致；标题 = 术语小词典；标签 = 通俗说。

### ① 今日页彻底取消自然日滚动（`pages/today/today.js` + `today.wxml`）

实测把两处残留定死（主落点逻辑本来就是打卡驱动，`firstUnfinishedDay()` 早已是唯一判据）：

- **跨天不重置**：`onShow` 的「切 tab 保留浏览位置」分支原来只看 `viewDay` 非空，**跨自然日也照留**——昨天翻过第 2 天，今天切回来还在第 2 天。现加**日期戳守卫** `this._browseDate`：只允许**同一天内**保留浏览位置；跨天（或冷启动）一律走默认落点。
- **「回到今天（第 N 天）」按日历差算**：`today.wxml` 的 `.is-today` chip 由 `todayNum`（自然日推算）驱动、点击调 `backToToday()` → `renderDay(todayNum)`。现改为 `curDay`（= `firstUnfinishedDay()`，全部打卡完才回退自然日）+ 新方法 `backToProgress()`，文案「**回到当前进度（第 N 天）**」。`backToToday()` 保留给准备期「先看看第 1 天」预览用。
- data 新增 `curDay`；两处 `theme.sameSet` 同步带出。
- 效果：昨天开始、Day1 未打卡 → 今天进来仍是第 1 天（实测四组场景：未打卡恒为 Day1；Day1 打卡 → Day2；Day1+2 打卡 → Day3，与自然日无关）。

### ② 两卡字号与量词统一（`pages/tools/tools.wxss` / `tools.wxml`）

- `.ph-cls__n`（分类段控里的数字）24rpx/600 → **28rpx/700**，与「元音/辅音」「词性缩写/语法术语」同号同重——v1.1.79 提到 24rpx 后用户仍觉不一致，真因是**字重差**（600 vs 700）而非字号；宽屏段补 `.ph-cls__n { font-size: 14px; }`。
- 量词统一：术语卡「40 **条**」→「40 **个**」（音标卡本来就是「44 个」）。

### ③ 术语卡命名与说明文字（`utils/glossary.js` + `tools.wxml`）

- 标题「语法术语速查」→「**术语小词典**」（6 字拗口 → 5 字；也不与「语法速查」撞名）。
- 面板标签「人话」→「**通俗说**」（与「例子」并排更稳）。
- 音标卡说明：「点音标看讲解；例词可直接点读（词表里有的词离线也能听）。」→「点任意音标看讲解；例词可直接点读（离线也能听）。」
- 术语卡分组说明随分类切换：词性缩写 →「单词卡上单词后面的小标签（n. / v. / adj. …），说明这个词属于哪一类词。」；语法术语 →「单词卡释义的括弧里、语法讲解里出现的行话，都在这里。」
- 卡底注释：「共 40 个术语，分「词性缩写」和「语法术语」两类；词卡上遇到看不懂的小字，来这里查一条就走。」

### ④ 配套调研：拆卡清单（overlay 方案，不含代码改动）

- 82 异音名单 × 词表 × `en_US.txt` 源读音，义项/读音归属由 DeepSeek 判定后人工校正 IPA → **37 词要拆、28 词不用拆**。
- 不拆的绝大多数是「另一读音的义项根本没被收进释义」（wind 只收「风；风力」）→ 单读音卡，音标/音频/例句/释义一致即闭环。
- 顺带查出 4 处数据问题：invalid 英音标是「无效的」读音、coordinate 例句与释义不符、nominate 美音出入、abuse/misuse 主副义项同形。
- 清单全文：`D:/idea/_reviews/拆卡清单_1013.md`；机器可读判定：`_ipa_build/_split_plan_1013.json`。

## 2026-10-13 · 异音词义项重排 9 词 + live/lead/sow 音频重做（v1.1.96，已上传体验版）

> **触发**：用户确认「bow 释义改船头；鞠躬」与「10 词义项提到首位」两件遗留；同时 edge-tts 403 断链修复成功，把「音标已改、音频仍旧音」的 3 个词一并重做。

### ① 义项重排（`utils/words.js`，只动第 2 字段词性与第 3 字段释义）

- 原则：**释义首项 = 词条自己例句用的那个义项**（与 v1.1.94 的音标修正同一原则）；词性首位同步对齐（词卡里词性显示在释义前，顺序不一致读起来别扭）。音标、例句、ai、音频全部不动。
- 9 词：bow「船头；鞠躬」（原「弓；眼睛框；用弓拉琴」全是 /boʊ/ 义项，与例句 /baʊ/ 冲突，按用户确认**整组替换**）；lead「引导；铅；铅条」v./n./adj.；sow「播种；母猪；懒胖女人」v./n.；close「靠近的；结束；完结」adj. 在前；object「反对；物体；目标」；addict「入迷的人；…」n. 在前；contest「争论；…」；convict「宣告有罪；…」；convert「使改变信仰；…」——以上 8 词为重排。use 检查后**无需改**（首项「使用」本身就是名词义，与 /juːs/ 一致）。
- bow 的 /boʊ/ 义项（弓；眼镜框；琴弓）**待将来拆卡**（用户设想：一词多音多义 → 拆成两张单词卡，各义项各英音美音双速）时以独立卡补回。

### ② live/lead/sow 音频重做（云端 w/ 与 wuk/ 各 6 文件，共 12 个，已上传）

- 口径与存量桶一致：美音 Ava +0%/-30%、英音 Sonia -4%/-33%，ffmpeg 裁首尾静音 + 44100Hz 单声道 96kbps。
- **读音逼音**：lead 直读即对（共振峰 F2→2800/3000 稳定 = /iː/）；live 与 sow 直读仍是旧音（TTS 对孤立异音词自选高频读音）→ **用同音拼写变体**：live→`liv`（类推 give）、sow→`sew`（英语 sew 本读 /soʊ/，现成同音词）。重做后共振峰复核全部命中目标音。
- 备份：`D:/idea/_ipa_build/_regen3/_backup/`（12 个旧文件）。

### ③ 生成侧基建：edge-tts 403 断链修复（不影响小程序代码）

- 根因（上游 issue #490 / PR #491）：2026-10 起微软全球封禁旧合成端点 `speech.platform.bing.com`；Edge 155 改走 `api.msedgeservices.com`。**新端点在本机直连可达**（此前误判不可达是沙箱代理干扰）。
- 补丁：本地 venv 的 `edge_tts/constants.py` 换 WSS_URL + `drm.py` 日期解析 locale 无关；留档脚本 `_ipa_build/_patch_edge_tts_403.py`（重装 venv 后重跑即可）。
- 新端点三条运行约束（写进生成脚本）：①清 `*_proxy` 环境变量（走代理必 502）；②**串行 + 退避重试**（并发握手会整批超时）；③返回音频首尾静音偏多 → silenceremove 裁剪。
- 至此音频生成链路完全恢复，后续拆卡义项音频、任何新增音频都可再生成。


## 2026-10-13 · 学习记录卡合并到工具页（v1.1.95，随 94 一起上传）

> **触发**：用户确认方案 B —— 工具页顶部只有三格进度、设置页顶部才是「重点词 / 复习记录」，两张卡都在讲学习记录、逻辑重复（这也是前几天想删设置页「学习进度」卡的动机）。用户定夺：**加「学习记录」标题**（与下方每张卡都有标题的做法一致），两个入口的跳转保留（直达对应 tab，少一次内部切换）。

### 工具页顶部「学习记录」卡（`pages/tools/tools.wxml/.wxss/.js`）

- **加卡标题「学习记录」** —— 工具页自上而下每张卡都有标题（查单词 / 音标 / 语法速查 / 语法术语速查），就它没有会突兀。
- **迁入两个入口格**（重点词 / 复习记录）：三格进度下方、上边框分隔；数字 40rpx 绿 + 12rpx chevron 箭头 + 22rpx 灰标签，视觉沿设置页 `.stat-*` 那套 —— 与上方 56rpx 三格形成层级（进度是主角、入口是导航）。宽屏（≥700px）显式 px 化，尺寸 = rpx × 0.5。
- **跳转逻辑原样迁入**：点数字落复习页对应 tab（重点词 → starred / 复习记录 → random），经 `globalData.reviewTab` 传递 + 跨栈预切换。按压沿用设置页那套 `data.statPress` 手动按压（touchstart 亮 / touchmove 灭 / touchend 不灭灯 / tap 未派发 350ms 兜底）—— 原生 hover-class 切 tab 返回后残影不可靠（v1.1.27 结论）；`onShow`/`onHide` 双兜底清态，`onUnload` 清 `_statTimer`。
- **数字并入 `refreshRecord()`**：与三格同一次 `setData` 带出，切 tab 回来自动刷新，无额外监听。

### 设置页「学习进度」卡整体删除（`pages/settings/settings.wxml/.wxss/.js`）

- wxml 删卡（设置页首张卡变为「进度同步（多端）」）；wxss 删 `.stat-row/.stat-item/.stat-item--tap/.stat-item--press/.stat-arrow/.stat-num/.stat-label` 及宽屏段对应行；js 删 `data.starredCount/reviewCount/statPress`、`onStatDown/Move/End/Cancel/Tap` 五个方法、`refresh()` 里两个数字、`onShow`/`onHide` 的按压态残句。
- 设置页回归纯设置：进度同步 / 朗读语速 / 朗读方式 / 默认口音 / 备份与重置 / 关于。

### 备注

- 本轮同时实测 edge-tts 合成链路：**WSS 握手仍 403**（`speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1`），音频重做窗口仍未打开；异音词里 live / lead / sow 三个「音频也读旧音」的词只能等链路修复后再重生成。


## 2026-10-13 · 搜索首条保证 / 语法术语速查卡 / 异音词音标修正（v1.1.94，随 95 一起上传）

> **触发**：用户 Day2 真机反馈四条——①搜 wind 第一条是 win；②「宾格」这类词卡术语零基础看不懂，要有个讲解区；③工具页与设置页各有一张学习记录卡，逻辑重复；④多音单词按推荐口径修正。

### ① 搜索：查询词本身保证排第一（`utils/wordforms.js` + `utils/data.js`）

- **删掉「裸剥 -d 当过去式」规则**（`wordforms.js` regularCandidates）：规则动词 +d 的结果必然以 `ed` 结尾、已被 `-ed` 分支覆盖，能走到裸 `-d` 的全是原形本身 → 8115 词全量回归实测 **16 条全是误伤**（wind→win、card→car、feed 原本还会→fee、wood→woo、kind→kin、had→ha、and→an、add→ad、tend→ten、crowd→crow、nod→no、plead→plea、beard→bear、ward→war、grind→grin、fund→fun、band→ban）。
- **排序保证**（`data.js` searchWords）：查询词本身是词条时不再把归一到的原形顶到最前，改为「自己第一、原形第二并带 via 标签」；只有完全没直查命中时（taken→take）原形才顶最前。
- **`-ed` 分支加 BASEED 护栏**：本身就是原形却以 -ed 结尾的词（bed / red / feed / seed / shed / wed / need…）不再被剥，否则搜 feed 会冒出「fee 是它的过去式」假标签（feeding 一类仍正常归一）。
- 验证：wind / feed / seed / bed / red / card 第一条都是自己；used → used、use〔过去式〕；taken → take〔过去分词〕；making → making、make〔现在分词〕；found → found、find〔过去式〕。

### ② 工具页新增「语法术语速查」卡（`utils/glossary.js` 新文件 + tools 三件）

- 零基础会在两处撞见看不懂的「行话」：词卡释义括弧注记（me（宾格）· a（元音开头用 an）…）和词性标签（n. / v. / adj. …），而语法速查按天编排、当下找不到对应讲解。
- 新卡与音标卡同构：分类段控（词性缩写 15 / 语法术语 25，共 40 条）→ 胶囊网格 → 常驻面板（人话 + 例子），默认选中第一条、面板永不为空；纯静态数据、无音频、无跳转。
- 顺带修词表脏词性缩写 17 处：`/adv` 补句点（light、close、well、part、back、last、low…）、enough 的 `/i` → `/int.`。

### ③ 异音词音标修正 35 词（`utils/words.js`，纯音标文本）

- **判定原则**：一个词只有一个音标位、一个单词音频 → 音标必须与这个词**自己的例句**读的是同一个读音。核查表：`D:/idea/_reviews/异音词修正核查表_1013.md`。
- 典型：wind /waɪnd/→/wɪnd/（风）、read /rɛd/→/riːd/、tear /tɛr/→/tɪr/（眼泪）、wound /waʊnd/→/wuːnd/（伤口）、live /laɪv/→/lɪv/（居住）、lead /lɛd/→/liːd/（引导）、appropriate /eɪt/→/ət/（形容词）、object /ˈɑb/→/əbˈ/（例句是动词）、buffet /ˈbʌfət/→/bəˈfeɪ/（自助餐）……
- 声学实测（共振峰轨迹，`_ipa_build/_probe_hetero2.py`）10 词：wind / read / tear / wound **音频已是对的**（改完音标即闭环）；live / lead / sow **音频读的是旧音** → 进音频重做清单（等 edge-tts 403 修复）。
- 遗留待用户定夺：bow 释义「弓」与例句「船头」互相矛盾；10 词「音标已跟例句、但释义首项是另一个读音」是否把义项提到首位。
- 备份：改前词表存 `D:/idea/_ipa_build/_words_backup_1013.js`。

## 2026-10-12 · 复习页词形磁贴高亮闪灭修复（v1.1.93，随 92 一起上传）

> **触发**：真机验收 v1.1.92 反馈——复习页重点词 be 的其他词形（were）磁贴，点一下高亮马上消失；今日页同款正常。

- **根因**（v1.1.81 `a976fcd` 引入的历史 bug，非 91 补弄坏）：`review.js` onLoad 的 `onStateChange` 里 `if (!payload.playing && this.data.wfText) upd.wfText = ''; upd.wfKey = '';` 少花括号，第二句 `upd.wfKey = ''` 无条件执行——**每次语音状态回调（含「刚开始播放」那次）都把词形高亮键清空**，磁贴刚亮起来就被开始播放的回调抹灭。全站扫过，仅此一处中招（其余单行 if 均带花括号）。
- **修法**：对齐今日页 v1.1.78 的三分支冻结语义——wf 播放中词条态冻结（`onSpeakWf` 切换时已先清词条态）、播完清 wf 态、点别的（词条）先收 wf 态再落正常分支。词形磁贴现在播放全程亮 `--on`，播完熄灭；再点 = 暂停/收起，行为与今日页一致。
- 顺手把 v1.1.91 补丁区残留的 10 个孤立 CR 归一为 CRLF（review.js 全文件统一 CRLF，`new Function` 语法校验通过）。
- 行为波及面：随机卡 / 到期卡的**全部词形磁贴**（be→were、do→did 等），与是否重点词无关；词条喇叭、例句喇叭、卡拉OK 不受影响。

## 2026-10-11 · 准备期方案④落地（v1.1.92，随 v1.1.91 一起上传）：单主按钮 + 文字链接

> **触发**：v1.1.91 出的 5 方案真尺寸对比报告（`D:/idea/_reviews/准备期页面方案_v1.1.91.html`），用户选定 **方案④：单主按钮 + 文字链接**（「承认主行为只有一个」），并指示上传体验版。

- `today.wxml`：删掉 v1.1.90 的两条 `.cellrow`（等重胶囊行），换成——
  - 主：`.prestart-start` 实心绿大按钮「开始学习」+ 白色箭头（`--green-solid` 底 + `#fff` 字，**全站首个实心主按钮**；`--green-solid` 浅色 `#176B5B` / 深色 `#1E5A4B`，两套主题下白字对比度都够）。
  - 次：`.prestart-preview` 绿字文字链接「先看看第 1 天（只预览）」+ 小箭头，降级为按钮下一行（不再是等重的一行）。
- `today.wxss`：删 `.cellrow` 全组规则（该类只服务准备期，无其他引用），新增 `.prestart-start` / `.prestart-preview` 两组；宽屏（iPad）媒体查询同步换新类。按压反馈：主按钮 `opacity .86`（不用 press 色——深色主题里 `--green-press` 是浅绿，作底色会失效）、链接按全站「无底色行」约定 `opacity .55`。
- **行为零改动**：`startLearning`（写 startDate=今天、回第 1 天）/ `backToToday`（只预览不打卡）照旧。
- 自检：`tools/gen-prep-1192.js` 出浅/深两屏实现效果图（`D:/idea/_reviews/_prep1192_impl.png`）；today.wxml/wxss 仍为 LF、括号平衡、`cellrow` 无残留。
- 版本状态：与 v1.1.91（随机卡音标反查 / 易错点括弧断行 / 方法日要点去重+补充分层）**一起上传体验版**。

## 2026-10-11 · 真机四条反馈修复（v1.1.91，未上传）：随机卡音标反查 / 易错点括弧断行 / 方法日要点去重 + 补充分层 / 准备期页面待选

> **触发**：v1.1.90 真机截图四条反馈。前三条按「先探讨 → 出方案 → 用户认可推荐方案」流程落地；第四条（准备期按钮仍显单调）按用户要求**只出可视化报告待选**，代码未动。

### 一、复习随机卡：抽到重点词时补 ipa/uk 反查（`pages/review/review.js`）
- **真机现象**：随机抽查抽到 were，卡片只有一个「无字喇叭」，没有英音。数据/音频均正常（ai 8007，`w/8` `wuk/8` 都在）。
- **根因**：重点词快照只存 `{ w, m, p, e, ai, ts }`（store.js 注释同），**没有 ipa / uk**；`pickItem` 有 30% 概率优先抽重点词 → 拿到的是快照；卡片模板 `ipa-txt` 靠 `ipa` 渲染、英音胶囊 `wx:if="{{uk}}"` 整块不渲染。收藏 tab 早在 v1.1.50 就有 `ipaOf/ukOf/cnOf` 反查，随机卡与到期卡漏了。
- **修法**：随机卡（`onNext`）、到期卡（`onNextDue`）、到期答完切下一词（`onReviewResult`）三处 `Object.assign` 统一补 `ipa/uk/cn` 反查，与收藏列表同口径。词库、音频、缓存键一律不动。

### 二、易错点「（一瓶）」被劈到下一行（`pkg-study/data/grammar.js` + 源 `_ipa_build/_grammar.json`）
- **现象**：`…要表示数量才用 a piece of（一条）、a bottle of（一瓶）` 折行断在「（一瓶）」中间——全角「（」不许居于行首，被挤回上一行行尾，下一行只剩「一瓶」，看起来像「一条有括弧、一瓶没有」。
- **全库扫描**：125 条易错点中含括弧 13 条；其中 11 条是「✅ 句（原因）」形态（`parseNotes` 已摘出成独立行，无风险）、2 条是英文句内部的 `(which) / (should)`（无风险）。真正会断行的只有 2 条，均已改写：
  - advice 条 → `advice 不可数，前面不加 a；句中用 some 就对了。要表示数量，得用 a piece of advice、a bottle of water 这样的短语`
  - will 条 → `电话铃响时说 I'll get it. 这是临时决定，不说 I'm going to get it.`
- 口径：**新文案禁止「英文短语 + 全角括弧挂注」这种组合**（断行不可控）；括弧注只允许出现在句尾（会被摘成「原因」行）。
- 英文例句未动 → 无新增音频。改的是中文尾巴，`g/` 桶音频不涉及。

### 三、方法日「今日要点」序号区与注释区重复（`utils/data-p1..p6.js` + `pages/today/today.js/.wxml/.wxss`）
- **评审**：65 个纯中文方法日（无可朗读英文）中，62 天只有 1 条内容。逐条评审后分两类：**有增量**（留存率数据、行动处方、诊断结论，如「直接重读留存率约 20%，先回忆能到 70%」）与**同义换皮**（与上方背景色注释区说的是同一件事）。用户选定「B+C 组合」。
- **B 去重**：删除 31 天、34 条零增量条目（`_ipa_build/_dropex1191.js`，带断言防错位）。含用户点名的 Day165「用搭配描述事物」。删除后这些天的要点卡只保留注释区，不再有两段并列的中文说明。
  - 保留 34 天有增量的补充条；`g.exp`（注释区）**一条未动**。
- **C 降格**：`today.js` 给方法日打 `plain: !gEx.length` 标记 → `today.wxml` 去掉「1. 2.」序号、`today.wxss` 新增 `.grammar-ex--sup`（左侧 4rpx 细竖线 + 24rpx `--muted3` 浅色小字），视觉上从「并列要点列表」变成「附在讲解下的一行补充」。point 日（325 天，有英文例句）完全不受影响。
- ⚠️ 同类混排教训（沿用 v1.1.87）：**判「方法日」的口径是「ex 里没有可朗读英文」**，不是「ex 全中文」；改动后跑扫描确认 325 个 point 日 `ex` 零变动（断言通过）。
- 内容四关卡：①往返一致 6/6 ✓ ②结构 13 段/65 天 ✓ ③考试色彩 **无新增命中**（反而少 1 处：被删条目里的「写作」）④格式异常 0 ✓。

### 四、准备期按钮（待选，未动代码）
- 用户反馈：v1.1.90 的两个胶囊仍显单调，要求**先探讨再出可视化方案**（重申工作流）。已出 5 方案真尺寸对比报告：`D:/idea/_reviews/准备期页面方案_v1.1.91.html`（现状 / ①主按钮加副标题 / ②双卡片入口 / ③卡片加自绘插画 / ④单主按钮+文字链接 / ⑤组合式·推荐），等选型后再改。


## 2026-10-11 · 准备期按钮去图标 + 胶囊圆弧（v1.1.90，未上传）

> **触发**：v1.1.89 方案A 效果图定稿后用户再看：左侧两个图标（实心绿圆播放标 / 灰眼睛）都可以不用；背景两端改成圆弧形。已出三档圆角对比效果图（`D:/idea/_reviews/准备期按钮_去图标圆角_1011.html`），用户选定 **胶囊圆弧 999rpx + 主行维持浅绿底**。

- `today.wxml`：删两个 `.cellrow__ico` 节点（`--play` / `--eye`），注释同步 v1.1.90 口径。
- `today.wxss`：`.cellrow` `border-radius` 16rpx → **999rpx**（胶囊，两端半圆）、左右 padding 22→26rpx（胶囊下更匀）；删 `.cellrow__ico` 四组规则（含深色主题两套 data-URI）；宽屏媒体 `border-radius:8px` → `999px`、删宽屏 `.cellrow__ico` 行。
- 行为、文案、按压色一律不动（`startLearning` / `backToToday` / press2 / press-green）。
- 自检 `_chk1189.js` 更新两条口径后 **20/20 全绿**（含「cellrow__ico 零残留」「胶囊 999rpx 落位」断言）。

## 2026-10-11 · 语法区易错点重排 + 内容修正 17 条 + 准备期按钮改箭头行（v1.1.89，未上传）

> **触发**：用户真机截图反馈 —— ① 易错点「✓ I need some advice. 不可数名词要表示数量用 a piece of / a bottle of」超长混排难读；② ✓ 句与中文尾巴无关联（句里根本没出现 a piece of），零基础只能靠猜；③ 准备期「先看看第 1 天」两个 button 看不出是功能性按钮，中意自绘 SVG 箭头形式。三项方案均已出效果图并经用户选定（易错点方案A·说明独立成行；按钮方案A·双箭头行主行浅绿底）。

### 一、易错点：内容修正 17 条（`grammar.js` + 源 `_grammar.json` 同步改）
- **修法口径**：中文尾巴先接住 ✓ 句里的成分（"句中就是例子" / "children 是不规则复数"）再向外延伸，零基础顺着 ✓ 句就能看懂尾巴在说什么。
- **英文句一律不动** → 朗读音频零新增。唯一例外 much/many 条：✓ 从「I have much money. / I have a lot of money.」收敛为「I have a lot of money.」（与另一话题口径一致、该句音频已在云）；旧句 2 个音频成孤儿已从云端删除。
- 全部 17 条对照表见 `D:/idea/_reviews/易错点与准备期按钮方案_1011.html` ③；应试词扫描 0 命中。
- ⚠️ 实施注意：**不能从 `_grammar.json` 重新 build** —— plain 开场白 / tags 场景标签只存在于产物 `grammar.js`（apply_plain_tags.js 写回的），重建会丢。

### 二、易错点：排版方案A「说明独立成行」（`topic.wxml/.wxss/.js`）
- 现状问题：句+尾连排且喇叭钉行尾，折行后喇叭正好落在尾巴词组中间。
- 改后：英文句一行带喇叭；中文说明独立成行（`.fix__tail`，缩进 44rpx 对齐文本列、23rpx 浅色，与「（原因）」行同构）。
- `parseNotes` 的 tail 在显示层剥掉行首标点（say 切分落在「。」前留下的），数据不动。
- 卡拉OK（v1.1.83）不受影响：只点亮 say（英文部分），tail 本就不参与点亮、只是从行内挪到行外。

### 三、准备期双按钮：改「箭头行」方案A（`today.wxml/.wxss`）
- 主行「开始学习」：press-green 浅绿底常亮 + 实心绿圆白三角播放标 + 深色 chevron；按压 press2 再深一档。
- 次行「先看看第 1 天」：soft 底 + 灰描边眼睛标 + 「只预览 · 不打卡」小字 + 灰 chevron；按压 press-green（与 tools 页 cat-cell 按压约定一致）。
- 图标自绘 SVG data-URI，`.theme-dark` 单独一套；行为不变（startLearning / backToToday 原样）。
- 自检 `_ipa_build/_chk1189.js` **18/18 全绿**（数据一致性 / say-tail 切分 / 119 个 say 音频云端零缺口 / 模板样式落位 / 语法）。

## 2026-10-11 · 删设置页「计划开始日期」模块 + 准备期改双按钮（「开始学习」/「先看看第 1 天」）（v1.1.88，未上传）

> **触发**：用户定案 —— ①「计划开始日期」这个模块本身就是匹配周计划和雅思的，现在这两个都没有了，直接删；删完「清除学习记录」里「去设置开始日期」的描述也要改。② 准备期页面应该有两个按钮：一个保留「去 Day 1 看看」（能返回准备期），另一个新增「开始学习」（真的开始）。这样**任何使用者只要没有学习记录，点进小程序首页都是准备期页面**，逻辑才自洽。

### 一、设置页：「计划开始日期」模块整体下线
- **为什么能删**：`startDate` 当年只服务两件事 —— 「周」作为对外进度单位时的对齐，以及雅思备考周期的排期。v1.1.67 等级下线、v1.1.66 起「第 1 天 = 所选当天（不再强制对齐周一）」，这个选择器已经没有承载物。
- **删除清单**：`settings.wxml` 的日期卡 + 自绘月历弹层（`cal-sheet` 整块）；`settings.js` 的 `onStartDate / openCal / _buildCal / shiftMonth / closeCal / pickDay` 六个方法 + `data.startDate` 初值 + `data.cal` 状态；`settings.wxss` 的 `.cal-*` 规则（含宽屏段）。`.picker-value` 保留（「朗读方式 / 默认口音」仍在用）。
- **文案同步**：清除学习记录弹窗尾句 `想开学，把上方开始日期设为今天或未来某天即可。` → `想开学，在今日页点「开始学习」即可。`
- `store.js` 侧字段与合并规则（`settingsAt` 新者胜）**一概不动** —— 云端同步、导入导出、备份摘要都还要用它。

### 二、准备期改为两个按钮（用户已确认方案）
- **主按钮「开始学习」（`.btn-primary`）**：`startLearning()` → `store.set('startDate', 今天)` → `resetView` → 重走 `onShow` 默认落点 → `currentDayFromStart` 返 1 → 今日页即第 1 天，打卡放开。**不加二次确认**（用户定案）：开学不是消耗性动作，当天不打卡第二天仍停第 1 天，没有惩罚。
- **次按钮「先看看第 1 天」（`.btn-ghost`）**：沿用原 `backToToday()`，只预览；顶部保留「‹ 返回准备期」条，打卡按钮置灰（`onCheckin` 拦截）。
- **判定口径（用户定案）**：**未开学**（`startDate` 为空）才显示准备期；点过「开始学习」后即使 0 打卡，下次进来也是第 1 天，不再回准备期。
- **文案调整**：副标题 `计划开始日前，可先熟悉操作` → `先熟悉一下，随时可以开始`；状态行 `尚未设置开始日期 · 选好日期即开学`（`prestart-days`，60rpx 大字）→ 拆出 `prestart-note`（28rpx 常规字）`还没有学习记录 · 点「开始学习」即开学` —— 原来那条只在倒计时（`daysToStart > 0`，现仅云端同步来的未来日期会出现）时用大字；预览态返回条 `‹ 返回准备期（未设置开始日期）` → `‹ 返回准备期`。

### 三、校验
- 自检 `_ipa_build/_chk1188.js`：**33/33 全绿**（设置页零残留 13 项、清除记录文案 2 项、准备期双按钮与文案 10 项、`startLearning` 行为 5 项、`plan.currentDayFromStart` 真跑换算 4 项）。
- 内容门禁 `verify_l3_final.js`：③ **95 处 = HEAD 基线，本轮新增 0**（本轮未动 `data-p*`）；格式异常 0。
- 无音频改动（云端 `g/` 仍 2770 条 / 99.4MB —— 同日已清掉 1394 个孤儿文件）。

## 2026-10-11 · 例句精读口径重做：例句必须来自「讲解区」+ 纯方法日不配喇叭、标题改「今日要点」（v1.1.87，已上传体验版 19:24）

> **触发**：v1.1.86 真机验收 —— ① 音标映射与今日页一致 ✅、语法区不再闪屏 ✅；② 用户通读 160 多天新生成的例句后判断「不对：生成的例句是今日页那些单词的例句，而相应单词下面本来就有例句。例句精读应该根据上方注释区的讲解来生成，比如 163/164 天讲『形容词和介词是一个组合要一起记』，就该按里面的形容词介词组合生成几组例句」。

### 一、先纠一个口径错误：日号 = 每周 7 天，不是 5 天
- v1.1.86 我把「第 N 天」按**每周 5 个学习日**折算，于是用户说的第 163/164 天（第 24 周·形容词+介词）被我算成第 33 周·词根周 → 生成的东西完全跑偏。
- **正确口径**：`Day = 7 × (周 − 1) + 1 + 日内序号(idx 0..4)`。校验依据是每周日卡的文案自带天号（如第 28 周自检写「第 196 天自检」= 7×28）——按此公式，176 天与 v1.1.86 的生成记录**逐天 100% 对得上**。
- 真身：**Day162「为什么要连介词一起记」/ Day163「高频形容词 + 介词」/ Day164「情感类形容词搭配」/ Day166「搭配手册」**。

### 二、176 天重新分类：84 天有语言点 / 92 天是纯方法
- **84 天（point）**：讲解里给出具体英文材料或明确语言点 —— 前缀 re-/un-/dis-/pre-/over-/under-、词根 spect/port/dict/duc/ject/scrib/struct/tract/form、后缀 -tion/-ment/-ness/-able/-ive/-ize、make/do/take 搭配、形容词+介词、动词短语、学术搭配、正式 vs 日常替换、词性转换、易混词……
- **92 天（method）**：讲解本身就是学习方法/策略/流程（主动回忆法、间隔重复、听写三步法、影子跟读、错词本、回译法、时间安排、判断题/摘要补全等答题策略）——**里面没有任何英文语言点可示范**。
- 另有 4 天（Day79 简单句三要素、Day435 从简单句到复合句、Day437 段落公式、Day477 后缀与词性转换）讲解里虽没写英文材料，但语言点明确 → **人工并入 point**。

### 三、例句重做：一条都不许「拿当天单词造句」
- **新口径**：把当天讲解整段喂给模型，要求例句**示范这段讲解讲的语言点**；讲解里出现的英文材料（词根/词缀/搭配/句型/替换对照）必须真实用上，3 句尽量覆盖不同材料。
- 逐条硬校验：必须过客户端 `exSpk`、5~18 词、**不含当天单词表凑数**、与「原有例句」不重复、**必须命中讲解里的材料 token**（词缀按「词首/词尾」匹配，避免 `\bun\b` 把 unkind/dishonest 误杀）。
- 实跑 **84/84 天满 3 句 = 252 句**（DeepSeek `deepseek-flash`，两轮合计 ≈1.70 元），另**人工复核替换 9 句**读起来生硬/语法别扭的（如 `Pregame subway riders…` → `We underestimated the crowd and had to wait over an hour.`）。
- 效果：`Day163` 三句分别覆盖 interested in / good at / afraid of / ready for / different from / worried about —— 正是用户要的「按讲解里的组合生成几组例句」。
- **v1.1.86 的 528 句全部回滚**（写回时按「原始 ex + 新结果」重建，method 日自然回落为原来的中文要点）。

### 四、92 个纯方法日：不配喇叭，标题也不再叫「例句精读」
- 用户定案：「这部分区域就不给喇叭，且这部分完全没有英文语言的，甚至标题那里例句精读都可以换一种说法了。」
- `today.js`：`g.ex` 映射时统计可朗读条数，`gEx.length ? '例句精读' : '今日要点'` → 写入 `dayData.g.label`；`today.wxml` 标题改为 `{{dayData.g.label || '例句精读'}} · {{dayData.g.t}}`。数据驱动，无额外字段。
- 结果：**84 天**（point）仍是「例句精读 · 标题」+ 3 条带喇叭；**92 天**（method）变成「今日要点 · 标题」+ 只有中文要点、**无播放按钮**。

### 五、音频与校验
- 清单重算：**1385 条 × 双速 = 2770 个文件**（v1.1.86 是 1661 条；差额 = 528 句移除 − 252 句新增 = 276 条）。
- 上传：以**云端 key 为准**做差集（本地 g_mirror 残缺，不能当依据）→ 缺失 **504 个**（252 句 ×2）已生成并上传；复核 **2770/2770 零缺口**，云端 g/ 3660 → **4164 条**。
- 自检 `_chk1187.js` **6/6 全绿**：①客户端 `exSpk` × 生成侧 `looksSentence` 1164 句 **0 差异**；②point 84/84 ≥3 句可朗读、method 92/92 **0 句**；③标题分支 + wxml 动态 label；④云端零缺口。
- 内容门禁 `verify_l3_final.js` ③ 命中 **95 处 = HEAD 基线一致（本轮新增 0）**（期间修掉一处误伤：新句里的 `band`（乐队）撞 `\bband\b`（分数段），已换词）。
- **遗留**：云端 g/ 现在有 4164 个 key，清单只需 2770 → 约 **1394 个孤儿文件**（含本轮移除的 528 句 ×2 = 1056 个）。孤儿不被任何页面引用、不消耗流量，只占存储；需要时再定向清理。

## 2026-10-11 · 语法区卡拉OK 闪屏修复 + 176 个「方法日」补真例句（v1.1.86，已上传 18:33）

> **触发**：v1.1.85 真机验收两条 ——「语法区点按播放按钮闪屏；交互状态不仅仅播放按钮动了，和播放按钮同一行的例句也动了」「今日页 163 例句精读注释区没有喇叭，但下面根本没有英文例句，只有一句中文。部分页面是这样」。

### 一、语法区点喇叭闪屏 = 多余的一次 setData（例句被渲染成空串）
- **根因**：`topic.js:onSpeakEx` 在点击时**手工推了一次** `setData({ playingText, karaLit:'', karaRest:'' })` —— wxml 的卡拉OK 分支于是把**整句渲染成空字符串**；而网络音频首帧要等几百毫秒，这一行就「整句消失 → 再逐字长出」，看起来正是「例句跟着按钮一起动」。
- **为什么只有语法区**：今日页 / 复习页 / 工具页**都不做**这次清空（`karaLit/karaRest` 只在 `onStateChange` 里赋值）→ 所以不闪。用户「只有播放按钮该有按压态、今日页就是这逻辑」的方向对，但真因是那次多余 setData（例句行本来就是 `hover-class="none"`，没有行级按压态）。
- **修法**：`karaLit:'', karaRest: text` —— 首帧即渲染整句的**未读态**，染色区从 0 开始向右长；两段拼起来仍等于原文，断行点不变、无重排。

### 二、176 天「例句精读」补真例句（用户定案：按当天单词重新生成 + 双速音频）

> ⚠️ **本节口径已被 v1.1.87 推翻**（「按当天单词生成」= 与单词卡例句重复；日号也按每周 5 天算错）。v1.1.87 改为「按讲解区生成」，这 528 句已全部回滚。保留原文仅作变更史。
- **扫描**：390 张例句精读卡里 **176 天整卡只有中文要点、没有一句可读英文**（Day15~19 / 36~40 / 57~61 / 78~82 / 99~103 / 120~124 / 141~145 / 162~166 … 连续段）。定性：这些是**方法/技巧型学习日**（主动回忆法、间隔重复、错词本三条规则、前缀是什么…），`g.ex` 位置本来放的就是中文方法论要点，不是漏写英文。
- **生成**：DeepSeek `deepseek-flash`，176 天 × 3 句，逐条硬校验（必须通过客户端 `exSpk`、4~20 词、用上当天单词、纯英文无重复）。实跑 **176/176 天满 3 句 = 528 句**，成本 ≈0.53 元。
- **写回**：追加进 `data-p*.js` 的 `g.ex`（**保留原中文要点**，中文行仍不给喇叭）——6 个文件 JSON **往返逐字节一致**。
- **音频**：528 句 ×双速 = **1056 个文件**，已生成并上传云端；复核「清单 × 云端 key」= 1661 条 ×双速 **3322 个文件零缺口**（云端 g/ 3660 条 / 143.8 MB）。
- **效果**：「整卡无一句可读英文」的天数 **176 → 0**；可朗读句合计 1154 条。

### 三、纯英文的「注释行」仍不给喇叭（延续 v1.1.85 口径）
- v1.1.85 被挡的 131 条纯英文行逐条看过：绝大多数是**用英文写的注释**（`Pro:` / `Con:` / `Checklist:` / `Weakness:` / `Question:` / `Overview:`），按「注释类不播」继续**不给喇叭**。
- 只放行一类误伤：**句末带短括号的真例句** —— `The town that I visited was quiet. (not where)`、`My English is limited. (not: poor)`、`I really like it. (not: I very like it)` 等 5 条（Day380/381）。`exSpk` 与 `looksSentence` **同步**改为允许句末 `.!?` 后跟一个 ≤24 字符括号。
- **复核**：精读句 1440 条两侧口径 **0 差异**；`verify_l3_final.js` ③ 命中数与 HEAD 基线**完全一致**（95 处历史存量，本轮**新增 0**）。其中 `sprint` 是 Day404 词表的正式词汇，门禁词表项已由 `sprint` 精确为 `final sprint`，避免误伤。

## 2026-10-11 · 全链路朗读契约审计：「注释类不播」定案 + 词形走 w 桶（v1.1.85，已上传 17:44）

> **触发**：v1.1.84 修完音标例词音色后用户追问「其他区域是否还有同类问题？有没有一并修复」。穷举所有走文本哈希（g/ 桶）的朗读来源逐一核对——**覆盖率一律以云端 key 为准**（`tcb storage list g/ --json -e <env>`；本地 g_mirror 只有 1494 个 key、比云端 2578 少一半，用它算必误报——本轮曾因此误报「缺 906」）。

### 一、审计结论（云端盘点：51268 个 / 1016.5MB = w 16230 · wuk 16230 · s 16230 · g 2578）
| 来源 | 桶 | 结果 |
|---|---|---|
| 词表单词（美/英音）+ 词卡例句 | w/ wuk/ s/ | 8115 × 双速 → **0 缺** |
| 语法速查例句 + 易错点对句 | g/ | 212 + 120 → **0 缺** |
| 音标例词 | w/ + g/ | 111 → **0 缺**（v1.1.84 修） |
| **例句精读**（今日页学习日第 2 卡 = `data-p*.js` 的 `g.ex`，**从没进过生成清单**） | g/ | 912 唯一句 → 缺 63 |
| **词形小字**（206 个 form） | g/ | 缺 23（全是词表内「原形」） |

### 二、「注释类不播」定案（用户 10-11 晚拍板）
精读缺的 63 条逐条看**绝大多数不是句子**：日程（`10:45 - 11:45 writing…`）、清单（`Checklist: 1) …`）、填空（`The ___ fee is 30 yuan.`）、备注碎片（`Tag:` / `Type 4:`）、纯中文提示（110 条，如「每天 5 分钟回忆…」）。用户原话「提醒注释类区域，播放它干嘛？」→ 定案：**注释类一律不给喇叭、不生成音频**（而非补音频）。
- 客户端 `today.js:exSpk()`：含汉字 / 填空 `___` / 箭头 / `标签:` 开头 / 数字开头 / `Day|Box|Minute|Week N` 前缀 / 无句末标点 / 英文词 <3 → `spk=false` 不渲染喇叭。
- 生成侧 `mk_g_tasks.js:looksSentence()` **同口径**（校验脚本 `_chk1185b.js`：912 条两侧逐条比对 **0 差异**；会给喇叭的 621 条全部落在生成清单内）。
- ⚠️ 语法区例句**不套**这套过滤（`I work.` / `Birds fly.` 双词真例句会被词数下限误杀；该来源照旧全给喇叭）。

### 三、词形小字：词表内的形式改走 w/ 桶（零新增音频）
`was→be` 的 be 等 23 个「原形」都在词表里，三页 `onSpeakWf`（today/tools/review）由 `speak(t,{kind:'g'})` 改为 `plan.wordAi(t) ? {ai,kind:'w'} : {kind:'g'}` → 与单词**同一个文件**，音色/语速天然一致；词形在生成清单里也恢复词表外过滤。

### 四、音频增量：仅 26 个文件（13 条真句子 × 正常+慢速）
按「注释类不播」收窄后，真正缺音频的只有 **13 条真句子**（如 `Next year I will travel to Japan.`、`Did my overview exist in the chart description?`）。本轮生成 24 个（12 条 ×双速，9s、0 失败）；另有 1 条（`Next year I will travel to Japan.`）**本地镜像早已存在、云端却没有** —— `gen_g_audio.py` 按本地存在性跳过，于是它既没被生成也没进上传批次，**已单独补传**。合计 **26 个文件，已于 17:44 上传云端**（`tcb storage upload _g_up g`），复核「清单 × 云端 key」= 1128 条 ×双速 **2256 个文件零缺口**（云端 g/ 2604 条）。全量生成清单 `_g_tasks.json` = 1128 条（语法 212 · 音标例词 2 · 精读 615 · 词形 140 · 新增 159），哈希冲突 0。
> ⚠️ 教训：**「本地有、云端无」是静默漏传的盲区**，上传后必须用「生成清单 × 云端 key」复核缺口，不能只看生成日志。

### 五、附：含中文句可同音色生成（实测，本轮未采用）
预生成音色 `en-US-AvaMultilingualNeural` 是**多语言**音色，实测可读中文（纯中文 4.22s / 中英混排 4.80s，`_ipa_build/_probe_zh.py`）——「含中文整句生成、音色仍全站统一」技术上成立。因定案是注释类不播，本轮未采用；日后若要给「中文在前英文在后」的行（如「例词：really · real…」词族清单，`sayOf` 切不出英文）配朗读，直接走这条通道即可。

## 2026-10-11 · 音标例词音色修复 + 语法区例句去掉纯色背景（v1.1.84，未上传）

> **触发**：v1.1.83 真机验收——「语法区里的例句和易错词都有卡拉OK状态了，但是例句交互形式还有纯色背景。音标中的例词音色怎么和今日页中的单词不一致？」（卡拉OK 已确认生效）

- **音标例词音色 = 生成侧与播放侧口径对不上，111 个例词里 109 个中招**：
  - 生成脚本 `_ipa_build/mk_g_tasks.js` 的口径是「**只把不在词表**的音标例词收进 g/ 桶」——理由写在注释里：在词表的词会走 w/ 桶，音色本来就一致，不必重复生成。
  - 客户端 `tools.js` 的 `onSpeakPhonEx` 却**恒传 `ai: 0`**（等于只问 g/ 桶）。实测 **111 个例词里 109 个在词表内** → 这 109 个每次都命中不到预生成文件，**全部降级到在线有道 TTS**（`trySentence`），音色必然与今日页的 Azure Ava 不同。用户的听感判断完全正确。
  - **修法 = 两侧口径对齐**（改客户端，不动数据）：
    ```js
    const ai = plan.wordAi(w);
    if (ai) speech.speak(w, { ai: ai, kind: 'w' });   // 词表内 → w/ 桶（与今日页单词「同一个文件」）
    else    speech.speak(w, { ai: 0, kind: 'g' });    // 词表外 → g/ 桶文本哈希
    ```
    走 w/ 桶后音色、语速、**accent 切换**（美音/英音）一并随全局设置，与今日页单词完全同源。
  - **核查**（`_chk1184.js`）：111 个例词（走 w/ 桶 109 · 走 g/ 桶 2）在本地镜像里**美音 + 英音、正常速 + 慢速全部命中**，无缺口、无需重新生成音频。
- **语法区例句行去掉纯色背景**：删除 v1.1.80 定的 `.ex--on { background: var(--soft) }`（极浅绿底），wxml 也不再切这个 class —— 例句的播放反馈**只留「卡拉OK 已读段染绿 + 喇叭变深绿」**（用户：卡拉OK 有了，纯色背景不要）。
- **教训（值得记）**：「预生成音频走哪个桶」是**生成侧与播放侧的一对约定**，任一侧单独改就会静默降级到在线音源 —— 降级不报错、只是音色变了，只有真机能听出来。以后凡是 `speak()` 的 `ai/kind` 与某个生成脚本有关联，改任一侧都要把另一侧的口径翻出来对一遍。
- 自检 `_chk1184.js`：①例词路由端到端命中 ②客户端口径三条断言 ③`.ex--on` 在 wxml/wxss 双双消失（剥注释后判定）④四文件语法 + 换行符。

## 2026-10-11 · 语法区卡拉OK 回归（换渲染结构）+ 易错点喇叭按压（v1.1.83，已上传体验版 16:35）

> **触发**：v1.1.82 真机复测——「易错点卡片和下面的例句卡片能做成卡拉OK形式我看看会不会闪吗？现状是易错点播放按钮按了没看出交互效果，例句卡片的交互是深色背景。已经听到同音色的声音了」。音色/预取已随 v1.1.82 解决，本轮只做**播放态表达**。

- **易错点喇叭此前毫无按压反馈**：wxml 上写的是 `hover-class="none"` —— 点下去没有任何变化（用户「看不出按了没」）。改 `hover-class="speak-hover"`，并在 `topic.wxss` 单开一条 `.fix__spk.speak-hover { transform: scale(.85); opacity: .6; }`（与 `app.wxss` 的 `.ex-speak.speak-hover` 逐字同款）。喇叭本体是 `view.spk-ico`，**不是 `<text>`**（v1.1.77 的坑：`<text>` 不支持 hover-class / hover-stop-propagation）。
- **卡拉OK 回归，但换了渲染结构（这才是「会不会闪」的答案）**：v1.1.75 曾因整页闪动被 v1.1.80 撤掉，根因不是卡拉OK 本身，而是**渲染结构**。本轮三条约束：
  1. **wxml 用 `wx:if` 双分支**——只有「正在播放的那一行」才渲染 `{{karaLit}}{{karaRest}}`，其余行是纯文本节点、完全不引用这两个字段 → 进度帧（约每秒 3~4 次）的重绘范围从「整页所有例句行」压到「被点那一行的两个 text 节点」。
  2. **两段拼起来 == 整句原文**（`lit + rest` 只是切分点移动，文本总长与断行点都不变）→ 无重排、无跳动。
  3. **`onStateChange` 三字段差异比较后才 `setData`**（`playingText` / `karaLit` / `karaRest` 各自比对），同值不推 → 一帧一次、无空转重绘。
- **易错点的卡拉OK 比例句多一层切分**：数据里的展示文本常把「英文句 + 中文说明」连写，而播放文本 `S.say` 只取英文部分（v1.1.82 的 `sayOf`）→ 直接按 `say` 长度染色会和显示错位。故 `parseNotes` 里再算一层：`sg.kara = say 是否为 v 的前缀`、`sg.tail = v 去掉 say 的尾巴`。wxml 渲染 `{{karaLit}}{{karaRest}}{{S.tail}}` —— **中文尾巴永不点亮**；`say` 不是 `v` 前缀时（归一化差异）直接关掉本条卡拉OK，安全降级为纯文本。
- **例句行播放态不变**：仍是 `.ex--on` 极浅绿底（`--soft`）+ 喇叭 `spk-ico--on` 深绿（v1.1.80 定的，不是深色块），本轮只在其上叠加已读段染绿。
- **自检 `_chk1183.js`**：①三个文件语法 + 换行符 ②**用 vm 从 topic.js 源码里提取真实 `parseNotes`/`sayOf` 执行**（不是抄一份），验证 bad/good 三态 + `say + tail` 能拼回 `v` + 无播放文本时 `kara=false` ③wxml 标签配对 ④关键挂载点（含**数据引用次数必须 = 4** = 易错点 2 + 例句 2，防止以后有人把 `karaLit` 写到外层容器上、把闪动放回来）。全部通过。
- **自查踩坑**：自检脚本第一版里 `\{\{karaLit\}<\/text>` 漏写了一个 `\}`（正确是 `\{\{karaLit\}\}<\/text>`），使正则少匹配一个 `}` → 误报失败，白排查一轮。**教训**：这种"把代码结构写成断言"的检查别用长正则硬拼，改用 `indexOf` 拼接位置判断。

## 2026-10-11 · 易错点对句音频链路彻底修复（v1.1.82，未上传）
> **触发**：v1.1.81 上传后用户真机复测——「易错点的句子依旧是线上形式吗？不是和其他单词一样走的云盘预读？因为点击很久才播放而且音色也不一样」。**用户判断全对**。

- **⚠️ 上轮「154 个已上传」根本没落到位（根因一）**：`tcb storage upload ./_g_new g` 的语义是**把目录内容放到目标路径下** → 实际写成了 `g/g/0/xxx.mp3`（多一层 `g/`）。云端 `g/` 下**没有任何 10-11 的文件**，10-11 的 154 个全在 `g/g/` 里。已 `storage rm g/g --dir` 清理（165 项）。**铁律：`tcb storage upload <本地目录> <云端目录>` = 把本地目录的「内容」铺到云端目录下；要传 `g/0/x.mp3` 就该传 `./xxx/g` 而不是 `./xxx`。上传后必须 `storage list` 核对 key 前缀。**
- **prefetch 从不认语法例句（根因二）**：`speech.prefetch()` 用 `relPath(kind, ai)` 算路径，而语法例句 `ai=0` 被 `if (!ai) return;` 挡掉 → **易错点/语法例句从未预热**，每次点击都要现走云函数签名（1~3s）。已给 prefetch 加 `it.text` 分支（走 `gRel` 哈希），topic 页进页即预热本语法点全部 good 句（`diskLimit=0` 只签链接不落盘）。
- **含中文的句子永远走在线（根因三）**：125 条 good 句里 **41 条展示文本把英文句和中文说明连在一起**（如「I need some advice. 不可数名词要表示数量用 a piece of / a bottle of」），而 `tryPregenG` 对 `/[^\x20-\x7E]/` 的文本**主动跳过 g/ 桶**。新增 `sayOf()`（客户端 `topic.js` + 生成脚本 `_ipa_build/_sayof.js`，**逐字节同口径、已用 vm 提取实测 0 差异**）：纯英文原样；含中文则截到「首个句末标点或首个中文」，剥尾部省略号；切不出英文 → 返回空 → **不渲染喇叭**。wxml 播放走 `S.say`、显示仍用 `S.v`。
- **口径与结果**：good 句 125 条（去重 124）→ **say 120 条**（83 纯英 + 39 条自中文句切出，2 条纯中文提示句「去掉 so/but」不给喇叭）。本地生成 74 个缺失文件（37 条 ×2），**228 个文件按正确路径上传云端，复核 120/120 正常速 + 120/120 慢速全部命中**。同页内 say 重复 = 0（不需唯一键，实测确认）。
- **对账口径**：全量对账云端 `g/` 桶（`storage list g --json`，2578 条）+ `w/` `wuk/` `s/` 三桶 5.1 万文件 —— 单词/英音/例句**零缺失**。

## 2026-10-11 · v1.1.80 真机验收第 3 批修复（v1.1.81，已上传体验版）

> **触发**：v1.1.80 真机反馈——①评级四档没有反馈 ②were/was/been 三卡点「原形 be」三处同亮 ③填空喇叭播放态只是变色不明显 ④易错点对句音色不一致（推断未预生成）⑤某词点喇叭全链路失败（诊断弹窗）⑥复习页见一个词只有一个读音按钮且无音标。

- **评级按压从未生效（根因）**：v1.1.80 把 wxml 的 `hover-class` 改成了 `grade-press`，但 wxss 选择器写的是 `.grade-btn--press` → **类名不匹配，样式从未命中**。改 wxss 为 `.grade-press`。（教训：hover-class 的值就是追加的类名，改 wxml 必须同步 wxss 选择器。）
- **词形标签串亮（wfKey 唯一键）**：高亮判断原为 `wfText === F.form`，were/was/been 三卡同有「be」→ 点一处三处同亮。引入 `wfKey = 词 + ':' + form`（today / review 随机·到期·磁贴 / tools 四处统一），`data-text` 管播放文本、`data-key` 管高亮，清理处 wfText/wfKey 同生共死。
- **填空原句复刻卡拉OK**：`cloze-en` 行接入页面已有的 `karaLit/karaRest`（重点词例句同款，`onStateChange` 本就按 progress 计算）→ 无新增 setData 负担，无闪动风险。
- **易错点对句音色（推断证实）**：topic 对句喇叭走 g/ 桶（文本哈希），但这些句子**从未进过生成清单** → 播放降级有道整句、音色不一致。把 125 条 good 句 + 词形全部 form（183 个）收进 `_g_extra.json`（脚本 `_ipa_build/_collect_g_extra.js`），重跑 mk_g_tasks → **新增 154 个音频已生成并上传云端**（476 任务 ×2 本地 mirror 全齐）。
- **全量音频对账（tcb storage list 37 个分片目录 vs 期望清单）**：`w/`（美音正常+慢速）、`wuk/`（英音）、`s/`（例句）**共 51040 个文件零缺失**；g/ 桶云端另有 1518 个旧文本残留（不影响播放，不动）。用户截图的"某词未出声"：三个桶文件都在 → 疑为瞬时网络/签名或本地缓存损坏，待复现时报具体单词再深查。
- **44 条短语补音标**（ai 7941~7999，字段6/7 全空 = 用户看到的"一个喇叭无音标"）：人工写标准 IPA 美英双份写入 words.js（脚本 `_ipa_build/_fix_phrase_ipa.js`，锚点 = 唯一 ai，词数 8115 不变）。
- **415 词补齐英音音标**（用户拍板"改完直接传"）：这类词有美音、英音空（源 `en_UK.txt` 65119 条 vs `en_US.txt` 125927 条，缺 mother/use/job/number/put 等常用词）→ 英音模块不渲染。做法：
  - 数据源 = 有道词典 `jsonapi?dicts=ec`，其 `ukphone` **按位与 `usphone` 成对**（`live`：us `lɪv; laɪv` / uk `lɪv; laɪv`）。**拿词表美音匹配有道 us 列表 → 命中取同位置 uk**（保英美同词性），命中 **279** 词。
  - **未命中 136 词**（词表美音是 `en_US.txt` 首读音、或有道未列该读音）：按**释义/例句语境**人工定音 13 条覆盖（use·produce·close·estimate·reject·suspect·graduate·patent·compact·intern·diffuse·august·wellbeing），其余取有道首读音。
  - **风格归一**：`(r)`→删 / `(ə)`→`ə` / `ɡ`→`g` / `əu`→`əʊ` / 单元音 `e`→`ɛ`（保护 `eɪ`）/ 加 `/…/`，与词表既有 ipa-dict 风格对齐。
  - 结果：**8115 词美音+英音 100% 双全（补前 7700），0 格式异常**（脚本 `_ipa_build/_fill_uk_415*.js` / `_apply_uk_415.js` / `_verify_uk.js`）。音频侧 `wuk/` 桶本就零缺失，补完音标即全链路可用。
  - ⚠️ **遗留（不动，记待办）**：部分词表美音取自 `en_US.txt` 首读音、与释义/例句不符（`reading` 名词却标 `/ˈrɛdɪŋ/`、`wind` 名词却标 `/waɪnd/`、`lead` 例句是动词却标 `/lɛd/`）→ 待专项治理，本次不动美音。
- 词形"互相映射"核查：`wfNotes()` 正向 8115 全扫 + 反向 VARIANTS 全量，音频对账后词形 form 文本全部有 g/ 桶音频。
- **上传口径（15:53）**：TOTAL 1755332B（1.7MB）/ main 1678048B / pkg-study 77284B；sha=`5323b74` · 15:50。提交链：`a976fcd`（代码）→ `5323b74`（415 英音）→ `ee42f55`（stamp）。
- **踩坑记录（上传通道）**：①Git Bash 调 `cli.bat upload --project "<路径>"` 必在 cmd 层报 `'C:\Program' 不是内部或外部命令`（MSYS2 参数引号转义；`--help`/`islogin` 正常）→ **上传一律走 PowerShell 通道**。②IDE 已运行实例不会被 `_start_wechat_ide.sh` 重新拉起（exe 探测到实例即退出），而该脚本启动时**会移走 `.ide`/`.cli` 端口文件** → CLI 报 `wait IDE port timeout`。**修法**：`netstat` 找到 IDE 主进程监听端口（本次 38252 仍在 LISTENING）→ 把端口号写回 `.ide` 即可，**无需重启 IDE**。

## 2026-10-11 · 语法/复习交互与排版收口——箭头统一、例句闪动、音频预取、词形反向（v1.1.80）

> **触发**：v1.1.79 真机反馈第 2 批——①语法区频繁点按例句整块闪动（滑到底部闪上半屏 / 滑到顶部闪下半屏）②语法二三层底部卡片被遮挡 ③各层箭头仍偏小、且首层箭头在两个不同位置 ④易错点颜色/位置不统一 ⑤第三层导航栏标题被截成省略号 ⑥复习页点第一次很久不出声、反复点才播 ⑦复习页动作/评级按钮"只有底色、不知按了没" ⑧单词其他形态提示缺失（were 要不要标 be）。

### 一、语法区（A1/A2/A4/A5/A6）
- **A1 例句播放不再闪**：三条震荡源同时拔掉 —— ①撤销卡拉OK逐帧推送（`onStateChange` 原来每次进度回调约每秒 4 次 `setData` `karaLit/karaRest`，整页例句行重算重绘）②去掉整行 `hover-class="ex--press"`（喇叭 `scale(.85)` 触发整行重绘）③播放态不再替换文本节点，改只切 `.ex--on` 一个 class。重绘范围：**整页所有例句行 × 每秒 4 次 → 被点的那一行 × 2 次**。
- **A2 底部卡片被遮挡**：`topic.wxss` / `grammar.wxss` 的 `page{padding-bottom:env(safe-area-inset-bottom)}` 覆盖了全局 168rpx 预留，安卓多数机型该值为 0 → 最后一张卡贴底被手势条压住。改 `calc(44rpx + env(safe-area-inset-bottom))`。（全站 grep 确认只有这两个分包页有该覆盖。）
- **A4 易错点颜色收两档**：正文 `--ink3` / 辅助（引导语 + 原因）`--muted3`；原来引导语 muted3、原因 muted2、正文 ink3 = 三档灰。
- **A5 对句加朗读**：仅 ✅ 对句配喇叭（错句是反例不需听），复用 `onSpeakEx`（`kind:'s'` + 无编号 → g/ 桶）。喇叭**跟着句子走、不钉行尾**（对句短，钉右会留大片空白 —— v1.1.69 音标例词行的教训）。热区 44rpx、可见图标 32rpx。
- **A6 导航栏短标题**：本页是系统原生导航栏（单行 + 超长省略），长语法点名真机被截断 → `setNavigationBarTitle` 改用分类名（如「句子基础」），完整标题仍在头卡。

### 二、箭头全站统一为「CSS 边框 chevron」（A3）
- 现状三套写法：语法页/工具页用 `›` **字符**（32rpx，字形瘦、随字体漂移）、设置页用 **CSS 边框 chevron**（`border-right + border-bottom + rotate(-45deg)`）。**统一为设置页这一种**，并把语法页 `.cat__arrow` / `.tp__go`、工具页 `.cat-cell__go` 全部换成同款 —— 不引入 SVG，故**无需 darkicons 生成深色变体**（描边走 `currentColor`）。
- 尺寸/颜色一套值：`16rpx 盒 + 3rpx 线`，颜色一律 `--muted3`（原来首层 muted2 / 三层 muted3 / 设置页 muted4 三个灰）。
- **展开态旋转修正**：底形尖端朝东南，`rotate(-45deg)` 得「指向右」；展开要「指向下」需再转 90°，即 **`rotate(45deg)`**（v1.1.79 的 `rotate(90deg)` 方向是错的）。
- 设置页两处箭头同步：`.picker-arrow` 14rpx/4rpx/muted4 → 16rpx/3rpx/currentColor+muted3；`.stat-arrow` 保持 12rpx 几何（12rpx 盒 + `vertical-align:8rpx`，中心落在 40rpx 数字字面中心 14.4rpx，偏差 0.4rpx），仅统一描边色。
- 宽屏媒体查询：`16rpx → 8px`、`3rpx → 1.5px`。

### 三、复习页（B/C1/C4/C6/C7/D）
- **C1 音频预取（本轮最值得的一条）**：复习页此前**零预取** —— 点播放才现场向云函数要签名链接（往返 1~3s）才开始下载；用户以为没点中又点一次，第一次的异步结果被丢弃（链接已缓存）→ 表现为「点很多次、等很久才出声」。新增 `_prefetchCard`（美音正常速 + 慢速 + 英音 + 例句）在抽词/切卡/出题时调用，`_prefetchAllStarred` 备重点词首屏 6 个。
- **C4 按钮反馈**：动作按钮（下一个 / 开始抽查 / 下一题，均 `.btn-primary`）按下色 `#DCEFE7` 与常态 `#F0F7F3` 只差一档、视觉重叠 → 全局 `.btn-primary.btn-press` 增加一档 `box-shadow: inset`（"陷下去"感），一处改动覆盖全部动作按钮。评级四档原为 `hover-class="none"`（完全无反馈）→ 改 `grade-press`（底色加深 + 边框转绿，不叠缩放，守"有底色只用状态色"约定）。
- **C6 填空**：答对后显示的英文原句加喇叭（`onSpeakClozeEn`，`kind:'s'` + 词编号命中例句音频）；**四个选项不加** —— 一读出来就能听音猜词=泄题。
- **C7/D 词形提示**：`wordforms.js` 新增 **`wfNotes(w)`** —— 先查正向（原形→不规则变化），查不到再查反向（变体→原形）。今日页原来只用 `noteFor`，功能词包里的 `were` 作今日单词时词形行是空的；现在标「原形 be」。今日页 / 随机卡 / 到期卡 / 重点词磁贴四处同步，独立 `wfText` 播放态防误亮卡片上的单词/例句（与 v1.1.78 治「been 误亮」同一套做法）。
- **B 播放反馈**：核对后确认 `speech.speakCore` 在**点击时同步** `notify(text, true)` —— 点读按钮的播放态本来就是立刻亮的，无需额外动画；缺口只在"按钮本身没有按压反馈"，由 C4 补齐。

### 四、核查后判定「不做 / 不用改」
- C2 词族（ours→our）属**派生**关系、非变形，需独立词族表 → 本轮只做不规则变形。
- C2 英美音播放**原本就有**（美音/英音各一个胶囊，各带喇叭）。
- C5 四档时间（10 分钟/10 分钟/1 天/4 天）同字号 20rpx、同灰、各自居中，**本就一致**。
- A4 易错点对句中文翻译：数据层无此字段，需新增 100+ 条内容 → **用户 10-11 明确「不加了」，本轮定案不做**。
- A4 原因缺失的 100+ 条是否用 DeepSeek 批量补「为什么」→ 用户未表态，按暂不做。

### 五、上传
- **2026-10-11 14:47 CLI 上传体验版**：TOTAL 1747320B（1.7MB）/ main 1670036B / pkg-study 77284B。指纹 sha `2b06825` · 14:45。
- ⚠️ **上传通道变更**：Git Bash 下调 `cli.bat upload --project "<路径>"` 会在 cmd 层报 `'C:\Program' 不是内部或外部命令`（参数引号被 MSYS2 转义层破坏，`--help` / `islogin` / 不带 `--project` 的 upload 都正常，只有带 `--project` 才炸）→ **改用 PowerShell 调用同一条命令，一次通过**。以后上传统一走 PowerShell。

## 2026-10-11 · 交互反馈统一 + 语法/音标排版对齐全站收口（v1.1.79）

> **触发**：v1.1.78 真机反馈 6 组——①今日页 was/were 只有浅色底、been 还叠按压缩放 ②复习页「有底色 + 按压」双反馈（**包含顶部四个 tab 自身**；填空选项按压时有时无）③音标区「元音/辅音」数字与中文字号不一、例词行单词/中文/喇叭三尺度 ④语法速查箭头三个层级三个值、数量对齐不一 ⑤语法详情头卡四行四种字号四种颜色 + 一行带软底 ⑥设置页「学习进度」箭头未对齐数字中心。

### 一、交互反馈统一（一条规则收口）
- 规则：**有底色的元素只用状态色表达，不再叠加缩放/变暗；无底色的行保留轻按压。**
- 今日页固定词形行 `hover-class`：`hover-dim → none`（只留 `--on` 浅绿底）。
- 复习页三处撤按压：**顶部四个 tab**（原 `hover-dim`，而选中态 `--on` 本就有 `--soft` 底 → 底色之上又叠缩放变淡）、评级四按钮、填空四选项。填空选项的 `hover-class="{{cloze.done ? 'none' : 'btn-press'}}"` **条件绑定一并删除** —— 这就是「答完再点没反馈 / 时有时无」的根因。
- 保留：`.star-big`（无底色图标）、`.btn-primary`（主操作按钮，全站 CTA 约定 = 换 `--press-green` 底 + 轻缩放，未动）。
- **全站排查结论**：该双反馈**仅存在于复习页这三处**；今日页 `.is-today` / `.prep-back` / `.word-star`、设置页 `.about-btn`、语法页 `.sb__clear` 均无底色，保留轻按压是正确的。

### 二、语法详情头卡（方案 C 落地）
- `.head__cat` 22rpx/muted3 → **26rpx / 700 / `--green`**（与 `.section-label` 完全同款）：原分类名比下方每张卡的模块标题还小还淡，属**层级倒挂**（附属模块标题压过头卡身份标题）。v1.1.78 里「刻意区分本体标题/模块标题」的说法就此作废。
- `.head__plain` 去软底块、26→27rpx、`--ink3 → --ink4`；`.head__def` 保持 27rpx/`--ink3`。头卡四行收敛为 **3 字号 / 2 色**。
- 宽屏媒体查询补 `.head__cat 13px` / `.head__plain 14px`。

### 三、语法速查：箭头与数量全站一套值
- 箭头统一 **32rpx**（原：工具页 30 / 语法一层 34 / 语法三层 30）；数量统一 **24rpx**（原：工具页 22 / 语法二层 25）。
- `.cat__n` 去掉 96rpx 定宽 + `text-align:right`（标题已是 `flex:1`，短数字被推得离箭头过远）→ 自然宽度贴行尾。
- **箭头位置修正**：工具页语法目录的 `.cat-cell__go` 原写成**第一个子元素**（渲染在名称左侧），与语法速查页/设置页「箭头在行尾」不一致 → 移到数量之后。全站箭头自此一律行尾（`‹ 返回准备期`、日历翻页、导航返回属语义左向，保持不动）。
- 宽屏补 `.cat__n 12px`、`.cat__arrow` / `.tp__go` 16px。

### 四、工具页音标区字号收口
- `.ph-cls__n` 22rpx + `opacity:.8` → **24rpx 且去掉额外透明度**（与 28rpx 的「元音/辅音」不再像两个大小）。
- 例词行：`.ph-ex__w` 29→**27rpx**、`.ph-ex__cn` 24→**27rpx**，喇叭 36rpx 不变（基线本就对齐，是字号差导致视觉重心散）。

### 五、设置页「学习进度」箭头对齐
- `.stat-arrow` `vertical-align: 4rpx → 8rpx`（宽屏 2px → 4px）。几何：数字 40rpx 字面高 ≈28.8rpx、中心在基线上 14.4rpx；箭头高 12rpx，抬 4rpx 时中心只到 10rpx（**低 4.4rpx**），改 8rpx 后为 14rpx（偏差 0.4rpx ≈ 0.2px）。

### 核查结论：确认「不用改」的两处
- 第三层「例句 · 点整句听朗读」= 全站 `.section-label`（26rpx/700/绿/左对齐），与「用法」「易错点」同款 —— 不存在大小不一，也未居中。
- 复习页 `.btn-primary`（下一个 / 开始抽查 / 下一题）保留 `btn-press`：属全站主操作按钮约定，不属「卡片双反馈」范畴。

## 2026-10-11 · 词形播放态隔离 + 语法二三层排版收口（v1.1.78）

> **触发**：v1.1.77 真机反馈——①搜 be 点「过去分词 been」播放，第二个 been 结果卡的美音喇叭误亮 ②语法第二层展开列表无可点指引 ③头卡 4 层文字观感冗余 ④「用法」圆点与文字不对齐 ⑤头卡分类 chip 样式与其他卡 section-label 不一致。

- **词形播放态隔离（tools + today 同构）**：误亮根因 = 播放态全局广播且按「文本相等」匹配，变体朗读文本 = 单词本身 → 与同名结果卡/词卡撞车（Day1 的 be 与 been 同页必现）。修 = 新增独立 `wfText` 态：wf 播放期间主行 `playingText`/卡拉OK 冻结，播完清空；再点同标签 = 暂停；词条入口（onSpeak/onSpeakWord）反向收词形态。标签自身加 `--on` 播放态（浅绿底深绿字）。
- **语法第二层展开行加 `›` chevron**（手风琴/搜索/场景三处）：展开列表此前无任何可点暗示。
- **头卡分类 chip 与列表分类徽标去胶囊化**：`head__cat` / `tp__cat` 英音蓝（--uk-ink/--uk-bg）→ 中性纯文字小字（--muted3）。与 section-label 不同款是刻意的：head 是语法点本体，附属模块才用绿色粗体模块标签。
- **头卡 4 层文字排查结论**：71 点 `plain`（人话开场白）与 `def`（一句定义）字符级重合 0/71、合计长度均 ≤70 字——**内容无重复**，每层职责不同（分类导航 / 点名 / 开场白 / 定义），只做版式减重不动文案。
- **圆点对齐**：27rpx × 1.75 行高首行视觉中心 ≈ 23.5rpx，`.li__dot` margin-top 14→17rpx（原偏高约 4rpx）。全站仅 topic.wxss 一处同款。

## 2026-10-11 · 准备期统一为默认首站（v1.1.77 补，随 77 一版上传）

> **触发**：v1.1.77 落地后用户拍板——清空记录回准备期与全新安装直落第 1 天两种入口体验不一致，统一为**新装用户也先进准备期**。

- `store.js` defaults：`startDate` 默认值 `plan.DEFAULT_START`（今天）→ `''`（未开学）。新装用户今日页首站 = 准备期倒计时卡（可「先看看第 1 天」预览），去设置选好日期（今天或未来）即开学。
- 消费端零改动：`currentDayFromStart('')=0`（v1.1.77 守卫）、今日页 preStart 分支、设置页「未设置 · 准备期」显示、备份导出「尚未开始学习」均天然兼容空串。

## 2026-10-11 · 清空=回准备期 + 今日页固定词形行 + 语法三层指引（v1.1.77）

> **触发**：v1.1.76 真机反馈——①搜索结果 wf 标签点播放整块仍闪（**根因：`<text>` 不支持 hover-class/hover-stop-propagation，v1.1.76 的修复无效**）②跳转带过去的变体标注 2s 就消失，希望词形固定显示在今日页 ③语法速查首层无可点击指引、第二层数字跟着按压闪、第三层同样无指引且例句播放偶尔闪 ④清空学习记录还要再设未来日期才能看准备期，应该清空即初始状态。

- **wf 标签改 `<view>` 实现**（tools.wxml）：text 上 hover 属性全被忽略 → 行级 hover 照触发。view 支持完整，点标签只亮自身。今日页新增的词形行同样用 view。
- **今日页固定词形行（v1.1.77 主菜）**：词卡 IPA 下常驻「过去式 took · 过去分词 taken」小标签（`wordforms.noteFor`，只有不规则词才有这行），点词形走 g/ 桶朗读（`onSpeakWfToday` 与工具页同构）。跳转 2s 的 via 标注保留（解释「你查的是哪种形式」）。
- **语法三层指引**：首层 cat-cell 加右箭头 `›`；第二层按压反馈收窄到箭头本体（`.cat__head--press .cat__arrow`，数字不再跟着闪）；第三层例句区标题改「例句 · 点整句听朗读」。
- **清空学习记录 = 回「未开学」（主语义变更）**：`resetProgress` 的 `startDate` 从 `DEFAULT_START`（今天）改为 **空串**；`currentDayFromStart('')` 守卫返 0 → 今日页直接进准备期卡，各页面零记录零进度。开学 = 设置里重选日期（今天可选）。**startDate 云同步改 settingsAt 新者胜**（原 `if (c.startDate)` 会把空串打回老日期）。设置页日期显示「未设置 · 准备期」，准备期卡/返回条文案适配未设置态（不再显示「还有 0 天」）。全新安装仍默认今天开学（Day 1），未改。
- 已知小瑕疵沿袭：不规则不变位动词（put/cut）过去式与过去分词同形，`wx:key="form"` 重复键仅控制台警告，工具页 v1.1.73 起同样如此。
- 回归：currentDayFromStart('')=0 / 今天=1 / 未来=0 全对；noteFor(take/be/hello) 符合预期；四 CRLF 文件补丁零裸 LF、编译全过；verify-structure 全过。

## 2026-10-11 · 音频缓存版本化 + 选中胶囊浅色化 + 准备期指引（v1.1.76）

> **触发**：v1.1.75 修后真机复测——①be 美音/is 英音点读仍能听到例句残音（云端文件已验证干净：下载 MD5==本地、尾部 -58dB 纯静音 → 根因是**设备本地音频缓存**，v1.1.72 预取把事故期间的污染文件落进了 `USER_DATA_PATH/au/`，本地优先播放且无从感知云端已更换）②「大面积背景色」另一层含义=选中态胶囊的实心绿深底，与浅色系不符 ③搜索结果卡里点变体标签，整行跟着亮按压态 ④准备期页面没有任何指引，连开发者自己都不知道入口。

- **speech.js 音频缓存版本化**：`CACHE_ROOT` `/au` → `/au2`，模块加载时一次性 `rmdirSync('/au', recursive)` 清旧目录（失败静默重试）。全量缓存作废、按需重取云端干净文件——**修复对用户无需发新版音频，发这个版本即生效**。
- **选中态胶囊浅色化**（实心绿白字 → 浅绿底深绿字，与既有 `.ph-subchip.on` 同风格）：`.ph-cls.on` / `.ph-chip.on`（工具页音标区两级）、`.tagchip.on`（语法场景标签）= `background: var(--press-green); color: var(--green-press);`。暗色主题 token 自动适配（深绿底 + 亮绿字）。
- **wf 变体标签阻止行级按压联动**：`wf-note__t` 加 `hover-stop-propagation`——点标签只亮标签自身（hover-dim），不再把整行搜索结果带亮。
- **准备期指引两处**：设置页「计划开始日期」说明改为明示「设为未来某天 → 今日页进入准备期倒计时」；清空记录确认弹窗追加「想先看准备期，把开始日期设到未来某天即可」。
- 结构校验全过；speech.js/settings.js 编译通过；换行符无破坏（settings.js CRLF 保全，途中曾把字符串内换行写成真实 LF 导致语法错误，已改 `\n` 转义复验）。

## 2026-10-11 · 真机反馈五连修 + 音频管线事故修复（v1.1.75）

> **触发**：v1.1.74 真机反馈——①新补词的单词音频尾部混入多余读音 ②语法详情例句播放态是大面积背景色且无卡拉OK ③语法区/音标区按压仍有整行铺背景 ④查词变体标注只出现在搜索结果卡、跳到今日页后消失 ⑤工具页滑到底后从今日页点搜索跳回，页面先停在底部再滑到搜索框（残影）。

- **⚠️ 音频管线事故（本轮最重要）**：`gen_fw_audio.py` 的 raw 中间文件名只取 basename（`8001.mp3.raw.mp3`），同一 ai 的美音单词/美音例句/英音三个任务**并发写同一个 raw 路径**，内容互相踩踏——单词尾部混入例句片段（用户听到的「be 读完最后 1 秒又出来读音」）。修复 = raw 路径带桶前缀（w/s/wuk 子目录）；690 个旧文件全部隔离到 `_fw_bad/`（不删除），全量重生成（130s 零失败）。
- **音频质量量化验收**：`_ipa_build/scan_fw_audio.py` 用 silencedetect(-38dB, d≥0.25s) 数「发声段」——重生成后 **US/UK 词桶 460 个全部单段干净**（重生成前 US 76 / UK 83 异常）；legacy 基线 4056 个 0 异常（老管线本身无此问题）。剩余 7 条疑似全是例句文件的自然句读停顿（逗号/句号），非缺陷。重传 230×3 后抽验 ETag==MD5 全一致。
- **语法详情例句卡拉OK**（pkg-study/pages/topic）：播放态从 `.ex--on` 整行铺 `--soft2` 背景改为歌词式染色——topic.js 的 onStateChange 补 karaLit/karaRest（含「文本+已亮字符数」双键守卫，与工具页同款），wxml 例句英文拆 `<text class="kara-lit">` 两段；删 `.ex--on`。
- **按压统一收口**（无底色行不再铺背景，改变淡 opacity .55，与 hover-dim 同族）：工具页 `.tk-row--press`（搜索结果行）、语法速查页 `.cat__head--press`/`.tp--press`。带底色的 chip/tile（ph-chip/cat-cell/tagchip/day-chip）维持 press-green 底色按压的既有约定不动。
- **查词变体标注随跳转延续**：搜索结果行补 `data-via`，onJump 把 `{via, q}` 塞 `globalData.jumpVia`；今日页 onShow 消费后随 `_scrollToWord` 定位行下显示「『took』是它的过去式」小字（`.hl-via`，与高亮同生共死 2s 清除）。
- **工具页搜索跳转残影**：onShow 消费 `toolsFocus` 时先 `wx.pageScrollTo({scrollTop:0, duration:0})` 再聚焦——上次浏览停在底部时，切回不再「先画底部再被键盘顶上去」。
- 提交：cloud-sync 分支；音频 690 重传云存储（免版本号，路径不变直接覆盖）。

## 2026-10-11 · 功能词包 115 词插入词表最前 + 三桶双速音频（v1.1.74）

> **触发**：用户拍板「反正都要补词不如都补上，正好做相互的映射注释；我清空学习记录重看准备期」。114 词清单过目后执行插入；用户确认清单页只是审阅工具、版式无需优化。

- **115 词整体插入 words.js 最前**（ai 8001~8115，占前 8 个学习日，Day 1 = bye/be/am/is/are/was/were/been/being/I…）：114 词清单 + 补 1 词凑 5 的整除。补位词 = **bye**（maybe 词表已有 ai=238，bye 为问候语族缺口，插在块首）；词性/释义/英例/中例沿用清单口径。
- **双音标全量补齐**：ipa-dict 本地源（en_US/en_UK.txt）+ us_norm/uk_norm 归一化；en_UK 源缺收的 8 个超高频词（am/are/he/do/does/have/a/no/bye）人工按 OALD 补进 `uk_norm.js` UK_FIX 正式修正表；另修 9 处源数据小毛病（between/eleven/before 的 ɪ 误作 i、already 的 lr 重音错位、a/the 取弱读、than/because/near/here 等），美音口径与词表一致（/hw/ 保留、r 化、ɔ 无 ː）。
- **数据闭环重排**：`data.js` `WORD_TOTAL` 8000→8115；`RAMP` 前 23 组每日 +1 词（sum 1600→1623，×5=8115 闭环）——新课组 15→20 词/天起步，功能词块消化后回到原坡道。390 学习日/546 天/468 打卡日全不变。验证：sum(RAMP)×5 = WORD_TOTAL = allWords().length 三者相等；搜 was→be（v1.1.73 归一遗留的 wash 误归自动消失）、taken→take、better→good 回归全过；搜 hello 落第 10 天（整体后移符合预期）。
- **音频 690 个（115 词 × 6 文件）**：`_ipa_build/gen_fw_audio.py`——美音单词 w/8、美音例句 s/8（Ava +0%/-32%，ffmpeg 44100 单声道 96k）、英音单词 wuk/8（Sonia -4%/-33%，与 gen_uk 管线同构 raw 直存）；135s 零失败；tcb 分三桶整目录上传 230×3，抽验 6 文件 ETag==本地 MD5 全一致。
- **文案**：设置页关于「共 8000 词」→「共 8115 词，每天约 15~20 个新词」；tools.js 音标例词注释同步。构建产物 words.js 体积 +10KB（主包预算充足）。
- **说明**：清单页版式（用户嫌长）确认为纯审阅工具不优化；插入平移对清空记录的用户无缝，公众新用户上线前插入零影响。

## 2026-10-11 · 浮窗 dock V1 + 词形归一与不规则形式标注（v1.1.73）

- **浮窗 dock（用户从 4 版效果图定稿 V1）**：`custom-tab-bar/index.wxss` 壳改悬浮圆角（bottom 抬 safe-area+16rpx、左右 24rpx、radius 40rpx、阴影加肿、去 border-top），深色模式同步；**选中态图标复用现有 .on 变体，红点缀（时钟指针/工具提手/红心/设置钮）全保留**。页面底部预留：app.wxss page 132→168rpx（宽屏 66→84px）、settings sheet 150→168rpx。
- **词形归一（lemmatization）**：新增 `utils/wordforms.js`——不规则动词表（~80 词，含情态 can→could 词形关系）、不规则复数（children/men/feet…）、不规则比较级（better/worse/more…）；规则变化（-s/-es/-ies/-ed/-ing，含 e 还原与双写辅音还原）现场推导，候选必须真实命中词表才生效。`data.js searchWords` 接入：**归一与直查共存，原形排最前带 via 标签**（查 taken → take「过去分词」置顶；making/better/used 自身也是词条的，原形在前、词条在后）；-s 变体按词性修标签（run v. → 「第三人称单数」，tool n. → 「复数」）。20 例端到端回归全过。
- **词条不规则形式标注**：查单词结果卡 IPA 行下加小字（如 take：`过去式 took · 过去分词 taken`，绿色虚线底线标签），每个标签可点读——走 `kind:'g'` g/ 桶预生成音频，与全站同音色；was/were 双写法拆独立标签保证音频逐字一致；自然折行不破版（go 一行、understand 两行）。**今日页词卡暂不加**（学习页保持轻）。
- **g/ 桶音频 +370**：`_g_extra.json` 写入 185 个变体形式，mk_g_tasks → gen_g_audio（正常速 + 慢速各 185，105s 零失败），tcb 整目录上传 832 文件（462 旧 + 370 新），抽检 went ETag==本地 MD5。
- **功能词包清单（未写入 words.js）**：`tools/gen-funcwords-list.js` 产出 114 词清单（be/代词/助动/情态/冠词/疑问/介词/连词/副词/数词 11 步，含释义与例句；词表已有 17 词自动剔除），发布预览链接待用户过目后插入。
- 校验：verify-structure 全过；新文件纯 LF、data.js CRLF 保全（CR=334）；编译检查过。

## 2026-10-11 · 滑动窗口音频预取（v1.1.72）

- **背景**：原「预取三音频」挂账项。现状核实 = 今日页进页面已签全天前 40 条链接 + 落盘前 10 个（`today.js` renderDay → `speech.prefetch`），但 ①慢速变体完全没预取（点慢速首播必走网络，顿一下）；②落盘固定是当天头 5 个词，用户听到后面就没了。
- **方案（用户拍板「走你的建议」）= 滑动窗口 3 词**：以正在播的词为基点，连 3 个词各备 3 个文件（单词正常速 + 单词慢速 + 例句，例句速度跟全局慢速开关），约 150KB；用户往下听窗口跟着滚。全天签链接保留但改为**只签不落盘**（`prefetch` 新增 `diskLimit` 参数，全天调用传 0），落盘全权交给窗口。
- **触发点**：进页面（窗口 0）/ 点播任意词条（窗口滚到该词）/ 开队列连听（窗口 0）。
- **实现**：`speech.js` `prefetch(items, diskLimit)` + item 可带 `slow:true/false` 显式指定速度（缺省才看全局 rate 门槛——窗口预取要两种速度都备好）；`today.js` 新增 `_prefetchWindow(startIdx)`（CRLF 文件，node 脚本改，CR/LF=312 保全），ai 唯一性已有全量验证 → 用 `findIndex(v=>v.ai===ai)` 定位基点。BAD_PREGEN_AI（ai=15 come）与英音无例句音频两条跳过规则对窗口同样生效。
- **顺带**：情态动词缺口核实 —— **can/will/could/would/may/might/must/should/shall 全部不在 8000 词表**（零基础学习者最高频的一批词），已向用户报告，处置方式（补词 vs 查词兜底 vs 语法区补课）待拍板。
- 浮窗 dock 效果图脚本 `tools/gen-dock-preview.js`（4 版 × 明暗，图标实抽自 custom-tab-bar/index.wxss）→ 效果图发布 https://p6-rewrite-review.app.workbuddy.host/ ，**仅为探讨，未动 tabBar 代码**。
- 校验：2 JS 编译过、verify-structure 全过、today.js CRLF 保全。

## 2026-10-11 · tabBar 英文化（复数）+ toast 勾线稿化 + 朗读行按压统一（v1.1.71）

> **范围**：`custom-tab-bar/index.js`、`app.json`、`components/feedback/feedback.js|wxml|wxss`、`pages/tools/tools.wxss`、`pkg-study/pages/topic/topic.wxss`，共 7 文件。
> **触发**：用户真机验收 v1.1.70——①toast 勾仍有大面积色块（绿圆底），与全站线稿图标不统一；②音标例词/语法例句按压是整行变色，与今日页/查单词行不一致；③拍板 tab 文字改英文复数形式。

- **tabBar → Today / Review / Tools / Settings**：`custom-tab-bar/index.js` list text + `app.json` tabBar.list.text 两处同步。图标零改动；顶部导航保持中文（今日单词/复习巩固/工具/设置）。背景：today/review/tool/setting 四词均在 8000 词表内；用户选复数（英语软件习惯），词表无 tools/settings 屈折变体（词表全为原形）。
- **toast 勾去大色块**：`fb-toast-ico` 从「绿圆底+白勾」整枚 SVG 改为**纯线稿勾**（stroke 2.6 圆头，与 settings 的 `.sheet-check`、topic 易错点 ✓ 同一张图）；深色主题由 `feedback.js` 在 toast 弹出时读 `theme.isDark()` 挂 `fb-dark` 类切亮绿变体——组件 `styleIsolation:'isolated'`，页面根类 `.theme-dark` 穿透不进组件，只能 JS 挂类。
- **朗读行按压统一**：tools 音标例词行 `.ph-ex--press` 与 topic 例句行 `.ex--press` 从「整行变底色」改为**喇叭 scale(.85)+opacity .6**（与今日页 `.ex-speak.speak-hover` 同款）。语义分离：行底色=选中跳转（查单词结果行保留），按压发声=喇叭反馈；播放态卡拉OK 高亮（`.ex--on`）不动。
- 校验：2 个 JS 编译过、verify-structure 全过、换行符未破坏（js/json 保持 CRLF、wxss 纯 LF）。效果图发布于预览链接（tab-en 目录）。

## 2026-10-11 · 目标字母染进单词 + 对错/播放图标全站收口为自绘 SVG（v1.1.70）

> **范围**：`pages/tools/tools.js|wxml|wxss`、`pkg-study/pages/topic/topic.js|wxml|wxss`、`components/feedback/feedback.wxml|wxss`、`pages/settings/settings.wxml|wxss`、`tools/gen-tools-preview.js`，共 10 文件 +229/-67 行。
> **触发**：用户拍板「目标字母渲染进单词里」；并指出在可视化文件里看到「播放图标不一致」「自绘对错图标有两个版本」。

### 一、改动明细

| # | 位置 | 改动 |
|---|---|---|
| ① | 音标例词行 | 目标字母从「单词后的独立蓝色小标签」改为**词内就地染色**：`tools.js` 新增 `hitSegs()` 把 `w` 切成分段（`hit` 缺失/未命中时安全降级为整词一段），4 条开音节（name/time/five/home 的 `a-e`/`i-e`/`o-e`）按字母分别染色；模板 `wx:for` 渲染 `item.seg`。**配色：`--green` + 3rpx `currentColor` 底线**——纯色对比度实测仅约 2:1（29rpx 小字下不可辨，无头浏览器 4 档对比验证），不用 `text-decoration-thickness`（iOS WKWebView 支持不全），`border-bottom` 全兼容。播放中仍整词走卡拉 OK |
| ② | 易错点 ✗/✓ | 字符（U+2717/U+2713）→ **自绘 SVG**（`stroke-width 2.6` 圆头，✗ 12.8 格 / ✓ 14.1 格配平视觉重量），浅深各一对共 4 条 data-URI；对齐改 `.fix__ico` 零宽空格 strut + `.fix__mk` inline-block `vertical-align:middle`（与 `.ex-speak` 同构）。**根因：这两个字符在任何字体下由不同字形族兜底，粗细/大小天然不一致**（用户说的「两个版本」） |
| ③ | toast 勾 | `components/feedback` 的 `✓` 字符 → 整枚 SVG（绿圆 + 白勾一张图，勾形与 ② 同源），尺寸完全由盒子决定，零对齐风险 |
| ④ | 设置页选中勾 | `pages/settings` 弹层的 `✓` 字符 → SVG（与 ② 同源），补 `.theme-dark` 变体 |
| ⑤ | 效果图脚本 | `gen-tools-preview.js`：喇叭/搜索/勾叉全部改从 `app.wxss` 实抽（上一版喇叭用 emoji 🔊 与底栏真 SVG 混用 → 用户看图觉得「播放按钮不一致」；**真机代码本来就是统一的**，喇叭只出自 `.spk-ico` 一个类）。`appIcon()` 三个坑：规则含多条声明（`[^}]*` 放行）、英音蓝同名规则先出现（选择器完全匹配）、注释文本被吃进选择器串（先剥 `/* */`） |

### 二、验证

- `hitSegs` 单测：sit/i、name/a-e、television/si、fish/sh、未命中、空 hit 全部正确；3 个 JS `new Function` 编译通过；`verify-structure.js` 26 项全过；10 个改动文件换行符均为纯 LF 未破坏。
- 效果图 `D:/idea/_reviews/工具页效果图_v1.1.70.html`：渲染层零 emoji/字符图标（残留仅存在于注释与说明文字）。

## 2026-10-11 · 音标例词行改「左列喇叭」+ 播放按钮全站一致性收口（v1.1.69）

> **范围**：`pages/tools/tools.wxml|wxss`、`pkg-study/pages/topic/topic.wxml|wxss`，共 4 文件 +30/-16 行。本地提交，**未推远端、未传体验版**。
> **触发**：用户真机反馈「音标例词行的单词翻译和播放按钮之间有大片空白」+ 提问「各区域播放按钮是否保持一致」。

### 一、全站播放按钮一致性核查（9 处入口）

| 结论 | 明细 |
|---|---|
| ✅ 统一 | 颜色（绿 `#176B5B` / 播放态 `#0E4C41` / 英音蓝）与形状（同一实心喇叭 SVG path）全站一致 |
| ⚠️ 尺寸 4 档 | 30（音标胶囊内）/ 36（例句行）/ 40（语法详情，**唯一无理由例外**）/ 62（复习大词行）。前者和后者是「跟随所在行字号」的合理例外 |
| ⚠️ 对齐机制 4 种 | baseline+strut（今日页/工具页）、absolute 定位（复习随机卡，10-10 定稿）、center（复习磁贴，09-29 定稿）、center（语法详情，**无理由**） |

### 二、改动（2 处）

| 位置 | 根因 / 问题 | 修法 |
|---|---|---|
| 音标例词行（`tools.wxml/.wxss`） | 文字块 `flex:1` 被强行撑满 + 喇叭钉死最右，而例词很短（最长才 `television·si·电视`）→ 中间空白占行宽 **49%~72%** | **方案A（用户从 3 版方案图选定执行）**：喇叭挪到**行首**、独立成 44rpx 定宽列（图标仍 36rpx），文字左对齐、自然宽度——右侧不再有元素把空白"框"出来；三行文字与三枚喇叭各成一条竖线，长短词都不跳版。垂直对齐仍走 `.ex-speak` 零宽空格 strut + `vertical-align:middle`（x-height 锚定铁律不变）；宽屏媒体查询同步补 `.ex-speak--lead` 显式 px |
| 语法详情例句行（`topic.wxml/.wxss`） | 本页私有 `.ex__spk`：40rpx 裸背景块 + `align-items:center`——图标比全站小一号，例句折行时喇叭漂到两行中间 | 删私有规则，换回全站 `.ex-speak`（56×56 热区 + 36rpx 图标 + strut），容器改 `align-items:baseline`，与今日页例句行完全同构；播放态深绿由 wxml 三元挂 `.spk-ico--on`（与今日页同一写法，不再需要本页私有图标规则） |

### 三、刻意不动

- 复习页随机卡/到期卡例句（喇叭 absolute 定位到行右端，为「文本真居中」）——2026-10-10 用户真机定稿；
- 复习页重点词磁贴例句（`align-items:center`，折行时喇叭居中）——09-29 用户定稿；
- 音标胶囊内 30rpx、复习大词行 62rpx——「跟随所在行字号」的合理例外；
- 今日页/工具页查单词的例句行——本就是基准，未动。
- 效果图（改前/改后对照 + 一致性核查表）：`D:/idea/_reviews/音标例词行方案A效果图_v1.1.69.html`（脚本 `tools/gen-preview-1169.js`）、方案比选 `D:/idea/_reviews/音标例词排版方案_1010.html`。

## 2026-10-10 · 复习页交互修复 + 例句中文图标改版（v1.1.63）

> **范围**：`pages/review/review.js|wxml|wxss`、`pages/today/today.wxml`、`app.wxss`。本地提交，**未推远端**。
> **触发**：v1.1.62 上传体验版后用户真机验收 11 条反馈，本批处理其中 4 个功能 bug + 图标观感问题（其余翻译 / 文案 / 计划结构另批处理）。

### 一、复习页 4 个 bug

| # | 现象 | 根因 | 修法 |
|---|---|---|---|
| 1 | 填空卡答对后点「下一题」没反应，1 分钟后才自己出下一题 | `review.wxml` 绑的是 `bindtap="onClozeNext"`，而 `review.js` 里的 handler 叫 `onNextCloze` —— **v1.1.52 起就写反了**，点击落到不存在的 handler 静默失效；用户看到的「等一分钟」其实是 `again` 的 10 分钟学习步到期后自动换题 | wxml 绑定改回 `onNextCloze` |
| 2 | 到期卡「一般」按钮边框色与其余三档不同 | v1.1.52 把 `.grade-btn--good{background:var(--soft2);border-color:var(--cur-line)}` 混进了四档按钮规则，四档里只有它被额外上了底色／边框 | 删除该条规则，四档恢复统一 |
| 3 | 随机抽查卡／到期卡的英文例句与中文译文没对齐（中文看着靠右） | 两行原本都 `justify-content:center`；英文行含喇叭 + 眼睛图标 → 文本视觉中心偏左，中文行是纯文本整行居中 → 中文显得靠右 | 卡片内改左对齐成组：`.random-card .random-zh-ex{justify-content:flex-start}` + `.random-card .ex-cn{text-align:left;padding-left:0}` |
| 4 | 重点词磁贴只有美音一种音标 | 收藏快照（`store.toggleStar`）只存 `{w,m,p,e,ai,ts}`，**无 uk**（英音音标 v1.1.51 才加入，晚于快照结构）；渲染时只反查补了 `ipa`/`cn` | `review.js` 新增 `ukOf()` 反查（与 `ipaOf`/`cnOf` 同构）+ `onShow` 补全条件加 `v.uk` |

### 二、例句中文「眼睛」图标：去按压态 + 图形改版

- **去按压态**：眼睛本身是两态图标（闭／睁），已足够表达状态，`hover-class="speak-hover"` 的缩放变暗反而干扰 → **4 处**（`today.wxml` ×1、`review.wxml` ×3）改 `hover-class="none"`；热区与对齐机制不动。
- **图形改版（用户拍板「方案 A」）**：原闭眼图标只有**一条**下弧线 + 3 根睫毛，观感像「笑纹」不像眼睛。新版 = **反向上／下弧构成闭合眼眶**：
  - 上眼线 `∩` 形：`M2 12C4 12 6 6 12 6C18 6 20 12 22 12`
  - 下眼线 `∪` 形：`M2 12C4 12 6 18 12 18C18 18 20 12 22 12`
  - 两弧在 `(2,12)` / `(22,12)` 处收拢闭合（端点切线水平、圆润），睫毛仍从下眼线向外伸（`M12 18.4v3.2` + 左右斜向各一）
  - **开度取 12**（与睁开态轮廓同高 6~18）→ 闭 ↔ 睁切换时眼睛主体位置完全不跳动，只是瞳孔消失、弧度反向
  - 落地 = `app.wxss` 的 `.eye-ico` 一行 + `tools/darkicons.js` 重生成深色变体（auto 块 18 个，数量不变）；睁开态 `.eye-ico--on` 不动
  - 效果图留档：`tools/eye-icon-20261010.html`
- **中途踩坑（记录以免重蹈）**：改版第一版把上弧做成了下弧的**同向平移副本**（两条都朝下弯），用户指正「上眼线也朝下弯、方向与下眼线一致肯定不对」→ 已作废。**「眼眶」= 上下弧反向、两端收拢。**

### 三、刻意不动

- 搜索页不放眼睛（v1.1.53 起既定例外）。
- 睁开态图标、热区 56rpx、x-height 对齐机制（禁 `display:flex`）均不变。

## 2026-10-09 · L3 第三轮：去考试色彩「宽口径收口」（v1.1.62）

> **范围**：`miniprogram/utils/data-p1..p6.js`（周计划 / 日计划文案）+ `miniprogram/utils/words.js`（8000 条例句 / 释义）。**无代码改动**。本地提交，**未推远端**。
> **触发**：上传体验版前用户问「改干净了吗」→ 复核发现前两轮报的「零残留」都是**窄口径**结论。

### 一、前两轮漏在哪（口径教训）
- 第 1 轮（`3cd28a7`）只替换**中文术语表**（雅思/考试/模考/考前/真题/冲刺/考官/Section/Part，754 字符串）。
- 第 2 轮（`06d9040`）扩到 band 分数、英文题型标签、雅思题型名、考试流程的**中文**表述。
- **两轮共同漏掉两类**：① **英文科目模块名**（`Listening / Reading / Writing / Speaking` 作为科目出现，如 `9:00 - 9:40 Listening + transfer`）；② **英文应试流程话术**（`Arrive 60 minutes before the written test`、`ID card + confirmation letter`、`Water bottle without label`、`full test`、`exam day`、`Record your score in your error log.`）。
- 第 2 轮我还**自己制造**了残留：`rewrite_content.js` 的 `TASK_MAP = {1:'图表作文', 2:'议论文'}` 把「要删的词」当成了替换结果，`patch_p15/p6` 的新文案也手写「图表作文」。`Task 1` 被替换后接在「图表动词」前 → 产生 **4 处病句**（`图表作文图表动词（上升）`、`图表作文图表文+…`）。
- **口径定论（写死）**：说「零残留」必须先声明**词表口径**；检测表必须同时覆盖**中文与英文**，并区分「科目模块名」与「普通英语词」。

### 二、处理（宽口径，5 批）
| 批 | 工具 | 内容 |
|---|---|---|
| 1 | `fix_l3_residual.js --map=_fix_l3.json` | 47 组整串精确替换 + 4 条全局规则（`图表作文图表文`→图表描述 / `图表作文图表`→图表 / `图表作文`→图表描述 / `议论文`→观点短文）；修 4 处病句；雅思作文题干（`Some people think… To what extent do you agree?`）改述为**话题式**（「话题『金钱与幸福』——先亮立场再展开」）；英文 `ex` 数组的科目表与应试话术重写 |
| 2 | `--map=_fix_l3b.json` | 收尾零头：`Water bottle without label`、物品清单「水（无标签）」→「水」 |
| 3 | `--map=_fix_l3c.json` | **书面表达四题型模块**（p5[3] + p6[1]）：删 `To what extent do you agree?` / `Discuss both views` / `What are the causes and solutions?` 等 Task 2 题干公式，改成描述性说法（观点类＝就一个观点表态 / 双边讨论类＝两方都要讲、最后你站谁 / 原因对策类＝只写原因+解决）；`报告类题型`→`原因对策类` |
| 4 | `--map=_fix_l3d.json` | 写作语境里的「对话对象」错配（`考官`→`对话对象` 的连带残留）→ 改「读者 / 让人」 |
| 5 | `fix_words_exam.js` | 词库 **25 条 App 自撰应试句**（`Estimate your band score.` / `Simulate real exam conditions.` / `Finalize your exam-day checklist.` / `Revise the five score-boosting patterns.` / `Confirm your test date and venue.` / `Know the exam-day procedure by heart.` …）＋ 顺带修数据脏点：`band` 的 band-score 语境、`authentic` 释义「真实的；**真题的**」→「真正的；正宗的」、`estimate` 译文「估算你的**乐队**得分」 |

### 三、刻意保留（判定为普通英语 / 中性练习约束）
- **普通英语词**：`The test was hard, so I failed.`、`I wish the exam were easier.`、`If only the test were next month!`、`worth reading`、`I remembered to bring my ID card.`；词库中 `exam` / `pass` / `fail` / `examination` / `cram school` / `stool examination` 等词，释义与例句**本就必须**是考试语境。
- **学术写作词**：`Thesis:`、`Overview paragraph`、`Verdict:`、`outweigh`（议题词汇）。
- **词根例词**：`predict · prediction · verdict · jurisdiction`。
- **中性约束**：「限时」「250 词」「各科时间红线」「答对 / 打分」（自测用语）。

### 四、核验
- `verify_l3_final.js` **四项全过**：① 往返逐字节一致（6 文件）② 结构 周 13 / 日 65 ③ 考试色彩**零命中**（检测表本轮已扩到中英 80+ 词）④ 格式异常 0。
- **偏执扫描**（考 / 分数 / 卷证卡 / 英文考试词 / 英文题型词 / 品牌 / 留痕 七类）→ 仅剩 7 处，逐条确认为合法用法。
- `words.js` 单验：**8000 条 / 字段分布 `8:8000` / CR 11（CRLF 未破坏）/ 强考试词零命中**。
- 体积：`miniprogram` 合计 **1731.8 KB / 2048 KB**（余量 ≈316 KB）；`words.js` 1118.5 KB、`data-p1..p6` 合计 319.8 KB。

### 五、工具（`_ipa_build/`，可复用）
- `_scan_residual.js`（中英双口径残留扫描）、`_scan_paranoid.js`（偏执七类）
- `fix_l3_residual.js`（整串精确替换 + 全局规则 + **往返校验** + 未命中配对告警；`--map=<json>` 换批次）
- `fix_words_exam.js`（**词库字段级修补**：复刻原格式序列化 → 往返校验 → 按词断言旧值 → 改字段；支持改「释义」字段；`--rules=<json>` 换批次）
- 备份：`bak/data-p*.js.bak-residual-*`、`bak/words.js.bak-exam-*`

## 2026-10-09 · L3 第二轮：教学内容去考试色彩「全量泛化」（v1.1.61）

> **范围**：`miniprogram/utils/data-p1..p6.js`（周计划 / 日计划文案）；无代码改动。本地提交，**未推远端**。
> **口径**：用户拍板「彻底去考试色彩（连听说写也改）」+ 追问后追加「全量泛化」。

### 一、先纠正上一轮的口径结论
- 上一轮报的「全库零残留」只在**窄词表**口径下成立（雅思/考试/模考/考前/真题/冲刺/考官/Section/Part）。该口径**确已清零**。
- 换**宽口径**重扫（分数 / 英文题型标签 / 题型名 / 考试流程）后，仍查出 **171 种字符串**带考试色彩 —— 其中约 63 种是上一轮「保留骨架」时有意留下的（我当时只替换了窄词表，把 band 分数与英文标签当成了骨架）。
- 另查出 **5 处是 `patch_*.js` 定点脚本新文本引入的**（失分/提分/得分）：规则层跑在定点脚本**之前**，所以躲过了替换 —— 这是流程顺序问题。

### 二、处理（三层）
| 类别 | 字符串数 | 处理 |
|---|---|---|
| 雅思分数 / 等级（band） | 31 | 「6 分作文 / 7 分分水岭 / 六分=对 27/40 / 满分 / 及格线」→ 去掉分数，改述为「高水平 / 高阶 / 拉开差距」 |
| 英文题型 / 评分标签 | 31 | `Opinion / Discussion / Advantage / Report 题` → 观点类 / 双边讨论类 / 利弊类 / 原因对策类；`PEE` → 「论点-解释-例子」；`thesis` → 立场句；`评分标准` → 标准 |
| 雅思题型名 / 话题卡 | 78 | `T/F/NG` → 正误判断（对 / 错 / 未提及）；`段落信息匹配` → 段落对应；`人名观点匹配` → 人物观点对应；`标题题` → 段落主旨匹配；`地图题` → 方位描述；`表格/摘要填空` → 表格补全 / 摘要补全；`话题卡 / Describe a X` → 话题陈述 / 描述人物·事件·地点·物品；`图表作文` → 图表描述 |
| 考试流程 / 时限 | 39 | `限时 40 分钟一篇 250 词` → 限时写一篇 250 词短文；`交卷前 5 分钟` → 收笔前检查；`誊写` → 抄写；`NO MORE THAN THREE WORDS / ONE WORD ONLY` → 字数上限 / 只写一词；`考场流程（敲门进场·出示证件·候考）` → 开场问候 → 自我介绍 → 问答 → 陈述 → 讨论 → 收尾 |
| 品牌词 | 2 | `Next year I will take the IELTS test.` → `Next year I will travel to Japan.`；`IELTS has four papers.` → `The book has four chapters.` |

**保留**（判定为正常英语 / 学习用语，非考试色彩）：`outweigh`（英文例句与写作议题本身）、`verdict`（`-dict` 词根例词 predict · prediction · verdict · jurisdiction）、`答对`（错词本自测用语）、`打分`（自评分档用语）、`分数比例`（数学分数）。

### 三、落地手法（可复用）
- `_ipa_build/apply_l3_map.js`：**目标串按固定顺序重算**（与导出脚本同一口径）→ 与人工定稿的 `_l3_new.txt` **逐行配对** → 整串精确替换（不碰其他内容）；含「重复目标串即中止」断言。
- `_ipa_build/patch_l3_extra2.js`：宽口径复查后新冒出的软性考试词（送分点 / 送分题 / 评分项 / 评分点 / 印象分 / 大分值户）+ 一段考场流程文案，用**子串替换 + 命中次数断言**收口。
- `_ipa_build/verify_l3_final.js`：终态四项核验 —— ① 往返一致（`header + JSON.stringify(require(f)) + ';\n'` 与原文**逐字节相同**）② 结构（周 13 / 日 65 / 必备字段）③ 考试色彩零命中 ④ 格式异常（空括号 / 双空格 / 中文间空格 / 叠字 / 同源重复）。

### 四、结果
| 项 | 值 |
|---|---|
| 定稿替换 | **193 处字段**（首轮 180 + 收尾 13） |
| 终态核验 | 四项**全部通过**；考试色彩宽口径**零命中**（保留项除外） |
| 结构 | 6 文件均 周 13 / 日 65，字段齐全 |
| 体积 | `data-p1..p6` 合计 ≈ 320 KB，与改前**基本持平**（主包预算无影响） |
| 备份 | `_ipa_build/bak/data-p*.js.bak-generic-20261009081933` / `.bak-extra2-20261009082148` |

> 换行符：6 个文件按仓库约定统一为 **LF**（autocrlf 曾把头两行带成 CRLF，已矫正；blob 一直是 LF，故 diff 干净）。

## 2026-10-09 · 例句中文对照全量上线（腾讯云 TMT 通道，v1.1.60）

> **范围**：数据文件 `miniprogram/utils/words.js`（第 8 字段）；无代码改动。未推远端。
> **触发**：用户提供腾讯云 TMT 密钥，要求一次跑完剩余例句翻译。

### 一、通道选择：百度 → 腾讯云 TMT
- 百度翻译是**标准版**（免费 5 万字符/月），当月额度已耗尽（54003 → 54004），只补到 2689/8000。
- 换 **腾讯云机器翻译 TMT**（TextTranslate，`tmt.tencentcloudapi.com`，`2018-03-21`）：**免费 500 万字符/月**，剩余 5311 条约 19 万字符一次跑完。
- 新脚本 `_ipa_build/translate_cn_tmt.js`：**手写 TC3-HMAC-SHA256 签名**（本机装不了 SDK），密钥走环境变量 `TMT_SECRET_ID` / `TMT_SECRET_KEY`（**不落盘、不进仓库**）。
  - 组批 15 条/请求（`\n` 拼接，≤1500 字符，官方单次 SourceText 上限 2000）→ 返回按行拆分对齐；**行数失配则降级逐条重译**。
  - 并发 3（免费 QPS≈5，留余量）+ 指数退避重试 4 次；限频/内部错误自动重试，鉴权/欠费类错误**立即熔断**。
  - 与百度通道**共用 `cn_map.json`**，可各自续跑、互不覆盖。
- 先做**假 Key 探针**（`_tmt_probe.js`）：报 `AuthFailure.SignatureFailure` ⇒ 签名算法与请求格式正确，只差真 Key。真 Key 实测 `The eagle is the king of the air. → 鹰是空中之王。`

### 二、全量结果
| 项 | 值 |
|---|---|
| 本轮新增 | **5311 条**（去重例句口径 5271 条入 map） |
| 覆盖 | **8000 / 8000（100.0%）** |
| 失败 | **0** |
| 耗时 | **1.9 分钟** |
| 消耗字符 | 193300（免费额度 500 万，用掉 **3.9%**） |
| 质检 `qc_cn.js` | 8000 条，内联标签/原句回声/空白/长度/中文字占比/回声重复 **六项全 0** |

- `inject_cn.js` 注入：**校验通过（8000 条逐条一致）**，新增第 8 字段 5311 条 · 补空位 308 条 · map 有词源里没有 0 条；备份 `_ipa_build/bak/words.js.bak-cn-20261009074805`。
- `words.js` 体积 **941.3 KB → 1118.5 KB（+177.2 KB）**；主包实际字节 **1729 KB / 2048 KB**（余量约 **320 KB**，gzip 后 726 KB）。

### 三、连带影响
- **例句中文对照覆盖率 100%** ⇒ 「眼睛」开关的 `wx:if="{{item.cn}}"` 现在**每行都成立**（此前仅 33.6%），全部词条都可点开中文；复习页「填空」tab 的题库池（已学词 ∩ 有 cn）不再受翻译进度限制。
- 每日 09:30 的 **MyMemory 续跑自动化已无对象**（`translate_cn.js` 检测到「已全部译完」会直接退出，无害），可停用。

### 验收
- `_ipa_build/count_ex.js`：8000 条记录 / 7930 去重例句 / **7997 行带第 8 字段（100%）**。
- `_ipa_build/qc_cn.js`：六类缺陷全 0；译文长度中位 10 字、p95 16 字、最长 29 字。

## 2026-10-09 · 英音慢速音频补齐 + 英音链摘除美音兜底（v1.1.59）

> **范围**：新增云存储 `wuk/` 慢速 8000 条；`miniprogram/utils/speech.js` 改两处。未推远端。
> **触发**：用户「英音链如果兜底是美音那不就没法区分了吗？对于零基础来说肯定要能准确区分，慢速音频也补一下吧。」

### 一、英音链摘除百度兜底（口音正确性）
- 百度 `fanyi.baidu.com/gettts?lan=en` 读的是**美音**。它挂在英音链末档，等于「英音失败 → 悄悄退回美音」，对零基础用户是**错误示范**。
- 改法：`if (accent === 'us') chain.push({ run: cb => tryBaidu(text, cb) });` —— 百度只做**美音**兜底。
- 代价（已知取舍）：英音条目（尤其**例句/语法例句**，无离线音频）有道失败时**不发声**。好过发错口音。
- 失败提示差异化：英音失败 toast 改「英音音源暂不可用」；诊断弹窗首行加「（英音音源暂不可用；未降级为美音，以免口音混淆）」，避免用户以为是自己没点对。

### 二、英音慢速音频（离线）
- 音色同正常速 `en-GB-SoniaNeural`；rate **−33%**（正常速是 −4%，即在正常速基础上再放慢 ~30%，与美音 −30% 口径对齐；实际倍率 ≈0.96×0.70=0.672）。
- 输出 `D:/idea/ielts-audio/dist2uk/w/{分片}/{ai}s.mp3`，与美音 `w/{分片}/{ai}s.mp3` 同构；脚本 `_ipa_build/gen_uk_slow.py`（断点续跑）。**实测 8000/8000 零失败、耗时 36.6 分钟、102 MB**（平均 12.8 KB，正常速 9.4 KB 的 1.36 倍）。
- 上传 `wuk/` 桶 8 片（复用 v1.1.58 的 `tcb storage upload <分片目录> wuk/<分片>` 范式），**零失败**。
  只传慢速：`_ipa_build/prep_uk_slow_upload.js` 先把 `*s.mp3` 挑到 `dist2uk_slow/w/{分片}/`，避免整目录重传那 8000 个正常速文件。
- **核对**：`verify_uk_slow_cloud.js` 慢速差集 = 本地 8000 / 云端 8000 / 缺失 0 / 多余 0；`verify_uk_all_cloud.js` 全量 = 本地 16000 / 云端 16000 / 差集 0。
  抽验 `wuk/1/1788s.mp3`：云函数签发 `status:0 errMsg:ok`（非法路径 `../x.txt` 仍被拦），签名链接 curl **HTTP 200 / 9504 字节 / audio-mpeg**，**md5 与本地一致**。
- 英音合计 **175 MB / 16000 文件**；云存储总占用约 **1024 MB / 2 GB（50%）**。
- `speech.js`：`const slow = state.rate <= SLOW_GATE;` —— 英音不再强制 `false`，慢速时直接取 `wuk/…s.mp3`，`playbackRate=1`（音高不变）。`prefetch` 同步。

### 验收
- `_ipa_build/t_uk_route.js` **17/17**：新增「英音慢速用 wuk s 文件」「英音全链失败时不请求百度」「英音链确实走到最后一档」「美音失败时仍走百度兜底」+ 一条源码级断言（`tryBaidu` 的 push 必须被 `accent === 'us'` 保护，防回归删条件）。
- `_ipa_build/t_accent.js` **8/8**：英音用例的 `baidu` 期望由 `true` 改 `false`；「仅预生成 + 英音单词」由「必须放行在线」改为「离线自足（wuk 已有音频）」——该用例名原为「关键修复」，语义已随 v1.1.59 变更，故重命名并注明「英音例句仍放行在线」这半条见 `t_uk_route.js` 用例 8/9。
- 云函数 `audio-url` 白名单在 v1.1.58 已写成 `wuk\/[0-8]\/\d{4}s?\.mp3`（含 `s?`），**慢速路径无需再改云函数**（已核对）。

### 未做（有意）
- 英音**例句 / 语法例句**仍无离线音频 → 走在线有道 `type=1`。容量账：美音 `s/` 已 567 MB，再做一套英音例句（含慢速）会贴近云存储免费上限，暂不做。

## 2026-10-09 · 英音离线音频（edge-tts）+ 英音朗读路由接线（v1.1.58）

> **范围**：新增云存储桶 `wuk/`（8000 个英音单词音频）；改 `miniprogram/utils/speech.js` 路由。未推远端。

### 背景
用户：「在线 TTS 之前尝试过很多单词都有问题，这个英音还用这个形式是否可行？」→ 拍板 **补英音单词离线音频**。
此前英音**一律走在线有道 `type=1`**（失败再退百度 `lan=en` —— 百度读的是美音，属真缺陷）。

### 音频生成
- 音色 `en-GB-SoniaNeural`（edge-tts，与美音 `en-US-AvaMultilingualNeural` 女声对位），rate −4%。
- 规模 **8000 个单词（仅正常速）**、**75 MB**（本地 `D:/idea/ielts-audio/dist2uk/w/{分片}/`）；耗时 26.7 分钟、**失败 0**。
- 只做正常速的理由（容量账）：云存储免费额度 2 GB，原有 847 MB（42%）；+75 MB ≈ 46%。慢速可由 `playbackRate` 变速替代，不必再占一份。
- 清单 `_ipa_build/uk_words.json`（ai + 单词）、脚本 `_ipa_build/gen_uk.py`（断点续跑：文件 >512 字节则跳过）。

### 上传（复刻当初美音的方式）
`tcb storage upload <分片目录> wuk/<分片> -e <环境ID>` —— **必须分片**（整目录会挂死），8 片 × 约 1000 文件，约 35 秒/片、零失败。
CLI 实际入口 `…/node/workspace/node_modules/@cloudbase/cli/dist/standalone/cli.js`（直接 node 调用可绕开 PATH 问题）；当初的 `_wordbank/upload_shards.sh` 已被清理。

### 代码接线（`utils/speech.js`）
- `relPath/localPath` 增 `accent` 维度：`accent='uk' && kind='w'` → **`wuk/`** 桶；其余沿用 `w/ s/ g/`。
- `tryPregen(kind, ai, accent, cb)`：英音**非单词**条目（例句 / 语法例句）无英音音源 → 直接 false 走在线；英音单词**忽略** `BAD_PREGEN_AI`（英音由 edge-tts 按词文本独立合成，不继承 Azure「ai=15 come」的缺陷）。
- 慢速回退：英音只有正常速文件 → `slow=false`，靠 `playbackRate` 变速。
- 链构造：`accent='uk' && kind='w'` 进预生成档；**「仅预生成」模式下英音的非单词条目仍放行在线**（否则永远无声）。
- `evict()` 本地缓存目录扫描加入 `wuk/`。
- 验收：`_ipa_build/t_uk_route.js`（桩住 wx，13 断言）**13/13 通过**。

### 未做（等拍板）
- 英音链里的**百度兜底**是否移除（`lan=en` 实为美音）。
- 英音**慢速**音频（当前用变速替代）。
- cloud / dark 实例按「功能内核」规则同步本次改动（只同步 `speech.js` 等内核，**外观配色不同步**）。

## 2026-10-09 · 词行版式方案 B + 词区右移（v1.1.57）

> 只改 light；`app.wxss` + `today/review/search` 三处 WXML。效果图 `tools/wordrow-layout-20261009.html`。

- 词行改 **方案 B**：`.word-head` 内「单词 + 词性 + 释义 + 美/英双音标」同一行 `flex-wrap` 流，贴近右边界自动折行（原为 5 行堆叠）。
- 词区整体**右移 16rpx**：`.word-main{padding-left:16rpx}`、`.word-head .word-zh{margin-left:12rpx}`、`.ipa-row{margin-left:8rpx}`；宽屏块 px 化。
- 三页同构（今日词行 / 复习重点词磁贴 / 搜索页）；验收 `_ipa_build/t_wordrow_b.js` **31/31**。

## 2026-10-09 · 绿色喇叭补深色变体（v1.1.56）

- `.theme-dark .spk-ico` / `.spk-ico--on`：`#176B5B→#7CD6B4`、`#0E4C41→#8FE0C0`（原对比度约 2.5:1 不达标）。
- 注意 `darkicons.js` 只处理「规则体仅 background-image 一条声明」的类，故这两条**手写**；且 `background-repeat` 写在 `background-image` 之前，避免被自动生成脚本重复追加。

## 2026-10-09 · 例句喇叭放大 + 眼睛对齐（v1.1.55）

> **范围**：只改 `app.wxss`（5 处规则 + 2 处注释），零 WXML/JS 改动；未推远端。效果图 `tools/exspeak-align-20261009.html`（含三方案实测表与深色模式发现）。

### 用户反馈（原话）
「例句播放按钮没有放大，且眼睛图标和喇叭不在一条水平线上。所有例句播放按钮都应该适当放大一些」

- **错位根因（实测定位）**：`.word-example-row` / `.random-zh-ex` 都是 `align-items:baseline`；`.ex-speak` 是普通块（零宽空格 strut 撑出真实文字基线），而 `.ex-eye` 是 **flex 容器**——flex 容器在该行没有真实基线，浏览器拿它子元素的**底边**当基线 → 眼睛整只被抬离喇叭。无头浏览器实测 Δ（眼中心−喇叭中心）= **−5.00px（10rpx）**。
- **修法 = 让眼睛与喇叭完全同构**（沿用 app.wxss v1.1.20 定下的 x-height 锚定机制，不是调 margin 硬凑）：`.ex-eye` 去 flex、加 `font-size:28rpx;text-align:center` + `::before` strut，`.ex-eye .eye-ico` 改 `inline-block;vertical-align:middle`。修后 **Δ=0.00px**，且长例句折行时图标仍贴第一行（三方案对比中击败了「行改 center」方案——那会长例句时图标悬在两行中间）。
- **喇叭放大**：`.ex-speak .spk-ico` 0.85em(≈23.8rpx) → **36rpx 显式定值**（不再随 em 漂移），比眼睛 34rpx 略大（播放是主行为）。热区维持 56rpx。词级小喇叭（美/英音胶囊内 30rpx）不动。
- **落点 5 处**：今日词行 / 今日例句精读 / 复习随机卡 / 复习到期卡 / 复习重点词磁贴；**搜索页例句喇叭同全局类也被放大**（用户说「所有」，未排除；要排除需拆类）。
- **宽屏（≥700px）同步修**：`.ex-eye` 补 `font-size:14px;text-align:center`（28rpx 在宽屏会被放大 3 倍 → x-height 锚定点漂移），`.ex-speak .spk-ico` 18px。
- **顺带发现（未改，等拍板）**：绿色 `.spk-ico` **没有深色变体**——深色下 #176B5B 压 #162324 对比度约 2.5:1（英音 #7FB3E8、眼睛 #7CD6B4 都有变体，唯独绿喇叭没有；darkicons.js 只给「只含 background-image 一条声明」的类生成变体，`.spk-ico` 规则混了尺寸声明被跳过）。补 2 条 `.theme-dark .spk-ico(--on)` 即可，见效果图第 4 区。

## 2026-10-09 · 闭眼图标改版（斜杠 → 眼皮弧+睫毛）+ 译文清洗（v1.1.54）

> **范围**：只改 light；未推远端。效果图 `tools/eye-icon-v2-20261009.html`（含 4 个位置方案），位置方案待用户拍板。

### 用户反馈（原话）
「闭眼的图标目前是一条斜杠，不应该是这种形式的。应该是两种图标，睁眼就是睁开的，闭眼是有眼皮覆盖了。」

- **闭眼改版**：`.eye-ico` 由「眼睛+斜杠」（斜杠=禁用语义，错）改为「**闭合的上眼皮弧线 + 三根睫毛**」；`.eye-ico--on`（睁眼：瞳孔填实）不变。深色变体由 `tools/darkicons.js` 重新生成（#176B5B → #7CD6B4）。
- **效果图先截图自验过**（无头 Edge 渲染后人工看图），第一版的「备选：上眼皮填实」渲染出来像实心半圆，已改成「眼皮线压下来」的画法。
- **译文清洗**：新增 `_ipa_build/clean_cn.js` —— ①去掉 MyMemory 内联标签（`travel` → `我很喜<gid="1">欢</g>…`）②拆「原句回声+括号译文」（`recently` → `Whathaveyoubeenupto?（…）`）③**只删中文之间的空格**（旧逻辑 `\s+` 全删把英文空格也删了）。历史 cn_map 清洗 2 条后重注入，8000 条逐条校验通过；逻辑已并入 `translate_cn.js`，每日续跑不再产生这两类脏译文。
- 已入库 1169 条译文全量扫描：含标签 1 / 回声 1 / 与原句相同 0 / 可疑幻觉词 0。剩余 1 条真·机器翻译误差（rule of the game → 「游戏的名称」），留 `CN_FIX` 手工修正表，不阻塞。
- **位置方案已拍板（2026-10-09 用户三选均按推荐）**：闭眼 = A 眼皮弧+睫毛；眼睛位置 = **A 现状**（例句行右端喇叭右侧，WXML 不动）；无中文的词**不显示**眼睛（维持 `wx:if="{{item.cn}}"`）。B/C/D 备选记录在 `tools/eye-icon-v2-20261009.html`，不再做。**本节代码即最终形态，可上传体验版。**


## 2026-10-09 · 例句中文「眼睛」开关（v1.1.53）

> **范围**：只改 light；未推远端。已出效果图 `tools/exzh-eye-20261009.html`，等用户确认后再上传体验版。

### 需求与落点（用户原话）
「除搜索页外，其他页面的例句中文翻译改成这样的结构：在例句末尾加一个眼睛图标，睁开＝显示例句中文意思，闭上＝不显示。默认不显示。」

- 落点 **4 处**：今日页词行、复习页随机卡、到期卡、重点词磁贴；**搜索页不动**（用户明确要求）。
- **无处可挂的地方（不是漏做）**：`weeks` / `settings` 页不渲染例句；今日页「例句精读」的 `dayData.g.ex` 只有英文原句、没有中文译文（`data-p1..p6.js` 里只有 `g.exp` 中文讲解）。

### 实现
- `app.wxss`：新增 `.eye-ico`（闭上：轮廓 + 斜杠）/ `.eye-ico--on`（睁开：瞳孔填实）、`.ex-eye`（56rpx 热区，与 `.ex-speak` 同规格）、`.ex-cn`（中文行），含 `min-width:700px` 宽屏覆盖。
- **图标类必须写成「只含 background-image 一条声明」** —— `tools/darkicons.js` 的正则才扫得到并自动生成深色变体（已自动产出 `.theme-dark .eye-ico` / `.eye-ico--on` 两条）。
- **`.ex-eye .eye-ico` 禁用 `background` 简写**（会把上一条规则的 background-image 重置为 none，app.wxss 里 `.ico-inline` 踩过同一个坑），改用 position/size/repeat 长手属性。
- `today.js` / `review.js`：data 加 `zhOpen: {}`（按词记展开态），新增 `onToggleExZh`。**切换用整对象替换**，不用 `setData({'zhOpen.' + w: …})` —— 词条含空格（`get up`）等字符，拼数据路径不可靠；整表只有当天十几~几十个词，开销可忽略。
- `review.js` 新增 `cnOf(w)`：**收藏快照（`store.toggleStar`）只存 `{w,m,p,e,ai,ts}`，没有 cn**，渲染时按词反查补全（与 v1.1.50 给旧快照补 `ipa` 是同一套做法）。
- **眼睛只在有 `cn` 时渲染**（`wx:if="{{item.cn}}"`），不出现「点了没反应」的死按钮；当前 1169/8000 有中文，随每日翻译自动长出，不需要再改代码。
- 眼睛一律 `catchtap`，不冒泡吞掉整行点击（沿用 v1.1.49 铁律：点击归属唯一、只给小组件挂 catchtap）。

### 验证
- `_ipa_build/t_ex_eye.js`：**36/36 通过**（标签配对 today 66/66、review 89/89；渲染点 today×1 / review×3；守卫与「默认全闭」；搜索页隔离断言；深色变体存在；换行符零混用）。
- `node --check`：today.js / review.js 通过。
- 效果图：`tools/exzh-eye-20261009.html`（浅/深 × 闭/睁，含 4× 图标放大、「无中文不出眼睛」对照、覆盖率表）。

## 2026-10-09 · L3 只做单词学习（结构 + 文案 + SRS SM-2 四档 + 填空练习）（v1.1.52）

> **范围**：只改 light；未推远端（等用户真机验收）。内容层（290/390 天的考试色彩文案）按用户定的「分两轮」留待下一轮。

### 定位与信息架构
- 放弃雅思四模块定位 → **只做单词学习**；**语法保留**（用户：「我们有例句」），改称「例句精读」留在今日页。
- tab：`今日 / 词表 / 复习 / 设置`（原「周计划」→「词表」，用户选四 tab 保留设置）。
- tabBar 图标：日历 → **书本**（`i-cal`→`i-book`，4 处 SVG：浅/深 × 常态/选中）。
- `weeks` 页 navTitle → `词表总览`；`data.js#PHASE_NAMES` → `阶段一：入门词 / 阶段二：常用词 / 阶段三：进阶词 / 阶段四：高阶词`（1410/1850/2130/2610 词）。

### 说明字样去雅思化（UI 层全部清完）
准备期卡「还有 N 天开始学单词」+ 提示改「点音标模块听发音」/ 今日页 navTitle `今日计划`→`今日单词` / 打卡 toast「开学后才能打卡」→「开始后才能打卡」/ 语法卡 section `语法 · x`→`例句精读 · x` / 设置页「和好友一起来学雅思」→「和好友一起来背单词」+ 关于正文 / 口音 sheet 与卡片标题统一「默认口音」。

### SRS：固定阶梯 → SM-2 四档
- `ef`(1.3~2.8) / `ivl` / `step` / `reps` / `nextReviewAt`；`level` 保留仅作兼容。
- 忘记 / 困难 / 一般 / 简单 四档；**「忘记」进 10 分钟学习步**，废除「答错立刻重抽」。
- 旧数据（只有 level）惰性迁移；旧布尔调用（true/false）继续可用。
- **`sanitizeReviewStats` 同步扩字段**——否则云同步/备份导入一轮即丢 ef/ivl。
- 新增 `gradePreview()`：只算不写，驱动四档按钮的下次间隔副标题（10 分钟 / 3 天 / 2.4 个月…）。
- 复习页到期卡片：2 按钮 → 4 档按钮布局（`.grade-btn`）。

### 复习新增「填空」tab（中文例句 → 选英文单词）
- 题干＝中文例句整句 + 英文例句（目标词挖空 `____`）+ 四选一英文选项，**不显示释义**。
- 选「英文挖空」而非「中文挖空」：跨语种把词义对齐进中文句子不可靠；英文挖空可正则 + 词形回退（`child`→`children`）。
- `words.js` 第 8 字段 = 中文例句；`data.js` 装配 `cn`；`plan.clozeSentence` / `plan.clozeOptions`（干扰项优先同词性）。
- 中文例句数据：**已生成首批并注入**（见下条）。

### 中文例句数据链路（`_ipa_build/`）
- `translate_cn.js`（MyMemory 免费 API）：按词表顺序推进、增量落 `cn_map.json`、**HTTP 429 或连续 30 条被拒即熔断**（旧版只认 `quotaFinished`，会空转几千次）。
- `cn_to_simp.py`：OpenCC 官方繁简字表（经 jsdelivr 取；本机 PyPI/GitHub 不可达）→ 转简体。首轮命中 3/1169。顺序：短语表 → 单字表，幂等。
- `inject_cn.js`：注入 `words.js` 第 8 字段。**不能用文本替换**——该文件真实换行为 CRLF，而记录/字段分隔是字面两字符 `\n`/`\t`，且含 664 处 `\'`；必须 require 取真实数据 → 改字段 → 重新转义序列化。幂等 + 先写 `words_new.js` 逐条比对通过才 rename + 带时间戳备份。
- **首轮成果：1169/8000（14.6%）已注入**，其中 **1154 词可出题**（`clozeSentence` 挖不空的 15 词自动不进题库）。按词表顺序推进 → 覆盖天然前置：**阶段一：入门词 82.9%（1169/1410）**，阶段二/三/四 0%。
- 配额实测：MyMemory 匿名约 505 句/轮上限；加 `de=<邮箱>` 可再得约 575 句，**当日总量约 1170 句后 HTTP 429**。故 8000 句需约 7 个自然日续跑。备用通道 LibreTranslate 已验证**不可用**（4/6 返回 undefined，"The eagle is the king of the air" → "鹰为空相之相"）。
- **体积预算**：整包 1490.5 KB / 2048 KB（**无分包**），本次 +34.5 KB；若 8000 条全注入外推 +236 KB → 约 1.65 MB，余量降到约 357 KB。

### 验证
- `node --check`：store.js / data.js / today.js / weeks.js / settings.js / review.js / custom-tab-bar 全过。
- `_ipa_build/t_sm2.js`：SM-2 行为 23/23（含旧数据迁移、旧布尔兼容、ef 下限、10 分钟学习步不进到期队列）。
- WXML 结构：today 63/63、weeks 31/31、review 80/80（view/text/block 全配对）；review tab=4、grade-btn=4、无 `data-result` 残留。
- `clozeOptions` 200 次抽样：长度/去重/含正确答案/均来自词池 全过。
- `_ipa_build/t_cloze_data.js`：题库验收 **7/7**（1169 条带 cn、1154 条进题库、挖空必含 `____`、恒 4 选项、必含答案、互不重复、**选项无中文/释义泄漏**、**干扰项同词性 99.2%**）。
- `_ipa_build/inject_cn.js`：注入前后 **8000 条记录逐条比对一致**；字段分布 `5:56 / 6:352 / 7:6423 / 8:1169`（合计 8000）；CRLF 未被破坏（11 CRLF / 0 裸 LF）。
- 词库字段与换行符：全库无混用（store.js/custom-tab-bar/app.json 为 CRLF，其余 LF）。

## 2026-10-09 · 双音标（美音 + 英音）方案 A 落地 —— 音标模块化 + 按口音朗读（v1.1.51）

> **范围**：只改 light；未推远端（等用户真机验收）。用户拍板「先按推荐的方案 A 修改」，本条为实施记录。

### 词行 UI（方案 A：音标模块化）

1. **删除词行左侧的长按整块喇叭**（`.word-speak`），`word-main` 由 510rpx 增至 ≈582rpx；**词性从独立行上移到单词同行**（`word-head` 内 `.word-en` + `.word-pos`）。
2. **新增 `.ipa-row` + `.ipa-mod`**：美音模块（绿系 `--us-bg/--us-line/--us-ink`）与英音模块（蓝系 `--uk-bg/--uk-line/--uk-ink`）各带小喇叭，**点模块 = 按该口音朗读**；浅/深两套 token + 宽屏（≥700px）分支。英音模块 `wx:if="{{item.uk}}"`；无音标的短语仍渲染美音模块（只有喇叭）以保留朗读入口。
3. **三页同步改造**：`today.wxml` / `search.wxml` / `review.wxml`（随机抽查 + 到期复习 + 重点词列表，共 6 个音标模块）；`.ipa-row` 用 `flex-wrap:wrap` 做折行兜底。宽度实测双音标单行容纳率 **99.3%**（立项时估 88.5%，因左侧喇叭腾出 72rpx 而大幅改善），仅 58 词折行。
4. **播放态精细到口音**：页面 data 增 `playingAccent`，由 `speech.onStateChange` 新增的 `payload.accent` 驱动，点亮对应口音的模块；同词同口音再点 = 暂停/续播。
5. 例句喇叭 `.ex-speak` 46→56rpx（与音标模块等高，视觉对齐）。

### 语音链路（按口音朗读）

6. `speech.js`：新增 `state.playingAccent`；`onlineUrl(text, accent)` → 英音用有道 `type=1`、美音 `type=2`；`trySentence/tryWords` 串 accent；`notify` 载荷加 `accent`；`speak(text, opts)` 在 `opts.accent` 存在时也走对象通道（否则口音会丢）。
7. **关键修复**：预生成音频只有美音一套 → 链条改为「`accent==='us'` 且 `engineMode!=='online'` 才进预生成」，而 **`accent==='uk'` 时即便 `engineMode='pregen'` 也放行在线**，否则「仅预生成」的用户点英音模块永远无音源（桩住 wx 的穷举测试 `t_accent.js` 8/8 通过）。
8. 设置页「发音口音」卡改名「**默认口音**」，补说明：影响例句朗读与朗读全部，单词页美/英音标各读各的口音；英音走在线音源、暂无离线音频。

### 数据（`utils/words.js` 第 7 字段 + 归一化流水线）

9. 注入英音音标：8000 行 = 5 字段 60（短语）/ 6 字段 415（仅美音）/ 7 字段 7525（双音标）；**UK 命中 94.1%**（en_UK 源缺 415 个高频词，如 mother/use/job/number/put，App 中只显示美音）。`data.js` 三处装配加 `uk` 字段（`allWords` / `wordsOfStudyDay` / `searchWords`）。
10. **归一化流水线**（`_ipa_build/uk_norm.js` 唯一实现 + `harmonize.js` 重刷）：字符降级 → **重音符左移**（受合法音节首约束，否则 computer 会错成 `kəˈmpjuːtə`）→ **塞擦音先合成单单位**（否则 gently→`dˈʒɛntli`）→ 非重读 ʌ→ə / ɐ→ə → **多主重音降级**（只留最后一个 ˈ，其余转 ˌ，修 association 这类）→ 单音节去重音符。
11. **美音侧顺带修正 82 词**：多音变体时改选「主重音与英音一致 + 与当前值最接近 + 不引入新元音」的一条 → 修掉 `effect/museum/umbrella/emerge/emotion` 等重音错位，也修掉 `center/enter/printer/international/different` 这类误选弱化变体的旧数据；另做多主重音降级 9 词。
12. **质检脚本** `t_uk_data.js`：7 项结构断言全过（无「有 UK 无 US」/ 斜杠成对 / 无非法残留字符 / 均含元音 / 无空白 / 至多一个主重音 / 字段数），18 词抽查 18/18；美英重音位置不一致 **127/5723 = 2.2%**（含约 25 条英美固有差异，两边都对）。残余 ≈2% 暂不逐词人工修，留 `uk_norm.js#UK_FIX` 接口，等真机验收后按用户实际反馈点单点修。

### 已知未做 / 边界

- `cloud/`、`dark/` 尚未同步方案 A（按「只同步功能内核」规则，待真机验收后做）；
- `app.wxss` 中 `.word-speak` / `.word-ipa` 已成 light 死规则，**暂留不删**（避免与 cloud/dark 的同步出现不对称）；
- 词尾次重音 `ˌ`（两侧都有，US 737 / UK 477 条）与词尾 `ə`（`table /ˈteɪbəl/`）是源约定，**非缺陷，未改**。

## 2026-10-09 · 修复搜索页播放闪烁/卡片变色 + 复习页补音标 + come 读音修正 + 双音标排版数据（v1.1.50）

> **范围**：只改 light；未推远端。本版同时为「双音标」立项完成数据侧调研。

### 修复

1. **搜索页播放时单词/例句「先消失再显现」**（用户真机反馈）：`speech.onStateChange` 回调的 kara 守卫只比 `lit`（已亮字符数）——上一次播放结束时 `_lit` 归 0，新播放开始 `lit=0` 与旧值相等 → `karaLit/karaRest` 不更新（残留空串）而 `playingText` 已切换 → 文本渲染成空，等第一个进度回调才显现。守卫键改为「文本 + 已亮字符数」。
2. **点喇叭整个卡片变色**（用户真机反馈）：喇叭是行的子元素，`touchstart` 冒泡激活了行级 `hover-class="search-row--press"`。两个喇叭加 `hover-stop-propagation="{{true}}"`，点喇叭只有按钮态变色。
3. **come 读成 co'me**（用户真机反馈，Day 2）：全量脚本验证 8000 个音频编号**零共用**（排除串号）→ 结论是编号 15 的**源音频内容本身有误**。`speech.js` 新增预生成音频修正表 `BAD_PREGEN_AI`（ai=15），该词跳过预生成直接走在线 TTS（读音正确）；仅单词 kind='w' 生效，例句音频不受影响。已知取舍：engineMode=pregen 用户表内词将无音源。

### 补齐

4. **复习页三处补音标**：随机抽查 / 到期复习卡片词性行前加 `word-ipa`（数据本就来自 `allWords` 带 ipa，仅未展示）；重点词列表（store 快照无 ipa）渲染时按词反查词表补全（`ipaOf` 懒构建 Map）。

### 双音标（英音）立项数据（脚本 `t_uk_width.js`，源 en_UK.txt 经 jsdelivr）

- UK 音标命中率 **94.8%**（7525/7940，en_UK 词典收录 fewer）；
- 宽度极值：最长美音 IPA = nanotechnology **270rpx**，最长英音 IPA = diversification **228rpx**（英音不 r 化更紧凑），最长单词 artificial intelligence **378rpx**，最长词义 twin **624rpx**；word-main 可用宽度 ≈ **454rpx**；
- 单行容纳率：双音标+2 按钮+词性 = **78.7%**；词性上移到单词行后 = **88.5%**；结论：**单行双音标必折**，推荐「音标模块化（美/英各带小喇叭、分色）+ 词性上移 + flex-wrap 自动换行兜底」，备选「美英音标分两行」（100% 不折但每词多一行）。
- 待用户确认排版方案后实施（含 UK 数据归一化流水线，en_UK 重音符贴音节尾需前移）。

## 2026-09-29 · 搜索页「点卡片偶发不跳」定位并修复（v1.1.49）
> **范围**：只改 light 的搜索页 + 今日页定位重试次数；未推远端。

**背景**：真机复测 v1.1.48 —— 输入法问题已解决，但**点搜索结果卡片仍偶发不跳**（用户明确说明：点的不是底部 `Day N` 指引那一行，就是单词卡片本身）。

### 排查

先排数据侧，结论是**数据零缺口**（脚本 `t_jump_all.js` 全量扫）：

- 8000 个词逐个换算所属天：`day` 越界 0、落在周末 0（390 个学习日全部周一~周五）；
- 每个词都确实存在于它所属那天的 `getDay(d).v` 词表里 → 今日页定位锚点不会落空；
- 对 18 组关键词抽 558 条结果，`day/dow/wn` 缺失 0。

所以问题在**交互层**，找到两条：

1. **点击归属有歧义（主因）**：例句文本 `.word-example` 是 `catchtap`（点了朗读例句，与今日页一致），但它 `flex:1` 撑满整行、长句还折两行，**是卡片里面积最大的一块** —— 用户「点卡片」时经常正好落在它上面 → 触发朗读而非跳转，表现即「偶发不跳」（关怀模式下字体更大，命中率更高）；
2. **重入锁可能永久卡死（次因）**：v1.1.48 的 `_jumping` 只在 `fail` 分支释放。安卓上存在 `switchTab`「既不回调 success 也不回调 fail」的形态 → 锁一旦卡住，之后**每次**点击都被 `return` 掉，一直坏到页面重建 —— 这正好解释「偶发、且有时连着几次都不跳」。

### 改动

1. **点击归属收敛为一条规则：图标 = 朗读，其它任何位置 = 跳转**
   - 例句文本去掉 `catchtap`（整卡可跳）；两个喇叭（词 / 例句）保持 `catchtap`，仍是唯一的朗读入口；
   - 行加 `hover-start-time="0"`，按下反馈零延迟；
   - 底部提示改为「点卡片跳到它所在的 Day；点喇叭只朗读，不跳转」。
2. **重入锁改成能自愈**：有效期 1.2s；另加 1.6s 看门狗，超时强制解锁 + toast「跳转超时，请再点一次」；`onUnload` 清看门狗（switchTab 成功会销毁本页，防销毁后 setData）。
3. **`dataset` 缺字段不再静默 return** → toast 提示（静默 = 用户眼里就是「点了没反应」）。
4. **行内加跳转反馈**：该行 `›` 变成「跳转中…」（`jumpingW`），失败/超时自动复原 —— 以后「点到了但没跳」和「没点到」可直接区分。
5. **朗读状态回调加同值守卫**：该回调常只有 1~2 个字段变化，而 `setData` 不做深度 diff、同值也整树重渲染 → 60 行列表在播放时被反复重渲（「播放卡一下」的来源之一），现在无变化不 setData。
6. **今日页 `_scrollToWord` 重试 3 次 → 5 次**（低端机首屏渲染慢于 360ms 时不再丢掉定位）。

### 验证

新增两个脚本（均留档可复跑）：

- `_ipa_build/t_jump_all.js`：数据侧全量自洽性（8000 词 × day 合法性 × 今日页词表包含关系 + 558 条搜索结果的字段完整性）—— 全 0 异常；
- `_ipa_build/t_jump_behavior.js`：**在纯 node 里桩掉 `wx`/`Page`/`getApp` 直接加载 `search.js`**，覆盖 `switchTab` 的四种回调形态（成功 / 两次失败 / 完全不回调 / data 缺字段）与静态点击归属断言 —— **22 项全过**，其中关键项「静默故障后看门狗解锁，★ 再次点击能正常跳转」通过（这正是 v1.1.48 会卡死的场景）；
- `node --check` `search.js`/`today.js` 全过；搜索页结构校验脚本 `check_search.py` 全过。

### 取舍

例句**不再是**「点一下就朗读」的目标（今日页仍是），要听例句请点它右侧的喇叭图标。原因是例句块是卡片里最大的一块、且与「点卡片跳转」相互冲突；真要保留，就得接受「点卡片经常不跳」。

## 2026-09-29 · 搜索页交互收尾：点 × 不闪、跳转更稳（v1.1.48）

> **范围**：只改 light 的搜索页 + 今日页定位函数；未推远端。

**背景**：用户真机复测 v1.1.47（输入法已不再被打断），又报三个细节：①点 × 清空时键盘会「消失一下又弹出来」；②点词条跳转偶发「点了没反应」或「卡顿后才跳」。

### 改动

1. **input 加 `hold-keyboard="{{true}}"`**（基础库 2.8.2+，语义＝「focus 时点击页面不收起键盘」）
   - 从源头掐掉①：点 × 原本会让输入框失焦（键盘开始收起），而 `onClear` 里的 `focus:true` 又把它拉回来 → 就是那「消失一下又弹出来」；
   - 现在点 × / 点词条都不会让输入框失焦，键盘原地保持，光标留在框里；
   - 副作用（可接受/合预期）：**滑动结果列表仍会收起键盘**（官方说明），正好方便看结果。
2. **`onClear` 删掉 `focus:true`** —— 有 hold-keyboard 后已无必要；用户此前已手动收起键盘时也不强行弹起。
3. **`onJump` 三处加固**（治②）：
   - 跳转所需数据改成全部取自 `dataset`（行上新增 `data-day`），**不再回头查 `this.data.list`** —— 列表随时可能被防抖/朗读回调 setData 重写，依赖 list 状态是「点了没反应」的隐患；
   - 加 `_jumping` 重入锁：连点两次不重复发 `switchTab`（并发 switchTab 会静默失败）；
   - `switchTab` 补 `fail` 回调：**200ms 后重试一次**，彻底失败才 toast 提示 —— 原来失败是完全无声的（表现就是「点了没反应」）。
4. **今日页 `_scrollToWord` 不再静默放弃**：原来 `findIndex` 找不到词就直接 `return`（既不定位也无高亮）；现在按未上屏处理，**120ms 后重试，上限 3 次**。

**说明**：②里那种「卡顿后跳转」另有一层是今日页首次渲染新一天的固有开销（整页 setData + 预取 40 条音频 + `pageScrollTo`），属性能表现而非缺陷，本次未动。

### 验证

- `node --check`：`search.js` / `today.js` 全过；
- WXML 属性核对：`hold-keyboard`、`data-day` 已就位；`onJump` 内已无 `this.data.list` 依赖。

## 2026-09-29 · 修复搜索页输入法打一个字就收起（v1.1.47）

> **范围**：只改 light 的搜索页（`pages/search/`）；未推远端。

**现象**（用户真机）：进搜索页自动弹输入法正常，但**按一个字母输入法就缩下去**，一个单词都打不完，键盘反复弹出/消失。

**根因**：初版 `onInput` 里写了 `this.setData({ kw, focus: false })`（本意是"用户已开始输入，撤掉自动聚焦"）。但在微信里 **`setData({ focus:false })` 不是"取消愿望"，而是主动调 blur = 收起键盘**（社区里正是用这一行来手动收键盘的）；再叠加页面重渲染可能把陈旧的 `focus:false` 重新应用一次，就成了反复弹出/消失。

**修法**：`focus` 改为"只做同步、不做控制"。

1. `onInput` **只回写输入内容，绝不碰 `focus`**（`value` 回写同值属无操作，官方示例即此写法，安全）；
2. 新增 `bindfocus` / `bindblur`，只在真实焦点事件里回写，且**只在状态确实不一致时**才 setData（保证 `data.focus` 与输入框真实状态一致，避免重渲染时把陈旧值再应用一次）；
3. `onClear` 里的 `focus:true` 保留——那是**真意图**（点 × 后重新聚焦），此时键盘通常在，等于无变化；
4. 顺带把 `wx.setStorageSync(关键词)` 从「每次按键」挪到防抖后的 `_run()` + `onUnload()`：安卓上同步写存储是阻塞调用，打字时不该每键一次。

**验证**：`node --check` 通过；`focus` 写入点收敛为 `onReady`(true) / `onFocus`(同步) / `onBlur`(同步) / `onClear`(true) 四处，`onInput` 已无 focus 写入。

## 2026-09-29 · 单词搜索（v1.1.46）

> **范围**：只改 light；云/深色/原始三实例未动（按 §同步边界，搜索属功能内核，**待本版真机验收后一并同步**）。

**背景**：09-29 早先问过「是否该加搜索」，当时定为音标之后再做，音标 v1.1.45 收尾，本轮开工。用户拍板两件事：①入口放**今日页顶部左侧**（中间突兀、右侧是胶囊按钮）；②结果行为**两者都给**——结果页内可直接看/听，点词条再跳到它所在的 Day 并定位。

### 改动

1. **新增搜索页 `pages/search/`**（wxml/wxss/js/json，`app.json` 注册为第 5 个页面，非 tab）
   - 顶部 `nav-bar`（带返回键）+ 圆角搜索条；输入即搜（160ms 防抖），点 × 清空；
   - 结果行**与今日页词行同构**（单词 / 音标 24rpx / 词性 / 释义 / 例句 / 喇叭），额外挂一行 `Day N · 第X周 周X ›`；
   - 喇叭与例句用 `catchtap` 拦在本页朗读，整行 `bindtap` 才跳转，两件事不打架；
   - 最多显示 60 条，超出提示「仅显示前 60 个」；空态区分「未输入」与「无结果」两种文案。
2. **`utils/data.js` 新增 `searchWords()` / `dayOfWordIndex()`**
   - 排序：**完全匹配 > 英文前缀 > 英文包含 > 中文释义包含**，各组内保持词表序（= 由易到难 = Day 升序）。完全匹配置顶是必须的：否则搜 good 会被 goods/goodbye 顶到后面，用户以为搜错了；
   - `dayOfWordIndex` 用二分在 `DAY_OFF` 里定位所属学习日，再按「每周 5 个学习日 + 周末 2 天」换算成**日历天**（口径必须与 App 的 Day 一致，即 Day N = 自然日）；
   - 8000 词单次遍历，实测 <5ms，不建索引、不发请求、离线可用。
3. **`components/nav-bar` 扩展**（原裁剪版只有标题，无返回键、无 slot）
   - 新增 `back` 属性（渲染「‹ 返回」+ `triggerEvent('back')`），给非 tab 页用；tab 页不传即零变化；
   - 左区从「纯占位」变为「可选容器」：`box-sizing:border-box` + 内部 `padding-left`，**宽度不变所以标题仍居中**，并在其中放默认 slot 供页面塞内容（今日页的放大镜就走这里）；
   - 返回键用字符 `‹` 而非 SVG：颜色直接继承 `--nav-fg`，深浅主题零成本适配，与今日页「‹ 前一天」同一语言。
4. **今日页接入**
   - 导航栏左插槽放放大镜（`.nav-search`，热区 30px / 图标 22px），点击 `navigateTo` 搜索页；
   - 词行加锚点 `id="w{{index}}"`；
   - `onShow` 消费 `globalData.jumpWord`（与周计划的 `jumpDay` 同一条通路）→ 渲染后 `pageScrollTo` 定位到该行（上限 3 次重试）→ 底色闪一下再淡出（`.word-row--hl`，2s 自动清）。
5. **`app.wxss` 新增 `.ico-search`**（浅色 `#176B5B` / 深色 `#7CD6B4` 两套 data-URI，同一份 path 只换描边色）。

### 关键设计决策

- **关键词只存本地 storage，不进 `store`**：搜索词是纯 UI 现场，`store.set()` 会 `schedulePush()` 触发云同步，把 UI 状态混进要上云的业务数据不划算。
- **从结果跳走会被 `switchTab` 销毁搜索页**（小程序规则：switchTab 关闭所有非 tab 页）→ 回到搜索页时按存下的关键词**自动恢复关键词与结果**，做到「跟没离开一样」；只有无历史关键词时才自动聚焦弹键盘。
- **不碰 deep-link**：跳转是应用内 `switchTab`（等价用户点 tab），不走外部深链，因此与 light 里那个尚未解决的 deep-link 残影问题无关。

### 验证（脚本化，均通过）

- 搜索冒烟：`nano→nanotechnology(Day319 周四)`、`character` 系列 4 条且 character 置顶、`努力` 命中 8 条、空串 0 条；
- **Day 换算锚点核对**：nano→Day 319 周四、characterization→Day 444 周三、information→Day 18、responsibility→Day 72，与既有定位表逐一吻合；
- **跳转链路自洽**：390 个学习日换算出的 Day 全部落在周一~周五（周六日无新词，不会跳空）；随机抽 300 词，`searchWords` 首条 = 该词本身且 `getDay(该 Day).v` 确含此词，**异常 0**；
- 词表 8000 条**无重复词条**，搜索结果无重复行；
- `node --check` 4 个 JS 全过；WXML 标签配对、`app.json`/`search.json` 合法、`id` 无重复。

### 未做 / 待办

- 结果行**不带收藏按钮**（会把行挤窄，刚调好的音标一行排版有再次被压的风险）；收藏仍走今日页词行的星标。
- `cloud/`、`dark/` 按规则应同步本次功能内核，**待 light 真机验收通过后一次性同步**，避免刚改完又变。

## 2026-09-29 · 四实例同步规则入档 + 功能内核输出到 cloud / dark（本实例代码零变更）

**背景**：v1.1.40~45 期间本实例新增音标、复习页例句朗读、音色兜底等能力。用户拍板：这批**功能内核**要补给 `cloud/` 与 `dark/`，但**外观配色不同步**（各实例色系语义不同，照搬会把 cloud 的换肤与 dark 的深色改坏）；`original/` 落后多代且不发布，**不参与同步**。

**本次动作**：

1. **规则入档**：AI-CONTEXT §本实例定位 新增「同步边界」小节——三类清单（功能内核 ✅ 同步 / 外观配色 ❌ 不同步 / 本实例独有机制 ❌ 不反向并入）+ 两条硬规则（`app.wxss` 是混装文件禁止整文件覆盖；纯数据文件覆盖前先证目标实例无独有内容）+ 验收判据。
2. **功能内核已同步进 cloud 与 dark**：音标（`utils/words.js` 全量数据 + `data.js` 第 6 字段 + 今日页 `.word-head/.word-ipa` + `app.wxss` 两条功能规则）、复习页例句朗读与音色兜底（`review.js`/`review.wxml`/`review.wxss`）、收藏补存 `ai`（`store.js`）。
3. **验收**：两实例与本实例的剩余差异只剩外观 / 主题机制 / 版本号（cloud 12 个文件、dark 9 个文件），功能类文件已从差异列表全部消失。
4. 同步脚本 `D:/idea/_ipa_build/sync_core_to_cloud_dark.py` 留档（唯一性断言 + 换行符自适应，可复用）。

**本实例代码零变更**，仅文档与下游实例。

## 2026-09-29 · 音标字号 22rpx → 24rpx（v1.1.45）

> **范围**：只改 light，一处 CSS（含大屏分支对应值）；云/深色/原始三实例未动。

**依据（实测 + 推算）**：

- 全库最宽词头 `characterization /ˌkɛrəktərɪˈzeɪʃən/`（16 字母 + 19 字符音标）在真机（小米 12S Pro）**不折行**，且与右侧收藏键之间**仍有可见间距**，说明宽度余量比保守估算更充足；
- 开发者工具模拟 **iPhone 5（逻辑宽 320px，常规手机最小档）**同样不折行、观感与实机接近。这条比实机更有说服力：若折行与屏幕尺寸相关，最小屏必然最先折；它不折 → 证实**词行尺寸全用 rpx，字号与可用宽度同比缩放，折行点与分辨率无关**；
- 宽度预算：词行可用 510rpx（750 − 卡片 margin 48 − 卡片 padding 56 − word-speak 72 − word-star 64）。上调后按保守系数估算最宽词头占用 90%→93%，仍未越界；
- 大屏分支（`@media (min-width:700px)`）同步由 11px → 12px，与手机端 24rpx 在 375px 基准下等值。大屏分支卡片限宽 640px、词行可用 544px，最宽词头仅占约 42%，无折行可能。

**改动**：`miniprogram/app.wxss` 两处——L113 `.word-ipa` 22rpx→24rpx、L207（大屏分支）11px→12px；注释补记依据。

**结论沉淀**：音标「折行」风险**验清、判为不存在**——最宽词在最小常规手机即不折行，其余手机走同一条等比路径必然一致，iPad/折叠屏/三折叠走大屏分支余量更大。唯一残留变量为 **IPA fallback 字体度量**（不同厂商系统字体宽度不同，需真实设备才能验）。用户长期在**微信关怀模式**下使用，v1.1.44（22rpx）实测不折行、字形正常显示（无豆腐块），故不内嵌 IPA 字体子集；上线后若有真实反馈再议。系统「字体大小」调节未单独测试。

---

## 2026-09-29 · 音标全量注入 + 音标回归纯文本（v1.1.44）

> **范围**：只改 light，只改今日页；云/深色/原始三实例未动。

### ① 数据：47 词样本 → 全量 8000 词

- **注入**：7940 词带音标（99.2%），缺的 60 个全是短语（无音标可标）；`words.js` 628KB → **762KB**，主包约 1.43MB（上限 2MB）。
- **质控修正**（ipa-dict 原始数据的三类问题，全库扫过）：
  - **单音节词去重音符**（1857 词）：数据源给每个词都标重音，词典惯例单音节不标 → `go /ˈgoʊ/` → `/goʊ/`。
  - **r 化元音按重读分家**：数据源 `ɝ` 同时表示重读/非重读（全库 0 个 `ɚ`）→ 重读 `ɜr`、非重读 `ər`（`teacher /ˈtitʃər/`、`learn /lɜrn/`）；顺带合并 `ɝɹ`、`rr` 冗余标注。
  - **数据源错误词 9 个手工修正**：如 `manufacturer` 原为双 `ɝ`，修为 `/ˌmænjəˈfæktʃərər/`。
- 全库异常模式（`ɜrɜr` / `rr` / `ll` / 重音符越界）扫描后**清零**。

### ② UI：音标从「可点胶囊」回归纯文本

- **改动**：`.word-ipa` 去掉底色/描边/内边距/播放反色态，改 `--ink3` 中性色；wxml 去掉音标的点击绑定与 hover 态；小屏媒体查询同步去 padding。只改 3 处。
- **理由（用户判断）**：**点左侧喇叭读的就是这个单词，音标本身不是独立播放入口**——给音标加「可点」视觉暗示属冗余。朗读入口保持唯一且明确（喇叭 / 例句行喇叭），音标只承担「书面读音依据」。
- 保留 `.word-head{flex-wrap:wrap}`：长音标（如 `characterization /ˌkɛrəktɜrɪˈzeɪʃən/`）自动折到下一行，不破版。
- 后续：等 **US/UK 双音标**上线时，音标才重新成为两个独立的点读目标，届时按方案去掉左侧喇叭并补整套英音音频。

---

## 2026-09-29 · 单词音标「试验版」：单音标 pill 可点朗读（v1.1.43）

> **范围**：只改 light，只改今日页，只注入 **47 词样本**——等真机验证 IPA 字形与排版后再谈全量与双音标。

- **数据源**：开源 `ipa-dict`（MIT，同时提供 en_US / en_UK 两套 IPA，共 19 万条）。词库 8000 词**美音命中 99.2%**（7940 词），缺失 60 个**全是短语**（"get up"/"at the moment"/"take care"…），短语不显示音标即可。
- **音标记法归一化（重要，后续全量沿用）**：
  - 字符降级：`ɹ→r`、`ɫ→l`、`ɡ→g`、`ɝ→ɜr`——原数据是学术级严格记法，这 4 个字在低端安卓字体缺字形风险远高于常规 IPA；
  - strut 元音：ipa-dict 的 en_US **全库 0 个 `ʌ`、一律写 `ə`**（如 some 写作 `/ˈsəm/`），与有道/欧路不一致。按「重读/次重读音节的首元音不可能是 schwa」这条语音学规则改回 `ʌ`（some `/ˈsəm/`→`/ˈsʌm/`、mother `/ˈməðɜr/`→`/ˈmʌðɜr/`）。
- **词库结构**：`words.js` 每行增第 6 字段（音标），本次**只注入 47 个样本词**，其余 7953 词不动。选样原则＝词库前 40 词（覆盖今日页真实第一天列表）+ 最长词 + 多音变体词，并保证 15 个特殊 IPA 字符**全覆盖**。
- **数据层**：`data.js` 的 `allWords()` / `wordsOfStudyDay()` 带出 `ipa`（缺失为空串）。
- **UI**：今日页词行改成「单词 → 音标 pill → 词性」，音标 **点击即朗读该词**（复用 `onSpeakWord`，ai 编号走预生成音频）；播放中 pill 反色。
- **单音标阶段保留左侧喇叭**：本轮是验证版，双通道（喇叭 + 音标）都验；等双音标（US/UK）上线、音标本身成为「两个按钮」时，再按方案去掉喇叭。
- **真机待验**：① IPA 字形（重点看 `ə ɜ ʃ ʒ ŋ θ ð ʌ`，低端安卓可能出方框）② 长词折行（`characterization /ˌkɛrəktɜrɪˈzeɪʃən/`）③ 点音标播放的手感与可发现性。
- **本轮未做**：全量 8000 词注入、复习页卡片、英式音标与英音音频（等本步验证通过）。

## 2026-09-29 · 学习提示卡改「线条区分」＋ SPA 思路入档（v1.1.42）

- **学习提示卡（方案B 手法，最小实验）**：`app.wxss` 新增 `.card.tip-box` 规则——1rpx 细描边（新 token `--card-line`，浅 `#DCE7DF`）+ 左侧 8rpx 绿竖条，浅绿底 `--soft` 保留。原理：**区分优先用细线（面积小→自身几乎不闪），底色贴近窗口底色（大面积→必然闪）**；此卡 Δ≈3 本就不闪，加线条只是强化识别。仅作用于「学习提示」卡，页面顶部/周计划的纯提示条不动，其他白卡不动（用户决定：等 SPA 再重做卡片体系）。
- **AI-CONTEXT 更新**：问题边界重写为三段——①deep-link 残影（待解决）②**顶部闪白已解决**（记录 v1.1.40 方案A + v1.1.41 状态栏字色两条独立通道的教训）③冷启动白卡浮现（Δ≈12，已知残留、有意保留）；新增 **「SPA 化思路」** 一节：SPA 可一并消除 ①各页首访首绘帧闪 ②deep-link 残影 ③跨主题首点闪白，边界=小程序冷启动那一帧仍在、改动大风险高；关键推论=**SPA 后窗口底色不再是硬约束 → 卡片配色自由，卡片体系重做留待 SPA**。
- 仅改 light 实例；cloud/dark/original 三实例文档与代码本轮不动。
- 真机验收点：学习提示卡出现细描边 + 左侧绿竖条；冷启动切 tab 仍不闪；状态栏仍清晰。

## 2026-09-29 · 状态栏字色随浅顶修正（v1.1.41）

- **问题（v1.1.40 真机反馈）**：浅顶上线后闪屏确实不明显了，但手机系统状态栏（时间/电量/信号）白字叠在 `#F3F8EF` 浅底上几乎看不见；
- **修复**：四页 json `navigationBarTextStyle` white→black（共 4 处，纯配置）；运行时零 `setNavigationBar*` 调用（v1.1.34 起已退役，已复查仅存注释）；
- 教训记录：绿顶→浅顶时「导航前景」改了（`--nav-fg`）但「状态栏前景」漏改——两者是独立通道（CSS 变量 vs 页面 json）。

## 2026-09-29 · 方案 A 浅灰顶 + 重点词例句播放/音色统一（v1.1.40）

- **方案 A 浅顶（用户拍板）**：`app.wxss` 导航 token 改 `--nav-bg:#F3F8EF / --nav-fg:#24332F`——导航区与窗口底色同色，冷启动首帧与终态零色差，首点 tab「顶部闪 1~2 帧」感知消除（定性依据见 09-27 条目）。品牌绿退守内容区（按钮/tab 选中态不变）；**回退绿顶 = 改回 `--nav-bg:#176B5B; --nav-fg:#FFFFFF` 仅此一处**；
- **重点词例句可播放**：star-tile 例句改为与今日页同款 `word-example-row`（例句可点 + 右侧喇叭，卡拉OK高亮复用），新增 `onSpeakStarredEx`（kind:'s' 命中例句预生成音频）；按钮对齐改 `align-items:center`——折行时水平垂直居中（用户定稿）；
- **音色统一（hello 两种音色根因）**：收藏入库此前丢 `ai` 音频编号（store.js）→ 重点词朗读拿不到编号 → 走在线有道 TTS，与今日页预生成音频音色不同。修复：①`toggleStar` 入库补存 `ai`；②`review.js` 加 `_aiOf` 兜底，旧收藏记录（无 ai）按单词从词库补查——存量重点词无需重新收藏即恢复与今日页同音色；
- 改动 5 文件 +36/-6 行；JS 语法已校验；真机验收点：①冷启动切 4 tab 顶部是否还闪 ②重点词例句点按播放与按钮居中 ③重点词/今日两处 hello 音色是否一致。

## 2026-09-27 · 首点闪白录屏定性（v1.1.39 真机，文档修订）

- 用户 v1.1.39 真机录屏（1000129736.mp4，24fps）逐帧定性「首点 4 个 tab 闪白」：**与色系无关，推翻「系统深色才闪」旧定性**；
- 实锤：手机后台无本小程序（冷启动）后，首次点击今日之外的每个 tab 均有 **1~2 帧（约 40~80ms）容器底色帧**（整屏浅灰、绿导航未绘、隐约新页虚影），随后 1 帧完整渲染；首页不闪（启动页 webview 常驻）；
- 机制定性：tab 页 webview 冷创建首绘帧——窗口底色先上屏、页面背景+自定义导航延后 1~2 帧；感知为「顶部闪」只因顶部大面积绿色与微信容器/手机底色色差大；
- 候选方案已列入 AI-CONTEXT（backgroundColor=导航绿 / initialRenderingCache / Skyline / 设计弱化），**均未实施**，等用户拍板实验顺序；
- 本次仅文档修订，无代码变更。

## 2026-09-27 · 问题边界重新定性（用户拍板）

- 本实例待解决问题收敛为两项：① **deep-link 残影**（过渡帧方案在本实例形态不会产生残影，但因深色形态闪白被整体舍弃，不单独启用）；② **系统深色时首次进入/首点 4 个 tab 闪白**（与 cloud 跨主题翻转闪白同族，机制待录屏定性）——均**待解决**；
- 此前文档「跨主题翻转闪白在本实例结构性不存在」的判断被用户定性推翻，已修正；
- 首个体验版：v1.1.39（`6f268cf`，light 主项首版，内容 = v1.1.38 复习页三修），用户已手动上传；预览验证通过。

## 2026-09-27 · 晋升主项 / 上线版（用户拍板）

- **本实例升为仓库主项与唯一上线形态**：cloud 实例深浅模式下的闪白/残影未根治，不再作为发布形态；功能开发、体验版与正式上线都从本实例出，直到主题闪白问题找到根治方案；
- 开发者工具项目根切换为 `D:\idea\ielts-365\light`；上传体验版流程不变（先 `node tools/stamp-build.js` 再 CLI upload）；
- 云同步多端数据（cloudfunctions 进度同步）与 cloud 实例共用同一环境，本实例功能与其完全一致（仅外观模块差异）；
- 根 README 与 cloud/AI-CONTEXT 已同步此定位变更。

## 2026-09-27 · 派生

- 自 cloud 实例 v1.1.38 派生，主题定死**浅色**；
- 删除色系调整模块：`theme.js` 定死 light、app.json 去 darkmode/themeLocation 改静态浅色、theme.json 删除、app.js 删 onThemeChange、设置页删「外观」卡片与 onAppearance；
- 闪白问题家族（切主题闪旧主题/容器首帧错色/跟随系统翻转闪白）在本实例**结构性不存在**，详见本实例 AI-CONTEXT「问题边界」；
- 后续变更从本节往下追加。

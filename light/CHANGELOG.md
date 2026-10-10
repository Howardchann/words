# CHANGELOG —— light 实例

> 本实例由 cloud 实例 v1.1.38（仓库提交 `dbe76dc` 的 cloud/ 树）派生，**共享全部产品与机制历史**——完整变更史见 `../cloud/CHANGELOG.md`，此处只记录本实例自身的差异与后续变更。

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

# 音频重做队列 · 2026-10-19（v1.1.105，已完成）

> 承接 2026-10-17 的 `AUDIO-REGEN-QUEUE` 待办。本轮已**生成并上传**，状态更新如下。
> 上传后做过「key 存在 + 体积逐字节一致」的资产核验；**未对全部条目做听音核验**（见文末口径）。

## 一、结论速览

| 项 | 数量 |
|---|---:|
| `s/` 例句重做（正常 + 慢速） | 16 条 → **32 个文件** |
| `g/` 课程例句新增（正常 + 慢速） | 3 条 → **6 个文件** |
| `g/` 新「词形规则」专题例句 + 易错点正句 | 14 条 → **28 个文件** |
| **合计** | **66 个文件 / 2.3 MB** |

- 桶容量：`g/` 2768 → **2802** 个；云端总计 51734 → **51768 个 / 1034.1 MB**
- 词卡六维覆盖：**零缺口**（`mk-manifest.js` 复核）
- 缓存版本：`speech.js` **au6 → au7**（同名同路径覆盖，必须换根目录）

## 二、`s/` 例句（16 条，按 ai 路由）

| 词 | ai | 路径 | 新句 |
|---|---:|---|---|
| make | 5 | `s/0/0005.mp3` | I make breakfast for my family every morning. |
| one | 7 | `s/0/0007.mp3` | I would like one, please. |
| think | 10 | `s/0/0010.mp3` | I think about my plans every morning. |
| some | 11 | `s/0/0011.mp3` | Some of my friends live nearby. |
| tear | 1513 | `s/1/1513.mp3` | A tear rolled down her cheek. |
| moderate | 2651 | `s/2/2651.mp3` | We should exercise at a moderate pace. |
| aisle | 3597 | `s/3/3597.mp3` | Please keep the aisle clear. |
| recount | 4333 | `s/4/4333.mp3` | She recounted her journey to her friends. |
| sow | 6924 | `s/6/6924.mp3` | Farmers sow seeds in spring. |
| conservatory | 7821 | `s/7/7821.mp3` | She studies piano at the conservatory. |
| isle | 7825 | `s/7/7825.mp3` | The tiny isle lies off the coast. |
| expedient | 7841 | `s/7/7841.mp3` | A quick fix may be expedient, but it is not always wise. |
| oblong | 7868 | `s/7/7868.mp3` | The table has an oblong shape. |
| reinforced | 7877 | `s/7/7877.mp3` | The bridge was reinforced with steel. |
| bitumen | 7930 | `s/7/7930.mp3` | The road was covered with hot bitumen. |
| close（副义项） | 8207 | `s/8/8207.mp3` | Please close the door quietly. |

> `go`（ai=2）原队列列入保守重做，但逐字比对**文本未变**（仍是 “I have to go to the city.”），故本轮不动。

## 三、`g/` 新增（按文本 djb2 哈希路由）

### 课程例句（「连读与弱读」那天）

| 句子 | key |
|---|---|
| Give me a cup of tea. | `g/6/d75d51e8.mp3` |
| I can do it. | `g/4/c19ce7fe.mp3` |
| Yes, I can. | `g/5/1c129a4b.mp3` |

### 新「词形规则」专题（2 个语法点 × 4 例句 + 6 条易错点正句）

路径由 `hashName(text)` 计算，与 `speech.js` 的 `gRel()` 完全同源；完整清单见生成时任务表
（`_work/regen1019/tasks.json`，已 gitignore）。
要点：易错点只朗读英文前缀（`topic.js` 的 `sayOf()` 口径），如「✅ He is running.（重读闭音节…）」只读 `He is running.`。

## 四、口径与核验

- 音色：`en-US-AvaMultilingualNeural`；正常 `+0%`、慢速 `-32%`；ffmpeg → 44100 Hz / 单声道 / 96 kbps
- 上传：`tcb storage upload <本地分片目录> <云端分片目录>`，逐分片覆盖（覆盖不新增条目，已核 `s/7` 上传前后均为 2000 条）
- 资产核验：66/66 key 存在且**云端 size 与本地逐字节一致**
- 听音核验：抽检 `s/7/7825.mp3` 转写为 “The tiny l lies off the coast.”（即新句；`isle` 与 “I'll” 同音，ASR 误识为 “l”）；其余条目转写服务超时，**未逐条听音**
- 建议真机抽查：`isle` / `aisle` / `close（副卡）` + 「词形规则」两条专题的第一条例句

## 五、后续注意

1. 新增/重做同路径音频，**必须同步升 `utils/speech.js` 的 `CACHE_ROOT`**，否则老设备继续播本地旧缓存。
2. 新增语法点例句后，若要离线可听，需按 `hashName` 补 `g/`；漏补会降级到在线 TTS（音色不同）。
3. `cloud-manifest.json` 已重新生成（2026-10-19，51768 个 / 1034.1 MB）。

## 六、2026-10-19 第二批（v1.1.106 内容补全）

第二轮补内容带出的 **22 个** `g/` 文件，全部为新哈希（新路径），**不覆盖任何既有文件**：

| 来源 | 文本 | 数量 |
|---|---|---:|
| 「副词 -ly 怎么加」例句 | She sings beautifully. / He finished the work quickly. / They live happily together. / Please speak slowly and clearly. | 4 条 × 2 速 |
| 「副词 -ly 怎么加」易错点正句 | He runs quickly. / She smiled happily. | 2 条 × 2 速 |
| 「-ed 与三单 -s 怎么读」例句 | I worked late last night. / We waited for the bus for ten minutes. / She played the piano for an hour. / He watched two movies yesterday. | 4 条 × 2 速 |
| 「比较级与最高级」易错点正句 | more beautiful | 1 条 × 2 速 |
| **合计** | | **11 条 → 22 个文件 / 0.62 MB** |

- 桶容量：`g/` 2802 → **2824**；云端总计 51790 个 / **1034.7 MB**
- 资产核验：22/22 key 存在、云端 size 与本地**逐字节一致**、lastModified 均为 2026-10-19
- **缓存根未动**：新哈希即新路径，老设备不会命中旧缓存，`au7` 保持不变
- 覆盖审计：语法 `g/` 需 700 个 key（350 条可点读文本 × 2 速）→ **零缺口**（口径同 `speech.js` 的 `hashName`/`gRel` 与 `topic.js` 的 `sayOf`）

> ⚠️ 易错点文本 **不要在 ✅ 后面放纯音标**：`sayOf()` 会把它当作要朗读的英文，生成一个读音标的喇叭。本轮「liked /laɪkt/」两条已改写为不含标记的提示句。
## 七、2026-10-19 第三批（v1.1.107 分类分组 + 词形与构词）

第三轮补内容带出的 **24 个** `g/` 文件，全部为新哈希（新路径），**不覆盖任何既有文件**：

| 来源 | 文本 | 数量 |
|---|---|---:|
| 「英美拼写」例句 | The city centre is very busy at weekends. / She organised the whole trip by herself. / You need more practice before the exam. / We travelled around Europe by train. | 4 条 × 2 速 |
| 「前缀和后缀」例句 | Her kindness made everyone feel welcome. / The instructions are completely useless. / He disagreed with the plan at the meeting. / This software is easy to use. | 4 条 × 2 速 |
| 「合成词和词性转换」例句 | I left my toothbrush in the bathroom. / She booked a table for two. / He is a well-known writer in this city. / The breakdown happened on the highway. | 4 条 × 2 速 |
| **合计** | | **12 条 → 24 个文件** |

- 桶容量：`g/` 2824 → **2848**；云端总计 51814 个 / **1035.6 MB**
- 资产核验：24/24 key 存在、云端 size 与本地**逐字节一致**、lastModified 均为 2026-10-19
- 首轮 4 个连接超时（`api.msedgeservices.com`），单独重试后 24/24 成功
- **缓存根未动**：新哈希即新路径，`au7` 保持不变
- 覆盖审计：语法 `g/` 需 724 个 key（362 条可点读文本 × 2 速）→ **零缺口**

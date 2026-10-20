# audio-pipeline —— 词库音频生成管线

> 位置：`light/tools/audio-pipeline/`（只此一份；cloud / dark 不复制）
> 目标：换台电脑 clone 仓库后，音频管线照样跑得起来 —— 不再依赖原开发机的 `D:\idea\_ipa_build`

这条管线产出的是**云端音频桶**（小程序运行时真正读的那批 mp3），不是仓库里的文件。
音频本体约 **1.03 GB**，永远不进 git；进来 git 的只有**脚本 + 输入数据 + 一份云端清单**。

---

## 0. 换机上手三步

```bash
git clone <repo> && cd words/light
node tools/audio-pipeline/selftest.js      # ① 依赖与路径自检（必须全绿）
```

```bash
# ② 装齐外部依赖
#   Node ≥ 18、Python 3、ffmpeg、（英音）pip install edge-tts、（上传）npm i -g @cloudbase/cli
python tools/audio-pipeline/patch-edge-tts-403.py   # edge-tts 装好后必须打这个补丁
```

```bash
# ③ 需要看云端现状时，重新拉一份清单
node tools/audio-pipeline/mk-manifest.js
```

---

## 1. 云端音频桶结构

环境 ID：`cloud1-d2gfv3f254c476e40`

| 桶 | 内容 | 音源 | 路径规则 | 现状（2026-10-19 实测） |
|---|---|---|---|---|
| `w/` | 美音单词（正常 + 慢速） | Cambridge 官方音频（v1.1.102 起）；更早的存量是 Ava TTS | `w/{ai//1000}/{ai:04d}.mp3`，慢速加 `s` | 16322 个 / 249 MB |
| `wuk/` | 英音单词（正常 + 慢速） | edge-tts `en-GB-SoniaNeural` | `wuk/{ai//1000}/{ai:04d}(s).mp3` | 16322 个 / 144.6 MB |
| `s/` | 美音例句（正常 + 慢速） | Azure `en-US-AvaMultilingualNeural` | `s/{ai//1000}/{ai:04d}(s).mp3` | 16322 个 / 540 MB |
| `g/` | 语法例句 + 音标例词（正常 + 慢速） | 同上 Ava | `g/{djb2(text)%10}/{djb2hex}(s).mp3` | 2848 个 / 101.8 MB |

**合计 51814 个 / 1035.6 MB**。词卡覆盖 **8161 个 ai 号 × 6 维度**（美/英 × 正常/慢速 ＋ 例句正常/慢速）—— 2026-10-19 核验 **零缺口**。

> ⚠️ 容量：已占约 **1.03 GB**。新增音频（尤其例句慢速）之前先确认云存储额度，别把桶撑爆。

---

## 2. 两条音源线

### A. 词音频（`w/`）—— Cambridge 官方音频

`cam-fetch.js` 抓音标与音频 URL → `data/cambridge-db.json` 存档 → `cam-pick.js` 逐卡选块 →
`cam-rebuild.js --gen` 下载 + ffmpeg `atempo=0.78` 变速 → 44100 Hz / 单声道 / 96 kbps。

**选块口径**（`cam-pick.js`，改动前先看懂）：

| 判据 | 权重 |
|---|---|
| 词性主键命中（主卡用 overlay 后的 `p1`；复合值 `"n./adj."` 取斜杠前项） | +5 |
| IPA 骨架相等 | +4 |
| 重音位置一致 | +2 |
| 剩余用编辑距离 ×1.5 加权决胜 | — |

⚠️ **禁用字符串直接比对**（旧脚本因截断/错位恒为 0 而退化）。

### B. TTS 音频（`wuk/` `s/` `g/`）

| 桶 | 音色 | 正常速 | 慢速 |
|---|---|---|---|
| `s/` `g/` | `en-US-AvaMultilingualNeural` | +0% | −30% ~ −32% |
| `wuk/` | `en-GB-SoniaNeural` | −4% | −33% |

输出规格统一 44100 Hz / 单声道 / 96 kbps。Ava 能读中文 → 中英混排整句预生成成立。

---

## 3. 脚本清单

| 文件 | 作用 | 用法 |
|---|---|---|
| `_env.js` / `_env.py` | **路径解析唯一出口**（被下面所有脚本引用） | 不需要直接跑 |
| `selftest.js` | 依赖与路径自检 | `node selftest.js` |
| `mk-manifest.js` | 拉云端清单 + 缺口分析 | `node mk-manifest.js [--from-dir=<分片目录>]` |
| `cam-fetch.js` | 抓 Cambridge 音标 + 音频 URL | `node cam-fetch.js` |
| `cam-pick.js` | 为每张卡挑剑桥音频块 | 被 `cam-rebuild.js` 引用 |
| `cam-rebuild.js` | 选块审计 + 下载 + 变速编码 | `node cam-rebuild.js [--gen]`（不带 `--gen` 只审计） |
| `cam-ipa-audit.js` | 卡面音标 vs 剑桥块音标比对 | `node cam-ipa-audit.js` |
| `mk-g-tasks.js` | 生成 `g/` 桶任务清单（djb2 hash） | `node mk-g-tasks.js` |
| `gen-g-audio.py` | 生成 `g/` 桶音频 | `python gen-g-audio.py [--only-slow] [--limit N]` |
| `gen-fw-audio.py` | 功能词 115 词音频（6 文件/词） | `python gen-fw-audio.py` |
| `gen-uk.py` | 英音单词正常速全量 | `python gen-uk.py` |
| `gen-uk-slow.py` | 英音单词慢速全量 | `python gen-uk-slow.py` |
| `regen-us.py` | 单条美音音频重生成（工具） | `python regen-us.py --ai=41 --text="..."` |
| `gen-new-audio.py` | 批量新条目（6 文件/条） | `python gen-new-audio.py` |
| `gen-special-fix.py` | **单点修正脚本模板** —— 示范载语逼音 / WordBoundary 裁词 / MW 官方源 / 零删除 | 照它改词表再跑 |
| `patch-edge-tts-403.py` | edge-tts 403 端点修复补丁 | `python patch-edge-tts-403.py`（venv 重建后重跑） |

---

## 4. 目录约定与可移植性

```
audio-pipeline/
├── _env.js / _env.py     路径解析唯一出口 —— 所有脚本从这里拿 HERE / WORK / MP / FFMPEG
├── data/                 输入数据（入 git）：剑桥存档、英音词表、功能词表、任务源
├── _work/                中间产物 + 本地输出镜像（gitignore，可随时删）
├── cloud-manifest.json   云端 key 全量清单 + 缺口分析（入 git，约 1 MB）
├── selftest.js
└── *.js / *.py           管线脚本
```

**所有脚本零硬编码绝对路径** —— 迁移时已把 `D:/idea/_ipa_build/...`、`D:/idea/words/light/miniprogram/...`
全部换成 `_env` 提供的 `data()` / `work()` / `mp()`。可用环境变量覆盖：

| 变量 | 默认 | 说明 |
|---|---|---|
| `AUDIO_WORK` | `./_work` | 中间产物与输出镜像根目录 |
| `FFMPEG` | 先认本机已知绝对路径，再退回 PATH 里的 `ffmpeg` | ffmpeg 可执行文件 |
| `TCB_ENV` | `cloud1-d2gfv3f254c476e40` | `mk-manifest.js` 用的云环境 |
| `TCB_CLI` | `npx -y @cloudbase/cli` | `mk-manifest.js` 的 CLI 调用前缀 |

---

## 5. 什么不进 git，为什么

| 不进 | 体积 | 原因 |
|---|---|---|
| `*.mp3` 全量 | ≈ 1.03 GB | git 对二进制无增量：音源从 BBC → Cambridge → Merriam-Webster 换一次就存一份全量副本，历史只涨不降；且调试小程序根本不需要音频 |
| `_work/` | 视情况 | 一次性中间产物（下载源、裁词临时文件、输出镜像） |
| 云端桶本体 | ≈ 1.03 GB | 已归属 tcb 对象存储，小程序运行时读的就是它 |

**替代方案**就是 `cloud-manifest.json`：把"云端有什么"落成纯文本随仓库走 —— 能离线对照、能查缺口，体积只有 1 MB。

---

## 6. 已知坑

1. **零删除铁律**：生成脚本里 `os.remove` 每轮超过 50 次会触发本机守卫 → 让每个 worker 反复覆盖同一个固定临时文件，不要批量删。
2. **文件名必须 4 位补零**：`('0000' + ai).slice(-4)`。用 3 位会让 `ai < 1000` 的卡**静默取不到**音频。
3. **覆盖率只认云端 key**：拿本地产出文件名自证会误报（本地镜像常有残留/缺失）。
4. **载语逼音**：TTS 读孤立词会自选高频读音 → 名词用 `a / the / his`、动词用 `to`、形容词用 `he is` 作载体短语，再按 `WordBoundary` 裁出目标词。
5. **edge-tts 新端点必须直连 + 串行**：旧主机 `speech.platform.bing.com` 已全球 403；新端点并发 4 也可能整批超时，且返回音频首尾静音更长（转码时补 `silenceremove`）。
6. **剑桥抓取限流**：并发 ≤ 2、1.5 s 退避；IPA 要绕过内嵌的 `<span class="sp dsp">`，先取 `<span class="ipa[^"]*">([\s\S]*?)</span>/` 再剥内层标签。
7. **美/英音标可能来自不同读音**：两套源各取首读音 → 可能出现 conduct 美 `/ˈkɑndəkt/`（名）· 英 `/kənˈdʌkt/`（动）。这是**取音错误**不是英美差异，判据 = 对齐「释义 + 例句」所在读音。（research 这类英美重音本就不同的词别误判。）
8. **addict 特例**：剑桥只有 noun 块、英音无官方源 → 美音用 Merriam-Webster 官方 mp3，英音用 Sonia 裁词。
9. **必须沙箱外运行**：脚本要联网 + edge-tts 直连，沙箱里必失败。
10. **`g/` 的 hash 不能"优化"**：必须与 `miniprogram/utils/speech.js` 的 `djb2` **逐字节一致**，否则算出来的路径取不到文件。
11. **容量**：已占 ≈ 1.03 GB，新增前先确认额度。

---

## 7. 与小程序端的关系

| 事项 | 位置 |
|---|---|
| 路径规则 / 缓存版本 | `miniprogram/utils/speech.js`（`CACHE_ROOT` 换音源时必须一起升，否则同名文件命中旧缓存） |
| 云端取值 | `cloudfunctions/audio-url`（`PATH_RE` 白名单，新增桶/号码段要同步） |
| 词表 / 卡号 | `miniprogram/utils/words.js`（8115 行，字段序：词/词性/释义/英例/ai/美音/英音/中例） |
| 拆卡释义 | `miniprogram/utils/split-senses.js`（overlay 只覆盖主卡 `m1`/`p1`） |

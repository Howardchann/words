# study-data —— 语法速查 / 音标速查的数据源与生成脚本

> 位置：`light/tools/study-data/`（只此一份；cloud / dark 不拷贝 —— 产物是同一套小程序数据文件）

## 这个目录解决什么问题

小程序里的三个数据文件是**生成产物**，不能手改：

| 产物 | 内容 | 谁在用 |
|---|---|---|
| `miniprogram/pkg-study/data/grammar.js` | 15 分类 / 78 个语法点全文（含课程对应天） | 语法速查页 + 语法点详情页（分包） |
| `miniprogram/utils/study-groups.js` | 分类分组（语法 / 词形与构词） | 工具页分类卡 + 语法速查页（分段渲染） |
| `miniprogram/utils/study-cats.js` | 分类目录（id / 名称 / 简介 / 条数） | 工具页「语法速查」分类卡（主包） |
| `miniprogram/utils/phonetic.js` | 44 个国际音标（要领 / 易混 / 例词） | 工具页音标区（主包） |

以前这套源数据放在仓库外的 `D:\idea\_ipa_build`，换机 clone 后**没法重新生成**。现在源数据与脚本一并入库。

## 目录

```
study-data/
  build-study-data.js     生成脚本（路径全部相对本文件）
  data/grammar.json       语法全量源（15 分类 / 78 点；字段见下）
  data/grammar-map.json   「语法点 → 课程天」映射（按扁平序号）
  data/phonetic.json      44 个音标源
```

## 用法

```bash
cd words/light
node tools/study-data/build-study-data.js
```

输出会直接覆盖上面三个产物文件。跑完建议接着跑 `node tools/verify-structure.js`。

## 字段口径

- `t` 标题 ｜ `plain` 一句人话开场白 ｜ `def` 一句话定义 ｜ `use[]` 用法 ｜
  `note[]` 易错点（`❌ 错句 ✅ 对句（原因）` 格式） ｜ `ex[{en,cn}]` 例句 ｜ `tags[]` 场景标签
- 分类级字段：`id` / `name` / `intro` / `group`（`grammar` = 语法，`wordform` = 词形与构词）。
  分组只用于 UI 分段，不进入 `study-cats.js` / `grammar.js` 的产物契约（保持既有键序逐字节不变）。
- `days[]` **不写在源里**，由 `data/grammar-map.json` + `dayOfCourseIdx()` 计算
- 场景标签取值固定 8 类：日常生活 / 社交闲聊 / 书面表达 / 工作职场 / 学习成长 / 出行游玩 / 购物消费 / 商务沟通

## 🔴 两个硬约束

1. **只能在末尾追加新分类。**
   `grammar-map.json` 的键是「扁平序号」= 该主题之前所有分类的主题数累加 + 本分类内下标。
   在中间插入/删除主题，会让后面**所有**主题的「课程里讲过哪几天」整体错位，而且不会报错。
   确需在中间改动时，必须同步重排 `grammar-map.json` 的键。

2. **换行符按文件固定，不要"自动检测"。**
   `utils/phonetic.js` = CRLF；`utils/study-cats.js`、`pkg-study/data/grammar.js` = LF。
   三个文件的大 JSON 都是整整一行，EOL 对不上就会整行全变、git diff 无法审。

## 新增语法点后要顺带做的事

1. **补 `g/` 音频**：例句和易错点的 ✅ 正句都会按文本哈希去 `g/` 桶取音频，漏补会降级到在线 TTS（音色不同）。
   哈希口径见 `miniprogram/utils/speech.js` 的 `hashName()`；生成脚本在 `tools/audio-pipeline/`。
2. 若新增的是「易错点」，确认句式符合 `topic.js` 的 `parseNotes()` / `sayOf()` 口径
   （`✅` 后面接英文句 + 中文说明时，只朗读英文前缀）。
3. 分类数变化会影响工具页网格：**两段各自独立网格**，某段分类数为奇数时，同段最后一格由 `tools.wxml` 的 `cat-cell--odd` 在末行居中（与其他卡同宽 + 文字箭头靠拢）。

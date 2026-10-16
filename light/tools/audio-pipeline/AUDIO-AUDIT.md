# 音频核验与重生成清单（light）

## 当前状态定义

| 状态 | 含义 | 证据要求 |
|---|---|---|
| \`code-routed\` | 代码已指向预期桶/编号 | \`speech.js\` 路由与 \`ai\` 编号核对 |
| \`asset-generated\` | 目标音频已生成 | 生成日志、时长、采样率、文件大小 |
| \`asset-uploaded\` | 文件已上传到正确云端 key | 上传结果 + 云端清单/对象元数据复核 |
| \`listened-verified\` | 实际音频已听核 | 核对文本、口音、词性读音、截断/杂音；记录核听者与日期 |

**代码存在、manifest 有 key、生成成功和听核正确是四件不同的事，不得互相代替。** 本轮只完成文本/路由审查，不声称音频已听核。

## 本轮待重生成的例句音频

具体任务见 [\`data/pending-sentence-audio.json\`](./data/pending-sentence-audio.json)。每条只需重生成美音例句桶 \`s/{ai//1000}/{ai:04d}.mp3\` 与慢速 \`.../{ai:04d}s.mp3\`；词卡单词读音文件无需因例句改文而重生成。

- 当前 13 条任务：\`code-routed\` 已完成（文本与 \`ai\` 号已记录）；\`asset-generated\` / \`asset-uploaded\` / \`listened-verified\` **待负责音频的 AI 执行**。
- 不要在没有听核的情况下把状态标为 \`listened-verified\`。
- 若后续需补齐单词的英音/美音，另建单词音频任务；不要把例句桶 \`s/\` 当成单词桶 \`w/\` 或 \`wuk/\`。

## 优先抽听的异音多义词

先抽查 \`abuse\`、\`addict\`、\`close\`、\`record\`、\`conduct\`、\`lead\`、\`live\`、\`recount\`、\`read\`、\`refuse\`、\`tear\`、\`wind\`、\`wound\`、\`use\`、\`moderate\`、\`sow\`。重点判断主/副卡的 \`ai\` 是否对应正确词性读音，尤其同拼写异读；再抽听功能词 \`what/where/when/why/which\` 的美音是否与常见 General American \`/w/\` 音标相符。

**这些项目目前只是待核验样本，不表示已发现音频错误或已完成听核。**

## 建议提供给音频 AI 的核验清单字段

\`word_or_sentence\`, \`ai\`, \`kind\` (\`w\`/\`s\`/\`g\`), \`expected_accent\`, \`expected_ipa\`, \`expected_text\`, \`cloud_key\`, \`generated\`, \`uploaded\`, \`listened_verified\`, \`issue\`, \`checked_at\`。

## 人工抽听步骤

1. 先核对编号和 key 是否指向正确词条；再播放正常速和慢速。
2. 单词音频核对词性对应读音（尤其异音多义词）；例句音频核对整句、句尾是否完整。
3. 美音与英音分别核对，允许真实口音差异，但不允许文件串号、读成另一个词性、漏词或截断。
4. 每次替换同名音频后检查 \`utils/speech.js\` 的 \`CACHE_ROOT\` 是否升级，避免设备继续播放旧缓存。

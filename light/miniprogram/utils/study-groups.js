// utils/study-groups.js —— 语法分类的分组（工具页分段 + 语法页分段用）
// ⚠️ 本文件由 light/tools/study-data/build-study-data.js 生成，请勿手改；改内容请改同目录 data/*.json。
// 字段：id 组 id / name 组名 / ids 分类 id（顺序同 grammar.js）/ count 分类数 / points 语法点数
// 分组由 data/grammar.json 每个分类的 group 字段推导：新增分类写对 group 就会自动归组。
module.exports = [{"id":"grammar","name":"语法","ids":["sentence","noun","pron","num","adj","prep","tense","voice","modal","nonfin","clause","special"],"count":12,"points":70},{"id":"wordform","name":"词形与构词","ids":["form","spell","wordbuild"],"count":3,"points":8}];

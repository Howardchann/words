// gen-funcwords-list.js —— 功能词包内容清单（v1.1.73 探讨稿，未写入 words.js）
// 产出：D:/idea/_reviews/funcwords/index.html（发布到手机预览链接）
// 数据本源 = FUNCWORDS 数组（将来 words.js 插入与音频任务都以它为准）
// 已自动剔除词表现有词（all/other/many/more/welcome 等），只列真缺口。
const fs = require('fs');

// [word, pos, cn, enExample, cnExample]
const F = [
  // —— 第 1 步：be 动词（接触英语的第一批词）——
  ['be', 'v.', '是；存在', 'Be happy, be yourself.', '开心点，做你自己。'],
  ['am', 'v.', '是（我）', 'I am a student.', '我是学生。'],
  ['is', 'v.', '是（他她它）', 'This is my book.', '这是我的书。'],
  ['are', 'v.', '是（你们我们他们）', 'You are my best friend.', '你是我最好的朋友。'],
  ['was', 'v.', '是（过去）', 'I was at home last night.', '我昨晚在家。'],
  ['were', 'v.', '是（过去，复数）', 'They were happy together.', '他们曾在一起很开心。'],
  ['been', 'v.', '是（完成时）', 'I have been here for years.', '我在这里好几年了。'],
  ['being', 'v.', '是（进行时）', 'He is being funny again.', '他又在搞笑了。'],
  // —— 第 2 步：人称代词（主格/宾格）——
  ['I', 'pron.', '我', 'I like music.', '我喜欢音乐。'],
  ['you', 'pron.', '你；你们', 'You look great today.', '你今天气色很好。'],
  ['he', 'pron.', '他', 'He is my brother.', '他是我哥哥。'],
  ['she', 'pron.', '她', 'She works in a bank.', '她在银行工作。'],
  ['it', 'pron.', '它', 'It is a nice day.', '今天天气不错。'],
  ['we', 'pron.', '我们', 'We go to school together.', '我们一起上学。'],
  ['they', 'pron.', '他们；她们；它们', 'They live next door.', '他们住在隔壁。'],
  ['me', 'pron.', '我（宾格）', 'Call me tonight.', '今晚打电话给我。'],
  ['him', 'pron.', '他（宾格）', 'Give him the pen.', '把笔给他。'],
  ['us', 'pron.', '我们（宾格）', 'Come with us.', '跟我们一起去吧。'],
  ['them', 'pron.', '他们（宾格）', 'I know them well.', '我跟他们很熟。'],
  // —— 第 3 步：物主代词 ——
  ['my', 'det.', '我的', 'My family is big.', '我家人口很多。'],
  ['your', 'det.', '你的；你们的', 'Your bag is here.', '你的包在这儿。'],
  ['his', 'det.', '他的', 'His car is red.', '他的车是红色的。'],
  ['its', 'det.', '它的', 'The dog eats its food.', '狗在吃它的饭。'],
  ['our', 'det.', '我们的', 'Our team won!', '我们队赢了！'],
  ['their', 'det.', '他们的', 'Their house is near.', '他们的房子很近。'],
  ['mine', 'pron.', '我的（东西）', 'This book is mine.', '这本书是我的。'],
  ['yours', 'pron.', '你的（东西）', 'Is this seat yours?', '这个座位是你的吗？'],
  ['hers', 'pron.', '她的（东西）', 'That key is hers.', '那把钥匙是她的。'],
  ['ours', 'pron.', '我们的（东西）', 'The victory is ours.', '胜利属于我们。'],
  ['theirs', 'pron.', '他们的（东西）', 'Those shoes are theirs.', '那些鞋是他们的。'],
  // —— 第 4 步：助动词（时态的骨架）——
  ['do', 'v.', '做；用于提问和否定', 'Do you like tea?', '你喜欢喝茶吗？'],
  ['does', 'v.', '做（第三人称单数）', 'Does he play football?', '他踢足球吗？'],
  ['did', 'v.', '做（过去）', 'Did you sleep well?', '你睡得好吗？'],
  ['have', 'v.', '有；完成时助动词', 'I have two sisters.', '我有两个姐姐。'],
  ['has', 'v.', '有（第三人称单数）', 'She has a new phone.', '她有一部新手机。'],
  ['had', 'v.', '有（过去/完成）', 'We had a good time.', '我们玩得很开心。'],
  // —— 第 5 步：情态动词（能、会、应该……）——
  ['can', 'v.', '能；会；可以', 'I can swim.', '我会游泳。'],
  ['could', 'v.', '能（过去/委婉）', 'Could you help me?', '你能帮我一下吗？'],
  ['will', 'v.', '将要；愿意', 'I will call you later.', '我晚点打给你。'],
  ['would', 'v.', '会（委婉）；想要', 'I would like some water.', '我想要点水。'],
  ['shall', 'v.', '要不要（提议）', 'Shall we go now?', '我们现在走吗？'],
  ['should', 'v.', '应该', 'You should rest more.', '你该多休息。'],
  ['may', 'v.', '可以；可能', 'May I come in?', '我可以进来吗？'],
  ['might', 'v.', '可能（更不确定）', 'It might rain today.', '今天可能下雨。'],
  ['must', 'v.', '必须；一定', 'You must try this cake.', '你一定要尝尝这个蛋糕。'],
  // —— 第 6 步：冠词 / 限定词 / 指示词 ——
  ['a', 'art.', '一个（辅音开头）', 'I have a dream.', '我有一个梦想。'],
  ['an', 'art.', '一个（元音开头）', 'She is an artist.', '她是一名艺术家。'],
  ['the', 'art.', '这个；那个（特指）', 'The sun is bright.', '太阳很明亮。'],
  ['some', 'det.', '一些', 'I need some help.', '我需要一些帮助。'],
  ['any', 'det.', '任何的（已收录）', '', ''],
  ['no', 'det.', '没有', 'No money, no problem.', '没钱，也没问题。'],
  ['every', 'det.', '每一个', 'Every child likes games.', '每个孩子都喜欢游戏。'],
  ['each', 'det.', '各自；每个', 'Each day is new.', '每一天都是新的。'],
  ['both', 'det.', '两者都', 'Both answers are right.', '两个答案都对。'],
  ['few', 'det.', '很少的', 'Few people know this.', '很少有人知道这个。'],
  ['much', 'det.', '许多（不可数）', 'There is not much time.', '时间不多了。'],
  ['another', 'det.', '另一个', 'Try another way.', '换个方法试试。'],
  ['this', 'det.', '这；这个', 'This is my seat.', '这是我的座位。'],
  ['that', 'det.', '那；那个', 'That sounds good.', '听起来不错。'],
  ['these', 'det.', '这些', 'These apples are sweet.', '这些苹果很甜。'],
  ['those', 'det.', '那些', 'Those stars are bright.', '那些星星很亮。'],
  // —— 第 7 步：疑问词 ——
  ['what', 'pron.', '什么', 'What is your name?', '你叫什么名字？'],
  ['where', 'adv.', '在哪里', 'Where are you from?', '你来自哪里？'],
  ['when', 'adv.', '什么时候', 'When does the bus come?', '公交车什么时候来？'],
  ['why', 'adv.', '为什么', 'Why not try again?', '为什么不试试呢？'],
  ['how', 'adv.', '怎样；多么', 'How are you today?', '你今天好吗？'],
  ['who', 'pron.', '谁', 'Who is that girl?', '那个女孩是谁？'],
  ['whose', 'pron.', '谁的', 'Whose cup is this?', '这是谁的杯子？'],
  ['which', 'pron.', '哪一个', 'Which color do you like?', '你喜欢哪个颜色？'],
  // —— 第 8 步：介词（英语的「胶水」）——
  ['in', 'prep.', '在……里', 'The keys are in the box.', '钥匙在盒子里。'],
  ['on', 'prep.', '在……上', 'The book is on the desk.', '书在桌上。'],
  ['at', 'prep.', '在（某点）', 'Meet me at the gate.', '在大门口见我。'],
  ['to', 'prep.', '到；向', 'Go to the door.', '走到门口去。'],
  ['of', 'prep.', '……的', 'A cup of tea, please.', '请给我一杯茶。'],
  ['for', 'prep.', '为了；给', 'This gift is for you.', '这份礼物是给你的。'],
  ['with', 'prep.', '和……一起；用', 'I walk with my dog.', '我和狗一起散步。'],
  ['by', 'prep.', '通过；被；在旁', 'We went home by bus.', '我们坐公交回家的。'],
  ['from', 'prep.', '从；来自', 'I am from China.', '我来自中国。'],
  ['about', 'prep.', '关于；大约', 'Tell me about it.', '跟我说说这事。'],
  ['into', 'prep.', '进入', 'She walked into the room.', '她走进了房间。'],
  ['over', 'prep.', '在……上方；超过', 'The lamp hangs over the table.', '灯挂在桌子上方。'],
  ['under', 'prep.', '在……下面', 'The cat is under the bed.', '猫在床底下。'],
  ['after', 'prep.', '在……之后', 'Rest after dinner.', '晚饭后休息一下。'],
  ['before', 'prep.', '在……之前', 'Wash hands before meals.', '饭前要洗手。'],
  ['between', 'prep.', '在……之间', 'The bank is between two shops.', '银行在两家店之间。'],
  ['through', 'prep.', '穿过；通过', 'We walked through the park.', '我们穿过公园。'],
  ['near', 'prep.', '在……附近', 'I live near the school.', '我住在学校附近。'],
  // —— 第 9 步：连词 ——
  ['and', 'conj.', '和；并且', 'Bread and milk, please.', '请给我面包和牛奶。'],
  ['but', 'conj.', '但是', 'He is small but strong.', '他个子小但很强壮。'],
  ['or', 'conj.', '或者', 'Tea or coffee?', '喝茶还是咖啡？'],
  ['so', 'conj.', '所以', 'It was late, so I left.', '天晚了，所以我走了。'],
  ['because', 'conj.', '因为', 'I smiled because I was happy.', '我笑了，因为我很开心。'],
  ['if', 'conj.', '如果', 'If it rains, stay home.', '如果下雨就待在家里。'],
  ['while', 'conj.', '当……时候；然而', 'Listen while you walk.', '走路时也可以听。'],
  ['although', 'conj.', '虽然', 'Although it was cold, we went out.', '虽然很冷，我们还是出门了。'],
  ['than', 'conj.', '比', 'Today is hotter than yesterday.', '今天比昨天热。'],
  // —— 第 10 步：高频副词 / 小品词 ——
  ['not', 'adv.', '不；没', 'I am not tired.', '我不累。'],
  ['yes', 'adv.', '是的', 'Yes, that is right.', '对，就是这样。'],
  ['also', 'adv.', '也', 'She also likes tea.', '她也喜欢喝茶。'],
  ['too', 'adv.', '也；太', 'The tea is too hot.', '茶太烫了。'],
  ['very', 'adv.', '很；非常', 'Thank you very much.', '非常感谢你。'],
  ['just', 'adv.', '刚刚；只是', 'I just arrived.', '我刚到。'],
  ['only', 'adv.', '只；仅仅', 'I have only one apple.', '我只有一个苹果。'],
  ['then', 'adv.', '然后；那时', 'First wash, then eat.', '先洗手，然后吃饭。'],
  ['here', 'adv.', '这里', 'Come here, please.', '请过来这边。'],
  ['there', 'adv.', '那里', 'The shop is over there.', '商店在那边。'],
  ['now', 'adv.', '现在', 'It is your turn now.', '现在轮到你了。'],
  ['again', 'adv.', '再；又', 'Say it again, please.', '请再说一遍。'],
  ['still', 'adv.', '仍然；还', 'He is still young.', '他还年轻。'],
  ['always', 'adv.', '总是', 'She always smiles.', '她总是面带微笑。'],
  ['usually', 'adv.', '通常', 'I usually walk to work.', '我通常走路上班。'],
  ['often', 'adv.', '经常', 'We often meet on Sundays.', '我们常在周日见面。'],
  ['sometimes', 'adv.', '有时候', 'Sometimes I read at night.', '我有时晚上看书。'],
  ['never', 'adv.', '从不', 'He never gives up.', '他从不放弃。'],
  ['already', 'adv.', '已经', 'I have already eaten.', '我已经吃过了。'],
  ['yet', 'adv.', '还（没）；已经', 'Dinner is not ready yet.', '晚饭还没好。'],
  // —— 第 11 步：数词 ——
  ['two', 'num.', '二', 'Two coffees, please.', '请来两杯咖啡。'],
  ['three', 'num.', '三', 'We have three cats.', '我们有三只猫。'],
  ['four', 'num.', '四', 'The class starts at four.', '四点开始上课。'],
  ['five', 'num.', '五', 'Give me five minutes.', '给我五分钟。'],
  ['six', 'num.', '六', 'Dinner is at six.', '六点吃晚饭。'],
  ['seven', 'num.', '七', 'Seven days in a week.', '一周有七天。'],
  ['eight', 'num.', '八', 'Eight hours of sleep.', '睡满八小时。'],
  ['nine', 'num.', '九', 'Nine out of ten doctors agree.', '十有九个医生都同意。'],
  ['ten', 'num.', '十', 'Count to ten.', '数到十。'],
  ['eleven', 'num.', '十一', 'The store closes at eleven.', '商店十一点关门。'],
  ['twelve', 'num.', '十二', 'Twelve months in a year.', '一年有十二个月。'],
  ['hundred', 'num.', '百', 'One hundred percent sure.', '百分之百确定。'],
  ['thousand', 'num.', '千', 'A thousand thanks.', '万分感谢。'],
  ['first', 'num.', '第一', 'This is my first visit.', '这是我第一次来。'],
  ['second', 'num.', '第二；秒', 'The second try worked.', '第二次成功了。'],
  ['third', 'num.', '第三', 'She finished third.', '她得了第三名。']
];

// 剔除词表已有的
const W = require('D:/idea/ielts-365/light/miniprogram/utils/words.js');
const words = new Set(W.join('\n').split('\n').map(r => r.split('\t')[0].toLowerCase()));
const list = F.filter(r => !words.has(r[0].toLowerCase()));
const dropped = F.filter(r => words.has(r[0].toLowerCase())).map(r => r[0]);

const stages = [
  ['1', 'be 动词', '零基础第一课：先会说「我是 / 他是 / 我们是」'],
  ['2', '人称代词（主格/宾格）', '我你他她它我们你们他们——英语句子的人口'],
  ['3', '物主代词', '我的你的他的——谁的东西谁认领'],
  ['4', '助动词', 'do/have 两家：提问、否定、完成时全靠它们'],
  ['5', '情态动词', '能、会、应该、必须——开口说话的态度词'],
  ['6', '冠词 / 限定词 / 指示词', 'a/an/the + 这个那个——英语句子的开头位置'],
  ['7', '疑问词', '什么在哪何时为何——会问才会聊'],
  ['8', '介词', 'in/on/at……英语的「胶水」，一天都离不开'],
  ['9', '连词', '并且但是因为如果——把短句连成长话'],
  ['10', '高频副词', '也很只都从不——句子里的调味料'],
  ['11', '数词', '一到十二 + 百千——数得清日子和钱']
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const groups = stages.map(([no, title, sub]) => {
  const items = list.filter(r => r._stage === no);
  return { no, title, sub, items };
});
// 给 F 打阶段标（按区块顺序：每块开头注释里的「第 N 步」）
// 简化：手动分组映射
const stageOf = {};
let cur = '';
F.forEach(r => {
  // 借助注释无法在数组里取，改为在下面重新分区
});
// 直接按索引分区
const bounds = [];
const src = fs.readFileSync(__filename, 'utf8');
// 更稳妥：按每块第一个词定位分区
const stageHeads = {
  'be': '1', 'I': '2', 'my': '3', 'do': '4', 'can': '5', 'a': '6',
  'what': '7', 'in': '8', 'and': '9', 'not': '10', 'two': '11'
};
let stage = '1';
F.forEach(r => {
  const key = r[0];
  if (stageHeads[key] !== undefined) stage = stageHeads[key];
  r._stage = stage;
});
const groups2 = stages.map(([no, title, sub]) => ({ no, title, sub, items: list.filter(r => r._stage === no) }));

const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>功能词包清单 · ${list.length} 词</title>
<style>
  body{margin:0;background:#DDE6E0;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;color:#22322E}
  .wrap{max-width:430px;margin:0 auto;padding:16px 14px 40px}
  h1{font-size:19px;margin:8px 0 4px;color:#0F4A3E}
  .sub{font-size:12.5px;color:#5C6B66;line-height:1.8;margin-bottom:14px}
  .stage{background:#fff;border-radius:14px;padding:12px 14px;margin-bottom:12px;box-shadow:0 1px 4px rgba(15,74,62,.08)}
  .st-h{font-size:15px;font-weight:700;color:#0F4A3E}
  .st-n{font-size:11px;color:#fff;background:#2E8B72;border-radius:8px;padding:2px 8px;margin-right:8px}
  .st-sub{font-size:12px;color:#82908B;margin:4px 0 8px}
  .wrow{padding:9px 2px;border-bottom:1px solid #EEF3F0}
  .wrow:last-child{border-bottom:none}
  .w{font-size:16px;font-weight:700;color:#176B5B}
  .p{font-size:11px;color:#82908B;margin-left:6px}
  .cn{font-size:13px;color:#22322E;margin-top:2px}
  .ex{font-size:12px;color:#5C6B66;margin-top:2px}
  .ex b{color:#176B5B;font-weight:600}
  .cnt{font-size:12px;color:#82908B;margin-left:6px;font-weight:400}
  .dropped{font-size:11.5px;color:#82908B;line-height:1.8;margin-top:10px}
  .foot{font-size:12px;color:#5C6B66;line-height:1.9;background:#E8F2ED;border-radius:12px;padding:12px 14px;margin-top:6px}
</style></head><body><div class="wrap">
<h1>功能词包清单 · ${list.length} 词</h1>
<div class="sub">8000 词表是实词向语料，<b>虚词层（I / is / the / and / in……）整体缺失</b>——零基础用户在学习流里永远遇不到它们。
本清单按<b>初中英语起步路径</b>编排（be → 代词 → 助动 → 情态 → 冠词 → 疑问 → 介词 → 连词 → 副词 → 数词），
确认后将<b>整体插入词表最前</b>（新用户从第 1 天开始按此顺序学）。词表里已有的词已自动剔除（${dropped.length} 个：${dropped.join(' ')}）。</div>
${groups2.map(g => `
<div class="stage">
  <div class="st-h"><span class="st-n">第 ${g.no} 步</span>${g.title}<span class="cnt">${g.items.length} 词</span></div>
  <div class="st-sub">${g.sub}</div>
  ${g.items.map(r => `<div class="wrow"><span class="w">${esc(r[0])}</span><span class="p">${r[1]}</span><div class="cn">${esc(r[2])}</div><div class="ex">${esc(r[3]).replace(new RegExp('\\b(' + esc(r[0]) + ')\\b', 'i'), '<b>$1</b>')}</div></div>`).join('')}
</div>`).join('')}
<div class="foot">
<b>插入后的连带改动（确认后我来做）：</b><br>
① words.js 头部插入 ${list.length} 行（词性/释义/英例/中例/美英音标，音标按既有词的生成规则补齐）<br>
② 音频 ${list.length} × 6 ≈ ${list.length * 6} 个文件（美音正常+慢速 / 例句正常+慢速 / 英音正常+慢速），分批生成上传<br>
③ 关于页「共 8000 词」、工具页记录卡总数 → ${8000 + list.length}<br>
④ 你的进度：已学记录按天存储不受影响，但「第 N 天」的词整体后移约 ${(list.length / 20).toFixed(0)} 天内容（正好你要清空记录重看准备期，无缝）<br>
⑤ 变体归一/标注/搜索/复习/打卡零改动（按 ai 编号）
</div>
</div></body></html>`;

fs.mkdirSync('D:/idea/_reviews/funcwords', { recursive: true });
fs.writeFileSync('D:/idea/_reviews/funcwords/index.html', html);
fs.writeFileSync('D:/idea/_reviews/funcwords/_funcwords_data.json', JSON.stringify(list, null, 1));
console.log('清单词数:', list.length, '| 剔除已有:', dropped.join(' ') || '无');
console.log('分组:', groups2.map(g => g.no + ':' + g.items.length).join(' '));

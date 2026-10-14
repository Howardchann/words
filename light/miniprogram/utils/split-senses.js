// utils/split-senses.js —— 异音多义词拆卡 overlay（v1.1.98）
//
// 背景：同形异音词（object 动词 /əbˈdʒekt/ vs 名词 /ˈɑːbdʒekt/）此前一张卡只配一套
// 音标/音频，另一读音的义项与读音对不上。本表把这些词拆成主/副两张卡：
//   主卡 = 原词条，例句与读音不动；m1/p1 存在时收敛释义与词性，使音标/读音/例句/释义一致。
//   副卡 = sub 里的另一读音义项（释义/词性/双音标/例句/中译/音频编号一整套）。
// 只在今日页渲染层展开（today.js renderDay → expand），主表 words.js、DAY_OFF 索引、
// 云同步快照、WORD_TOTAL 全部零改动。搜索/复习仍以主卡为准。
//
// 副卡音频编号 = 8200~8241 新号段（勿动 8001~8115 的 AI 释义号段）：
//   美音单词 w/8/82xx.mp3（慢速 82xxs.mp3）
//   英音单词 wuk/8/82xx.mp3（慢速 82xxs.mp3）
//   美音例句 s/8/82xx.mp3（慢速 82xxs.mp3）
//
// 字段（与 data.js allWords 的映射名一致）：
//   m1/p1   主卡释义/词性收敛（缺省 = 不动）
//   sub     副卡：p 词性 m 释义 ipa 美音 uk 英音 ai 音频编号 e 英例 cn 中译
module.exports = {

  abuse: {
    p1: 'n.',
    sub: { p: 'v.', m: '滥用；虐待；辱骂', ipa: '/əˈbjuːz/', uk: '/əˈbjuːz/', ai: 8200,
      e: 'You should not abuse your power at work.', cn: '你不应该在工作中滥用职权。' },
  },

  addict: {
    p1: 'n.', m1: '入迷的人',
    sub: { p: 'v.', m: '使沉溺；使上瘾', ipa: '/əˈdɪkt/', uk: '/əˈdɪkt/', ai: 8201,
      e: 'He was addicted to video games as a teenager.', cn: '他十几岁时对电子游戏上瘾了。' },
  },

  advocate: {
    p1: 'n.', m1: '提倡者；拥护者',
    sub: { p: 'v.', m: '主张；提倡', ipa: '/ˈædvəkeɪt/', uk: '/ˈædvəkeɪt/', ai: 8202,
      e: 'Many doctors advocate eating less sugar and more vegetables.', cn: '许多医生主张少吃糖、多吃蔬菜。' },
  },

  aggregate: {
    p1: 'n./adj.', m1: '合计；合计的',
    sub: { p: 'v.', m: '总计；合计', ipa: '/ˈæɡrɪɡeɪt/', uk: '/ˈæɡrɪɡeɪt/', ai: 8203,
      e: 'We aggregate the numbers to find the total.', cn: '我们把这些数字合计起来求出总数。' },
  },

  alternate: {
    p1: 'v.', m1: '交替；轮流',
    sub: { p: 'adj.', m: '交替的；轮流的', ipa: '/ˈɔːltərnət/', uk: '/ˈɔːltənət/', ai: 8204,
      e: 'My sister and I take alternate turns doing the dishes.', cn: '我和妹妹轮流洗碗。' },
  },

  associate: {
    p1: 'v.', m1: '使联合；使联系',
    sub: { p: 'n.', m: '同伴；伙伴', ipa: '/əˈsoʊʃiət/', uk: '/əˈsəʊʃiət/', ai: 8205,
      e: 'She is a business associate of my father.', cn: '她是我父亲的商业伙伴。' },
  },

  buffet: {
    p1: 'n.', m1: '自助餐；小卖部',
    sub: { p: 'v.', m: '连续打；打击', ipa: '/ˈbʌfɪt/', uk: '/ˈbʌfɪt/', ai: 8206,
      e: 'The strong wind buffeted the windows all night long.', cn: '大风整夜猛烈拍打着窗户。' },
  },

  close: {
    p1: 'adj.', m1: '靠近的',
    sub: { p: 'n./v.', m: '结束；完结', ipa: '/kloʊz/', uk: '/kləʊz/', ai: 8207,
      e: 'At the close of the meeting, everyone clapped.', cn: '会议结束时，大家都鼓掌了。' },
  },

  combat: {
    p1: 'n.', m1: '争斗；战斗',
    sub: { p: 'v.', m: '与…战斗；对抗', ipa: '/kəmˈbæt/', uk: '/kəmˈbæt/', ai: 8208,
      e: 'The doctor worked hard to combat the disease.', cn: '医生努力对抗这种疾病。' },
  },

  console: {
    p1: 'v.', m1: '安慰；慰藉',
    sub: { p: 'n.', m: '控制台；操纵台', ipa: '/ˈkɑːnsoʊl/', uk: '/ˈkɒnsəʊl/', ai: 8209,
      e: 'He plays his new game console every night after dinner.', cn: '他每天晚饭后都玩他的新游戏机。' },
  },

  contest: {
    p1: 'v.', m1: '争论；争辩',
    sub: { p: 'n.', m: '竞赛；比赛', ipa: '/ˈkɑːntest/', uk: '/ˈkɒntest/', ai: 8210,
      e: 'She won the singing contest at her school last year.', cn: '她去年在学校唱歌比赛中获胜。' },
  },

  contract: {
    p1: 'n.', m1: '合约；婚约',
    sub: { p: 'v.', m: '收缩；使皱缩', ipa: '/kənˈtrækt/', uk: '/kənˈtrækt/', ai: 8211,
      e: 'The metal contracts when it gets very cold.', cn: '金属在很冷的时候会收缩。' },
  },

  convert: {
    p1: 'v.', m1: '使转变；使改变信仰',
    sub: { p: 'n.', m: '皈依者；改变信仰的人', ipa: '/ˈkɑːnvɜːrt/', uk: '/ˈkɒnvɜːt/', ai: 8212,
      e: 'He became a convert to the new religion.', cn: '他成了这个新宗教的皈依者。' },
  },

  convict: {
    p1: 'v.', m1: '宣告有罪',
    sub: { p: 'n.', m: '囚犯；罪犯', ipa: '/ˈkɑːnvɪkt/', uk: '/ˈkɒnvɪkt/', ai: 8213,
      e: 'The convict escaped from the prison last night.', cn: '那名囚犯昨晚从监狱逃跑了。' },
  },

  degenerate: {
    p1: 'v.', m1: '退化；堕落',
    sub: { p: 'adj.', m: '堕落的；退化的', ipa: '/dɪˈdʒenərət/', uk: '/dɪˈdʒenərət/', ai: 8214,
      e: 'Some people say that kind of movie is degenerate.', cn: '有些人说那种电影很堕落。' },
  },

  delegate: {
    p1: 'n.', m1: '代表',
    sub: { p: 'v.', m: '委派；把…委托给', ipa: '/ˈdelɪɡeɪt/', uk: '/ˈdelɪɡeɪt/', ai: 8215,
      e: 'The manager delegated the job to her assistant.', cn: '经理把这项工作委派给了她的助手。' },
  },

  deliberate: {
    p1: 'adj.', m1: '深思熟虑的；故意的',
    sub: { p: 'v.', m: '仔细考虑；商议', ipa: '/dɪˈlɪbəreɪt/', uk: '/dɪˈlɪbəreɪt/', ai: 8216,
      e: 'The group deliberated for two hours before deciding.', cn: '小组在决定前仔细考虑了两个小时。' },
  },

  desert: {
    p1: 'n./adj.', m1: '沙漠；沙漠的',
    sub: { p: 'v.', m: '抛弃；遗弃', ipa: '/dɪˈzɜːrt/', uk: '/dɪˈzɜːt/', ai: 8217,
      e: 'The soldiers deserted the fort at night.', cn: '士兵们夜里弃守了堡垒。' },
  },

  diffuse: {
    p1: 'v.', m1: '散播；传播',
    sub: { p: 'adj.', m: '散开的；弥漫的', ipa: '/dɪˈfjuːs/', uk: '/dɪˈfjuːs/', ai: 8218,
      e: 'The diffuse light from the lamp filled the room.', cn: '灯发出的散开的光充满了房间。' },
  },

  elaborate: {
    p1: 'v.', m1: '详细地说明',
    sub: { p: 'adj.', m: '精细的；详尽的', ipa: '/ɪˈlæbərət/', uk: '/ɪˈlæbərət/', ai: 8219,
      e: 'She wore an elaborate dress to the party.', cn: '她穿了一条精致的连衣裙去参加聚会。' },
  },

  graduate: {
    p1: 'v.', m1: '毕业',
    sub: { p: 'n.', m: '毕业生', ipa: '/ˈɡrædʒuət/', uk: '/ˈɡrædʒuət/', ai: 8220,
      e: 'She is a college graduate and has a job.', cn: '她是大学毕业生，有一份工作。' },
  },

  intimate: {
    p1: 'adj.', m1: '亲密的；私人的',
    sub: { p: 'v.', m: '暗示', ipa: '/ˈɪntɪmeɪt/', uk: '/ˈɪntɪmeɪt/', ai: 8221,
      e: 'He intimated that he was unhappy with the new plan.', cn: '他暗示自己对这项新计划不满意。' },
  },

  lead: {
    p1: 'v.', m1: '引导；导致',
    sub: { p: 'n.', m: '铅；铅条', ipa: '/led/', uk: '/led/', ai: 8222,
      e: 'The old pipes in this house are made of lead.', cn: '这所房子里的旧管道是铅做的。' },
  },

  live: {
    sub: { p: 'adj.', m: '活的；现场直播的', ipa: '/laɪv/', uk: '/laɪv/', ai: 8223,
      e: 'The match is live on TV now.', cn: '比赛正在电视上现场直播。' },
  },

  misuse: {
    p1: 'n.',
    sub: { p: 'v.', m: '误用；滥用；虐待', ipa: '/ˌmɪsˈjuːz/', uk: '/ˌmɪsˈjuːz/', ai: 8224,
      e: 'Be careful not to misuse the machine.', cn: '小心别把机器用错了。' },
  },

  moderate: {
    p1: 'adj.', m1: '适度的；稳健的',
    sub: { p: 'v.', m: '节制；缓和', ipa: '/ˈmɑːdəreɪt/', uk: '/ˈmɒdəreɪt/', ai: 8225,
      e: 'He tries to moderate how much time he spends online.', cn: '他试着节制自己上网的时间。' },
  },

  object: {
    p1: 'v.', m1: '反对',
    sub: { p: 'n.', m: '物体；目标', ipa: '/ˈɑːbdʒekt/', uk: '/ˈɒbdʒɪkt/', ai: 8226,
      e: 'There is a strange object in the sky.', cn: '天空中有一个奇怪的物体。' },
  },

  produce: {
    p1: 'n.', m1: '生产品；物产',
    sub: { p: 'v.', m: '生产；产生', ipa: '/prəˈduːs/', uk: '/prəˈdjuːs/', ai: 8227,
      e: 'This factory produces many toys for children.', cn: '这家工厂为孩子们生产许多玩具。' },
  },

  project: {
    p1: 'v.', m1: '预计；预测',
    sub: { p: 'n.', m: '项目；工程', ipa: '/ˈprɑːdʒekt/', uk: '/ˈprɒdʒekt/', ai: 8228,
      e: 'Our team is working on a new project this month.', cn: '我们团队这个月在做一个新项目。' },
  },

  protest: {
    p1: 'n.', m1: '抗议',
    sub: { p: 'v.', m: '反对；抗议', ipa: '/prəˈtest/', uk: '/prəˈtest/', ai: 8229,
      e: 'Many students protest against the new school rules.', cn: '许多学生抗议新校规。' },
  },

  read: {
    p1: 'v.', m1: '读；阅读',
    sub: { p: 'adj.', m: '有学问的；博学的', ipa: '/red/', uk: '/red/', ai: 8230,
      e: 'My grandfather is well read and tells great stories.', cn: '我爷爷博览群书，很会讲故事。' },
  },

  rebel: {
    p1: 'n.', m1: '叛徒；反叛者',
    sub: { p: 'v.', m: '造反；反抗', ipa: '/rɪˈbel/', uk: '/rɪˈbel/', ai: 8231,
      e: "Teenagers often rebel against their parents' strict rules.", cn: '青少年常常反抗父母的严格规定。' },
  },

  recount: {
    p1: 'v.', m1: '详述；叙述',
    sub: { p: 'v.', m: '重新计算；重新清点', ipa: '/ˌriːˈkaʊnt/', uk: '/ˌriːˈkaʊnt/', ai: 8232,
      e: 'The election workers had to recount all the votes.', cn: '选举工作人员不得不重新清点所有选票。' },
  },

  refuse: {
    p1: 'v.', m1: '拒绝；谢绝',
    sub: { p: 'n.', m: '废物；垃圾', ipa: '/ˈrefjuːs/', uk: '/ˈrefjuːs/', ai: 8233,
      e: 'Please put the refuse in the bin outside.', cn: '请把垃圾放进外面的垃圾桶里。' },
  },

  reject: {
    p1: 'n.', m1: '被拒之人；被弃之物',
    sub: { p: 'v.', m: '拒绝；不接受', ipa: '/rɪˈdʒekt/', uk: '/rɪˈdʒekt/', ai: 8234,
      e: 'My brother rejected the job because the pay was low.', cn: '我哥哥拒绝了那份工作，因为工资太低。' },
  },

  segment: {
    p1: 'n.', m1: '片段；部分',
    sub: { p: 'v.', m: '分割；划分', ipa: '/seɡˈment/', uk: '/seɡˈment/', ai: 8235,
      e: 'The teacher will segment the class into four small teams.', cn: '老师会把班级分成四个小组。' },
  },

  sow: {
    p1: 'v.', m1: '播种',
    sub: { p: 'n.', m: '母猪', ipa: '/saʊ/', uk: '/saʊ/', ai: 8236,
      e: 'The farmer keeps a big sow and ten little pigs.', cn: '农夫养了一头大母猪和十只小猪。' },
  },

  use: {
    p1: 'n.', m1: '使用；习惯',
    sub: { p: 'v.', m: '利用；使用', ipa: '/juːz/', uk: '/juːz/', ai: 8237,
      e: 'Can I use your phone to call my mom?', cn: '我可以用你的手机给我妈妈打个电话吗？' },
  },

  // ── 以下 5 词：另一读音义项原未收录（v1.1.98 决定补成副卡）──────────────

  extract: {
    sub: { p: 'n.', m: '摘录；选段', ipa: '/ˈekstrækt/', uk: '/ˈekstrækt/', ai: 8238,
      e: 'She read a short extract from her new book.', cn: '她读了她新书里的一小段摘录。' },
  },

  tear: {
    p1: 'n.',
    sub: { p: 'v.', m: '撕裂；撕破', ipa: '/ter/', uk: '/teə/', ai: 8239,
      e: 'Be careful not to tear the paper.', cn: '小心别把纸撕破。' },
  },

  wind: {
    sub: { p: 'v.', m: '缠绕；蜿蜒', ipa: '/waɪnd/', uk: '/waɪnd/', ai: 8240,
      e: 'The path winds along the river.', cn: '这条小路沿河蜿蜒前进。' },
  },

  wound: {
    sub: { p: 'v.', m: '缠绕（wind 的过去式）', ipa: '/waʊnd/', uk: '/waʊnd/', ai: 8241,
      e: 'She wound the scarf around her neck.', cn: '她把围巾绕在脖子上。' },
  },

  // ── v1.1.99 补录（用户真机验收反馈）──────────────────────────────
  // record：释义/音标都是名词读音，动词读音义项未收录 → 补成副卡
  record: {
    p1: 'n.', m1: '记录；履历；记载',
    sub: { p: 'v.', m: '记录；录制', ipa: '/rɪˈkɔːrd/', uk: '/rɪˈkɔːd/', ai: 8242,
      e: 'She likes to record her own songs.', cn: '她喜欢录下自己唱的歌。' },
  },
};

// ── 展开逻辑（今日页渲染层调用；输入 must 为浅拷贝数组，本函数会原地改写副本）──
// 返回 { list, extraIdx }：list = 展开后的卡片数组（主卡在前、副卡紧跟）；
// extraIdx = 第一个非核心词在展开后数组中的下标（无扩展词为 -1），供分组标签定位。
// 每张卡补唯一键 k：主卡 = 单词本身，副卡 = 单词 + '~2'（wx:key 不允许重复）。
// ⚠️ 查表必须用 MAP 而非 module.exports：词表里有单词「expand」，会撞上导出的函数名。
const MAP = module.exports;
function expand(list) {
  const out = [];
  let extraIdx = -1;
  for (let i = 0; i < list.length; i++) {
    const v = list[i];
    if (extraIdx < 0 && !v.core) extraIdx = out.length;
    v.k = v.w;
    const sp = MAP[v.w];
    if (typeof sp !== 'object' || !sp || !sp.sub) { out.push(v); continue; }
    if (sp.m1) v.m = sp.m1;
    if (sp.p1) v.p = sp.p1;
    out.push(v);
    const s = sp.sub;
    out.push(Object.assign({}, v, {
      k: v.w + '~2', p: s.p, m: s.m, ipa: s.ipa, uk: s.uk, ai: s.ai, e: s.e, cn: s.cn,
    }));
  }
  return { list: out, extraIdx: extraIdx };
}

module.exports.expand = expand;

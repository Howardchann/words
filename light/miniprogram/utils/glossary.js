// utils/glossary.js —— 术语小词典（v1.1.94；v1.1.97 定名，原名「语法术语速查」）
//
// 为什么单独做一页「行话词典」：
// 零基础用户会在两个地方撞见看不懂的术语，但语法速查是按天编排的，当下根本找不到对应讲解——
//   ① 词卡释义里的括弧注记：me（宾格）、a（元音开头用 an）…
//   ② 词性标签：n. / v. / adj. …
// 这里给一份静态清单，两条分类（词性缩写 / 语法术语），每条一两句人话 + 一个例子。
// 数据只读、无音频、无交互副作用；界面沿用音标卡那套「分类段控 → 胶囊网格 → 常驻面板」。

var GROUPS = [
  {
    id: 'pos',
    name: '词性缩写',
    hint: '单词卡上单词后面的小标签（n. / v. / adj. …），说明这个词属于哪一类词。',
    items: [
      { k: 'n.', d: '名词：人、物、地方、概念的名字。', e: 'book 书 · water 水 · China 中国' },
      { k: 'v.', d: '动词：表示动作或状态。', e: 'run 跑 · be 是 · like 喜欢' },
      { k: 'adj.', d: '形容词：说明名词「什么样」。', e: 'big 大的 · happy 高兴的' },
      { k: 'adv.', d: '副词：可修饰动词、形容词、副词或整句话，表示方式、程度、频率等。', e: 'quickly 快速地 · very 非常 · often 经常' },
      { k: 'pron.', d: '代词：代替名词，避免重复。', e: 'I 我 · you 你 · it 它' },
      { k: 'prep.', d: '介词：表示时间、位置、方向等关系，后面接名词。', e: 'in · on · at · with' },
      { k: 'det.', d: '限定词：放在名词前，划定它指的是哪一个或多少。', e: 'the · this · my · some' },
      { k: 'num.', d: '数词：表示数量或顺序。', e: 'three 三 · first 第一' },
      { k: 'conj.', d: '连词：连接词、短语或句子。', e: 'and 和 · but 但是 · because 因为' },
      { k: 'int.', d: '感叹词：独立表达情绪，不跟别的词发生语法关系。', e: 'oh · wow · hi' },
      { k: 'art.', d: '冠词：名词前的 a / an / the。', e: 'a book · the sun' },
      { k: 'pl.', d: '复数：这个词条只以复数形式使用。', e: 'proceeds 收益' },
      { k: 'phr.', d: '短语：几个词固定搭配成一个整体来用。', e: 'take care 保重' },
      { k: 'phr.v.', d: '动词短语：动词 + 介词/副词，整体当一个动词用。', e: 'look after 照顾' },
      { k: 'pref.', d: '前缀：加在词前面改变意思。', e: 'auto- 自己、自身 → autobiography 自传' }
    ]
  },
  {
    id: 'term',
    name: '语法术语',
    hint: '单词卡释义的括弧里、语法讲解里出现的行话，都在这里。',
    items: [
      { k: '主格', d: '代词作主语时用的形式。', e: 'I like it. 里的 I（不能说 me like it）' },
      { k: '宾格', d: '代词作宾语（动词或介词后面）时用的形式。', e: 'She called me. 里的 me' },
      { k: '第三人称单数', d: '他 / 她 / 它 / 单个的人或物；一般现在时里动词要加 -s。', e: 'He works.' },
      { k: '单数 / 复数', d: '一个用单数，两个及以上用复数。', e: 'book → books · child → children' },
      { k: '过去式', d: '表示过去发生的动作，自己就能当谓语。', e: 'worked · went · took' },
      { k: '过去分词', d: '和 have 连用构成完成时，或和 be 连用构成被动。', e: 'have gone · is broken' },
      { k: '现在分词', d: '动词的 -ing 形式，和 be 连用构成进行时。', e: 'is running' },
      { k: '完成时', d: 'have + 过去分词，表示「已经…」。', e: 'I have finished.' },
      { k: '进行时', d: 'be + 现在分词，表示「正在…」。', e: 'I am reading.' },
      { k: '比较级', d: '两者比较，「更…」。', e: 'bigger · more useful' },
      { k: '最高级', d: '三者及以上比较，「最…」。', e: 'biggest · most useful' },
      { k: '可数名词', d: '能一个一个数，有复数形式。', e: 'two books · three apples' },
      { k: '不可数名词', d: '不能直接数、也没有复数形式。', e: 'water · advice · information' },
      { k: '及物动词', d: '后面必须跟一个宾语，话才完整。', e: 'I like music.（不能说 I like）' },
      { k: '不及物动词', d: '后面不直接跟宾语。', e: 'He arrived. · She smiled.' },
      { k: '情态动词', d: 'can / may / must 这类，后面接动词原形。', e: 'You must go.' },
      { k: '助动词', d: '帮忙构成时态、疑问、否定的词。', e: 'do / have / be' },
      { k: '不定式', d: 'to + 动词原形。', e: 'I want to go.' },
      { k: '动名词', d: '动词的 -ing 形式，当名词用。', e: 'Swimming is fun.' },
      { k: '物主限定词', d: '放在名词前，说明所属关系。', e: 'my book · your bag · their house' },
      { k: '名词性物主代词', d: '独立使用，代替「物主限定词 + 名词」。', e: 'mine · yours · hers · ours · theirs' },
      { k: '反身代词', d: '动作落回自己身上时用的词。', e: 'myself · yourself · herself' },
      { k: '特指', d: '说话双方都知道的那个，前面用 the。', e: 'Close the door.' },
      { k: '泛指', d: '不特指某一个，用 a / an 或复数。', e: 'a book · books' },
      { k: 'a / an 的选择', d: '看后面单词的「读音」而不是字母：元音音开头用 an，辅音音开头用 a。', e: 'an hour（h 不发音）· a university（读 /j/）' },
      { k: '词形', d: '同一个词的不同形态。', e: 'be → am / is / are / was / were' }
    ]
  }
];

module.exports = { groups: GROUPS };

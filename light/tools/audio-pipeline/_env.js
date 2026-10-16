// _env.js —— 音频管线公共环境（路径全部相对本目录，换机 clone 后无需改动任何脚本）
//
// 目录约定：
//   audio-pipeline/           本目录（脚本 + data/ + _work/）
//   audio-pipeline/data/      输入数据（剑桥抓取存档、词表快照）—— 已纳入版本管理
//   audio-pipeline/_work/     中间产物与本地输出镜像 —— 已 gitignore，可随时删
//   ../../miniprogram/        小程序内核（读 words.js / split-senses.js / grammar.js 等）
//
// 可用环境变量覆盖：
//   AUDIO_WORK   工作目录（默认 ./_work）
//   FFMPEG       ffmpeg 可执行文件（默认先认本机已知绝对路径，再退回 PATH 里的 ffmpeg）
const path = require('path');
const fs = require('fs');

const HERE = __dirname;
const WORK = process.env.AUDIO_WORK || path.join(HERE, '_work');
const MP = path.join(HERE, '..', '..', 'miniprogram');

function pickFfmpeg() {
  const env = process.env.FFMPEG;
  if (env && fs.existsSync(env)) return env;
  const known = 'C:/Users/Administrator/.workbuddy/binaries/ffmpeg/ffmpeg.exe';
  if (fs.existsSync(known)) return known;
  return 'ffmpeg'; // 交给 PATH
}

const FF = pickFfmpeg();

module.exports = {
  HERE,
  WORK,
  MP,
  FFMPEG: FF,
  FFPROBE: FF.endsWith('ffmpeg.exe') ? FF.slice(0, -'ffmpeg.exe'.length) + 'ffprobe.exe' : 'ffprobe',
  data: (...p) => path.join(HERE, 'data', ...p),
  work: (...p) => path.join(WORK, ...p),
  mp: (...p) => path.join(MP, ...p),
};

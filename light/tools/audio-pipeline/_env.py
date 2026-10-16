# -*- coding: utf-8 -*-
"""_env.py —— 音频管线公共环境（路径全部相对本文件，换机 clone 后无需改动任何脚本）

目录约定：
  audio-pipeline/           本目录（脚本 + data/ + _work/）
  audio-pipeline/data/      输入数据（剑桥抓取存档、词表快照）—— 已纳入版本管理
  audio-pipeline/_work/     中间产物与本地输出镜像 —— 已 gitignore，可随时删
  ../../miniprogram/        小程序内核（读 words.js / grammar.js 等）

可用环境变量覆盖：
  AUDIO_WORK   工作目录（默认 ./_work）
  FFMPEG       ffmpeg 可执行文件（默认先认本机已知绝对路径，再退回 PATH 里的 ffmpeg）
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.environ.get('AUDIO_WORK') or os.path.join(HERE, '_work')
MP = os.path.join(HERE, '..', '..', 'miniprogram')


def _pick_ffmpeg():
    env = os.environ.get('FFMPEG')
    if env and os.path.exists(env):
        return env
    known = r'C:/Users/Administrator/.workbuddy/binaries/ffmpeg/ffmpeg.exe'
    if os.path.exists(known):
        return known
    return 'ffmpeg'


FF = _pick_ffmpeg()
FFP = FF[: -len('ffmpeg.exe')] + 'ffprobe.exe' if FF.endswith('ffmpeg.exe') else 'ffprobe'


def data(*p):
    return os.path.join(HERE, 'data', *p)


def work(*p):
    return os.path.join(WORK, *p)


def mp(*p):
    return os.path.join(MP, *p)

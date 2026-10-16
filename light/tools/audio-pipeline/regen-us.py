# -*- coding: utf-8 -*-
"""重生成「美音例句」预生成音频（正常速 + 慢速）。
用法：
  python regen-us.py --ai=41 --text="Please write down your name." --outdir=<目录>
  python regen-us.py --ai=41 --text="..."            # 默认写入 dist2/s/<shard>/
口径对齐（与既有 dist2 文件一致）：voice=en-US-AvaMultilingualNeural
  正常速 rate=0%      慢速 rate=-30%
  ffmpeg 转码 → 44100Hz 单声道 96kbps
"""

from _env import HERE, WORK, MP, FF, FFP, data, work, mp

import asyncio, os, sys, subprocess, argparse
import edge_tts

VOICE = 'en-US-AvaMultilingualNeural'
RATE_SLOW = '-32%'
DEF_OUT = work('dist2', 's')

ap = argparse.ArgumentParser()
ap.add_argument('--ai', required=True, type=int)
ap.add_argument('--text', required=True)
ap.add_argument('--outdir', default=DEF_OUT)
a = ap.parse_args()

shard = a.ai // 1000
os.makedirs(f'{a.outdir}/{shard}', exist_ok=True)
tmp = work('tts_tmp')
os.makedirs(tmp, exist_ok=True)

async def make(rate, raw_path, out_path):
    for attempt in range(4):
        try:
            kw = {'rate': rate} if rate else {}
            c = edge_tts.Communicate(a.text, VOICE, **kw)
            await c.save(raw_path)
            if os.path.getsize(raw_path) > 512:
                break
        except Exception as e:
            if attempt == 3: raise
            await asyncio.sleep(1.5 * (attempt + 1))
    r = subprocess.run([FF, '-y', '-i', raw_path, '-ar', '44100', '-ac', '1',
                        '-b:a', '96k', out_path, '-loglevel', 'error'], capture_output=True)
    if r.returncode != 0:
        raise RuntimeError('ffmpeg 失败: ' + r.stderr.decode('utf-8', 'ignore')[:200])
    return os.path.getsize(out_path)

async def main():
    n = f'{a.ai:04d}'
    s = f'{a.ai:04d}s'
    r1 = await make(None, f'{tmp}/{n}.raw.mp3', f'{a.outdir}/{shard}/{n}.mp3')
    r2 = await make(RATE_SLOW, f'{tmp}/{s}.raw.mp3', f'{a.outdir}/{shard}/{s}.mp3')
    fp = FF.replace('ffmpeg.exe', 'ffprobe.exe')
    for f in (f'{a.outdir}/{shard}/{n}.mp3', f'{a.outdir}/{shard}/{s}.mp3'):
        p = subprocess.run([fp, '-v', 'error', '-show_entries', 'stream=sample_rate,channels,duration',
                            '-of', 'csv=p=0', f], capture_output=True)
        print(f'  {f}  {os.path.getsize(f)}B  {p.stdout.decode().strip()}', flush=True)
    print(f'OK  text={a.text!r}  (正常速 {r1}B / 慢速 {r2}B)', flush=True)

asyncio.run(main())

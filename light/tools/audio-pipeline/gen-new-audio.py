# -*- coding: utf-8 -*-
"""gen-new-audio.py —— 为 19 个新短语条目重生成音频（6 个文件/条）

产物（镜像云端路径，便于直接上传）：
  _work/upload_fix2/w/7/xxxx.mp3    美音 短语 正常速
  _work/upload_fix2/w/7/xxxxs.mp3   美音 短语 慢速
  _work/upload_fix2/s/7/xxxx.mp3    美音 例句 正常速
  _work/upload_fix2/s/7/xxxxs.mp3   美音 例句 慢速
  _work/upload_fix2/wuk/7/xxxx.mp3  英音 短语 正常速
  _work/upload_fix2/wuk/7/xxxxs.mp3 英音 短语 慢速

口径（与既有桶一致）：
  美音 en-US-AvaMultilingualNeural：正常速 0%，慢速 -30%
  英音 en-GB-SoniaNeural        ：正常速 -4%，慢速 -33%
  ffmpeg 统一转 44100Hz 单声道 96kbps（与存量文件同规格）
"""

from _env import HERE, WORK, MP, FF, FFP, data, work, mp

import asyncio, json, os, subprocess, sys, time

OUT = work('upload_fix2')
TASKS = json.load(open(data('audio-tasks.json'), encoding='utf-8'))

US_VOICE = 'en-US-AvaMultilingualNeural'
UK_VOICE = 'en-GB-SoniaNeural'
US_RATE_N, US_RATE_S = '+0%', '-30%'
UK_RATE_N, UK_RATE_S = '-4%', '-33%'

SEM = asyncio.Semaphore(8)
fails = []


def conv(raw, out):
    subprocess.run([FF, '-y', '-i', raw, '-ar', '44100', '-ac', '1',
                    '-b:a', '96k', out, '-loglevel', 'error'], check=True)
    os.remove(raw)
    p = subprocess.run([FFP, '-v', 'error', '-show_entries', 'stream=duration',
                        '-of', 'csv=p=0', out], capture_output=True)
    return float(p.stdout.decode().strip() or 0), os.path.getsize(out)


async def one(text, voice, rate, out):
    raw = out + '.raw.mp3'
    for attempt in range(3):
        try:
            async with SEM:
                import edge_tts
                c = edge_tts.Communicate(text, voice, rate=rate)
                await c.save(raw)
            if os.path.getsize(raw) > 512:
                d, sz = conv(raw, out)
                return d, sz
        except Exception as e:
            if attempt == 2:
                fails.append({'out': out, 'err': f'{type(e).__name__}: {e}'})
            else:
                await asyncio.sleep(1.5 * (attempt + 1))
    return 0, 0


async def main():
    jobs = []
    for t in TASKS:
        sh = int(t['ai']) // 1000
        f = f"{int(t['ai']):04d}"
        for sub in ('w', 's', 'wuk'):
            os.makedirs(f'{OUT}/{sub}/{sh}', exist_ok=True)
        jobs += [
            ('w',   f'{OUT}/w/{sh}/{f}.mp3',    t['w'],  US_VOICE, US_RATE_N),
            ('w',   f'{OUT}/w/{sh}/{f}s.mp3',   t['w'],  US_VOICE, US_RATE_S),
            ('s',   f'{OUT}/s/{sh}/{f}.mp3',    t['ex'], US_VOICE, US_RATE_N),
            ('s',   f'{OUT}/s/{sh}/{f}s.mp3',   t['ex'], US_VOICE, US_RATE_S),
            ('wuk', f'{OUT}/wuk/{sh}/{f}.mp3',  t['w'],  UK_VOICE, UK_RATE_N),
            ('wuk', f'{OUT}/wuk/{sh}/{f}s.mp3', t['w'],  UK_VOICE, UK_RATE_S),
        ]
    print(f'共 {len(jobs)} 个文件待生成', flush=True)
    t0 = time.time()
    res = await asyncio.gather(*[one(txt, v, r, p) for _, p, txt, v, r in jobs])
    for (sub, p, txt, _, _), (d, sz) in zip(jobs, res):
        print(f'  {p.replace(OUT, "")}  {d:.3f}s  {sz}B')
    print(f'\n完成 {sum(1 for r in res if r[1] > 0)}/{len(jobs)}  用时 {time.time()-t0:.0f}s')
    if fails:
        print('失败:', fails)
        sys.exit(1)


asyncio.run(main())

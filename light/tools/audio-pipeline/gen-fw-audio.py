# -*- coding: utf-8 -*-
"""gen-fw-audio.py —— 功能词包 115 词全量音频（正常速 + 慢速，三个桶）

  w/8/{ai}.mp3    美音单词   Ava  +0%   → ffmpeg 44100/单声道/96k
  w/8/{ai}s.mp3   美音单词   Ava  -32%
  s/8/{ai}.mp3    美音例句   Ava  +0%
  s/8/{ai}s.mp3   美音例句   Ava  -32%
  wuk/8/{ai}.mp3  英音单词   Sonia -4%  （与 gen-uk.py 同构：raw 直存，不过 ffmpeg）
  wuk/8/{ai}s.mp3 英音单词   Sonia -33% （与 gen-uk-slow.py 同构）

任务源：_funcwords_insert.json（[w,pos,cn,en,ai,us,uk,cnEx] × 115，ai 8001~8115）
输出：_work/dist2{,uk}/...（本地镜像，既有 8000 词同目录）
增量：已存在且 >512B 的文件跳过，可反复跑。
⚠️ raw 中间文件一律落 _fw_tmp，不 os.remove（Windows 批量删除护栏）。
"""

from _env import HERE, WORK, MP, FF, FFP, data, work, mp

import asyncio, json, os, subprocess, sys, time
import edge_tts

ROWS = json.load(open(data('funcwords-insert.json'), encoding='utf-8'))
TMP = work('fw_tmp')
FAILS = work('fw-fails.json')
D2 = work('dist2')
D2UK = work('dist2uk')
VO_US, VO_UK = 'en-US-AvaMultilingualNeural', 'en-GB-SoniaNeural'
SEM = asyncio.Semaphore(8)
os.makedirs(TMP, exist_ok=True)

jobs = []  # (text, voice, rate, out, need_ff)
for r in ROWS:
    w, ai, ex = r[0], int(r[4]), r[3]
    shard = str(ai // 1000)
    n4 = f'{ai:04d}'
    for slow, sfx in ((False, ''), (True, 's')):
        jobs.append((w,   VO_US, ('-32%' if slow else '+0%'), f'{D2}/w/{shard}/{n4}{sfx}.mp3',   True))
        jobs.append((ex,  VO_US, ('-32%' if slow else '+0%'), f'{D2}/s/{shard}/{n4}{sfx}.mp3',   True))
        jobs.append((w,   VO_UK, ('-33%' if slow else '-4%'), f'{D2UK}/w/{shard}/{n4}{sfx}.mp3', False))

todo = []
for j in jobs:
    d = os.path.dirname(j[3])
    os.makedirs(d, exist_ok=True)
    if not (os.path.exists(j[3]) and os.path.getsize(j[3]) > 512):
        todo.append(j)
print(f'总任务 {len(jobs)} | 已完成 {len(jobs)-len(todo)} | 待生成 {len(todo)}', flush=True)

fails, done, lock = [], [0], asyncio.Lock()
T0 = time.time()

def conv(raw, out):
    subprocess.run([FF, '-y', '-i', raw, '-ar', '44100', '-ac', '1',
                    '-b:a', '96k', out, '-loglevel', 'error'], check=True)

def raw_of(out):
    """raw 中间文件必须带桶前缀：同一 ai 的 w/s/wuk 三个任务并发，
    若只用 basename，三者共用一个 raw 路径 → 内容互相踩踏（v1.1.74「be 尾部多出读音」根因）。"""
    rel = os.path.relpath(out, D2) if out.startswith(D2) else os.path.relpath(out, D2UK)
    bucket = rel.replace('\\', '/').split('/')[0]          # w / s / wuk
    sub = os.path.join(TMP, bucket)
    os.makedirs(sub, exist_ok=True)
    return os.path.join(sub, os.path.basename(out) + '.raw.mp3')

async def one(text, voice, rate, out, need_ff):
    raw = raw_of(out)
    for attempt in range(3):
        try:
            async with SEM:
                c = edge_tts.Communicate(text, voice, rate=rate)
                await c.save(raw)
            if os.path.getsize(raw) > 512:
                if need_ff:
                    conv(raw, out)
                else:
                    with open(raw, 'rb') as f, open(out, 'wb') as g:
                        g.write(f.read())
                async with lock:
                    done[0] += 1
                    if done[0] % 100 == 0:
                        el = time.time() - T0
                        print(f'  进度 {done[0]}/{len(todo)} 已用 {el:.0f}s 预计剩余 {el/done[0]*(len(todo)-done[0]):.0f}s', flush=True)
                return True
        except Exception as e:
            if attempt == 2:
                fails.append({'out': out, 'text': text, 'err': f'{type(e).__name__}: {e}'})
                print(f'  FAIL {out} -> {type(e).__name__}: {str(e)[:90]}', flush=True)
            else:
                await asyncio.sleep(1.5 * (attempt + 1))
    return False

async def main():
    B = 120
    for i in range(0, len(todo), B):
        await asyncio.gather(*[one(*j) for j in todo[i:i+B]])
    dt = time.time() - T0
    print(f'生成完成 | 成功 {done[0]}/{len(todo)} | 失败 {len(fails)} | 耗时 {dt:.0f}s', flush=True)
    if fails:
        json.dump(fails, open(FAILS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('失败清单 →', FAILS, flush=True)

asyncio.run(main())

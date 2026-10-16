# -*- coding: utf-8 -*-
"""英音单词「慢速」音频生成（v1.1.59 · 用户要求「慢速音频也补一下」）

与正常速（gen-uk.py）的关系：
  正常速 rate = -4%（英音语速天生略快于美音，整体放慢 4% 找齐）
  慢速   rate = -33%（在正常速基础上再放慢 ~30%，与美音 -30% 口径对齐）
  实际速度倍率 = 0.96 × 0.70 ≈ 0.672

输出：_work/dist2uk/w/{shard}/{ai:04d}s.mp3
      —— 与美音 dist2 同构（美音也有 0001s.mp3），speech.js 用 s 后缀取慢速
断点续跑：已存在且 >512 字节则跳过。
"""

from _env import HERE, WORK, MP, FF, FFP, data, work, mp

import asyncio, json, os, time, sys
import edge_tts

LIST = json.load(open(data('uk-words.json'), encoding='utf-8'))
VOICE = 'en-GB-SoniaNeural'
OUT = work('dist2uk', 'w')
RATE = '-33%'

for sh in range(10):
    os.makedirs(f'{OUT}/{sh}', exist_ok=True)

jobs = []
for it in LIST:
    p = f"{OUT}/{it['ai'] // 1000}/{it['ai']:04d}s.mp3"
    if not (os.path.exists(p) and os.path.getsize(p) > 512):
        jobs.append((it['ai'], it['w'], p))
print(f'总任务 {len(LIST)} | 已完成 {len(LIST)-len(jobs)} | 待生成 {len(jobs)}', flush=True)
if not jobs:
    print('全部已存在，无事可做', flush=True); sys.exit(0)

LIMIT = int(os.environ.get('LIMIT', '0'))
if LIMIT: jobs = jobs[:LIMIT]

SEM = asyncio.Semaphore(8)
RETRY = 3
fails, done = [], [0]
lock = asyncio.Lock()
T0 = time.time()

async def gen(ai, text, out):
    for attempt in range(RETRY):
        try:
            async with SEM:
                c = edge_tts.Communicate(text, VOICE, rate=RATE)
                await c.save(out)
            if os.path.getsize(out) > 512:
                async with lock:
                    done[0] += 1
                    if done[0] % 200 == 0:
                        el = time.time() - T0
                        print(f'  进度 {done[0]}/{len(jobs)}  已用 {el:.0f}s  预计剩余 {el/done[0]*(len(jobs)-done[0]):.0f}s', flush=True)
                return True
        except Exception as e:
            if attempt == RETRY - 1:
                fails.append({'ai': ai, 'text': text, 'err': f'{type(e).__name__}: {e}'})
                print(f'  FAIL ai={ai} {text[:30]} -> {type(e).__name__}: {str(e)[:100]}', flush=True)
            else:
                await asyncio.sleep(1.5 * (attempt + 1))
    return False

async def main():
    B = 400
    for i in range(0, len(jobs), B):
        await asyncio.gather(*[gen(*j) for j in jobs[i:i+B]])
    dt = time.time() - T0
    print(f'\n生成完成 | 成功 {done[0]}/{len(jobs)} | 失败 {len(fails)} | 耗时 {dt:.0f}s ({dt/60:.1f} 分钟)', flush=True)
    if fails:
        json.dump(fails, open(work('uk-slow-fails.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('失败清单 → _work/uk-slow-fails.json', flush=True)

asyncio.run(main())

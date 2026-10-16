# -*- coding: utf-8 -*-
"""英音单词音频全量生成（v1.1.58 · 用户拍板「补英音单词离线音频」）
音色：en-GB-SoniaNeural（英音女声，与美音 AvaMultilingualNeural 女声对位）
只做单词正常速（不做慢速）——容量账：+103MB → 云存储 880MB/2GB（86%），放得下；
若连慢速一起做 = 1.04GB（101%）刚好超免费额度。
输出：_work/dist2uk/w/{shard}/{ai:04d}.mp3   （与美音 dist2 同构，前缀不同）
断点续跑：已存在且 >512 字节则跳过。
"""

from _env import HERE, WORK, MP, FF, FFP, data, work, mp

import asyncio, json, os, time, sys
import edge_tts

LIST = json.load(open(data('uk-words.json'), encoding='utf-8'))
VOICE = 'en-GB-SoniaNeural'
OUT = work('dist2uk', 'w')
RATE = '-4%'          # 英音语速略快于美音，整体放慢 4% 找齐（可调）

for sh in range(10):
    os.makedirs(f'{OUT}/{sh}', exist_ok=True)

jobs = []
for it in LIST:
    p = f"{OUT}/{it['ai'] // 1000}/{it['ai']:04d}.mp3"
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
        json.dump(fails, open(work('uk-fails.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('失败清单 → _work/uk-fails.json', flush=True)

asyncio.run(main())

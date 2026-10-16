# -*- coding: utf-8 -*-
"""gen-g-audio.py —— 生成「语法例句 / 音标例词」的预生成音频（正常速 + 慢速）

为什么存在：语法速查里的例句与音标例词原先没有预生成音频，播放时走在线 TTS，
音色和今日页的 Azure Ava 不一样（用户 2026-10-10 真机反馈）。本脚本把这类文本
一次性合成进 g/ 桶，之后播放链第一优先命中的就是这里。

口径（与 s/ 例句桶完全一致，保证音色统一）：
  音色 en-US-AvaMultilingualNeural
  正常速 +0%      慢速 -32%
  ffmpeg → 44100Hz 单声道 96kbps

路径规则必须与 miniprogram/utils/speech.js 的 hashName/gRel 一致：
  g/{djb2hex % 10}/{djb2hex}.mp3   正常速
  g/{djb2hex % 10}/{djb2hex}s.mp3  慢速
任务清单由 mk-g-tasks.js 生成（node mk-g-tasks.js）。

用法：
  python gen-g-audio.py              # 生成全部缺失文件（已存在的跳过，可反复跑）
  python gen-g-audio.py --only-slow  # 只补慢速缺失
  python gen-g-audio.py --limit 20   # 只做前 20 条（试跑）
"""

from _env import HERE, WORK, MP, FF, FFP, data, work, mp

import asyncio, json, os, subprocess, sys, time

TASKS = json.load(open(work('g-tasks.json'), encoding='utf-8'))
TMP = work('g_tmp')
FAILS = work('g-fails.json')

VOICE = 'en-US-AvaMultilingualNeural'
RATE_N, RATE_S = '+0%', '-32%'
SEM = asyncio.Semaphore(8)


def conv(raw, out):
    # ⚠️ 不要在这里 os.remove(raw)：Windows 端 Python 有「批量删除护栏」，
    #    几百个 os.remove 会被判为危险批量删除直接 SystemExit(1)（2026-10-10 实测踩到）。
    #    改成 raw 一律落在 _g_tmp/，与成品目录分离（mirror 目录要整目录上传云存储，
    #    混进 .raw.mp3 会被一起传上去）。raw 体积小（~30KB/条），留着不清理。
    subprocess.run([FF, '-y', '-i', raw, '-ar', '44100', '-ac', '1',
                    '-b:a', '96k', out, '-loglevel', 'error'], check=True)
    p = subprocess.run([FFP, '-v', 'error', '-show_entries', 'stream=duration',
                        '-of', 'csv=p=0', out], capture_output=True)
    return float(p.stdout.decode().strip() or 0), os.path.getsize(out)


async def one(text, rate, out):
    raw = TMP + '/' + os.path.basename(out) + '.raw.mp3'
    for attempt in range(3):
        try:
            async with SEM:
                import edge_tts
                c = edge_tts.Communicate(text, VOICE, rate=rate)
                await c.save(raw)
            if os.path.getsize(raw) > 512:
                d, sz = conv(raw, out)
                return d, sz
        except Exception as e:
            if attempt == 2:
                return -1, str(e)[:80]
            await asyncio.sleep(1.2 * (attempt + 1))
    return 0, 0


async def main():
    only_slow = '--only-slow' in sys.argv
    limit = 0
    if '--limit' in sys.argv:
        limit = int(sys.argv[sys.argv.index('--limit') + 1])
    os.makedirs(TMP, exist_ok=True)

    jobs = []
    for t in TASKS:
        if not only_slow and not (os.path.exists(t['out']) and os.path.getsize(t['out']) > 512):
            jobs.append((t['text'], RATE_N, t['out'], t['name']))
        if not (os.path.exists(t['outSlow']) and os.path.getsize(t['outSlow']) > 512):
            jobs.append((t['text'], RATE_S, t['outSlow'], t['nameSlow']))
    if limit:
        jobs = jobs[:limit]

    print('待生成 = %d 个文件（总任务 %d 条）' % (len(jobs), len(TASKS)))
    t0 = time.time()
    fails, done, empty = [], 0, []

    async def run(text, rate, out, name):
        nonlocal done
        os.makedirs(os.path.dirname(out), exist_ok=True)
        d, sz = await one(text, rate, out)
        if d == -1:
            fails.append({'name': name, 'err': sz, 'text': text})
        elif d == 0:
            empty.append({'name': name, 'text': text})
        else:
            done += 1
            if done % 25 == 0:
                print('  已完成 %d / %d  (%.0fs)' % (done, len(jobs), time.time() - t0), flush=True)

    await asyncio.gather(*[run(*j) for j in jobs])
    json.dump({'fails': fails, 'empty': empty}, open(FAILS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('成功 %d，失败 %d，空音频 %d，用时 %.0fs' % (done, len(fails), len(empty), time.time() - t0))
    for f in fails[:10]:
        print('  fail ' + f['name'] + ' :: ' + f['err'])
    for e in empty[:10]:
        print('  空音频 ' + e['name'])


asyncio.run(main())

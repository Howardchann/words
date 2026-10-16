# -*- coding: utf-8 -*-
"""gen-special-fix.py —— v1.1.100 音频生产（36 词复扫：3 拆卡 + 10 音标修正）
必须沙箱外运行（联网 + edge-tts）。

产出（44100Hz/单声道/96kbps，与存量桶口径一致）：
  副卡 3 张（8243 conduct / 8244 digest / 8245 permit）：
    美音单词 w/8/<ai>(s).mp3、英音单词 wuk/8/<ai>(s).mp3、美音例句 s/8/<ai>(s).mp3
  主卡 13 词（A 类 3 主卡 + B 类 10 音标修正）：
    w/<shard>/<ai>(s).mp3（美音 Ava）、wuk/<shard>/<ai>(s).mp3（英音 Sonia）
  主卡新例句 3 条（A 类换成名词例句）：s/<shard>/<ai>(s).mp3

读音正确性：单词一律用「载体短语 + WordBoundary 裁词」逼出目标读音 ——
  名词读音用 a / the / his 载语，动词读音用 to 载语，形容词用 he is / to be 载语。
  例句不裁词。已存在的输出文件默认跳过（可断点续跑）。

用法：python gen-special-fix.py [--jobs=4] [--force]
"""

from _env import HERE, WORK, MP, FF, FFP, data, work, mp

import os, sys, asyncio, subprocess, time
for k in ('http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'all_proxy', 'ALL_PROXY'):
    os.environ.pop(k, None)
os.environ['no_proxy'] = '*'
os.environ['NO_PROXY'] = '*'

import edge_tts

OUT = work('regen')
US = 'en-US-AvaMultilingualNeural'
UK = 'en-GB-SoniaNeural'
US_R = {'n': '+0%', 's': '-30%'}
UK_R = {'n': '-4%', 's': '-33%'}
TRIM = ('silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB,'
        'areverse,'
        'silenceremove=start_periods=1:start_silence=0.12:start_threshold=-45dB,'
        'areverse')
os.makedirs(OUT + '/_raw', exist_ok=True)

SUB = [
    # ── v1.1.100 新增 3 张副卡（动词读音）──────────────────
    # ⚠️ A 类 6 张卡（3 主 + 3 副）的单词音频一律「从该卡自己的例句裁词」，
    #    这样单词读音与例句读音同源、物理上不可能矛盾，不依赖声学推断。
    (8243, 'conduct', 'She will conduct the survey next week.', 'She will conduct the survey next week.'),
    (8244, 'digest',  "I know it's a lot to digest.", "I know it's a lot to digest."),
    (8245, 'permit',  'Permit me to do that for you.', 'Permit me to do that for you.'),
]

MAIN = [
    # ── A 类主卡 3 词：读音为名词；单词音频从「主卡自己的新例句」裁词 ──
    (888,  'conduct', 'His conduct at the meeting was excellent.'),
    (6621, 'digest',  "This magazine is a digest of the week's news."),
    (1682, 'permit',  'You need a permit to park here.'),
    # ── B 类主卡 10 词：音标修正后「音频跟音标走」──────────────
    (1373, 'content',   'he is content'),
    (4844, 'discharge', 'to discharge'),
    (3511, 'exploit',   'to exploit'),
    (2816, 'export',    'to export'),
    (3263, 'import',    'to import'),
    (472,  'increase',  'to increase'),
    (5075, 'insult',    'an insult'),
    (222,  'research',  'the research'),
    (1855, 'transfer',  'to transfer'),
    (2761, 'upset',     'to be upset'),
]

MAIN_EX = [
    # ── A 类主卡新例句（美音例句桶 s/<shard>/）──────────────
    (888,  'His conduct at the meeting was excellent.'),
    (6621, "This magazine is a digest of the week's news."),
    (1682, 'You need a permit to park here.'),
]


def norm(t):
    return ''.join(ch for ch in t.lower() if ch.isalnum())


def convert(raw, out, ss=None, dur=None):
    """⚠️ 不删除 raw：本机沙箱的 os.remove 有「每轮删除数」守卫（>50 次即中断进程）。
    调用方的临时文件按 worker 固定命名、反复覆盖 → 全程零删除。"""
    cmd = [FF, '-y']
    if ss is not None:
        cmd += ['-ss', '%.3f' % ss]
    cmd += ['-i', raw]
    if dur is not None:
        cmd += ['-t', '%.3f' % dur]
    cmd += ['-af', TRIM, '-ar', '44100', '-ac', '1', '-b:a', '96k', out, '-loglevel', 'error']
    subprocess.run(cmd, check=True)
    p = subprocess.run([FFP, '-v', 'error', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', out], capture_output=True)
    return round(float(p.stdout.decode().strip() or 0), 2), os.path.getsize(out)


async def synth(text, voice, rate, out, cut=None, tmp=None):
    raw = tmp or (out + '.raw.mp3')
    for attempt in range(6):
        try:
            if cut is None:
                await edge_tts.Communicate(text, voice, rate=rate).save(raw)
                if os.path.getsize(raw) > 512:
                    return convert(raw, out)
            else:
                comm = edge_tts.Communicate(text, voice, rate=rate, boundary='WordBoundary')
                chunks, marks = [], []
                async for ch in comm.stream():
                    if ch.get('type') == 'audio':
                        chunks.append(ch['data'])
                    elif ch.get('type') == 'WordBoundary':
                        marks.append((norm(ch.get('text', '')), ch['offset'], ch['duration']))
                data = b''.join(chunks)
                if len(data) < 512 or not marks:
                    raise RuntimeError('no audio/marks')
                tgt = norm(cut)
                start = end = None
                for i in range(len(marks)):
                    acc = ''
                    for j in range(i, len(marks)):
                        acc += marks[j][0]
                        if acc == tgt:
                            start, end = marks[i][1] / 1e7, (marks[j][1] + marks[j][2]) / 1e7
                            break
                        if not tgt.startswith(acc):
                            break
                    if start is not None:
                        break
                if start is None:
                    raise RuntimeError('boundary not found: ' + cut)
                with open(raw, 'wb') as f:
                    f.write(data)
                return convert(raw, out, ss=max(0, start - 0.01), dur=(end - start) + 0.03)
        except Exception as e:
            if attempt >= 5:
                return ('FAIL', type(e).__name__, str(e)[:80])
            await asyncio.sleep(2 + 2 * attempt)


def build_tasks(only, cut_only=False):
    T = []

    def add(text, voice, rate, rel, cut=None, tag=''):
        T.append({'text': text, 'voice': voice, 'rate': rate,
                  'out': OUT + '/' + rel, 'cut': cut, 'tag': rel + ' ' + tag})

    for (ai, word, carrier, ex) in SUB:
        if only and word not in only:
            continue
        f = '%04d' % ai
        add(carrier, US, US_R['n'], 'us/w/8/' + f + '.mp3', word, 'sub-us-n')
        add(carrier, US, US_R['s'], 'us/w/8/' + f + 's.mp3', word, 'sub-us-s')
        add(carrier, UK, UK_R['n'], 'uk/wuk/8/' + f + '.mp3', word, 'sub-uk-n')
        add(carrier, UK, UK_R['s'], 'uk/wuk/8/' + f + 's.mp3', word, 'sub-uk-s')
        if not cut_only:
            add(ex, US, US_R['n'], 'us/s/8/' + f + '.mp3', None, 'sub-sent-n')
            add(ex, US, US_R['s'], 'us/s/8/' + f + 's.mp3', None, 'sub-sent-s')
    for (ai, word, carrier) in MAIN:
        if only and word not in only:
            continue
        f = '%04d' % ai
        sh = str(ai // 1000)
        add(carrier, US, US_R['n'], 'us/w/' + sh + '/' + f + '.mp3', word, 'main-us-n')
        add(carrier, US, US_R['s'], 'us/w/' + sh + '/' + f + 's.mp3', word, 'main-us-s')
        add(carrier, UK, UK_R['n'], 'uk/wuk/' + sh + '/' + f + '.mp3', word, 'main-uk-n')
        add(carrier, UK, UK_R['s'], 'uk/wuk/' + sh + '/' + f + 's.mp3', word, 'main-uk-s')
    for (ai, ex) in MAIN_EX:
        f = '%04d' % ai
        sh = str(ai // 1000)
        add(ex, US, US_R['n'], 'us/s/' + sh + '/' + f + '.mp3', None, 'mainex-n')
        add(ex, US, US_R['s'], 'us/s/' + sh + '/' + f + 's.mp3', None, 'mainex-s')
    return T


async def main():
    args = sys.argv[1:]
    jobs = 6
    for a in args:
        if a.startswith('--jobs='):
            jobs = int(a.split('=')[1])
    only = set()
    for a in args:
        if a.startswith('--only='):
            only = set(a.split('=')[1].split(','))
    force = '--force' in args
    tasks = build_tasks(only, '--cut-only' in args)
    # 跳过已完成
    todo, skipped = [], 0
    for t in tasks:
        if (not force) and os.path.exists(t['out']) and os.path.getsize(t['out']) > 1024:
            skipped += 1
            continue
        os.makedirs(os.path.dirname(t['out']), exist_ok=True)
        todo.append(t)
    print('任务 %d | 跳过(已存在) %d | 待生成 %d | 并发 %d' % (len(tasks), skipped, len(todo), jobs))

    q = asyncio.Queue()
    for t in todo:
        q.put_nowait(t)
    ok = bad = 0
    fails = []
    done = [0]
    t0 = time.time()

    async def worker(n):
        nonlocal ok, bad
        myTmp = OUT + '/_raw/w%d.raw.mp3' % n     # 每 worker 固定临时文件，反复覆盖（零删除）
        while True:
            try:
                t = q.get_nowait()
            except asyncio.QueueEmpty:
                return
            r = await synth(t['text'], t['voice'], t['rate'], t['out'], cut=t['cut'], tmp=myTmp)
            done[0] += 1
            if isinstance(r, tuple):
                ok += 1
            else:
                bad += 1
                fails.append((t['tag'], r))
                print('FAIL', t['tag'], r)
            if done[0] % 10 == 0 or done[0] == len(todo):
                print('[%d/%d] ok=%d bad=%d %.1fmin' % (done[0], len(todo), ok, bad, (time.time() - t0) / 60))

    await asyncio.gather(*[worker(i) for i in range(jobs)])
    print('== DONE ok=%d bad=%d skipped=%d 用时 %.1fmin' % (ok, bad, skipped, (time.time() - t0) / 60))
    if fails:
        print('失败清单：')
        for f in fails:
            print('  ', f[0], f[1])


asyncio.run(main())

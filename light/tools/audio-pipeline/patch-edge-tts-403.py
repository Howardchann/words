# -*- coding: utf-8 -*-
"""patch-edge-tts-403.py —— edge-tts 403 修复补丁（留档，重装 venv 后重跑即可）
根因：2026-10 起微软在全球范围封禁旧合成端点 speech.platform.bing.com（403），
      Edge 155 改用 api.msedgeservices.com（edge-tts issue #490 / PR #491）。
补丁：WSS_URL 换新端点 + drm 日期解析改 locale 无关。
⚠️ 运行约束：
  1. 新端点必须直连（走沙箱代理会 502/超时）→ 生成脚本里清掉 *_proxy 环境变量 + no_proxy='*'
  2. 新端点对并发握手敏感（并发 4 也可能整批超时）→ 串行 + 指数退避重试
  3. 新端点返回的音频首尾静音比旧端点多 → 转码时加 silenceremove 裁剪
  4. TTS 读孤立异音词自选高频读音（live→/laɪv/、sow→/saʊ/）→ 用同音拼写变体逼音：
     live→"liv"、sow→"sew"（sew 本来就读 /soʊ/，现成同音词）
用法：python patch-edge-tts-403.py
"""

from _env import HERE, WORK, MP, FF, FFP, data, work, mp

import io, os

import edge_tts as _et
P = os.path.dirname(_et.__file__)

# ---- constants.py ----
f = os.path.join(P, "constants.py")
s = io.open(f, encoding="utf-8").read()
old = 'WSS_URL = f"wss://{BASE_URL}/edge/v1?TrustedClientToken={TRUSTED_CLIENT_TOKEN}"'
new = ('# 2026-10 起旧主机 speech.platform.bing.com 全球返回 403（edge-tts issue #490）。\n'
       '# Edge 155 改用 api.msedgeservices.com，同一个 token 作为 Ocp-Apim-Subscription-Key 传入。\n'
       '# 音色列表仍由旧主机提供（VOICE_LIST 不动）。补丁来源：PR #491。\n'
       'WSS_URL = (\n'
       '    "wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1"\n'
       '    f"?Ocp-Apim-Subscription-Key={TRUSTED_CLIENT_TOKEN}"\n'
       ')')
if "api.msedgeservices.com" in s:
    print("- constants.py 已打过补丁，跳过")
else:
    assert s.count(old) == 1, "constants.py 锚点未命中"
    io.open(f, "w", encoding="utf-8", newline="\n").write(s.replace(old, new))
    print("OK constants.py")

# ---- drm.py ----
f2 = os.path.join(P, "drm.py")
s2 = io.open(f2, encoding="utf-8").read()
if "parsedate_to_datetime" in s2:
    print("- drm.py 已是新实现，跳过")
else:
    s2 = s2.replace("import hashlib\nimport secrets",
                    "import hashlib\nimport secrets\nfrom email.utils import parsedate_to_datetime", 1)
    old2 = ('        try:\n'
            '            return (\n'
            '                dt.strptime(date, "%a, %d %b %Y %H:%M:%S %Z")\n'
            '                .replace(tzinfo=tz.utc)\n'
            '                .timestamp()\n'
            '            )\n'
            '        except ValueError:\n'
            '            return None')
    new2 = ('        try:\n'
            '            parsed = parsedate_to_datetime(date)\n'
            '        except (TypeError, ValueError, IndexError):\n'
            '            return None\n'
            '        if parsed.tzinfo is None:\n'
            '            parsed = parsed.replace(tzinfo=tz.utc)\n'
            '        return parsed.timestamp()')
    assert s2.count(old2) == 1, "drm.py 锚点未命中（可手动对照 PR #491）"
    io.open(f2, "w", encoding="utf-8", newline="\n").write(s2.replace(old2, new2))
    print("OK drm.py")
print("完成。验证：python _test_new_endpoint.py（须在沙箱外跑）")

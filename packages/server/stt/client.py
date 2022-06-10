#!/usr/bin/env python3

import asyncio
import websockets
import sys
import wave
from packages.server.env import get_env

en_websocket = None
en_url = 'ws://%d' % get_env('STT_EN_SERVER_PORT')
if en_url:
    en_websocket = websockets.connect(en_url)


fr_websocket = None
fr_url = 'ws://%d' % get_env('STT_FR_SERVER_PORT')
if fr_url:
    fr_websocket = websockets.connect(fr_url)


async def run_test(uri):
    # async with
    wf = wave.open(sys.argv[1], "rb")
    await fr_websocket.send('{ "config" : { "sample_rate" : %d } }' % (wf.getframerate()))
    buffer_size = int(wf.getframerate() * 0.2)  # 0.2 seconds of audio
    while True:
        data = wf.readframes(buffer_size)

        if len(data) == 0:
            break

        await fr_websocket.send(data)
        print(await fr_websocket.recv())

    await fr_websocket.send('{"eof" : 1}')
    print(await fr_websocket.recv())

asyncio.run(run_test)

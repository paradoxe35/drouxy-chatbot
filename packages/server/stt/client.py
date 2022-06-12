#!/usr/bin/env python3

import asyncio
import websockets
import wave
import env

en_url = 'ws://%s' % env.get_env('STT_EN_SERVER_PORT')
fr_url = 'ws://%s' % env.get_env('STT_FR_SERVER_PORT')


async def run_stt(uri: str, filePath: str):
    try:
        last_partial = None
        async with websockets.connect(uri) as websocket:
            wf = wave.open(filePath, "rb")
            await websocket.send('{ "config" : { "sample_rate" : %d } }' % (wf.getframerate()))
            buffer_size = int(wf.getframerate() * 0.2)  # 0.2 seconds of audio
            while True:
                data = wf.readframes(buffer_size)
                if len(data) == 0:
                    break
                await websocket.send(data)
                last_partial = await websocket.recv()

            await websocket.send('{"eof" : 1}')
            final = await websocket.recv()
        return final, last_partial
    except Exception as e:
        return None, None


def stt_en(wavFile: str):
    if not en_url:
        raise Exception('No STT url server configured')
    result, last_partial = asyncio.run(run_stt(en_url, wavFile))
    return result, last_partial


def stt_fr(wavFile: str):
    if not fr_url:
        raise Exception('No STT url server configured')
    result, last_partial = asyncio.run(run_stt(fr_url, wavFile))
    return result, last_partial

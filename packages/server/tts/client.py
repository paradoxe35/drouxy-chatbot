#!/usr/bin/env python3

import asyncio
import requests
import wave
import env

en_url = 'ws://%s' % env.get_env('TTS_EN_SERVER_PORT')
fr_url = 'ws://%s' % env.get_env('TTS_FR_SERVER_PORT')


async def run_tts(uri: str, text_message: str):
    last_partial = None


def tts_en(text_message: str):
    if not en_url:
        raise Exception('No STT url server configured')
    result, last_partial = asyncio.run(run_tts(en_url, text_message))
    return result, last_partial


def tts_fr(text_message: str):
    if not fr_url:
        raise Exception('No STT url server configured')
    result, last_partial = asyncio.run(run_tts(fr_url, text_message))
    return result, last_partial

#!/usr/bin/env python3

import asyncio
import requests
import wave
import env


EN_VOICE = "en-us/cmu_slt-glow_tts"

FR_VOICE = "fr-fr/siwis-glow_tts"

VOCODER = "hifi_gan/universal_large"

DENOISER_STRENGTH = 0.005

NOISE_SCALE = 0.333

LENGTH_SCALE = 1

defaultEnConfig = {
    "voice": EN_VOICE,
    "vocoder": VOCODER,
    "denoiserStrength": DENOISER_STRENGTH,
    "noiseScale": NOISE_SCALE,
    "lengthScale": LENGTH_SCALE
}

defaultFrConfig = {
    "voice": FR_VOICE,
    "vocoder": VOCODER,
    "denoiserStrength": DENOISER_STRENGTH,
    "noiseScale": NOISE_SCALE,
    "lengthScale": LENGTH_SCALE
}

en_url = 'ws://%s' % env.get_env('TTS_EN_SERVER_PORT')
fr_url = 'ws://%s' % env.get_env('TTS_FR_SERVER_PORT')


async def run_tts(uri: str, text_message: str):
    last_partial = None


def tts_en(text_message: str, config: dict[str] = {}):
    if not en_url:
        raise Exception('No STT url server configured')
    result, last_partial = asyncio.run(run_tts(en_url, text_message))
    return result, last_partial


def tts_fr(text_message: str, config: dict[str] = {}):
    if not fr_url:
        raise Exception('No STT url server configured')
    result, last_partial = asyncio.run(run_tts(fr_url, text_message))
    return result, last_partial

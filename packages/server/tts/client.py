#!/usr/bin/env python3

import asyncio
import sys
import aiohttp
import env
import logging
from urllib.parse import urlencode


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

en_url = 'http://%s' % env.get_env('TTS_EN_SERVER_PORT')
fr_url = 'http://%s' % env.get_env('TTS_FR_SERVER_PORT')


logging.basicConfig(
    format="%(asctime)s %(levelname)s:%(name)s: %(message)s",
    level=logging.DEBUG,
    datefmt="%H:%M:%S",
    stream=sys.stderr,
)

logger = logging.getLogger("tts")
logging.getLogger("chardet.charsetprober").disabled = True


async def fetch(client: aiohttp.ClientSession, url: str):
    async with client.get(url) as resp:
        assert resp.status == 200
        return await resp.content.read()


async def run_tts(url: str, text_message: str, config: dict, lang: str):
    new_config = {
        **(defaultEnConfig if lang == 'en' else defaultFrConfig),
        **config,
        "text": text_message
    }
    url = url + "/api/tts?%s" % urlencode(new_config)

    async with aiohttp.ClientSession() as client:
        error = None
        audio = None
        try:
            audio = await fetch(client, url)
        except (
            aiohttp.ClientError,
            aiohttp.http_exceptions.HttpProcessingError,
        ) as e:
            logger.error(
                "aiohttp exception for %s [%s]: %s",
                url,
                getattr(e, "status", None),
                getattr(e, "message", None),
            )
            error = getattr(e, "message", None)
        except Exception as e:
            logger.exception(
                "Non-aiohttp exception occured:  %s", getattr(
                    e, "__dict__", {})
            )
        return audio, error


def tts_en(text_message: str, config: dict = {}):
    if not en_url:
        raise Exception('No TTS url server configured')
    audio, error = asyncio.run(run_tts(en_url, text_message, config, 'en'))
    return audio, error


def tts_fr(text_message: str, config: dict = {}):
    if not fr_url:
        raise Exception('No TTS url server configured')
    audio, error = asyncio.run(run_tts(fr_url, text_message, config, 'fr'))
    return audio, error

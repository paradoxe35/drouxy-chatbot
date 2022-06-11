import os
import json
import asyncio
import jellyfish
import random


dialog_data: dict = None
dialog_file = '%s/mock/dialogs.json' % os.getcwd()
jaro_distance_limit = 0.3

entities = {
    "author": "Drouxy",
    "language": "undefined",
    "botName": "Drouxy",
    "name": "User Name",
    "geo-city": "Paris",
}


def dictKeys(dict_data: dict):
    return list(dict_data.keys())


def read_json() -> dict:
    global dialog_data
    """
        Reads the dialog data from the json file.
    """
    if dialog_data != None:
        return dialog_data
    with open(dialog_file) as json_file:
        data = json.load(json_file)
        dialog_data = data

    return dialog_data


def text_occorrences(text: str):
    json_data = read_json()
    fallbacks: list = json_data['fallbacks']
    intents: dict = json_data['intents']

    intents_keys = dictKeys(intents)
    random.shuffle(intents_keys)

    last_similar_intent: str = None
    last_similar_probability: float = None

    for key in intents_keys:
        intent = intents[key]
        for exemple in intent['examples']:
            similarity = jellyfish.jaro_distance(
                u"%s" % text.lower(), u"%s" % exemple.lower())
            if last_similar_probability == None and last_similar_intent == None and similarity >= jaro_distance_limit:
                last_similar_intent = key
                last_similar_probability = similarity

            if last_similar_intent != None and similarity > last_similar_probability:
                last_similar_intent = key
                last_similar_probability = similarity

    if last_similar_intent != None:
        return last_similar_intent, last_similar_probability, intents[last_similar_intent]['responses']
    else:
        return None, None, fallbacks


def generate_response(text: str):
    intent, probability, responses = text_occorrences(text)
    try:
        return random.choice(responses)
    except:
        return '😔'


async def bulck_dialog(message: str):
    loop = asyncio.get_event_loop()
    future = loop.run_in_executor(None, generate_response, message)
    return await future


def mock_dialog(message: str):
    data = asyncio.run(bulck_dialog(message))
    return data

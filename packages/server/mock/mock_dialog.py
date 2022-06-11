from email.policy import default
import os
import json
import asyncio
import jellyfish
import random
import emoji

dialog_data = {
    "fr": None,
    "en": None
}

dialog_files = {
    "fr": "%s/mock/dialogs_fr.json" % os.getcwd(),
    "en": "%s/mock/dialogs_en.json" % os.getcwd()
}

jaro_distance_limit = 0.3

default_message_entities = {
    "author": "Paradoxe",
    "language": "undefined",
    "botName": "Drouxy",
    "name": "User Name",
    "geo-city": "Paris",
}


def dictKeys(dict_data: dict):
    return list(dict_data.keys())


def read_json(language: str) -> dict:
    global dialog_data
    """
        Reads the dialog data from the json file.
    """
    if dialog_data[language] != None:
        return dialog_data[language]
    with open(dialog_files[language]) as json_file:
        data = json.load(json_file)
        dialog_data[language] = data

    return dialog_data[language]


def text_occurrences(text: str, language: str):
    json_data = read_json(language)
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


def generate_response(text: str, language: str) -> str:
    intent, probability, responses = text_occurrences(text, language)
    try:
        return random.choice(responses), intent, probability,
    except:
        return '😔', intent, probability


async def bulck_dialog(message: str, message_entities: dict):
    loop = asyncio.get_event_loop()
    language = 'fr' if message_entities['language'] == 'fr' else 'en'
    future_message = await loop.run_in_executor(None, generate_response, message, language)
    is_emoji = False
    if len(future_message) <= 2:
        is_emoji = bool(emoji.get_emoji_regexp().search(future_message))

    # Replace entities with message_entities
    message_entities = {
        **default_message_entities,
        **message_entities
    }
    for key, value in message_entities.items():
        future_message = future_message.replace(f'${key}', value)
    return future_message, is_emoji


def mock_dialog(message: str, message_entities: dict):
    response, is_emoji = asyncio.run(bulck_dialog(message, message_entities))
    return response, is_emoji

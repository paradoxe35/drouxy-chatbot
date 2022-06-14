import os
import json
import asyncio
import jellyfish
import random
import emoji
import env
import wikipedia
import logging
import googlesearch


logging.basicConfig(format='%(asctime)s - %(message)s', level=logging.INFO)


dialog_data = {
    "fr": None,
    "en": None
}

dialog_files = {
    "fr": "%s/mock/dialogs_fr.json" % os.getcwd(),
    "en": "%s/mock/dialogs_en.json" % os.getcwd()
}

search_distance_limit = 0.8  # 0.0 to 1.0

default_message_entities = {
    "author": "Paradoxe",
    "botName": env.get_env('BOT_NAME', 'Zora'),
    "language": "undefined",
    "name": "User Name",
    "geo-city": "Paris",
    "emergency-phone": "0123456789",
}


def dictKeys(dict_data: dict):
    return list(dict_data.keys())


def read_json(user_language: str) -> dict:
    global dialog_data
    """
        Reads the dialog data from the json file.
    """
    if dialog_data[user_language] != None:
        return dialog_data[user_language]
    with open(dialog_files[user_language]) as json_file:
        data = json.load(json_file)
        dialog_data[user_language] = data

    return dialog_data[user_language]


def text_occurrences(text: str, user_language: str):
    json_data = read_json(user_language)
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
            if last_similar_probability == None and last_similar_intent == None and similarity >= search_distance_limit:
                last_similar_intent = key
                last_similar_probability = similarity

            if last_similar_intent != None and similarity > last_similar_probability:
                last_similar_intent = key
                last_similar_probability = similarity

    if last_similar_intent != None:
        responses = intents[last_similar_intent]['responses']
        actions = intents[last_similar_intent]['actions']
        return last_similar_intent, last_similar_probability, responses, actions
    else:
        return None, None, fallbacks, ['fallback']


def generate_response(text: str, user_language: str) -> str:
    intent, probability, responses, actions = text_occurrences(
        text, user_language)
    try:
        return random.choice(responses), intent, probability, actions
    except:
        return '😔', intent, probability, actions


def wikipedia_search(message: str, user_language: str):
    message = message.lower().replace('wikipedia', '')
    if message.strip().startswith('search'):
        message = message.replace('search', '').strip()
    wikipedia.set_lang(user_language)
    try:
        wikipedia_response = wikipedia.summary(message, sentences=1)
        return wikipedia_response
    except:
        return None


def google_search(message: str, user_language: str):
    try:
        google_response = googlesearch.search(
            message,  num_results=1, lang=user_language)
        for key in google_response:
            return key
    except:
        return None


def bulck_search(message: str, user_language: str):
    intro = "Voici ce que j'ai trouvé sur le net: \n" if user_language == "fr" else "Here is what I found on the web: \n"
    wkpd_response = wikipedia_search(message, user_language)
    if wkpd_response != None:
        return intro + wkpd_response, None
    google_res = google_search(message, user_language)
    if google_res != None:
        return intro, """<a href="%s" target="_blank">%s</a>""" % (google_res, google_res)
    return None, None


async def bulck_dialog(message: str, message_entities: dict):
    loop = asyncio.get_event_loop()
    user_language = message_entities['user_language']
    append_response = ""
    future_message, intent, probability, actions = await loop.run_in_executor(None, generate_response, message, user_language)
    is_emoji = False
    if len(future_message) <= 2:
        # is_emoji = bool(emoji.get_emoji_regexp().search(future_message))
        is_emoji = True

    # Replace entities with message_entities
    message_entities = {
        **default_message_entities,
        **message_entities
    }

    # Search on wikipedia
    if len(actions) > 0 and actions[0] == 'fallback':
        search_response, add_response = await loop.run_in_executor(None, bulck_search, message, user_language)
        if search_response != None:
            future_message = search_response
        if add_response != None:
            append_response = add_response

    logging.info('---- actions %s' % actions, '----intent %s' % intent, '---- probability %s' %
                 probability, '---- future_message %s' % future_message)

    for key, value in message_entities.items():
        future_message = future_message.replace(f'${key}', value)
    return future_message, is_emoji, append_response


def mock_dialog(message: str, message_entities: dict):
    response, is_emoji, append_response = asyncio.run(
        bulck_dialog(message.strip(), message_entities))
    return response, is_emoji, append_response

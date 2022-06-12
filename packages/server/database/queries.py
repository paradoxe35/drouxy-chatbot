from .models import User, Message
from pony import orm


def required_keys(datas={}, required=[]):
    for key in required:
        if key not in datas.keys():
            return False
        elif type(datas[key]) is str and len(datas[key].strip()) == 0:
            return False
    return True


@orm.db_session
def check_user_authentication(auth, environ):
    if not required_keys(auth, ['username', 'session_id']):
        return False
    user = User.get(session_id=auth['session_id'])
    if not user:
        return False
    return user


@orm.db_session
def authenticate_user(sid: str, datas: dict):
    if not required_keys(datas, ['username', 'language', 'tts_enabled']):
        return False
    geo_city = datas['geo_city'] if 'geo_city' in datas else 'Paris'

    user = User(
        username=datas['username'],
        tts_enabled=bool(datas['tts_enabled']),
        language='fr' if datas['language'] == 'fr' else 'en',
        geo_city=geo_city
    )

    user.flush()

    return user


@orm.db_session
def logout_user(user_session: dict):
    user = User.get(session_id=user_session['session_id'])
    if user:
        user.disconnected = True
    return True


@orm.db_session
def get_messages(user_session: dict):
    user = User.get(session_id=user_session['session_id'])
    if not user:
        return []
    return user.messages


@orm.db_session
def change_language(user_session: dict, datas: dict):
    if not required_keys(datas, ['language']):
        return False
    user = User.get(session_id=user_session['session_id'])
    if not user:
        return None
    user.language = 'fr' if datas['language'] == 'fr' else 'en'
    return user


@orm.db_session
def add_message(user_session: dict, text: str, from_bot: bool):
    user = User.get(session_id=user_session['session_id'])
    if not user:
        return False
    Message(
        text=text,
        from_bot=from_bot,
        customer=user
    )
    return True

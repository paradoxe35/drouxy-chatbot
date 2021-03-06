import eventlet
import socketio
import logging
import env
import wave
import tempfile
from database.connector import startup_database
from stt.client import stt_en, stt_fr
from tts.client import tts_en, tts_fr
from database import queries
# mock_dialog
from mock.mock_dialog import mock_dialog


logging.basicConfig(format='%(asctime)s - %(message)s', level=logging.INFO)


# get allowed origins from env.py and parse it to a list
cors_allowed_origins = list(env.get_env('ALLOWED_ORIGINS').split(','))

sio = socketio.Server(async_mode='eventlet',
                      cors_allowed_origins=cors_allowed_origins)
app = socketio.WSGIApp(sio, static_files=None)


def bot_response(sid: str, message: str, user_session: dict, default_message=False):
    """
    Generate a response from the bot.
    """
    user_language = user_session['language']
    message_entities = {
        "language": "Français" if user_language == 'fr' else "English",
        "user_language": user_language,
        "name": user_session['username'],
        "geo-city": user_session['geo_city'],
    }
    # get the response from the bot
    bot_response, is_emoji, append_response = mock_dialog(
        message, message_entities)
    text_bot_response = bot_response + append_response

    if user_session['tts_enabled'] == True and is_emoji == False:
        audio_byte, err = tts_fr(
            bot_response) if user_language == 'fr' else tts_en(bot_response)
        if audio_byte:
            sio.emit('tts_bot_response', {
                     'audio': audio_byte, "message": text_bot_response}, to=sid)
        else:
            sio.emit('bot_response', {"message": text_bot_response}, to=sid)
    else:
        sio.emit('bot_response', {'message': text_bot_response}, to=sid)

    if default_message == False:
        # Save message on the database from the user
        queries.add_message(user_session, message, False)
    # Save message on the database from the bot
    queries.add_message(user_session, text_bot_response, True)


@sio.event
def connect(sid, environ, auth):
    user_session = queries.check_user_authentication(auth, environ)
    if not user_session:
        sio.emit('authentication_failed', to=sid)
    else:
        with sio.session(sid) as session:
            session['user_session'] = user_session
            sio.emit('authenticated', user_session, to=sid)
    logging.info('connect ------------', sid)


@sio.on('login_session')
def login_session(sid, data):
    with sio.session(sid) as session:
        user_session = queries.authenticate_user(sid, data)
        if not user_session:
            sio.emit('authentication_failed', to=sid)
            return False
        session['user_session'] = user_session
        sio.emit('authenticated', {**user_session,
                 "first_connect": True}, to=sid)
        # send the welcome message
        default_message = "Salut" if user_session['language'] == 'fr' else "Hello"
        bot_response(sid, default_message, user_session, True)


@sio.on('logout_session')
def disconnect_session(sid):
    with sio.session(sid) as session:
        if 'user_session' in session:
            queries.logout_user(session['user_session'])
            del session['user_session']
            sio.emit('logout_session', to=sid)


@sio.on('messages')
def messages(sid):
    with sio.session(sid) as session:
        if 'user_session' not in session:
            return
        user_session = session['user_session']
        messages = queries.get_messages(user_session)
        sio.emit('messages', {'messages': messages}, to=sid)


@sio.on('change_language')
def change_language(sid, data):
    with sio.session(sid) as session:
        if 'user_session' not in session:
            return False
        new_user = queries.change_language(session['user_session'], data)
        if new_user:
            session['user_session'] = new_user
        sio.emit('authenticated', new_user, to=sid)


@sio.on('tts_enabled')
def tts_enabled(sid, data):
    with sio.session(sid) as session:
        if 'user_session' not in session:
            return False
        new_user = queries.tts_enabled(session['user_session'], data)
        if new_user:
            session['user_session'] = new_user
        sio.emit('authenticated', new_user, to=sid)


@sio.on('user_message')
def user_message(sid, data):
    with sio.session(sid) as session:
        if 'user_session' not in session:
            return
        user_session = session['user_session']
        # Process bot response in a separate thread
        bot_response(sid, data['text'], user_session)


@sio.on('user_recording_stt')
def user_recording_stt(sid, data):
    with sio.session(sid) as session:
        if 'user_session' not in session:
            return
        user_session = session['user_session']
        try:
            with tempfile.NamedTemporaryFile() as tmpfile:
                with wave.open(tmpfile.name, 'wb') as wavf:
                    wavf.setsampwidth(2)
                    wavf.setnchannels(data['numChannels'])
                    wavf.setframerate(data['sampleRate'])
                    wavf.writeframes(data['blob'])
                if user_session['language'] == 'fr':
                    result, last_partial = stt_fr(tmpfile.name)
                else:
                    result, last_partial = stt_en(tmpfile.name)
                data = {
                    'error': 0,
                    'final': result,
                    'last_partial': last_partial
                }
                if not result:
                    data['error'] = 1
                # send the stt result to the client
                sio.emit('stt_live_message', data, to=sid)

        except Exception as e:
            data = {
                'error': 1,
                'final': None,
                'last_partial': None
            }
            sio.emit('stt_live_message', data, to=sid)


@sio.event
def disconnect(sid):
    logging.info('disconnect ---------------', sid)


# run app
if __name__ == '__main__':
    # startup_database
    startup_database()
    #  Start the socketio server
    port = int(env.get_env('SERVER_PORT'))
    eventlet.wsgi.server(eventlet.listen(('', port)), app)

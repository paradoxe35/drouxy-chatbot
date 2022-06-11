import eventlet
import socketio
import env
import wave
import tempfile
from stt.client import stt_en, stt_fr
from tts.client import tts_en, tts_fr
from database import queries
# mock_dialog
from mock.mock_dialog import mock_dialog
from concurrent.futures import ThreadPoolExecutor


executor = ThreadPoolExecutor(max_workers=4)

# get allowed origins from env.py and parse it to a list
cors_allowed_origins = list(env.get_env('ALLOWED_ORIGINS').split(','))

sio = socketio.Server(async_mode='eventlet',
                      cors_allowed_origins=cors_allowed_origins)
app = socketio.WSGIApp(sio, static_files=None)


def bot_response(sid, message: str, user_session: dict):
    global sio
    """
    Generate a response from the bot.
    """
    user_language = user_session['language']
    message_entities = {
        "language": "Français" if user_language == 'fr' else "English",
        "name": user_session['username'],
        "geo-city": user_session['geo_city'],
    }
    # get the response from the bot
    response, is_emoji = mock_dialog(message, message_entities)

    if user_session['tts_enabled'] == True and is_emoji == False:
        audio_byte, err = tts_fr(
            response) if user_language == 'fr' else tts_en(response)
        if audio_byte:
            sio.emit('tts_bot_response', {
                     'audio': audio_byte, "text": response}, to=sid)
    else:
        sio.emit('bot_response', {'message': response}, to=sid)


@sio.event
def connect(sid, environ, auth):
    user_session = queries.authenticate_user(auth, environ)
    if not user_session:
        sio.emit('authentication_failed', room=sid)
        return False
    with sio.session(sid) as session:
        session['user_session'] = user_session
        sio.emit('authenticated', {**user_session,
                 "fist_connect": False}, to=sid)
    print('connect ------------', sid)


@sio.on('connect_session')
def connect_session(sid, data):
    with sio.session(sid) as session:
        user_session = queries.authenticate_user(data)
        if not user_session:
            sio.emit('authentication_failed', room=sid)
            return False
        session['user_session'] = user_session
        sio.emit('authenticated', {**user_session,
                 "fist_connect": True}, to=sid)


@sio.on('disconnect_session')
def disconnect_session(sid):
    with sio.session(sid) as session:
        if 'user_session' in session:
            queries.logout_user(session['user_session'])


@sio.on('user_message')
def user_message(sid, data):
    with sio.session(sid) as session:
        user_session = session['user_session']
        # Process bot response in a separate thread
        executor.submit(bot_response, sid, data['text'], user_session)
        executor.shutdown(wait=False)


@sio.on('user_message_stt')
def user_message_stt(sid, data):
    with sio.session(sid) as session:
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
                # Process bot response in a separate thread
                executor.submit(bot_response, sid,
                                result['text'], user_session)
                executor.shutdown(wait=False)
                # send the stt result to the client
                sio.emit('live-message', data, to=sid)
        except Exception as e:
            data = {
                'error': 1,
                'final': None,
                'last_partial': None
            }
            sio.emit('live-message', data, to=sid)


@sio.event
def disconnect(sid):
    print('disconnect ---------------', sid)


# run app
if __name__ == '__main__':
    port = int(env.get_env('SERVER_PORT'))
    eventlet.wsgi.server(eventlet.listen(('', port)), app)

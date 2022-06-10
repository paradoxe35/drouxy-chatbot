
import eventlet
import socketio
import env
import wave
from stt.client import stt_en
import tempfile


# get allowed origins from env.py and parse it to a list
cors_allowed_origins = list(env.get_env('ALLOWED_ORIGINS').split(','))

sio = socketio.Server(async_mode='eventlet',
                      cors_allowed_origins=cors_allowed_origins)
app = socketio.WSGIApp(sio, static_files=None)


@sio.event
def connect(sid, environ):
    print('connect ', sid)


@sio.on('recording')
def recording(sid, data):
    try:
        with tempfile.NamedTemporaryFile() as tmpfile:
            with wave.open(tmpfile.name, 'wb') as wavf:
                wavf.setsampwidth(2)
                wavf.setnchannels(data['numChannels'])
                wavf.setframerate(data['sampleRate'])
                wavf.writeframes(data['blob'])
            result, last_partial = stt_en(tmpfile.name)
            data = {
                'error': 0,
                'final': result,
                'last_partial': last_partial
            }
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
    print('disconnect ', sid)


# run app
if __name__ == '__main__':
    port = int(env.get_env('SERVER_PORT'))
    eventlet.wsgi.server(eventlet.listen(('', port)), app)
    print('Server started on port {}'.format(port))

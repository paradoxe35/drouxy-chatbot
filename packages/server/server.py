
import eventlet
import socketio
import env
import wave


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
    with wave.open('demo.wav', 'wb') as f:
        f.setsampwidth(2)
        f.setnchannels(data['numChannels'])
        f.setframerate(data['sampleRate'])
        f.writeframes(data['blob'])
    print('message ', data['sampleRate'])


@sio.event
def disconnect(sid):
    print('disconnect ', sid)


# run app
if __name__ == '__main__':
    port = int(env.get_env('SERVER_PORT'))
    eventlet.wsgi.server(eventlet.listen(('', port)), app)
    print('Server started on port {}'.format(port))


import eventlet
import socketio
import env

sio = socketio.Server(async_mode='eventlet')
app = socketio.WSGIApp(sio, static_files=None)


@sio.event
def connect(sid, environ):
    print('connect ', sid)


@sio.on('recording')
def recording(sid, data):
    print('message ', data)


@sio.event
def disconnect(sid):
    print('disconnect ', sid)


# run app
if __name__ == '__main__':
    port = int(env.get_env('SERVER_PORT'))
    eventlet.wsgi.server(eventlet.listen(('', port)), app)
    print('Server started on port {}'.format(port))

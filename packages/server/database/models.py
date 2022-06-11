import datetime
import connector
from pony import orm


class User(connector.db.Entity):
    username = orm.Required(str)
    session_id = orm.Required(str)
    language = orm.Required(str)
    disconnected = orm.Required(bool)
    geo_city = orm.Required(str, default='Paris')
    tts_enabled = orm.Required(bool, default=True)
    created_at = orm.Required(datetime, default=datetime.datetime.now())
    messages = orm.Set(lambda: Message)


class Message(connector.db.Entity):
    message = orm.Required(str)
    from_bot = orm.Required(bool)
    timestamp = orm.Required(datetime, default=datetime.datetime.now())
    customer = orm.Required(User)

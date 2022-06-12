import datetime
import connector
from pony import orm
import uuid


class User(connector.db.Entity):
    session_id = orm.Required(uuid.UUID, default=uuid.uuid4)
    username = orm.Required(str)
    language = orm.Required(str)
    disconnected = orm.Required(bool, default=False)
    geo_city = orm.Required(str, default='Paris')
    tts_enabled = orm.Required(bool, default=True)
    created_at = orm.Required(datetime, sql_default='CURRENT_TIMESTAMP')
    messages = orm.Set(lambda: Message, cascade_delete=True)


class Message(connector.db.Entity):
    id = orm.PrimaryKey(int, auto=True)
    text = orm.Required(str)
    from_bot = orm.Required(bool)
    timestamp = orm.Required(datetime, sql_default='CURRENT_TIMESTAMP')
    customer = orm.Required(User)

import connector
from pony import orm


class Message(connector.db.Entity):
    name = orm.Required(str)
    age = orm.Required(int)
    cars = orm.Set('Car')

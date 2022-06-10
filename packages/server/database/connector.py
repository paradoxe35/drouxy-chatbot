from pony import orm

db = orm.Database()
db.bind(provider='sqlite', filename=':sharedmemory:')
db.generate_mapping(create_tables=True)

import os
from dotenv import load_dotenv

load_dotenv('.env')
load_dotenv('.env.local')


def get_env(name: str, default=None):
    return os.environ.get(name, default)

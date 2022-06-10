import os
from dotenv import load_dotenv

load_dotenv()


def get_env(name: str, default=None):
    return os.environ.get(name, default)

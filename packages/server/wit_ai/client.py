import logging
from wit import Wit
import env

client_fr = Wit(env.get_env('WIT_AI_FR_ACCESS_TOKEN'))
client_en = Wit(env.get_env('WIT_AI_EN_ACCESS_TOKEN'))

client_fr.logger.setLevel(logging.WARNING)
client_en.logger.setLevel(logging.WARNING)

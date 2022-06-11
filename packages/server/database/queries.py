import connector


@connector.db.db_session
def check_user_authentication(auth, environ):
    # username, session_id, tts_enabled, language
    return None


@connector.db.db_session
def authenticate_user(auth):
    return None

export type IUserMessageSTT = {
  sampleRate?: number;
  blob: Blob;
  numChannels: number;
  mimeType: string;
};

export type SpeechTextResult = {
  result: {
    conf: number;
    end: number;
    start: number;
    word: string;
  };
  text: string;
};

export type ILiveMessage = {
  error: 0 | 1;
  final: SpeechTextResult;
  last_partial: { partial: string };
};

export type IUserSessionEmit = {
  username: string;
  language: string;
  geo_city?: string;
  tts_enabled: boolean | number;
};

export type IAuthenticatedUser = {
  session_id: string;
  username: string;
  language: string;
  geo_city: string;
  tts_enabled: boolean;
  created_at: string;
};

export type IAuthenticatedEvent = {
  first_connect?: boolean;
} & IAuthenticatedUser;

export type IMessage = {
  from_user: boolean;
  text: string;
  timestamp?: string;
  id?: string;
};

export type BotResponseEvent = {
  text: string;
  audio?: BlobPart;
};

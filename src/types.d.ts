export type IRecordedDto = {
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

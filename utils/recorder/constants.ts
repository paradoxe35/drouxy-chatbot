export const audio_options = {
  sampleRate: 16000,
};

export const mediaStreamConstraints: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    channelCount: 1,
    sampleRate: audio_options.sampleRate,
  },
  video: false,
};

export const defaultMicrophoneConfig = {
  bufferLen: 4096,
  numChannels: 1,
  mimeType: "audio/wav",
};

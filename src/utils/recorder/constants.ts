export const audio_options = {
  sampleRate: 16000,
};

export const EXPORT_MIME_TYPE = "audio/wav";

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
  mimeType: EXPORT_MIME_TYPE,
};

export const noiseCaptureConfig = {
  min_decibels: -40, // Noise detection sensitivity
  max_blank_time: 1000, // Maximum time to consider a blank (ms)
};

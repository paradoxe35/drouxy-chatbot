export = Recorder;

declare class Recorder {
  constructor(audioContext: AudioContext, config?: Recorder.RecorderConfig);
  static download(blob: Blob, filename: string): void;
  audioRecorder: { recording: boolean } | null;
  init(stream: MediaStream): Promise<void>;
  start(): Promise<MediaStream | undefined>;
  stop(): Promise<Recorder.RecorderResult>;
}

declare namespace Recorder {
  type OnAnalysedHandler = (data: number[], lastNonZero: number) => void;

  interface RecorderConfig {
    onAnalysed?: OnAnalysedHandler | undefined;
  }

  interface RecorderResult {
    blob: Blob;
    buffer: Float32Array[];
    sampleRate?: number;
  }
}

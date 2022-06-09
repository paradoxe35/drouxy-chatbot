export = IRecorder;

declare class IRecorder {
  constructor(audioContext: AudioContext, config?: IRecorder.RecorderConfig);
  static download(blob: Blob, filename: string): void;
  audioRecorder: { recording: boolean } | null;
  init(stream: MediaStream): Promise<void>;
  start(): Promise<MediaStream | undefined>;
  stop(): Promise<IRecorder.RecorderResult>;
}

declare namespace IRecorder {
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

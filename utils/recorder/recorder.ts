import type IRecorder from "./index.d";
import Microphone from "./microphone";

const defaultConfig = {
  nFrequencyBars: 255,
  onAnalysed: null,
};

class Recorder implements IRecorder {
  config: { nFrequencyBars: number; onAnalysed: any };
  static download: (blob: any, filename?: string) => void;
  audioContext: any;
  audioInput: any;
  realAudioInput: any;
  inputPoint: any;
  audioRecorder: Microphone;
  rafID: any;
  analyserContext: any;
  recIndex: number;
  stream: MediaStream;
  analyserNode: any;
  private cancelRequestAnimationFrame: number;

  constructor(
    audioContext: AudioContext,
    config?: Omit<typeof defaultConfig, "onAnalysed">
  ) {
    this.config = Object.assign({}, defaultConfig, config || {});

    this.audioContext = audioContext;
    this.audioInput = null;
    this.realAudioInput = null;
    this.inputPoint = null;
    this.audioRecorder = null;
    this.rafID = null;
    this.analyserContext = null;
    this.recIndex = 0;
    this.stream = null;

    this.updateAnalysers = this.updateAnalysers.bind(this);
  }

  init(stream: MediaStream) {
    return new Promise<void>((resolve) => {
      this.inputPoint = this.audioContext.createGain();

      this.stream = stream;

      this.realAudioInput = this.audioContext.createMediaStreamSource(stream);
      this.audioInput = this.realAudioInput;
      this.audioInput.connect(this.inputPoint);

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.inputPoint.connect(this.analyserNode);

      this.audioRecorder = new Microphone(this.inputPoint);

      const zeroGain = this.audioContext.createGain();
      zeroGain.gain.value = 0.0;

      this.inputPoint.connect(zeroGain);
      zeroGain.connect(this.audioContext.destination);

      this.updateAnalysers();

      resolve();
    });
  }

  start() {
    return new Promise<MediaStream>((resolve, reject) => {
      if (!this.audioRecorder) {
        reject("Not currently recording");
        return;
      }

      this.audioRecorder.clear();
      this.audioRecorder.record();

      resolve(this.stream);
    });
  }

  stop() {
    return new Promise<IRecorder.RecorderResult>((resolve) => {
      this.audioRecorder.stop();

      this.audioRecorder.getBuffer((buffer, sampleRate) => {
        this.audioRecorder.exportWAV(
          (blob) => resolve({ buffer, blob, sampleRate }),
          "audio/wav"
        );
      });
    });
  }

  updateAnalysers() {
    if (this.config.onAnalysed) {
      this.cancelRequestAnimationFrame = requestAnimationFrame(
        this.updateAnalysers
      );

      const freqByteData = new Uint8Array(this.analyserNode.frequencyBinCount);

      this.analyserNode.getByteFrequencyData(freqByteData);

      const data = new Array(255);
      let lastNonZero = 0;
      let datum;

      for (let idx = 0; idx < 255; idx += 1) {
        datum =
          Math.floor(freqByteData[idx]) - (Math.floor(freqByteData[idx]) % 5);

        if (datum !== 0) {
          lastNonZero = idx;
        }

        data[idx] = datum;
      }

      this.config.onAnalysed({ data, lineTo: lastNonZero });
    } else if (this.cancelRequestAnimationFrame && this.config.onAnalysed) {
      cancelAnimationFrame(this.cancelRequestAnimationFrame);
    }
  }

  setOnAnalysed(handler) {
    this.config.onAnalysed = handler;
  }
}

Recorder.download = (blob, filename = "audio") => {
  Microphone.forceDownload(blob, `${filename}.wav`);
};

export default Recorder;

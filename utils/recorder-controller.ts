import Recorder from "./recorder";
import { audio_options, mediaStreamConstraints } from "./recorder/constants";

type IAnalysed = { data: number[]; lineTo: number };
type IOnAnalysed = (datas: IAnalysed) => void;

export default class RecorderController {
  private static audioContext: AudioContext;

  private static recorder: Recorder;

  private static mediaStream: MediaStream;

  private static started_recording_time: number;

  private static onRecordedCallbacks: Array<(blob: Blob) => void> = [];

  private static _onAnalysed: IOnAnalysed;

  /**
   * This must be called before any other method and only once.
   */
  static init() {
    if (this.audioContext) {
      throw new Error("RecorderController.init() must be called only once.");
    }
    this.audioContext = new AudioContext(audio_options);

    // This is a workaround for a bug in Safari.
    // See: https://bugs.webkit.org/show_bug.cgi?id=153693
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
    this.recorder = new Recorder(this.audioContext);

    this._updateAnalysers = this._updateAnalysers.bind(this);
  }

  static onRecorded(callback: (blob: Blob) => void) {
    this.onRecordedCallbacks.push(callback);
  }

  static onAnalysed(handler: IOnAnalysed) {
    this._onAnalysed = handler;
  }

  /**
   * Request the user to enable the microphone and init the recorder stream
   */
  static async getUserMedia() {
    if (!this.audioContext) return;
    if (this.mediaStream) return this.mediaStream;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints
      );
    } catch (e) {
      console.error(e);
      return null;
    }

    await this.audioContext.resume();

    // initialize the recording process
    this.recorder.init(this.mediaStream);

    return this.mediaStream;
  }

  private static _updateAnalysers(datas: IAnalysed) {
    if (this._onAnalysed) {
      this._onAnalysed(datas);
    }
  }

  static async startRecording() {
    this.recorder.setOnAnalysed(this._updateAnalysers);
    this.recorder.updateAnalysers();

    await this.recorder.start();
    this.started_recording_time = Date.now();
  }

  static async stopRecording() {
    if (!this.recorder.audioRecorder.recording) return;
    this.recorder.setOnAnalysed(null);
    const recordResult = await this.recorder.stop();
    this.started_recording_time = 0;
    this.onRecordedCallbacks.forEach((callback) => callback(recordResult.blob));
  }

  static async sequentialize() {}
}

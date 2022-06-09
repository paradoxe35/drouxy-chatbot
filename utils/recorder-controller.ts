import type IRecorder from "./recorder/index.d";
import Recorder from "./recorder";
import {
  audio_options,
  EXPORT_MIME_TYPE,
  mediaStreamConstraints,
  noiseCaptureConfig,
} from "./recorder/constants";

import { concatenateBlobs } from "./concatenate-blobs";

type IAnalysed = { data: number[]; lineTo: number };
type IOnAnalysed = (datas: IAnalysed) => void;
type sequentializeCallback = (data: IRecorder.RecorderResult) => void;

export default class RecorderController {
  private static audioContext: AudioContext;

  private static recorder: Recorder;

  private static mediaStream: MediaStream;

  private static started_recording_time: number;

  private static onRecordedCallbacks: Array<(blob: Blob) => void> = [];

  private static _onAnalysed: IOnAnalysed;

  private static sequentializerAnalyser?: {
    analyser: AnalyserNode;
    data: Uint8Array;
  };

  private static _onSequentialize: sequentializeCallback;

  private static canSequentialize: boolean = false;

  private static sequentializeBlobs: Blob[] = [];

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
  /**
   * Request the user to enable the microphone and init the recorder stream
   */
  static async getUserMedia() {
    if (!this.audioContext) return;
    // this must be called only once
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

    // initialize the sequentializer
    this.initSequentializer();

    return this.mediaStream;
  }

  private static initSequentializer() {
    const analyser = this.audioContext.createAnalyser();
    const streamNode = this.audioContext.createMediaStreamSource(
      this.mediaStream
    );
    streamNode.connect(analyser);
    analyser.minDecibels = noiseCaptureConfig.min_decibels;

    this.sequentializerAnalyser = {
      analyser,
      data: new Uint8Array(analyser.frequencyBinCount),
    };
  }

  static onRecorded(callback: (blob: Blob) => void) {
    this.onRecordedCallbacks.push(callback);
  }

  static onAnalysed(handler: IOnAnalysed) {
    this._onAnalysed = handler;
  }

  /**
   * Callback called only when a noise is detected,
   * NB: After the recording is stopped
   * the onRecorded callback is called with the concatenated blobs from the sequentializer
   */
  static onSequentialize(callback: sequentializeCallback) {
    this._onSequentialize = callback;
  }

  static exportSequentializerBlobs() {
    if (!this._onSequentialize) return null;
    return new Promise<Blob>((resolve) => {
      concatenateBlobs(this.sequentializeBlobs, EXPORT_MIME_TYPE, resolve);
    });
  }

  static async startSequentializer() {
    const { analyser } = this.sequentializerAnalyser!;
    const data = new Uint8Array(analyser.frequencyBinCount);
    let silenceStart = Date.now();
    let triggered = false;
    this.canSequentialize = true;

    const loop = async (time: number) => {
      if (!this.canSequentialize) return;
      requestAnimationFrame(loop);

      analyser.getByteFrequencyData(data);

      if (data.some((v) => v)) {
        if (triggered) {
          triggered = false;
          // noise detected
        }
        silenceStart = time;
      }

      if (
        !triggered &&
        time - silenceStart > noiseCaptureConfig.max_blank_time
      ) {
        // no noise detected
        triggered = true;
        if (this._onSequentialize) {
          const audioData = await this.recorder.export();
          this.sequentializeBlobs.push(audioData.blob);
          // clear all buffer
          this.recorder.audioRecorder.clear();
          this._onSequentialize(audioData);
        }
      }
    };
    requestAnimationFrame(loop);
  }

  static async stopSequentializer() {
    this.canSequentialize = false;
  }

  private static _updateAnalysers(datas: IAnalysed) {
    if (this._onAnalysed) {
      this._onAnalysed(datas);
    }
  }

  static async startRecording() {
    // set the analyser callback and start the Analysers auto update
    this.recorder.setOnAnalysed(this._updateAnalysers);
    this.recorder.updateAnalysers();
    // start the sequentializer
    this.startSequentializer();
    // start the recorder
    await this.recorder.start();
    this.started_recording_time = Date.now();
  }

  static async stopRecording() {
    if (!this.recorder.audioRecorder?.recording) return;
    // make some clean up
    this.recorder.setOnAnalysed(null);
    // get all sequentializer blobs and stop the sequentializer
    await new Promise((resolve) => setTimeout(resolve, 500));
    const blobSequentializer = await this.exportSequentializerBlobs();
    this.stopSequentializer();

    // stop the recorder
    const recordResult = await this.recorder.stop();
    this.started_recording_time = 0;

    // call the callbacks
    this.onRecordedCallbacks.forEach((callback) => {
      callback(blobSequentializer || recordResult.blob);
    });
  }

  static async download(blob: Blob) {
    Recorder.download(blob);
  }
}

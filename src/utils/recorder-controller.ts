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

  private static onRecordingEndCallbacks: Array<
    (data: IRecorder.RecorderResult) => void
  > = [];

  private static onRecordingStartCallbacks: Array<() => void> = [];

  private static _onAnalysed: IOnAnalysed;

  private static sequentializerAnalyser?: {
    analyser: AnalyserNode;
    data: Uint8Array;
  };

  private static _onSequentializeCallback: sequentializeCallback[] = [];

  private static canSequentialize: boolean = false;

  private static sequentializeBlobs: IRecorder.RecorderResult[] = [];

  private static sequentializerStatus: SequentializerStatus;

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

    this.sequentializerStatus = new SequentializerStatus();
  }

  static onRecordingEnd(callback: (blob: IRecorder.RecorderResult) => void) {
    this.onRecordingEndCallbacks.push(callback);
  }

  static onRecordingStart(callback: () => void) {
    this.onRecordingStartCallbacks.push(callback);
  }

  static onAnalysed(handler: IOnAnalysed) {
    this._onAnalysed = handler;
  }

  private static _updateAnalysers(datas: IAnalysed) {
    if (this._onAnalysed && this.recorder.audioRecorder?.recording) {
      this._onAnalysed(datas);
    }
  }

  /**
   * Callback called only when a noise is detected,
   * NB: After the recording is stopped
   * the onRecordingEnd callback is called with the concatenated blobs from the sequentializer
   */
  static onSequentialize(callback: sequentializeCallback) {
    this._onSequentializeCallback.push(callback);
  }

  /**
   * Concatenate all the chuncks blobs from the sequentializer and export it
   */
  static async exportSequentializerBlobs() {
    if (
      !this._onSequentializeCallback.length ||
      this.sequentializeBlobs.length === 0
    ) {
      return null;
    }
    return new Promise<IRecorder.RecorderResult>((resolve) => {
      concatenateBlobs(
        this.sequentializeBlobs.map(({ blob }) => blob),
        EXPORT_MIME_TYPE,
        (blob) =>
          resolve({
            blob,
            sampleRate: this.sequentializeBlobs[0].sampleRate,
            buffer: [],
          })
      );
    });
  }

  /**
   * start sequentializer loop
   */
  static async startSequentializer() {
    const { analyser } = this.sequentializerAnalyser!;
    const data = new Uint8Array(analyser.frequencyBinCount);
    let silenceStart = Date.now();
    let triggered = false;
    this.canSequentialize = true;

    const loop = async (time: number) => {
      if (!this.canSequentialize || !this.recorder.audioRecorder?.recording)
        return;
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
        if (this._onSequentializeCallback.length > 0) {
          // eanable pending the exportation
          this.sequentializerStatus.enableInPending();

          const audioData = await this.recorder.export();
          this.sequentializeBlobs.push(audioData);
          // disable pending the exportation
          this.sequentializerStatus.disableInPending();
          // clear all buffer from the recorder
          this.recorder.audioRecorder.clear();

          this._onSequentializeCallback.forEach((callback) =>
            callback(audioData)
          );
        }
      }
    };
    requestAnimationFrame(loop);
  }

  /**
   * Stop the sequentializer loop
   */
  static async stopSequentializer() {
    this.canSequentialize = false;
  }

  /**
   * Start the recording
   *
   * @returns
   */
  static async startRecording() {
    await this.audioContext.resume();
    // set the analyser callback and start the Analysers auto update
    this.recorder.setOnAnalysed(this._updateAnalysers);
    this.recorder.updateAnalysers();
    // start the sequentializer
    this.startSequentializer();
    // start the recorder
    await this.recorder.start();

    this.onRecordingStartCallbacks.forEach((callback) => callback());
  }

  /**
   * Stop the recording
   *
   * @returns
   */
  static async stopRecording() {
    // make some clean up
    this.recorder.setOnAnalysed(null);

    if (!this.recorder.audioRecorder?.recording) return;
    // get all sequentializer blobs and stop the sequentializer
    await this.sequentializerStatus.canExport();
    const blobSequentializer = await this.exportSequentializerBlobs();
    this.stopSequentializer();

    // stop the recorder
    const recordResult = await this.recorder.stop();

    // call the callbacks
    this.onRecordingEndCallbacks.forEach((callback) => {
      if (blobSequentializer) {
        blobSequentializer.lastSequence = recordResult.blob;
      }
      callback(blobSequentializer || recordResult);
    });
  }

  static async download(blob: Blob) {
    Recorder.download(blob);
  }
}

class SequentializerStatus {
  private pendingSequentializer: boolean = false;
  private eventTarget: EventTarget;
  private eventName = "disable-pending-sequentializer";

  constructor() {
    this.eventTarget = new EventTarget();
  }

  enableInPending() {
    this.pendingSequentializer = true;
  }

  disableInPending() {
    this.pendingSequentializer = false;
    this.eventTarget.dispatchEvent(new Event(this.eventName));
  }

  async canExport() {
    return new Promise<any>((resolve) => {
      if (this.pendingSequentializer === false) {
        resolve(true);
      } else {
        this.eventTarget.addEventListener(this.eventName, resolve, {
          once: true,
        });
      }
    });
  }
}

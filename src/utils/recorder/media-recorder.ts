/**
 * -------------------------------------------------------------------------
 * For later use (Late improvement)
 * -------------------------------------------------------------------------
 */
import { MediaRecorder, register } from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";
import { EXPORT_MIME_TYPE, SAMPLE_RATE } from "./constants";

async function mediaRecoderInit(stream: MediaStream) {
  await register(await connect());

  const mediaRecoder = new MediaRecorder(stream, {
    mimeType: EXPORT_MIME_TYPE,
    audioBitsPerSecond: SAMPLE_RATE,
  });

  return mediaRecoder;
}

export default mediaRecoderInit;

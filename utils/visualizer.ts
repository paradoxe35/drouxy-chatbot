/**
 *
 * @param {MediaStream} stream
 * @param {AudioContext} audioCtx
 */
export function visualize(stream: MediaStream, audioCtx: AudioContext) {
  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  requestAnimationFrame(draw);

  function draw() {
    const HEIGHT = 6;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;
    }
  }
}

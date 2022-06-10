export function concatenateBlobs(
  blobs: Blob[],
  type = "audio/wav",
  callback: (blob: Blob) => void
) {
  const buffers = [];

  let index = 0;

  function readAsArrayBuffer() {
    if (!blobs[index]) {
      return concatenateBuffers();
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      buffers.push(event.target.result);
      index++;
      readAsArrayBuffer();
    };
    reader.readAsArrayBuffer(blobs[index]);
  }

  readAsArrayBuffer();

  function audioLengthTo32Bit(n) {
    n = Math.floor(n);
    const b1 = n & 255;
    const b2 = (n >> 8) & 255;
    const b3 = (n >> 16) & 255;
    const b4 = (n >> 24) & 255;

    return [b1, b2, b3, b4];
  }

  function concatenateBuffers() {
    let byteLength = 0;
    buffers.forEach(function (buffer) {
      byteLength += buffer.byteLength;
    });

    const tmp = new Uint8Array(byteLength);
    let lastOffset = 0;
    let newData;
    buffers.forEach(function (buffer) {
      if (type == "audio/wav" && lastOffset > 0)
        newData = new Uint8Array(buffer, 44);
      else newData = new Uint8Array(buffer);
      tmp.set(newData, lastOffset);
      lastOffset += newData.length;
    });
    if (type == "audio/wav") {
      tmp.set(audioLengthTo32Bit(lastOffset - 8), 4);
      tmp.set(audioLengthTo32Bit(lastOffset - 44), 40); // update audio length in the header
    }
    const blob = new Blob([tmp.buffer], {
      type: type,
    });
    callback(blob);
  }
}

const WORKER_ENABLED = !!(window.URL && window.Blob && window.Worker);

function InlineWorker(this: any, func, self) {
  const _this = this;
  let functionBody;

  self = self || {};

  if (WORKER_ENABLED) {
    functionBody = func
      .toString()
      .trim()
      .match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/)[1];

    return new Worker(
      URL.createObjectURL(new Blob([functionBody], { type: "text/javascript" }))
    );
  }

  function postMessage(data) {
    setTimeout(function () {
      _this.onmessage({ data: data });
    }, 0);
  }

  this.self = self;
  this.self.postMessage = postMessage;

  setTimeout(func.bind(self, self), 0);

  return;
}

InlineWorker.prototype.postMessage = function postMessage(data) {
  const _this = this;
  setTimeout(function () {
    _this.self.onmessage({ data: data });
  }, 0);
};

declare class InlineWorkerClass {
  constructor(func, self);
  postMessage(data);
}

export default InlineWorker as unknown as typeof InlineWorkerClass;

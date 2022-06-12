export function swimrotate(
  _node: Node,
  { delay = 0, duration = 200, right = false }
) {
  return {
    delay,
    duration,
    css: (t) => {
      const rotation = t * 0.05 - 0.05;
      const scale = Math.min(t + 0.2, 1);
      return `
        transform-origin: ${right ? "bottom right" : "top left"};
        transform: scale(${scale}) rotate(${
        right ? rotation : Math.abs(rotation)
      }turn);`;
    },
  };
}

export function typewriter(node: Node, { speed = 1 }) {
  const valid =
    node.childNodes.length === 1 &&
    node.childNodes[0].nodeType === Node.TEXT_NODE;

  if (!valid) {
    throw new Error(
      `This transition only works on elements with a single text node child`
    );
  }

  const text = node.textContent;
  const duration = text!.length / (speed * 0.01);

  return {
    duration,
    tick: (t) => {
      const i = Math.trunc(text!.length * t);
      node.textContent = text!.slice(0, i);
    },
  };
}

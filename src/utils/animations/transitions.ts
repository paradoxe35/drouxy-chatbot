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

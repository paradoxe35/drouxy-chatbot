export default function wait(ms: number = 1000) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

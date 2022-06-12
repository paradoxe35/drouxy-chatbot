export type IAnimatedCanvasConfig = {
  shadowColor?: { rgB: number };
  shadowBlur?: number;
  strokeRepeat?: number;
  gradiants?: [[string, string]];
  globalCompositeOperation?: GlobalCompositeOperation;
};

export function animatedCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  config: IAnimatedCanvasConfig = {}
) {
  const animationFrameId: { value: null | number } = { value: null };
  const cancelDrawLoop = { value: false };

  const center = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };
  const radius = (canvas.width / 2) * 0.5;
  let phasex = { value: 1.2 };

  const defaultConfig: IAnimatedCanvasConfig = {
    shadowBlur: 45,
    strokeRepeat: 6,
    gradiants: [["#3fa3f6", "#5927f5"]],
    globalCompositeOperation: "luminosity",
    ...config,
  };

  const color1 = defaultConfig.gradiants![0][0];
  const color2 = defaultConfig.gradiants![0][1];

  let shadowColor = () => {
    let rgB = +(config?.shadowColor?.rgB || 0) || 97;
    return `rgba(32, 0, ${rgB}, 0.978)`;
  };

  const gradient = ctx.createLinearGradient(0, 0, center.x * 3, center.y * 0.9);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  const gradient2 = ctx.createLinearGradient(
    0,
    0,
    center.x * 5,
    center.y * 0.9
  );
  gradient2.addColorStop(0, color1);
  gradient2.addColorStop(1, color2);

  const gradient3 = ctx.createLinearGradient(0, 0, center.x, center.y);
  gradient3.addColorStop(0, color1);
  gradient3.addColorStop(1, color2);

  const circles: any[] = [];
  const gradients = [gradient, gradient2, gradient3];
  const points = 12;
  const PI = Math.PI;

  const rangeMin = 1;
  const rangeMax = 5;
  let tick = 0;
  const showPoints: boolean = false;

  for (var idx = 0; idx <= gradients.length - 1; idx++) {
    let swingpoints: any[] = [];
    let radian = 0;

    for (var i = 0; i < points; i++) {
      radian = ((PI * 2) / points) * i;
      var ptX = center.x + radius * Math.cos(radian);
      var ptY = center.y + radius * Math.sin(radian);

      swingpoints.push({
        x: ptX,
        y: ptY,
        radian: radian,
        range: random(rangeMin, rangeMax),
        phase: 0,
      });
    }

    circles.push(swingpoints);
  }

  function randomswingCircle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = defaultConfig.globalCompositeOperation!;

    for (let k = 0; k < circles.length; k++) {
      let swingpoints = circles[k];

      for (let i = 0; i < swingpoints.length; i++) {
        swingpoints[i].phase += random(1, 10) * -0.01;

        let phase =
          (k == 0 ? phasex.value : phasex.value + 1.5) * Math.sin(tick / 65);

        const r =
          radius +
          swingpoints[i].range * phase * Math.sin(swingpoints[i].phase) -
          rangeMax;

        swingpoints[i].radian += PI / 360;

        const ptX = center.x + r * Math.cos(swingpoints[i].radian);
        const ptY = center.y + r * Math.sin(swingpoints[i].radian);

        if (showPoints === true) {
          ctx.strokeStyle = "#96fbc4";
          ctx.beginPath();
          ctx.arc(ptX, ptY, 2, 0, PI * 2, true);
          ctx.closePath();
          ctx.stroke();
        }

        swingpoints[i] = {
          x: ptX,
          y: ptY,
          radian: swingpoints[i].radian,
          range: swingpoints[i].range,
          phase: swingpoints[i].phase,
        };
      }

      const fill = gradients[k];

      drawCurve(swingpoints, fill, k);
    }

    tick++;

    if (cancelDrawLoop.value === false) {
      animationFrameId.value = requestAnimationFrame(randomswingCircle);
    }
  }

  animationFrameId.value = requestAnimationFrame(randomswingCircle);

  function drawCurve(pts, fillStyle, k: number) {
    ctx.beginPath();
    ctx.moveTo(
      (pts[cycle(-1, points)].x + pts[0].x) / 2,
      (pts[cycle(-1, points)].y + pts[0].y) / 2
    );
    ctx.lineWidth = k === 0 ? 16 : 3;
    ctx.shadowColor = shadowColor();
    ctx.strokeStyle = fillStyle;
    ctx.shadowBlur = defaultConfig.shadowBlur!;

    for (var i = 0; i < pts.length; i++) {
      ctx.quadraticCurveTo(
        pts[i].x,
        pts[i].y,
        (pts[i].x + pts[cycle(i + 1, points)].x) / 2,
        (pts[i].y + pts[cycle(i + 1, points)].y) / 2
      );
    }

    ctx.closePath();
    for (let index = 0; index < defaultConfig.strokeRepeat!; index++) {
      ctx.stroke();
    }
  }

  /**
   * Clear the draw loop
   */
  return () => {
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value);
    }
    cancelDrawLoop.value = true;
  };
}

function cycle(num1: number, num2: number) {
  return ((num1 % num2) + num2) % num2;
}

function random(num1: number, num2: number): number {
  const max = Math.max(num1, num2);
  const min = Math.min(num1, num2);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

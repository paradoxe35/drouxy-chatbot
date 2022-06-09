<script lang="ts">
  import { onMount } from "svelte";
  import {
    animatedCanvas,
    IAnimatedCanvasConfig,
  } from "../../utils/canvas-curve";
  import { fade } from "svelte/transition";
  import RecorderController from "../../utils/recorder-controller";

  onMount(() => {
    const MAX_rgB_VALUE = 150;
    const MIN_rgB_VALUE = 97;
    const MAX_rgB_VALUE_DIFF = MAX_rgB_VALUE - MIN_rgB_VALUE;
    const AMPLIFIER = 2.5;
    const animatedCanvasConfig: IAnimatedCanvasConfig = {
      shadowColor: { rgB: MIN_rgB_VALUE },
    };

    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const cancelDrawLoop = animatedCanvas(canvas, ctx, animatedCanvasConfig);

    // on analyse microphone data from Recorder
    RecorderController.onAnalysed(({ data, lineTo }) => {
      if (!lineTo) return;
      for (let i = 0; i < data.length; i++) {
        if (data[i] > lineTo || !lineTo) continue;
        const v = (data[i] * 10) / lineTo;
        const add = (v * MAX_rgB_VALUE_DIFF) / 10;
        const new_rgB = MIN_rgB_VALUE + add * AMPLIFIER;
        animatedCanvasConfig.shadowColor.rgB = new_rgB;
      }
    });

    return () => {
      cancelDrawLoop();
    };
  });
</script>

<div class="voice__speech" transition:fade>
  <canvas id="canvas" height="400" width="400" />
</div>

<style lang="scss">
  .voice__speech {
    position: absolute;
    top: -40px;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    background: rgba(0, 0, 0, 0.158);
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }
  #canvas {
    width: 50%;
    height: auto;
    @media (max-width: 768px) {
      width: 70%;
    }
  }
</style>

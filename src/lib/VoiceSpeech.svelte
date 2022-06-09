<script lang="ts">
  import { onMount } from "svelte";
  import { animatedCanvas } from "../../utils/canvas-curve";
  import { fade } from "svelte/transition";
  import RecorderController from "../../utils/recorder-controller";

  onMount(() => {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const cancelDrawLoop = animatedCanvas(canvas, ctx);

    // on analyse microphone data from Recorder
    RecorderController.onAnalysed((data, lineTo) => {
      console.log(data, lineTo);
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

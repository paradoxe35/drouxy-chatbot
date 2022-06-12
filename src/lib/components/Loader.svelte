<script lang="ts">
  import { animatedCanvas } from "@src/utils/canvas-curve";
  import { onMount } from "svelte";

  onMount(() => {
    const canvas = document.querySelector(
      "#loader__canvas"
    ) as HTMLCanvasElement;
    const ctx = canvas!.getContext("2d")!;
    const cancelDrawLoop = animatedCanvas(canvas!, ctx, {
      shadowBlur: 0,
      strokeRepeat: 1,
      // gradiants: [["#838eff", "#5470fc"]],
    });

    return () => {
      cancelDrawLoop();
    };
  });
</script>

<canvas id="loader__canvas" height="400" width="400" />

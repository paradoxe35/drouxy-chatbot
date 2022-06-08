<script lang="ts">
  import { onMount } from "svelte";
  import curve from "./curve";

  onMount(animatedCanvas);
  /**
   * Create mock  siri animated canvas circle with a gradient
   */
  function animatedCanvas() {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const colors = ["#290168", "#4599ff"];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;
    const angle = 0;
    const startAngle = 0;
    const endAngle = 2 * Math.PI;
    const counterClockwise = false;

    const gradient1 = ctx.createLinearGradient(
      0,
      0,
      centerX * 3,
      centerY * 0.9
    );
    gradient1.addColorStop(0, "#3fa3f6");
    gradient1.addColorStop(1, "#5927f5");

    ctx.fillStyle = gradient1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, counterClockwise);
    ctx.shadowColor = "red";
    ctx.shadowBlur = 15;
    ctx.fill();
  }
</script>

<div class="voice__speech">
  <canvas id="canvas" style="border: 1px solid" height="400" width="400" />
</div>

<style lang="scss">
  .voice__speech {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    background: #000;
  }
</style>

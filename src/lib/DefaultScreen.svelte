<script lang="ts">
  import Loader from "./components/Loader.svelte";
</script>

<div class="default__screen">
  <div class="color__screen" />
  <div class="screen_content">
    {#if false}
      <div class="loader">
        <Loader />
      </div>
    {/if}
  </div>
</div>
<div class="default__screen_backdrop" />

<style lang="scss">
  .default__screen {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
  }

  .color__screen {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, #838eff, 50%, var(--primary-color));
    opacity: 0.2;
    z-index: -1;
  }

  .default__screen_backdrop {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    opacity: 1;
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.25);
    z-index: 999;
  }

  .screen_content {
    display: flex;
    justify-content: center;
    justify-items: center;
    width: 100%;
    height: 100%;
  }

  @-webkit-keyframes dot-revolution {
    0% {
      transform: rotateZ(0deg) translate3d(0, 0, 0);
    }
    100% {
      transform: rotateZ(360deg) translate3d(0, 0, 0);
    }
  }

  @keyframes dot-revolution {
    0% {
      transform: rotateZ(0deg) translate3d(0, 0, 0);
    }
    100% {
      transform: rotateZ(360deg) translate3d(0, 0, 0);
    }
  }

  :global(#loader__canvas) {
    width: auto;
    height: auto;
    opacity: 0.5;
  }
</style>

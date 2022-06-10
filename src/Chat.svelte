<script lang="ts">
  import "./network/socket";
  import { speechMode } from "./store/store";
  import InputMessage from "./lib/InputMessage.svelte";
  import MessageContent from "./lib/MessageContent.svelte";
  import VoiceSpeech from "./lib/VoiceSpeech.svelte";
  import RecorderController from "./utils/recorder-controller";
  import { onMount } from "svelte";

  /**
   * This must be called once
   */
  onMount(() => {
    RecorderController.init();
  });
</script>

<div class="chat__wrapper">
  <MessageContent />
  <InputMessage />
  {#if $speechMode}
    <VoiceSpeech />
  {/if}
</div>

<style lang="scss">
  .chat__wrapper {
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    background: #000;
    border-radius: 8px;
    width: 100%;
    padding: 2rem;
  }
</style>

<script lang="ts">
  import socket from "./network/socket";
  import { speechMode } from "./store/store";
  import InputMessage from "./Chat/InputMessage.svelte";
  import MessageContent from "./Chat/MessageContent.svelte";
  import VoiceSpeech from "./Chat/VoiceSpeech.svelte";
  import RecorderController from "./utils/recorder-controller";
  import { onMount } from "svelte";
  import {
    pendingSequenceMessageCounter,
    userLiveMessage,
  } from "./store/messages";

  onMount(() => {
    /**
     * This must be called once
     */
    RecorderController.init();

    // Clear all message store when socket connect failed
    socket.io.on("connect_failed", () => {
      userLiveMessage.reset();
      pendingSequenceMessageCounter.reset();
    });
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

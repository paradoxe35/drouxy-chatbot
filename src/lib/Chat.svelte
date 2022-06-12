<script lang="ts">
  import { speechMode } from "@src/store/store";
  import InputMessage from "./Chat/InputMessage.svelte";
  import MessageContent from "./Chat/MessageContent.svelte";
  import VoiceSpeech from "./Chat/VoiceSpeech.svelte";
  import RecorderController from "@src/utils/recorder-controller";
  import { onMount } from "svelte";
  import { client_socket } from "@src/network/client";

  onMount(() => {
    /**
     * This must be called once
     */
    RecorderController.init();

    client_socket.init();
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

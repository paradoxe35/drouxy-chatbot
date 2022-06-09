<script lang="ts">
  import { voiceController } from "../store/store";
  import InputMessage from "./lib/InputMessage.svelte";
  import MessageContent from "./lib/MessageContent.svelte";
  import VoiceSpeech from "./lib/VoiceSpeech.svelte";
</script>

<div class="chat__wrapper">
  <MessageContent />
  <InputMessage />
  {#if $voiceController}
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

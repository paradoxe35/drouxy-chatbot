<script lang="ts">
  import InputMessage from "./lib/InputMessage.svelte";
  import MessageContent from "./lib/MessageContent.svelte";
</script>

<div class="chat__wrapper">
  <MessageContent />
  <InputMessage />
</div>

<style lang="scss">
  .chat__wrapper {
    background: #000;
    border-radius: 8px;
    width: 100%;
    padding: 2rem;
  }
</style>

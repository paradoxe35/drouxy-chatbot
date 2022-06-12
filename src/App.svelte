<script lang="ts">
  import Chat from "./lib/Chat.svelte";
  import DefaultScreen from "./lib/DefaultScreen.svelte";
  import { screenMode } from "./store/store";
</script>

<div class="chat__container">
  <Chat />
</div>
{#if $screenMode !== "chat"}
  <DefaultScreen />
{/if}

<style lang="scss">
  .chat__container {
    display: flex;
    width: 80%;
    max-width: 600px;
    justify-content: center;
    height: 95vh;
    margin: auto;
  }
</style>

<script lang="ts">
  import Chat from "./lib/Chat.svelte";
</script>

<div class="chat__container">
  <Chat />
</div>

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

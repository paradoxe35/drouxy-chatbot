<script lang="ts">
  import { fade } from "svelte/transition";

  let holdMic = false;
  let textInput = "";

  $: hasValue = textInput.trim().length > 0;
</script>

<div class="input__content">
  <div class="input__field">
    <input type="text" placeholder="You can type here" bind:value={textInput} />
    {#if hasValue}
      <button class="input__button" transition:fade={{ duration: 200 }}>
        Send
      </button>
    {/if}
  </div>
  <div
    class:mic__hold={holdMic}
    class="input__mic"
    on:mousedown={() => (holdMic = true)}
    on:mouseup={() => (holdMic = false)}
    on:mouseleave={() => (holdMic = false)}
  >
    <svg class="input__mic-icon" viewBox="0 0 24 24">
      <path
        d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
      />
    </svg>
  </div>
</div>

<style lang="scss">
  .input__content {
    position: relative;
    display: flex;
    flex-direction: row;
    height: max-content;
  }

  .input__field {
    flex: 1;
    border-radius: 50px;
    background: #0e0a12;
    display: flex;
    input {
      border: none;
      outline: none;
      width: 100%;
      color: #c1c1c1;
      padding: 0.8rem 1.2rem;
      background: transparent;
    }

    .input__button {
      display: inline;
      border: none;
      outline: none;
      background: transparent;
      border-radius: 50px;
      color: var(--primary-color);
      cursor: pointer;
      padding-right: 1.2rem;
    }
  }

  .input__mic {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2.3rem;
    height: 2.3rem;
    border-radius: 50%;
    border: 1px solid rgba(193, 193, 193, 0.457);
    cursor: pointer;
    margin-left: 0.8rem;
    transition: background 0.5s ease-in-out;

    .input__mic-icon {
      width: 1.2rem;
      height: 1.2rem;
      fill: #c1c1c1;
    }

    &.mic__hold {
      background: #5969d0;
      border: 1px solid transparent;
      transition: background 0.5s ease-in-out;
    }
  }
</style>

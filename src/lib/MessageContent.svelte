<script lang="ts">
  import { isBotTyping } from "../store/store";
  import { messages } from "../store/messages";
  import { swimrotate } from "../utils/animations/transitions";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  onMount(() => {
    window.setTimeout(() => {
      isBotTyping.activate(true);
    }, 1000);

    window.setTimeout(() => {
      isBotTyping.activate(false);
      messages.addMessage({
        text: "How can I help you?",
      });
    }, 5000);
  });
</script>

<div class="message__content">
  {#each $messages as message, index (index)}
    <div class={`message__items ${message.from_user ? "message__user" : ""}`}>
      {#if !message.from_user}
        <div class={`message__item-img`} out:fade>
          <img src="/msg-icon.png" alt="Icon" />
        </div>
        <div class="message__item" in:swimrotate>
          {message.text}
        </div>
      {:else}
        <div class="message__item" in:swimrotate={{ right: true }}>
          {message.text}
        </div>
      {/if}
    </div>
  {/each}

  {#if $isBotTyping}
    <div class={`message__items`}>
      <div class={`message__item-img waving`}>
        <img src="/msg-icon.png" alt="Icon" />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .message__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .message__items {
    display: flex;
    width: max-content;
    max-width: 65%;
    min-width: 5rem;
    margin-bottom: 0.8rem;
    align-self: flex-start;

    @media screen and (max-width: 600px) {
      max-width: 85%;
    }
  }

  .message__items .message__item-img {
    position: relative;
    width: 50px;
    height: 50px;
    margin-top: -15px;
    border-radius: 50%;
    img {
      width: 100%;
      height: auto;
    }

    &:before,
    &:after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      border: solid rgba(131, 141, 255, 0.696);
      width: 100%;
      height: 100%;
      border-radius: 50%;
      opacity: 0;
      transition: all 0.25s ease;
    }

    &.waving:before {
      animation-name: wave-beat;
      animation-duration: 1s;
      animation-timing-function: linear;
      animation-delay: 0.5s;
      animation-fill-mode: both;
      animation-iteration-count: infinite;
    }
    &.waving:after {
      animation-name: wave-beat;
      animation-duration: 1.5s;
      animation-delay: 0s;
      animation-fill-mode: both;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  }
  .message__items.message__user {
    align-self: flex-end;
    .message__item {
      border-bottom-right-radius: 0;
      border-top-left-radius: var(--raduis);
      background: linear-gradient(to right, #838eff, 50%, var(--primary-color));
    }
  }

  .message__item {
    background: linear-gradient(
        to right,
        rgba(131, 141, 255, 0.233),
        15%,
        transparent
      ),
      linear-gradient(to left, rgba(131, 141, 255, 0.188), 15%, transparent);
    color: #d5d7da;
    width: 100%;
    padding: 0.8rem 1.2rem;
    --raduis: 18px;
    border-radius: var(--raduis);
    border-top-left-radius: 0;
  }

  @keyframes wave-beat {
    0% {
      opacity: 0;
      transform: scale(0);
    }

    30% {
      opacity: 0.6;
      transform: scale(0.6);
    }

    70% {
      opacity: 0;
      transform: scale(1);
    }

    100% {
      opacity: 0;
    }
  }
</style>

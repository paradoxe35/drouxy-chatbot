<script lang="ts">
  import { client_socket } from "@src/network/client";

  import { isBotSpeech } from "@src/store/bot";
  import { messages } from "@src/store/messages";
  import { swimrotate } from "@src/utils/animations/transitions";
  import { fade } from "svelte/transition";

  let container: HTMLDivElement | null = null;
  const cs = client_socket;

  $: $messages,
    (() => {
      if ($messages.length > 0 && container) {
        requestAnimationFrame(() => {
          container!.scrollTo({
            top: container!.scrollHeight,
            behavior: "smooth",
          });
        });
      }
    })();
</script>

<div class="message__content" bind:this={container}>
  {#each $messages as message, index (index)}
    <div class={`message__items ${!message.from_bot ? "message__user" : ""}`}>
      {#if message.from_bot}
        <div class={`message__item-img`} out:fade>
          <img src="/bot-logo.png" alt="Icon" />
        </div>
        <div
          class="message__item"
          in:swimrotate={{ duration: cs.has_initial_messages ? 0 : 200 }}
        >
          {message.text}
        </div>
      {:else}
        <div
          class="message__item"
          in:swimrotate={{
            right: true,
            duration: cs.has_initial_messages ? 0 : 200,
          }}
        >
          {message.text}
        </div>
      {/if}
    </div>
  {/each}

  {#if $isBotSpeech}
    <div class={`message__items`}>
      <div class={`message__item-img waving`}>
        <img src="/bot-logo.png" alt="Icon" />
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
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;

    .message__items:first-child {
      margin-top: 1rem;
    }
    .message__items:last-child {
      margin-bottom: 5rem;
    }
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

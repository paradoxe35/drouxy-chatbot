<script lang="ts">
  import { messages } from "../../store/store";

  function swimrotate(_node, { delay = 0, duration = 200, right = false }) {
    return {
      delay,
      duration,
      css: (t) => {
        const rotation = t * 0.05 - 0.05;
        const scale = Math.min(t + 0.2, 1);
        return `
        transform-origin: ${right ? "bottom right" : "top left"};
        transform: scale(${scale}) rotate(${
          right ? rotation : Math.abs(rotation)
        }turn);`;
      },
    };
  }
</script>

<div class="message__content">
  {#each $messages as message, index (index)}
    <div class={`message__items ${message.from_user ? "message__user" : ""}`}>
      {#if !message.from_user}
        <img src="/msg-icon.png" class="message__item-img" alt="Icon" />
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
    width: 50px;
    height: 50px;
    margin-top: -15px;
    border-radius: 50%;
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
</style>

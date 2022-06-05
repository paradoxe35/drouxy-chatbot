<div class="message__content">
  <div class="message__item">
    Hello NY I am Elwa. Before we start, tell me your name.
  </div>

  <div class="message__item message__user">Hello, I am Denis.</div>

  <div class="message__item">
    Hello NY I am Elwa. Before we start, tell me your name.
  </div>
</div>

<style lang="scss">
  .message__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .message__item {
    background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0.199),
        15%,
        transparent
      ),
      linear-gradient(to left, rgba(255, 255, 255, 0.144), 15%, transparent);
    color: #d5d7da;
    width: max-content;
    max-width: 60%;
    min-width: 10rem;
    align-self: flex-start;
    padding: 0.8rem 1.2rem;
    --raduis: 18px;
    border-radius: var(--raduis);
    border-top-left-radius: 0;
    margin-bottom: 0.8rem;
    &.message__user {
      border-top-left-radius: var(--raduis);
      border-bottom-right-radius: 0;
      align-self: flex-end;
      background: linear-gradient(to right, #838eff, 50%, var(--primary-color));
    }
  }
</style>

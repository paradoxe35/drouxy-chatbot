<script lang="ts">
  import { client_socket } from "@src/network/client";
  import { authenticatedUser } from "@src/store/authentication";

  const user = $authenticatedUser!;
  let language = user.language;
  let tts_enabled = user.tts_enabled;

  $: tts_enabled, client_socket.$emit_tts_enabled(tts_enabled);

  $: language, client_socket.$emit_change_language(language);

  const handleLogout = () => client_socket.$emit_logout_session();
</script>

<div class="user__details">
  <div class="detail">
    <span>User Name:</span>
    <span>{user.username}</span>
  </div>
  <div class="detail">
    <span>Language:</span>
    <select bind:value={language}>
      {#each client_socket.languages as lang}
        <option value={lang.value}>{lang.name}</option>
      {/each}
    </select>
  </div>
  <div class="detail">
    <span>Bot Voice speech:</span>
    <span>
      {tts_enabled ? "Enabled" : "Disabled"}
      {" "}
      <input type="checkbox" name="tts_enabled" bind:checked={tts_enabled} />
    </span>
  </div>

  <div class="detail">
    <button on:click={handleLogout}>Logout</button>
  </div>
</div>

<style lang="scss">
  .user__details {
    position: absolute;
    right: 20px;
    top: 0;
    width: max-content;
    height: auto;
  }

  .detail {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 10px;

    span:nth-child(2) {
      color: rgb(165, 165, 165);
    }
  }
</style>

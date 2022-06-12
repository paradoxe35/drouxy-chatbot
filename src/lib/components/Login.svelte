<script lang="ts">
  import { client_socket } from "@src/network/client";

  import { typewriter } from "@src/utils/animations/transitions";
  import { BOT_NAME } from "@src/utils/constants";

  let username = "";
  let language = "en";
  let tts_enabled = true;
  let valide_form = false;

  async function fetch_current_user_location() {
    return fetch("https://ipapi.co/json").then((response) => response.json());
  }

  const handleSubmit = async () => {
    if (!valide_form) return;
    const data = {
      username,
      language,
      tts_enabled: +tts_enabled,
    };

    try {
      const geo = await fetch_current_user_location();
      if (geo) {
        data["geo_city"] =
          geo.city || geo.region || geo.country_capital || geo.country_name;
      }
    } catch (error) {
      console.error(error);
    }

    client_socket.$emit_login_session(data);
  };

  $: username,
    language,
    (() => {
      if (username.trim().length > 1 && ["en", "fr"].includes(language)) {
        valide_form = true;
      } else {
        valide_form = false;
      }
    })();
</script>

<div class="login__screen">
  <div class="login__logo">
    <img src="/bot-logo.png" alt="Logo" width="100" height="100" />
  </div>

  <div class="welcome__text">
    <span transition:typewriter>
      Hey, I'm {BOT_NAME}. If you would like to chat with me, please complete
      the form below before 🙂.
    </span>
  </div>

  <form
    class="login__form"
    autocomplete="off"
    on:submit|preventDefault={handleSubmit}
  >
    <div class="input__text input">
      <input
        type="text"
        bind:value={username}
        placeholder="What is you name ?"
      />
    </div>

    <p>Select one of the supported languages</p>
    <div class="input__text input">
      <select bind:value={language}>
        <option value="en">English</option>
        <option value="fr">French</option>
      </select>
    </div>

    <p>Check this box if you want me to reply with voice speech</p>
    <div class="input__text input">
      <input type="checkbox" name="tts_enabled" bind:checked={tts_enabled} />
    </div>

    <div class="enter input">
      <button type="submit" disabled={!valide_form} class="input__button">
        Enter
      </button>
    </div>
  </form>
</div>

<style lang="scss">
  .login__logo {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .welcome__text {
    text-align: center;
    width: 70%;
    margin-right: auto;
    margin-left: auto;
    @media screen and (max-width: 768px) {
      width: 80%;
    }

    span {
      opacity: 0.8;
      font-size: large;
      font-weight: normal;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }
  }

  .login__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 3rem;

    .input__text {
      input,
      select {
        padding: 0.5rem 0.5rem;
        min-width: 200px;
      }
    }

    .enter button {
      margin-top: 1rem;
      padding: 0.3rem 1.8rem;
    }
  }
</style>

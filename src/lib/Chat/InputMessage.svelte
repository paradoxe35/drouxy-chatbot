<script lang="ts">
  import {
    pendingSequenceMessageCounter,
    userLiveMessage,
  } from "@src/store/messages";
  import { speechMode } from "@src/store/store";
  import { fade } from "svelte/transition";
  import RecorderController from "@src/utils/recorder-controller";
  import {
    AUDIO_NUM_CHANNELS,
    EXPORT_MIME_TYPE,
  } from "@src/utils/recorder/constants";
  import { debounce } from "@src/utils/debounce";
  import type IRecorder from "src/utils/recorder/index.d";
  import { client_socket } from "@src/network/client";

  let holdMic = false;
  let textInput = "";
  let hasRecorded = false;
  const r_controller = RecorderController;

  // Mock start message from bot
  $: hasTextValue = textInput.trim().length > 0;

  function handleUserTextMessage() {
    if (!hasTextValue) return;
    client_socket.$emit_user_text_message(textInput);
    textInput = "";
  }

  /**
   * This will trigger the start or stop of recording regarding of the status of {holdMic}
   */
  function handleMicClick(status: boolean) {
    /**
     * Start recording or stop recording
     */
    return async () => {
      const can_record = await r_controller.getUserMedia();
      if (!can_record) return;

      if (status) r_controller.startRecording();
      else r_controller.stopRecording();

      holdMic = status;
    };
  }

  /** Handle sequential recording */
  function handleSequentialRecording(result: IRecorder.RecorderResult) {
    console.log("handleSequentialRecording", result.blob);
    hasRecorded = true;
    pendingSequenceMessageCounter.increment();

    client_socket.$emit_user_recording_stt({
      sampleRate: result.sampleRate,
      blob: result.blob,
      mimeType: EXPORT_MIME_TYPE,
      numChannels: AUDIO_NUM_CHANNELS,
    });
  }

  r_controller.onSequentialize(debounce(handleSequentialRecording, 100));

  /* When user stop recording, send the audio blob to the server */
  function handleEndRecording(result: IRecorder.RecorderResult) {
    if ($pendingSequenceMessageCounter !== 0 && !result.lastSequence) {
      /**
       * IF there is message from sequential recording,
       * and no last sequency which was not captured by onSequentialize listener
       */
      return;
    } else if (result.lastSequence) {
      result.blob = result.lastSequence;
    }

    hasRecorded = true;
    console.log("handleEndRecording", result.blob);

    pendingSequenceMessageCounter.increment();

    client_socket.$emit_user_recording_stt({
      sampleRate: result.sampleRate,
      blob: result.blob,
      mimeType: EXPORT_MIME_TYPE,
      numChannels: AUDIO_NUM_CHANNELS,
    });
  }

  r_controller.onRecordingEnd(debounce(handleEndRecording, 100));

  /** Notify store about voice controller request */
  $: if (holdMic) {
    speechMode.activate(true);
  }

  /** Close speechMode when pendingSequenceMessageCounter is 0 and holdMic is false */
  $: if ($pendingSequenceMessageCounter === 0 && !holdMic && hasRecorded) {
    const wait_time = 500;
    hasRecorded = false;
    setTimeout(() => speechMode.activate(false), wait_time);

    const live_messages = userLiveMessage.getMessages();
    const msg = live_messages
      .map((t) => t.text)
      .join(" ")
      .trim();
    if (live_messages.length > 0 && msg.length > 0) {
      setTimeout(() => {
        // Send message to the server
        client_socket.$emit_user_text_message(msg);
        userLiveMessage.reset();
      }, wait_time + 500);
    }
  }
</script>

<div class="input__content">
  <form class="input__field" on:submit|preventDefault={handleUserTextMessage}>
    <input type="text" placeholder="You can type here" bind:value={textInput} />
    {#if hasTextValue}
      <button
        on:click={handleUserTextMessage}
        type="button"
        class="input__button"
        transition:fade={{ duration: 200 }}
      >
        Send
      </button>
    {/if}
  </form>
  <div
    class:mic__hold={holdMic}
    class="input__mic"
    on:mousedown={handleMicClick(true)}
    on:mouseup={handleMicClick(false)}
    on:mouseleave={handleMicClick(false)}
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
    z-index: 6;
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

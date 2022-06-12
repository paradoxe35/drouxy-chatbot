import { writable } from "svelte/store";

function createIsBotSpeechStore() {
  const { subscribe, set } = writable<boolean>(false);

  return {
    subscribe,
    activate: (status: boolean) => set(status),
  };
}

export const isBotSpeech = createIsBotSpeechStore();

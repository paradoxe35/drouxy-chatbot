import { writable } from "svelte/store";

// create in speech mode store
function createSpeechModeStore() {
  const { subscribe, set } = writable(false);

  return {
    subscribe,
    activate: (status: boolean) => set(status),
  };
}

export const speechMode = createSpeechModeStore();

// Create is typing store
function createIsBotTypingStore() {
  const { subscribe, set } = writable<boolean>(false);

  return {
    subscribe,
    activate: (status: boolean) => set(status),
  };
}

export const isBotTyping = createIsBotTypingStore();

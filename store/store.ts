import { writable } from "svelte/store";

// create voice controller store
function createVoiceController() {
  const { subscribe, set } = writable<boolean>(false);

  return {
    subscribe,
    activate: (status: boolean) => set(status),
  };
}

export const voiceController = createVoiceController();

// Create is typing store
function createIsBotTypingStore() {
  const { subscribe, set } = writable<boolean>(false);

  return {
    subscribe,
    activate: (status: boolean) => set(status),
  };
}

export const isBotTyping = createIsBotTypingStore();

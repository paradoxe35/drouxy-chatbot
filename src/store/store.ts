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

// Create screen mode store
type ScreenMode = "loading" | "chat" | "login";

function createScreenModeStore() {
  const { subscribe, set } = writable<ScreenMode>("loading");

  return {
    subscribe,
    setMode: (mode: ScreenMode) => set(mode),
  };
}

export const screenMode = createScreenModeStore();

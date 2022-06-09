import { writable } from "svelte/store";

export type Message = {
  from_user?: boolean;
  waving?: boolean;
  text?: string;
};

const defaultMessages = [
  {
    text: "Hey 👋 I am Elwa. Before we start, tell me your name.",
  },
  {
    from_user: true,
    text: "Hello, I am Denis.",
  },
  {
    from_user: false,
    text: "Hello 👋, I am Elwa. Before we start, tell me your name.",
  },
];

function createMessageStore() {
  const { subscribe, set, update } = writable<Message[]>(defaultMessages);

  return {
    subscribe,
    addMessage: (message: Message) => {
      update((messages) => [...messages, message]);
    },
  };
}

export const messages = createMessageStore();

import { writable } from "svelte/store";

export type Message = {
  from_user?: boolean;
  text: string;
};

export const messages = writable<Message[]>([
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
]);

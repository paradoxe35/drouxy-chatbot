import type { IMessage } from "@src/types";
import { writable } from "svelte/store";

function createMessageStore() {
  const { subscribe, update, set } = writable<IMessage[]>([]);

  return {
    subscribe,
    addMessage: (message: IMessage) => {
      update((messages) => [...messages, message]);
    },
    reset: () => {
      set([]);
    },
    setMessages: (messages: IMessage[]) => {
      set(messages);
    },
  };
}

export const messages = createMessageStore();

// Create pending Sequence message counter store
function createPendingSequenceMessageCounterStore() {
  const { subscribe, update, set } = writable(0);

  return {
    subscribe,
    increment: () => {
      update((count) => count + 1);
    },
    decrement: () => {
      update((count) => (!count ? count : count - 1));
    },
    reset: () => set(0),
  };
}

export const pendingSequenceMessageCounter =
  createPendingSequenceMessageCounterStore();

// Create user live message store
type IUserLiveMessages = { text: string; index: number }[];

function createUserLiveMessagesStore() {
  const { subscribe, update, set } = writable<IUserLiveMessages>([]);

  let all_messages: IUserLiveMessages = [];

  const limit = 2;
  let index = 0;

  return {
    subscribe,
    getMessages: () => all_messages,
    addMessage: (message: string) => {
      update((messages) => {
        const msg = { text: message, index: index++ };
        all_messages.push(msg);
        if (messages.length >= limit) {
          return [...messages, msg].slice(1, limit + 1);
        }
        return [...messages, msg];
      });
    },
    reset: () => {
      all_messages = [];
      set([]);
    },
  };
}

export const userLiveMessage = createUserLiveMessagesStore();

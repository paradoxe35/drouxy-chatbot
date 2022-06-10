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
  const { subscribe, update } = writable<Message[]>(defaultMessages);

  return {
    subscribe,
    addMessage: (message: Message) => {
      update((messages) => [...messages, message]);
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

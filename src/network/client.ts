import { authenticatedUser } from "@src/store/authentication";
import {
  messages,
  pendingSequenceMessageCounter,
  userLiveMessage,
} from "@src/store/messages";
import { isBotSpeech } from "@src/store/bot";
import type { Socket } from "socket.io-client";
import type {
  IAuthenticatedEvent,
  IAuthenticatedUser,
  ILiveMessage,
  IMessage,
  IUserMessageSTT,
  BotResponseEvent,
  IUserSessionEmit,
} from "../types";
import { socketIO } from "./socket";
import { screenMode } from "@src/store/store";
import wait from "@src/utils/wait";

class Client {
  private authenticatedUser: IAuthenticatedUser | null = null;
  public has_initial_messages: boolean = false;

  public languages: { value: string; name: string }[] = [
    { value: "en", name: "English" },
    { value: "fr", name: "Français" },
  ];

  private sessionStorageKey = "dxr_authenticated";

  private readonly stores = {
    userLiveMessage,
    pendingSequenceMessageCounter,
    authenticatedUser,
    messages,
    isBotSpeech,
    screenMode,
  };

  constructor(private readonly socket: Socket) {
    this.$event_bot_response = this.$event_bot_response.bind(this);
  }

  /**
   * This must be called once on main chat component mount.
   */
  public init() {
    const authenticated = this.get_authenticated_storage();
    if (authenticated) {
      this.socket.auth = {
        session_id: authenticated.session_id,
        username: authenticated.username,
      };
    }

    // Clear all message store when socket connect failed
    this.socket.on("connect_failed", () => {
      this.stores.userLiveMessage.reset();
      this.stores.pendingSequenceMessageCounter.reset();
    });

    // listen for authentication event
    this.socket.on("authenticated", (data: IAuthenticatedEvent) => {
      this.authenticatedUser = data;
      this.stores.authenticatedUser.authenticate(data);
      this.stores.screenMode.setMode("chat");
      if (import.meta.env.VITE_PERSISTE_SESSION === "true") {
        this.set_authenticated_storage(data);
      }
      // if not first time authenticated, then get messages
      if (!data.first_connect) {
        this.$emit_get_messages();
      }
    });

    this.socket.on("authentication_failed", () => {
      this.unauthenticate();
    });

    // listen for logout event
    this.socket.on("logout_session", () => {
      this.unauthenticate();
    });

    // listen for live message event
    this.socket.on("stt_live_message", (data: ILiveMessage) => {
      this.require_authentication();
      data.final = JSON.parse(<any>data.final);
      data.last_partial = JSON.parse(<any>data.last_partial);
      if (data.error === 0) {
        this.stores.userLiveMessage.addMessage(data.final.text);
      }
      this.stores.pendingSequenceMessageCounter.decrement();
    });

    // Get all session messages, this must be listened once
    this.socket.on("messages", ({ messages }: { messages: IMessage[] }) => {
      this.require_authentication();
      this.stores.messages.setMessages(messages);
      window.setTimeout(() => {
        this.has_initial_messages = false;
      }, 100);
    });

    // listen for new message with event from bot
    this.socket.on("tts_bot_response", this.$event_bot_response);

    // listen for new message with event from bot
    this.socket.on("bot_response", this.$event_bot_response);

    // connect to socket after getting authenticated user
    this.socket.open();
  }

  public languagesValue(): string[] {
    return this.languages.map((l) => l.value);
  }

  private unauthenticate() {
    this.authenticatedUser = null;
    this.stores.authenticatedUser.logout();
    this.stores.screenMode.setMode("login");
    this.stores.messages.setMessages([]);
    this.stores.userLiveMessage.reset();
    this.stores.pendingSequenceMessageCounter.reset();
    // this.remove_authenticated_storage();
  }

  private require_authentication() {
    if (!this.authenticatedUser) {
      throw new Error("Authentication required");
    }
  }

  private get_authenticated_storage(): IAuthenticatedEvent | null {
    const authenticated = sessionStorage.getItem(this.sessionStorageKey);
    if (authenticated) {
      try {
        return JSON.parse(authenticated);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  // @ts-ignore
  private remove_authenticated_storage() {
    sessionStorage.removeItem(this.sessionStorageKey);
  }

  private set_authenticated_storage(data: IAuthenticatedEvent) {
    sessionStorage.removeItem(this.sessionStorageKey);
    return sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(data));
  }

  public $emit_login_session(data: IUserSessionEmit) {
    this.socket.emit("login_session", data);
    this.stores.screenMode.setMode("loading");
  }

  public $emit_logout_session() {
    this.require_authentication();
    this.socket.emit("logout_session");
  }

  public $emit_get_messages() {
    this.require_authentication();
    this.socket.emit("messages");
    this.has_initial_messages = true;
  }

  public $emit_user_text_message(text: string) {
    this.require_authentication();

    this.socket.emit("user_message", { text });
    this.stores.messages.addMessage({
      from_bot: false,
      text,
    });
  }

  public $emit_user_recording_stt(data: IUserMessageSTT) {
    this.require_authentication();
    this.socket.emit("user_recording_stt", data);
  }

  public $emit_tts_enabled(tts_enabled: boolean) {
    this.require_authentication();

    if (this.authenticatedUser?.tts_enabled !== tts_enabled) {
      this.socket.emit("tts_enabled", { tts_enabled: +tts_enabled });
    }
  }

  public $emit_change_language(language: string) {
    this.require_authentication();

    if (
      this.languagesValue().includes(language) &&
      this.authenticatedUser!.language !== language
    ) {
      this.socket.emit("change_language", { language });
    }
  }

  private async $event_bot_response(data: BotResponseEvent) {
    this.require_authentication();

    if (data.audio) {
      const blob = new Blob([data.audio], {
        type: "audio/wav",
      });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.addEventListener("play", () => {
        this.stores.isBotSpeech.activate(true);
      });
      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(url);

        // show bot response message text with a delay
        window.setTimeout(async () => {
          await wait(500);
          this.stores.isBotSpeech.activate(false);
          this.stores.messages.addMessage({
            from_bot: true,
            text: data.message,
          });
        }, 500);
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(url);
      });

      audio.play();
      return;
    }

    await wait(500);
    this.stores.messages.addMessage({
      from_bot: true,
      text: data.message,
    });
  }
}

/**
 * Create a singleton client instance.
 */
export const client_socket = new Client(socketIO);

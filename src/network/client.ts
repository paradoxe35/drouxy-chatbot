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
      this.stores.screenMode.setMode("login");
    });

    // listen for logout event
    this.socket.on("logout", () => {
      this.unauthenticate();
    });

    // listen for live message event
    this.socket.on("stt_live_message", (data: ILiveMessage) => {
      data.final = JSON.parse(<any>data.final);
      data.last_partial = JSON.parse(<any>data.last_partial);
      if (data.error === 0) {
        this.stores.userLiveMessage.addMessage(data.final.text);
      }
      this.stores.pendingSequenceMessageCounter.decrement();
    });

    // Get all session messages, this must be listened once
    this.socket.on("messages", ({ messages }: { messages: IMessage[] }) => {
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

  private unauthenticate() {
    this.authenticatedUser = null;
    this.stores.authenticatedUser.logout();
  }

  private require_authentication() {
    if (!this.authenticatedUser) {
      throw new Error("Authentication required");
    }
  }

  private get_authenticated_storage(): IAuthenticatedEvent | null {
    const authenticated = sessionStorage.getItem("dxr_authenticated");
    if (authenticated) {
      try {
        return JSON.parse(authenticated);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  private set_authenticated_storage(data: IAuthenticatedEvent) {
    sessionStorage.removeItem("dxr_authenticated");
    return sessionStorage.setItem("dxr_authenticated", JSON.stringify(data));
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

  public $emit_change_language(language: string) {
    this.require_authentication();
    this.socket.emit("change_language", { language });
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

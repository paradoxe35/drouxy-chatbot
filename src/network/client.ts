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
} from "../types";
import { socketIO } from "./socket";
import { screenMode } from "@src/store/store";

class Client {
  public authenticatedUser: IAuthenticatedUser | null = null;

  private readonly stores = {
    userLiveMessage,
    pendingSequenceMessageCounter,
    authenticatedUser,
    messages,
    isBotSpeech,
    screenMode,
  };

  constructor(private readonly socket: Socket) {}

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

    // connect to socket after getting authenticated user
    this.socket.connect();

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
      this.set_authenticated_storage(data);
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
    this.socket.on("stt-live-message", (data: ILiveMessage) => {
      if (data.error === 0) {
        this.stores.userLiveMessage.addMessage(data.final.text);
      }
      this.stores.pendingSequenceMessageCounter.decrement();
    });

    // Get all session messages, this must be listened once
    this.socket.on("messages", (messages: IMessage[]) => {
      this.stores.messages.setMessages(messages);
    });

    // listen for new message with event from bot
    this.socket.on("tts_bot_response", this.$event_bot_response);

    // listen for new message with event from bot
    this.socket.on("bot_response", this.$event_bot_response);
  }

  private unauthenticate() {
    this.authenticatedUser = null;
    this.stores.authenticatedUser.logout();
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

  public $emit_user_text_message(text: string) {
    this.socket.emit("user_message", { text });
    this.stores.messages.addMessage({
      from_user: true,
      text,
    });
  }

  public $emit_user_message_stt(data: IUserMessageSTT) {
    this.socket.emit("user_message_stt", data);
  }

  public $emit_change_language(language: string) {
    this.socket.emit("change_language", { language });
  }

  private $event_bot_response(data: BotResponseEvent) {
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
        window.setTimeout(() => {
          this.stores.isBotSpeech.activate(false);
          this.stores.messages.addMessage({
            from_user: false,
            text: data.text,
          });
        }, 500);
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(url);
      });

      audio.play();
      return;
    }

    this.stores.messages.addMessage({
      from_user: false,
      text: data.text,
    });
  }
}

/**
 * Create a singleton client instance.
 */
export const client_socket = new Client(socketIO);

import { io } from "socket.io-client";
import type { ILiveMessage, IRecordedDto } from "../types";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const socketIO = io(SERVER_URL, {
  reconnectionDelayMax: 10000,
});

function sendSpeechRecorded(data: IRecordedDto) {
  socketIO.emit("user_message_stt", data);
}

function liveMessageEvent(cb: (data: ILiveMessage) => void) {
  const parse = (data: any) => {
    data.final = JSON.parse(data.final);
    data.last_partial = JSON.parse(data.last_partial);
    cb(data);
  };

  socketIO.on("live-message", parse);
}

export default {
  io: socketIO,
  sendSpeechRecorded,
  liveMessageEvent,
};

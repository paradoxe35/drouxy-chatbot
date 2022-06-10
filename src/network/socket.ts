import { io } from "socket.io-client";
import type { IRecordedDto } from "../types";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const socketIO = io(SERVER_URL, {
  reconnectionDelayMax: 10000,
});

function sendBlob(data: IRecordedDto) {
  socketIO.emit("recording", data);
}

export default {
  io: socketIO,
  sendBlob,
};

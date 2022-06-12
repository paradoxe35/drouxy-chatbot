import { io } from "socket.io-client";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const socketIO = io(SERVER_URL, {
  reconnectionDelayMax: 10000,
  autoConnect: false,
});

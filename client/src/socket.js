import { io } from "socket.io-client";

const SOCKET_SERVER_URL = `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_SERVER_PORT}`;

export const socket = io(SOCKET_SERVER_URL, { autoConnect: false });

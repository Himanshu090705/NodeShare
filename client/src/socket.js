import { io } from "socket.io-client";
import { SERVER_URL } from "../../config";

const SOCKET_SERVER_URL = `${SERVER_URL}`;

export const socket = io(SOCKET_SERVER_URL, { autoConnect: false });

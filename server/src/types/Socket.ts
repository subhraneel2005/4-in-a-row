import { WebSocket } from "ws";

export interface Socket extends WebSocket {
  username: string;
  opponent: WebSocket;
}

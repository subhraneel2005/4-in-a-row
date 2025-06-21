import { PlayerSymbol } from "../types/Game";
import { Socket } from "../types/Socket";

export class Player {
  private socket: Socket;
  private username: string;
  private symbol: PlayerSymbol;

  constructor(socket: Socket, username: string, symbol: PlayerSymbol) {
    this.socket = socket;
    this.username = username;
    this.symbol = symbol;
  }

  send(message: string): void {
    if (this.socket.readyState === this.socket.OPEN) {
      this.socket.send(message);
    }
  }

  sendJSON(data: any): void {
    this.send(JSON.stringify(data));
  }
}

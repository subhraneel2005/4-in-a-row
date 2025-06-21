import { Socket } from "../types/Socket";
import { GameManager } from "../classes/GameManager";

export class WebSocketHandler {
  private gameManager: GameManager;

  constructor() {
    this.gameManager = new GameManager();
  }

  handleConnection(ws: Socket): void {
    console.log("New client connected");

    ws.on("message", (message) => {
      this.handleMessage(ws, message);
    });

    ws.on("close", () => {
      this.handleDisconnect(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  private handleMessage(ws: Socket, message: any): void {
    // First message should be username
    if (!ws.username) {
      const username = message.toString().trim();
      if (!username) {
        ws.send("Please provide a valid username");
        return;
      }

      ws.username = username;
      ws.send(`Welcome ${username}!`);
      this.gameManager.findOrCreateGame(ws, username);
      return;
    }

    // Parse JSON messages
    try {
      const parsed = JSON.parse(message.toString());
      this.handleGameMessage(ws, parsed);
    } catch (error) {
      ws.send("Invalid message format. Please send valid JSON.");
    }
  }

  private handleGameMessage(ws: Socket, message: any): void {
    switch (message.type) {
      case "move":
        if (
          typeof message.column !== "number" ||
          message.column < 0 ||
          message.column > 6
        ) {
          ws.send("Invalid column. Must be between 0 and 6.");
          return;
        }
        this.gameManager.handleMove(ws, message.column);
        break;

      case "status":
        this.sendStatus(ws);
        break;

      default:
        ws.send("Unknown message type");
    }
  }

  private sendStatus(ws: Socket): void {
    const status = {
      type: "status",
      activeGames: this.gameManager.getActiveGamesCount(),
      waitingPlayers: this.gameManager.getWaitingPlayersCount(),
    };
    ws.send(JSON.stringify(status));
  }

  private handleDisconnect(ws: Socket): void {
    console.log(`Client disconnected: ${ws.username || "Unknown"}`);
    this.gameManager.handleDisconnect(ws);
  }
}

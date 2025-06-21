import { WebSocketServer } from "ws";
import { Socket } from "./types/Socket";
import { WebSocketHandler } from "./server/WebSocketHandler";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const wss = new WebSocketServer({ port: PORT });
const wsHandler = new WebSocketHandler();

wss.on("connection", (ws: Socket) => {
  wsHandler.handleConnection(ws);
});

console.log(`🎮 4-in-a-Row game server running on port ${PORT}`);
console.log(`🔗 Connect using: ws://localhost:${PORT}`);

// Export for testing
export { wss, wsHandler };

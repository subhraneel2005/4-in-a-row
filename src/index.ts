import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 3000 });

const sockets: Socket[] = [];

interface Socket extends WebSocket {
  username: string;
}

wss.on("connection", (ws: Socket) => {
  sockets.push(ws);
  ws.on("message", (message) => {
    if (!ws.username) {
      ws.username = message.toString();
      ws.send("Welcome " + ws.username);
      return;
    }
    sockets.forEach((socket) => {
      if (socket !== ws) {
        socket.send(ws.username + ":" + message.toString());
      }
    });
  });
  ws.on("close", () => {
    ws.send("Someone left the room");
    const index = sockets.indexOf(ws);
    if (index !== 1) {
      sockets.splice(index, 1);
    }
    console.log("Current sockets in the room: " + sockets.length);
  });
});

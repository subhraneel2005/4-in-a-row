import { WebSocketServer, WebSocket } from "ws";
import { Socket } from "./types/Socket";
import { Game, games } from "./types/Game";

const wss = new WebSocketServer({ port: 3000 });

let waitingPlayer: Socket | null = null;
let gameId = 1;

wss.on("connection", (ws: Socket) => {
  ws.on("message", (message) => {
    if (!ws.username) {
      ws.username = message.toString();
      ws.send("Welcome " + ws.username);

      if (waitingPlayer === null) {
        waitingPlayer = ws;
        ws.send("Waiting for opponent...");

        const currentPlayer = ws;
        const thisGameID = gameId++;

        setTimeout(() => {
          if (waitingPlayer === currentPlayer) {
            waitingPlayer = null;
            const game: Game = {
              id: thisGameID,
              player1: currentPlayer,
              player2: "bot",
            };
            games.set(game.id, game);
            currentPlayer.send("No player found, you are playing with a bot");
            currentPlayer.send("Your turn");
          }
        }, 10000);
      } else {
        const player1 = waitingPlayer;
        const player2 = ws;
        waitingPlayer = null;
        const thisGameID = gameId++;

        const game: Game = {
          id: thisGameID,
          player1: player1,
          player2: player2,
        };

        games.set(game.id, game);

        console.log(
          `Starting match between ${player1.username} and ${player2.username} with gameId: ${thisGameID}`
        );

        player1.send(`Your opponent is ${player2.username}`);
        player2.send(`Your opponent is ${player1.username}`);
      }

      return;
    }
  });
});

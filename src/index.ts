import { WebSocketServer, WebSocket } from "ws";
import { Socket } from "./types/Socket";
import { Cell, Game, games } from "./types/Game";
import { checkWinner, findAvailableRow } from "./utils/helper";

const wss = new WebSocketServer({ port: 3000 });

let waitingPlayer: Socket | null = null;
let gameId = 1;
let parsed;

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
        const emptyBoard: Cell[][] = Array.from({ length: 6 }, () =>
          Array(7).fill(null)
        );

        setTimeout(() => {
          if (waitingPlayer === currentPlayer) {
            waitingPlayer = null;
            const game: Game = {
              id: thisGameID,
              player1: currentPlayer,
              player2: "bot",
              board: emptyBoard,
              turn: "R",
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
        const emptyBoard: Cell[][] = Array.from({ length: 6 }, () =>
          Array(7).fill(null)
        );

        const game: Game = {
          id: thisGameID,
          player1: player1,
          player2: player2,
          board: emptyBoard,
          turn: "R",
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
    try {
      parsed = JSON.parse(message.toString());
    } catch (error) {
      ws.send("Invalid message format");
      return;
    }

    if (parsed.type === "move") {
      const column = parsed.column;
      const game = [...games.values()].find(
        (g) => g.player1 === ws || g.player2 === ws
      );

      if (!game) {
        return ws.send("You are not part of any game");
      }

      const isPlayer1 = game?.player1 === ws;
      const playerSymbol = isPlayer1 ? "R" : "Y";

      if (game.turn !== playerSymbol) {
        return ws.send("Not your turn.");
      }

      const row = findAvailableRow(game.board, column);
      if (row === -1) {
        return ws.send("Column is full.");
      }

      game.board[row][column] = playerSymbol;
      const winner = checkWinner(game.board, row, column, playerSymbol);

      const boardState = JSON.stringify({
        type: "update",
        board: game.board,
        currentTurn: game.turn === "R" ? "Y" : "R",
      });
      game.turn = game.turn === "R" ? "Y" : "R";

      if (game.player2 === "bot") {
        ws.send(boardState);
      } else {
        game.player1.send(boardState);
        (game.player2 as Socket).send(boardState);
      }
      if (winner) {
        const winMsg = JSON.stringify({ type: "win", winner: ws.username });
        game.player1.send(winMsg);
        if (game.player2 !== "bot") (game.player2 as Socket).send(winMsg);
        games.delete(game.id);
        return;
      }
    }
  });
});

import { Socket } from "./Socket";

type Cell = null | "R" | "Y";
type PlayerSymbol = "R" | "Y";

interface Game {
  id: number;
  player1: Socket;
  player2: Socket | "bot";
  board: Cell[][];
  turn: "R" | "Y";
}

const games = new Map<number, Game>();

export { Cell, PlayerSymbol, Game, games };

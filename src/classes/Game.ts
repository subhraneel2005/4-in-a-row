import { Cell, PlayerSymbol } from "../types/Game";
import { Bot } from "./Bot";
import { Player } from "./Player";

export class Game {
  id: string;
  player1: Player;
  player2: Player | Bot;
  board: Cell[][];
  isFinished: boolean = false;
  currentTurn: PlayerSymbol;
  winner: Player | Bot | null = null;

  constructor(id: string, player1: Player, player2: Player | Bot) {
    this.id = id;
    this.player1 = player1;
    this.player2 = player2;
    this.board = Array.from({ length: 6 }, () => Array(7).fill(null));
    this.currentTurn = "R";
  }
}

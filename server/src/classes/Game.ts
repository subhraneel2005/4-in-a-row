import { Cell, PlayerSymbol } from "../types/Game";
import { checkWinner, findAvailableRow } from "../utils/helper";
import { Bot } from "./Bot";
import { Player } from "./Player";

export class Game {
  public id: number;
  public player1: Player;
  public player2: Player | Bot;
  public board: Cell[][];
  public isFinished: boolean = false;
  public currentTurn: PlayerSymbol;
  public winner: Player | Bot | null = null;

  constructor(id: number, player1: Player, player2: Player | Bot) {
    this.id = id;
    this.player1 = player1;
    this.player2 = player2;
    this.board = Array.from({ length: 6 }, () => Array(7).fill(null));
    this.currentTurn = "R";
  }

  makeMove(player: Player, column: number): boolean {
    if (this.isFinished) {
      player.send("Game ahs already finished");
    }
    if (!this.isPlayerTurn(player)) {
      player.send("Not your turn");
      return false;
    }
    const row = findAvailableRow(this.board, column);
    if (row === -1) {
      player.send("Column is full");
      return false;
    }

    this.board[row][column] = player.symbol;

    const winner = checkWinner(this.board, row, column, player.symbol);

    if (winner) {
      this.isFinished === true;
      this.winner = player;
      this.broadcastWin(player);
      return true;
    }

    this.switchTurn();
    this.broadcastBoardUpdate();

    if (
      this.player2 instanceof Bot &&
      this.currentTurn === this.player2.symbol
    ) {
      setTimeout(() => this.makeBotMove(), 1000);
    }

    return true;
  }

  private makeBotMove(): void {
    if (this.isFinished || !(this.player2 instanceof Bot)) return;

    const botColumn = this.player2.makeMove(this.board);
    if (botColumn === -1) {
      this.broadcastDraw();
      return;
    }

    const row = findAvailableRow(this.board, botColumn);
    this.board[row][botColumn] = this.player2.symbol;

    const winner = checkWinner(this.board, row, botColumn, this.player2.symbol);
    if (winner) {
      this.isFinished = true;
      this.winner = this.player2;
      this.broadcastWin(this.player2);
      return;
    }

    this.switchTurn();
    this.broadcastBoardUpdate();
  }

  private isPlayerTurn(player: Player): boolean {
    return player.symbol === this.currentTurn;
  }

  private switchTurn(): void {
    this.currentTurn = this.currentTurn === "R" ? "Y" : "R";
  }

  public broadcastBoardUpdate(): void {
    const updateMessage = {
      type: "update",
      board: this.board,
      currentTurn: this.currentTurn,
    };

    this.player1.sendJSON(updateMessage);
    if (this.player2 instanceof Player) {
      this.player2.sendJSON(updateMessage);
    }
  }

  private broadcastWin(winner: Player | Bot): void {
    const winMessage = {
      type: "win",
      winner: winner.username,
    };

    this.player1.sendJSON(winMessage);
    if (this.player2 instanceof Player) {
      this.player2.sendJSON(winMessage);
    }
  }

  private broadcastDraw(): void {
    const drawMessage = {
      type: "draw",
      message: "Game ended in a draw",
    };

    this.player1.sendJSON(drawMessage);
    if (this.player2 instanceof Player) {
      this.player2.sendJSON(drawMessage);
    }
  }

  public getOpponent(player: Player): Player | Bot | null {
    if (player === this.player1) return this.player2;
    if (player === this.player2) return this.player1;
    return null;
  }
}

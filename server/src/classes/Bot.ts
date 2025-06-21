import { Cell, PlayerSymbol } from "../types/Game";

export class Bot {
  public username: string = "Bot";
  public symbol: PlayerSymbol;

  constructor(symbol: PlayerSymbol) {
    this.symbol = symbol;
  }

  makeMove(board: Cell[][]): number {
    for (let column = 0; column < 7; column++) {
      if (board[0][column] === null) {
        return column;
      }
    }

    return -1;
  }

  send(message: string): void {}

  sendJSON(data: any): void {}
}

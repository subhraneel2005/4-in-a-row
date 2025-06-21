import { Cell } from "../types/Game";

export function findAvailableRow(board: Cell[][], column: number): number {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][column] === null) return row;
  }
  return -1;
}

export function checkWinner(
  board: Cell[][],
  row: number,
  col: number,
  player: "R" | "Y"
): boolean {
  return (
    checkDirection(0, 1) || // horizontal
    checkDirection(1, 0) || // vertical
    checkDirection(1, 1) || // diagonal down-right
    checkDirection(1, -1) // diagonal down-left
  );

  function checkDirection(rowInc: number, colInc: number): boolean {
    let count = 1;

    for (let i = 1; i < 4; i++) {
      const r = row + rowInc * i;
      const c = col + colInc * i;
      if (board[r]?.[c] === player) count++;
      else break;
    }

    for (let i = 1; i < 4; i++) {
      const r = row - rowInc * i;
      const c = col - colInc * i;
      if (board[r]?.[c] === player) count++;
      else break;
    }

    return count >= 4;
  }
}

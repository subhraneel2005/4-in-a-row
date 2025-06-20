import { Socket } from "./Socket";

export interface Game {
  id: number;
  player1: Socket;
  player2: Socket | "bot";
}

export const games = new Map<number, Game>();

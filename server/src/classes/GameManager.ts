import { Socket } from "../types/Socket";
import { Bot } from "./Bot";
import { Game } from "./Game";
import { Player } from "./Player";

export class GameManager {
  private games: Map<number, Game> = new Map();
  private waitingPlayer: Player | null = null;
  private gameIdCounter: number = 1;
  private readonly BOT_TIMEOUT = 10000;

  findOrCreateGame(socket: Socket, username: string): void {
    if (this.waitingPlayer === null) {
      const player = new Player(socket, username, "R");
      this.waitingPlayer = player;
      player.send("Waiting for opponent...");

      this.setBotTimeout(player);
    } else {
      const player1 = this.waitingPlayer;
      const player2 = new Player(socket, username, "Y");
      this.waitingPlayer = null;

      this.createPvPGame(player1, player2);
    }
  }

  private setBotTimeout(player: Player): void {
    setTimeout(() => {
      if (this.waitingPlayer === player) {
        this.waitingPlayer = null;
        this.createBotGame(player);
      }
    }, this.BOT_TIMEOUT);
  }

  private createPvPGame(player1: Player, player2: Player): void {
    const gameId = this.gameIdCounter++;
    const game = new Game(gameId, player1, player2);

    this.games.set(gameId, game);

    console.log(
      `Starting PvP match: ${player1.username} vs ${player2.username} (Game ID: ${gameId})`
    );

    player1.send(
      `Your opponent is ${player2.username}. You are Red (R) - Your turn!`
    );
    player2.send(
      `Your opponent is ${player1.username}. You are Yellow (Y) - Wait for your turn.`
    );

    game.broadcastBoardUpdate();
  }

  private createBotGame(player: Player): void {
    const gameId = this.gameIdCounter++;
    const bot = new Bot("Y");
    const game = new Game(gameId, player, bot);

    this.games.set(gameId, game);

    console.log(
      `Starting bot match: ${player.username} vs Bot (Game ID: ${gameId})`
    );

    player.send("No opponent found. You're now playing against a bot!");
    player.send("You are Red (R) - Your turn!");
    game.broadcastBoardUpdate();
  }

  handleMove(socket: Socket, column: number): void {
    const player = this.findPlayerInGames(socket);
    if (!player) {
      socket.send("You are not part of any active game");
      return;
    }

    const game = this.findGameByPlayer(player);
    if (!game) {
      socket.send("Game not found");
      return;
    }

    const success = game.makeMove(player, column);

    if (game.isFinished) {
      this.games.delete(game.id);
      console.log(
        `Game ${game.id} finished. Winner: ${game.winner?.username || "Draw"}`
      );
    }
  }

  private findPlayerInGames(socket: Socket): Player | null {
    for (const game of this.games.values()) {
      if (game.player1.socket === socket) return game.player1;
      if (game.player2 instanceof Player && game.player2.socket === socket)
        return game.player2;
    }
    return null;
  }

  private findGameByPlayer(player: Player): Game | null {
    for (const game of this.games.values()) {
      if (game.player1 === player || game.player2 === player) {
        return game;
      }
    }
    return null;
  }

  handleDisconnect(socket: Socket): void {
    // Handle player disconnection
    if (this.waitingPlayer && this.waitingPlayer.socket === socket) {
      this.waitingPlayer = null;
      console.log("Waiting player disconnected");
      return;
    }

    // Find and end any active games
    const player = this.findPlayerInGames(socket);
    if (player) {
      const game = this.findGameByPlayer(player);
      if (game && !game.isFinished) {
        const opponent = game.getOpponent(player);
        if (opponent instanceof Player) {
          opponent.send(`${player.username} disconnected. You win by default!`);
        }
        this.games.delete(game.id);
        console.log(`Game ${game.id} ended due to disconnection`);
      }
    }
  }

  getActiveGamesCount(): number {
    return this.games.size;
  }

  getWaitingPlayersCount(): number {
    return this.waitingPlayer ? 1 : 0;
  }
}

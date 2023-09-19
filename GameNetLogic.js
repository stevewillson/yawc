import Game from "./Game.js";

export default class GameNetLogic {
  constructor() {
    this.loginPort = 6049;
    this.loginPort2 = 7042;
    this.host = "HOSTNAME_CHANGEME";

    this.game = new Game(this);

    // TODO - set a fake username
    this.username = "testUsername";
    this.icons = ["icon1", "icon2"];
    // set up a fake gamePacket
    let gamePacket = {
      type: "newGame",
      gameId: 12345,
      gameSession: 54321,
      totalPlayers: 3,
      players: [
        {
          name: "player1",
          teamId: 2,
          icons: ["test", "asdf"],
          slot: 0,
          isGameOver: false,
        },
        {
          name: "player2",
          teamId: 1,
          icons: ["test", "asdf"],
          slot: 1,
          isGameOver: false,
        },
        {
          name: "player3",
          teamId: 1,
          icons: ["test", "asdf"],
          slot: 2,
          isGameOver: false,
        },
      ],
    };

    this.game.handleGamePacket(gamePacket);
  }

  getPlayer(playerName) {
    // TODO - return actual player name
    return "player1";
  }

  getPlayerRank(playerName) {
    // TODO - return actual player rank
    return 123;
  }

  getUsername() {
    // TODO - set the username
    return this.username;
  }

  getIcons() {
    // TODO - set the icons
    return this.icons;
  }
}

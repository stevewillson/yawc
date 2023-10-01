export class ServerUser {
  username;
  slot;
  clientId;
  userId;
  teamId;
  rank;
  clan;
  roomId;
  icons;
  isAlive;

  constructor(clientId, username) {
    // TODO don't store the client on the user
    // this.client = client;
    this.username = username;
    this.icons = [];
    this.roomId = null;
    this.slot = null;
    this.userId = crypto.randomUUID();
    this.teamId = null;
    this.isAlive = null;
    this.clientId = clientId;

    // Set some placeholder values that we aren't really using yet.
    this.rank = 0;
    this.clan = "--";
    this.icons.push("small-platinumWeapons.gif");
  }

  numIcons() {
    return this.icons.length;
  }
}

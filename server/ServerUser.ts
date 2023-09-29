export class ServerUser {
  username;
  client;
  slot;
  userId;
  teamId;
  rank;
  clan;
  room;
  icons;
  isAlive;

  constructor(client, username) {
    this.client = client;
    this.username = username;
    this.icons = [];
    this.room = null;
    this.userId = crypto.randomUUID();
    this.teamId = 0;

    // Set some placeholder values that we aren't really using yet.
    this.rank = 0;
    this.clan = "--";
    this.icons.push("small-platinumWeapons.gif");
  }

  numIcons() {
    return this.icons.length;
  }
}

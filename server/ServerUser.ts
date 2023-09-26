export class ServerUser {
  username;
  client;
  id = -1;
  totalCredits;
  subscriptionLevel;
  slot;
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

export default class PlayerElement {
  username;
  roomId;
  rank;
  icons;
  clan;
  bIgnored;

  constructor(username, clan, rank, icons) {
    this.roomId = -1;
    this.username = username;
    this.clan = clan;
    this.rank = rank;
    this.icons = icons;
  }

  // implement a way to get an HTML representation of this element

  toHTML() {
    const playerElementDiv = document.createElement("div");
    // TODO - add a click handler to bring up a dialog box for this player to see stats and whisper to them

    // clan user table rank
    const playerInfo = document.createElement("p");
    // TODO - make a function to get the room index from the room id
    // TODO - make a way to translate rank from a number to a color
    playerInfo.innerText = `${this.clan} / ${this.username} / ${this.roomId} / ${this.rank}`;
    playerElementDiv.appendChild(playerInfo);
    playerElementDiv.style.background = "red";
    return playerElementDiv;
  }

  // maybe used for sorting the elements,
  // will sort by the username or rank
  // compareTo(element) {
  //   if (element == null || !(element instanceof PlayerElement)) {
  //     return 0;
  //   }
  //   let b = cfPlayerElement.getIcons().length > 0;
  //   if (b == this.icons.length > 0) {
  //     return this.name
  //       .toLowerCase()
  //       .compareTo(cfPlayerElement.getName().toLowerCase());
  //   }
  //   if (b) {
  //     return 1;
  //   }
  //   return -1;
  // }
}

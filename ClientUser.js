export default class ClientUser {
  username;
  roomId;
  rank;
  icons;
  clan;
  bIgnored;
  userPanel;
  userId;
  teamId;
  shipType;

  constructor(userPanel, username, clan, rank, icons) {
    this.userPanel = userPanel;
    this.roomId = null;
    this.username = username;
    this.userId = userId;
    this.clan = clan;
    this.rank = rank;
    this.icons = icons;
    this.teamId = 0;
    this.shipType = 1;
  }

  // implement a way to get an HTML representation of this element

  toHtml() {
    // TODO - add a click handler to bring up a dialog box for this user to see stats and whisper to them

    // make a new table row
    const tableRow = document.createElement("tr");
    tableRow.className = "userElementRow";
    tableRow.id = `user:${this.username}`;

    const clanElement = document.createElement("td");
    const usernameElement = document.createElement("td");
    const roomIndexElement = document.createElement("td");
    const rankElement = document.createElement("td");
    clanElement.innerText = this.clan;
    usernameElement.innerText = this.username;

    // get the room index from the user manager
    roomIndexElement.innerText = this.userPanel.gamePanel.lobbyPanel.roomPanel
      .roomIndex(this.roomId);
    // TODO - use graphic for rank rather than text
    rankElement.innerText = this.rank;

    tableRow.appendChild(clanElement);
    tableRow.appendChild(usernameElement);
    tableRow.appendChild(roomIndexElement);
    tableRow.appendChild(rankElement);

    return tableRow;
  }

  // maybe used for sorting the elements,
  // will sort by the username or rank
  // compareTo(element) {
  //   if (element == null || !(element instanceof UserElement)) {
  //     return 0;
  //   }
  //   let b = cfUserElement.getIcons().length > 0;
  //   if (b == this.icons.length > 0) {
  //     return this.name
  //       .toLowerCase()
  //       .compareTo(cfUserElement.getName().toLowerCase());
  //   }
  //   if (b) {
  //     return 1;
  //   }
  //   return -1;
  // }
}

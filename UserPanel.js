// add a user to here,
// this displays the users in the Lobby
import UserElement from "./UserElement.js";

export default class UserPanel {
  users;
  gamePanel;

  constructor(gamePanel) {
    this.users = new Map();
    this.gamePanel = gamePanel;
  }

  toHtml() {
    const userPanelDiv = document.createElement("div");
    userPanelDiv.className = "userPanelDiv";
    userPanelDiv.id = "userPanelDiv";

    // add a table for the users
    const userPanelTable = document.createElement("table");
    userPanelTable.id = "userPanelTable";
    userPanelTable.className = "userPanelTable";

    const tableHeaderRow = document.createElement("tr");
    tableHeaderRow.className = "userElementHeader";

    const clanHeader = document.createElement("th");
    const usernameHeader = document.createElement("th");
    const roomHeader = document.createElement("th");
    const rankHeader = document.createElement("th");

    clanHeader.innerText = "Clan";
    usernameHeader.innerText = "User";
    roomHeader.innerText = "Room";
    rankHeader.innerText = "Rank";

    tableHeaderRow.appendChild(clanHeader);
    tableHeaderRow.appendChild(usernameHeader);
    tableHeaderRow.appendChild(roomHeader);
    tableHeaderRow.appendChild(rankHeader);

    userPanelTable.appendChild(tableHeaderRow);

    this.users.forEach((user) => {
      const el = user.toHtml();
      userPanelTable.appendChild(el);
    });

    userPanelDiv.appendChild(userPanelTable);
    return userPanelDiv;
  }

  getUser(username) {
    return this.users.get(username);
  }

  removeUser(username) {
    this.users.delete(username);
  }

  // add the user to the panel
  addUser(username, clan, rank, icons) {
    if (this.getUser(username) != null) {
      return;
    }
    let newUserElement = new UserElement(this, username, clan, rank, icons);

    // make a function to add a sorted element to the panel
    this.addSortedElement(newUserElement);

    // TODO - check if the element is already on the userPanel
    // also add to the DOM here
    let userPanelTable = document.getElementById("userPanelTable");
    userPanelTable.appendChild(newUserElement.toHtml());
  }

  addSortedElement(element) {
    // TODO - add an element to the user panel
    // add the user element to the map in a sorted way
    // use the username as the key and the value for now
    this.users.set(element, element);
  }

  clearUsers() {
    // create a new map for the users
    this.users = new Map();
  }

  setUserRank(username, rank) {
    this.users.get(username).rank = rank;
  }
}

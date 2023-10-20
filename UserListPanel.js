/**
 * Display the users in the clientUserManager
 * in the Lobby
 */
export class UserListPanel {
  gamePanel;
  clientUserManager;

  constructor(gamePanel) {
    this.gamePanel = gamePanel;
    this.clientUserManager = gamePanel.gameNetLogic.clientUserManager;
  }

  toHtml() {
    const userListPanelDiv = document.createElement("div");
    userListPanelDiv.className = "userListPanelDiv";
    userListPanelDiv.id = "userListPanelDiv";

    // add a table for the users
    const userListPanelTable = document.createElement("table");
    userListPanelTable.id = "userListPanelTable";
    userListPanelTable.className = "userListPanelTable";

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

    userListPanelTable.appendChild(tableHeaderRow);

    this.clientUserManager.users.forEach((user) => {
      const newRow = userListPanelDiv.insertRow(-1);
      this.toHtml(newRow);
    });

    userListPanelDiv.appendChild(userListPanelTable);
    return userListPanelDiv;
  }

  // method for modifying the html
  // used when a user logs out
  removeUserFromList(userId) {
    this.users.delete(username);
  }

  // add the user to the panel
  addUserToList(userId) {
    const user = this.clientUserManager.users.get(userId);
    if (user == null) {
      return;
    }
    // let newUserElement = new UserElement(this, username, clan, rank, icons);

    // make a function to add a sorted element to the panel
    // this.addSortedElement(newUserElement);

    // TODO - check if the element is already on the userListPanel
    // also add to the DOM here
    let userListPanelTable = document.getElementById("userListPanelTable");
    userListPanelTable.appendChild(user.toHtml());
  }

  addSortedElement(element) {
    // TODO - add an element to the user panel
    // add the user element to the map in a sorted way
    // use the username as the key and the value for now
    this.users.set(element, element);
  }

  clearUsers() {
    // create a new map for the users
    this.users.clear();
  }

  setUserRank(username, rank) {
    this.users.get(username).rank = rank;
  }
}

// client side user manager

import ClientUser from "./ClientUser.js";

// accepts network packets that tell about the users connected

// queried by the user panel to get a list of users that the client knows about

// store users by userId and then the user object

// by rank
// username

// maintains a collection of users, currently, the user panel does this.
// I want the user panel to query the user manager,
// this is something created by the gameNetLogic on login
export default class ClientUserManager {
  gameNetLogic;
  users;

  constructor(gameNetLogic) {
    this.gameNetLogic = gameNetLogic;
    this.users = new Map();
  }

  addUser(user) {
    const newUser = new ClientUser(this.gameNetLogic);
    newUser.setClientUser(
      user.userId,
      user.username,
      user.clan,
      user.rank,
      user.icons
    );

    this.users.set(newUser.userId, newUser);

    // trigger to display the user to the UserListPanel
    // TODO - use the UserListPanel class to add the user
    const userListPanelTable = document.getElementById("userListPanelTable");
    const newRow = userListPanelTable.insertRow(-1);
    newUser.toHtml(newRow);
  }

  updateUser(user) {
    // TODO modify the existing user object and redraw
    const curUser = this.users.get(user.userId);
    curUser.username = user.username;
    curUser.clan = user.clan;
    curUser.rank = user.rank;
    curUser.icons = user.icons;

    // remove the row
    const userListPanelRow = document.getElementById(curUser.userId);
    userListPanelRow.remove();

    // add a new row
    const userListPanelTable = document.getElementById("userListPanelTable");
    const newRow = userListPanelTable.insertRow(-1);
    curUser.toHtml(newRow);
  }

  removeUser(userId) {
    // remove the user by the user's id
    this.users.delete(userId);
  }

  // get username
  getUsername(userId) {
    if (userId == null) {
      return "Open Slot";
    }
    let user = this.users.get(userId);
    if (user != undefined) {
      return user.username;
    }
    return "No user found";
  }

  // the users are user objects
  getUserByUsername(username) {
    // return this.users.get(username);
    const retUser = this.clientUserManager.users.filter(
      (user) => user.username == username
    );
    return retUser;
  }
}

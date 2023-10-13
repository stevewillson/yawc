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
      user.icons,
    );

    this.users.set(newUser.userId, newUser);
  }

  removeUser(userId) {
    // remove the user by the user's id
    this.users.delete(userId);
  }

  // get username
  getUsername(userId) {
    if (userId == null) {
      return null;
    }
    let user = this.users.get(userId);
    if (user != undefined) {
      return user.username;
    }
    return "No user found";
  }
}

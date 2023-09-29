export class ServerUserManager {
  usernames;
  users;

  constructor() {
    this.usernames = new Set();
    this.users = new Map();
  }

  getUser(id) {
    // returns undefined if there is no user with that id
    return this.users.get(id);
  }

  usernameTaken(username) {
    return this.usernames.has(username);
  }

  addUser(user) {
    this.users.set(user.userId, user);
    this.usernames.add(user.username);
  }

  removeUser(user) {
    // remove the user by the user's id
    this.users.delete(user.userId);
    // remove the username
    this.usernames.delete(user.username);
  }
}

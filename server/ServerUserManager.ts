export class ServerUserManager {
  server;
  users;

  constructor(server) {
    this.server = server;
    this.users = new Map();
  }

  usernameTaken(targetUsername) {
    // get the usernames and then test
    // to determine whether the target usernames
    // is in those usernames

    // let userValues = this.users.values();

    return this.users.values()
      .map((user) => user.username)
      .some((username) => username == targetUsername);
    // return this.usernames.has(username);
  }

  addUser(user) {
    this.users.set(user.userId, user);
  }

  removeUser(user) {
    // remove the user by the user's id
    this.users.delete(user.userId);
  }
}

import { Team } from "./Team.ts";

export class ServerRoom {
  id;
  numPlayers;
  isRanked;
  isBigRoom;
  allShipsAllowed;
  allPowerupsAllowed;
  isTeamRoom;
  isBalancedRoom;
  isPrivate;
  boardSize;
  status;
  password;
  names;
  wins;
  users;
  numSlots;

  constructor(
    isRanked,
    password,
    isBigRoom,
    allShipsAllowed,
    allPowerupsAllowed,
    isTeamRoom,
    boardSize,
    isBalancedRoom,
  ) {
    this.isRanked = isRanked;
    this.password = password;
    this.isBigRoom = isBigRoom;
    this.allShipsAllowed = allShipsAllowed;
    this.allPowerupsAllowed = allPowerupsAllowed;
    this.isTeamRoom = isTeamRoom;
    this.boardSize = boardSize;
    this.isBalancedRoom = isBalancedRoom;
    this.isPrivate = false;
    this.status = 0;
    this.numPlayers = 0;
    this.id = -1;

    this.numSlots = isBigRoom ? 8 : 4;
    this.names = [];
    this.users = [];
    this.wins = [];

    if (password.length() > 0) {
      this.isPrivate = true;
    }
  }

  removeUser(user) {
    let slot = user.slot;
    this.names[slot] = null;
    this.users[slot] = null;
    this.wins[slot] = 0;
    this.numPlayers--;
  }

  isFull() {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] == null) {
        return false;
      }
    }
    return true;
  }

  setPlayersAlive() {
    this.users.forEach((user) => {
      if (user != null) {
        user.setAlive(true);
      }
    });
  }

  addUserByUsername(username) {
    for (let i = 0; i < this.names.length; i++) {
      if (this.names[i] == null) {
        this.names[i] = username;
        this.numPlayers++;
        return i;
      }
    }
    return -1;
  }
  addUser(user) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] == null) {
        this.users[i] = user;
        i;
      }
    }
    return -1;
  }

  player(i) {
    return this.names[i] != null ? this.names[i] : "";
  }

  hasPlayer(player) {
    for (let i = 0; i < this.names.length; i++) {
      if (this.names[i] != null && this.names[i] == player) {
        return true;
      }
    }
    return false;
  }

  numPlayerSlots() {
    return this.names.length;
  }

  numPlayersAlive() {
    let count = 0;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] != null) {
        if (this.users[i].isAlive()) {
          count++;
        }
      }
    }
    return count;
  }

  numPlayersAliveForTeam(teamId: number) {
    let count = 0;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] != null) {
        if (this.users[i].isAlive() && this.users[i].teamId() == teamId) {
          count++;
        }
      }
    }
    return count;
  }

  gameOver() {
    if (this.isTeamRoom) {
      let goldTeamDead = this.numPlayersAliveForTeam(Team.GOLDTEAM) == 0;
      let blueTeamDead = this.numPlayersAliveForTeam(Team.BLUETEAM) == 0;
      return goldTeamDead || blueTeamDead;
    }

    return this.numPlayersAlive() == 1;
  }

  increaseWinCounts() {
    this.users.forEach((user) => {
      if (user != null && user.isAlive) {
        this.wins[user.slot]++;
      }
    });
  }

  teamSize(teamId: number) {
    let count = 0;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] != null && this.users[i].teamId() == teamId) {
        count++;
      }
    }
    return count;
  }

  winnerSlot() {
    if (this.isTeamRoom) {
      return this.numPlayersAliveForTeam(Team.GOLDTEAM) > 0
        ? Team.GOLDTEAM
        : Team.BLUETEAM;
    }
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] != null && this.users[i].isAlive) {
        return this.users[i].slot;
      }
    }
    return -1;
  }
  winCountOf(slot: number) {
    return this.wins[slot];
  }
}

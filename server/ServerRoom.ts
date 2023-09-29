import { Team } from "./Team.ts";

export class ServerRoom {
  roomId;
  numUsers;
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
    this.numUsers = 0;
    this.roomId = crypto.randomUUID();

    this.numSlots = isBigRoom ? 8 : 4;
    this.users = [];
    this.wins = [];

    // initialize the slot to be "Open Slot"
    // initialize wins to be all 0's
    for (let i = 0; i < this.numSlots; i++) {
      this.users.push("Open Slot");
      this.wins.push(0);
    }

    if (password.length > 0) {
      this.isPrivate = true;
    }
  }

  removeUser(user) {
    let slot = user.slot;
    this.users[slot] = "Open Slot";
    this.wins[slot] = 0;
    this.numUsers--;
  }

  isFull() {
    // check the table for an open slot
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] == "Open Slot") {
        return false;
      }
    }
    return true;
  }

  setUsersAlive() {
    this.users.forEach((user) => {
      if (user != "Open Slot") {
        user.isAlive = true;
      }
    });
  }

  addUser(user) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] == "Open Slot") {
        this.users[i] = user;
        this.wins[i] = 0;
        return i;
      }
    }
    return -1;
  }

  numUsersAlive() {
    // let count = 0;
    // filter and count the length of the result
    const numUsersAlive =
      this.users.filter((user) => user != "Open Slot" && user.isAlive).length;
    return numUsersAlive;
    // for (let i = 0; i < this.users.length; i++) {
    //   if (this.users[i] != null) {
    //     if (this.users[i].isAlive) {
    //       count++;
    //     }
    //   }
    // }
    // return count;
  }

  numUsersAliveForTeam(teamId: number) {
    // use a filter for here as well
    const numUsersAlive =
      this.users.filter((user) =>
        user != "Open Slot" && user.teamId == teamId && user.isAlive
      ).length;
    return numUsersAlive;
    // let count = 0;
    // for (let i = 0; i < this.users.length; i++) {
    //   if (this.users[i] != null) {
    //     if (this.users[i].isAlive() && this.users[i].teamId == teamId) {
    //       count++;
    //     }
    //   }
    // }
    // return count;
  }

  gameOver() {
    if (this.isTeamRoom) {
      let goldTeamDead = this.numUsersAliveForTeam(Team.GOLDTEAM) == 0;
      let blueTeamDead = this.numUsersAliveForTeam(Team.BLUETEAM) == 0;
      return goldTeamDead || blueTeamDead;
    }

    return this.numUsersAlive() == 1;
  }

  increaseWinCounts() {
    this.users.forEach((user) => {
      if (user != "Open Slot" && user.isAlive) {
        this.wins[user.slot]++;
      }
    });
  }

  teamSize(teamId: number) {
    const teamSize =
      this.users.filter((user) => user != "Open Slot" && user.teamId == teamId)
        .length;
    return teamSize;
    // let count = 0;
    // for (let i = 0; i < this.users.length; i++) {
    //   if (this.users[i] != "Open Slot" && this.users[i].teamId == teamId) {
    //     count++;
    //   }
    // }
    // return count;
  }

  winnerSlot() {
    if (this.isTeamRoom) {
      return this.numUsersAliveForTeam(Team.GOLDTEAM) > 0
        ? Team.GOLDTEAM
        : Team.BLUETEAM;
    } else {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i] != "Open Slot" && this.users[i].isAlive) {
          return this.users[i].slot;
        }
      }
    }
    return -1;
  }

  winCountOf(slot: number) {
    return this.wins[slot];
  }
}

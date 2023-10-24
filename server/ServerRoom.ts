import { Team } from "./Team.ts";
import { RoomStatus } from "./RoomStatus.ts";

export class ServerRoom {
  roomId;
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
  userIds;
  numSlots;
  gameOver;
  winnerSlot;

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
    this.status = "idle";
    this.roomId = crypto.randomUUID();
    this.gameOver = false;

    this.numSlots = isBigRoom ? 8 : 4;
    // store users by userid
    this.userIds = [];
    this.wins = [];

    // initialize the slot to be "Open Slot"
    // initialize wins to be all 0's
    for (let i = 0; i < this.numSlots; i++) {
      this.userIds.push(null);
      this.wins.push(0);
    }

    if (password.length > 0) {
      this.isPrivate = true;
    }
  }

  addUser(userId) {
    for (let i = 0; i < this.userIds.length; i++) {
      if (this.userIds[i] == null) {
        this.userIds[i] = userId;
        this.wins[i] = 0;
        return i;
      }
    }
    return -1;
  }

  removeUser(userId) {
    // get the user by the userId
    for (let i = 0; i < this.numSlots; i++) {
      if (this.userIds[i] == userId) {
        this.userIds[i] = null;
        this.wins[i] = 0;
      }
    }
  }

  isFull() {
    // check the table for an open slot
    for (let i = 0; i < this.userIds.length; i++) {
      if (this.userIds[i] == null) {
        return false;
      }
    }
    return true;
  }

  winCountOf(slot: number) {
    return this.wins[slot];
  }

  numUsers() {
    let count = 0;
    for (let i = 0; i < this.numSlots; i++) {
      if (this.userIds[i] != null) {
        count++;
      }
    }
    return count;
  }
}

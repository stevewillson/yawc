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
    this.status = RoomStatus.IDLE;
    this.roomId = crypto.randomUUID();

    this.numSlots = isBigRoom ? 8 : 4;
    // TODO - store users by userid
    this.userIds = [];
    this.wins = [];

    // initialize the slot to be "Open Slot"
    // initialize wins to be all 0's
    for (let i = 0; i < this.numSlots; i++) {
      this.userIds.push("Open Slot");
      this.wins.push(0);
    }

    if (password.length > 0) {
      this.isPrivate = true;
    }
  }

  addUser(userId) {
    for (let i = 0; i < this.userIds.length; i++) {
      if (this.userIds[i] == "Open Slot") {
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
        this.userIds[i] = "Open Slot";
        this.wins[i] = 0;
      }
    }
  }

  isFull() {
    // check the table for an open slot
    for (let i = 0; i < this.userIds.length; i++) {
      if (this.userIds[i] == "Open Slot") {
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
      if (this.userIds[i] != "Open Slot") {
        count++;
      }
    }
    return count;
  }
}

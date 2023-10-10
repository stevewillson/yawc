import ClientRoomManager from "./ClientRoomManager.js";

export default class ClientRoom {
  clientRoomManager;
  clientUserManager;

  roomId;
  status;
  userIds;
  numSlots;

  isPrivate;
  isRanked;
  isTeamRoom;
  isBigRoom;
  allShipsAllowed;
  allPowerupsAllowed;
  isBalancedRoom;

  boardSize;
  text;
  countdown;
  options;

  password;
  wins;

  constructor(clientRoomManager, room) {
    this.clientRoomManager = clientRoomManager;
    this.clientUserManager = clientRoomManager.gameNetLogic.clientUserManager;
    this.userIds = room.userIds;
    this.roomId = room.roomId;
    this.numSlots = room.numSlots;
    // set start status in waiting
    this.status = "idle";
  }

  toHtml() {
    // specify how to represent the room as an HTML element
    // draw a 'join' button
    // draw a table size below the joint button
    // set the users in each of the slots
    // 4 slots for a small table
    // 8 slots for a large table

    // table of either 2x3 or 2x5 to show the slots
    // get the room index
    const joinRoomButton = document.createElement("button");
    joinRoomButton.innerText = `Join Room ${
      this.clientRoomManager.roomIndex(
        this.roomId,
      )
    }`;
    joinRoomButton.className = "joinRoomButton";
    joinRoomButton.onclick = () =>
      this.clientRoomManager.gameNetLogic.handleJoinRoom(this.roomId);

    const roomElementDiv = document.createElement("div");
    roomElementDiv.className = "roomElement";
    roomElementDiv.id = this.roomId;

    const roomTable = document.createElement("table");
    roomTable.className = "roomElementTable";
    const firstRow = document.createElement("tr");
    const firstElement = document.createElement("td");
    const secondElement = document.createElement("td");
    const thirdElement = document.createElement("td");

    firstElement.appendChild(joinRoomButton);
    // get the username from the userId
    secondElement.innerHTML = this.clientUserManager.getUsername(
      this.userIds[0],
    );
    secondElement.id = `${this.roomId}-slot0`;
    thirdElement.innerHTML = this.clientUserManager.getUsername(
      this.userIds[1],
    );
    thirdElement.id = `${this.roomId}-slot1`;

    firstRow.appendChild(firstElement);
    firstRow.appendChild(secondElement);
    firstRow.appendChild(thirdElement);

    const secondRow = document.createElement("tr");
    const fourthElement = document.createElement("td");
    const fifthElement = document.createElement("td");
    const sixthElement = document.createElement("td");

    if (this.numSlots == 4) {
      fourthElement.innerHTML = "Large";
      fifthElement.innerHTML = this.clientUserManager.getUsername(
        this.userIds[2],
      );
      fifthElement.id = `${this.roomId}-slot2`;

      sixthElement.innerHTML = this.clientUserManager.getUsername(
        this.userIds[3],
      );
      sixthElement.id = `${this.roomId}-slot3`;

      secondRow.appendChild(fourthElement);
      secondRow.appendChild(fifthElement);
      secondRow.appendChild(sixthElement);
    } else {
      // TODO - draw for rooms with 8 slots
      const firstRow = document.createElement("tr");
      const fourthElement = document.createElement("td");
      const fifthElement = document.createElement("td");

      fourthElement.innerHTML = this.clientUserManager.getUsername(
        this.userIds[2],
      );
      fifthElement.innerHTML = this.clientUserManager.getUsername(
        this.userIds[3],
      );

      firstRow.appendChild(fourthElement);
      firstRow.appendChild(fifthElement);
    }

    roomTable.appendChild(firstRow);
    roomTable.appendChild(secondRow);

    roomElementDiv.appendChild(roomTable);
    return roomElementDiv;
  }

  getOptionBool(s) {
    return this.getOption(s) != null;
  }

  setOptions(
    bRanked,
    bPrivate,
    bAllShipsAllowed,
    bAllPowerupsAllowed,
    isTeamRoom,
    boardSize,
    bBalancedTeams,
    options,
  ) {
    this.bRanked = bRanked;
    this.bPrivate = bPrivate;
    this.isTeamRoom = isTeamRoom;
    this.boardSize = boardSize;
    this.bAllShipsAllowed = bAllShipsAllowed;
    this.bAllPowerupsAllowed = bAllPowerupsAllowed;
    this.bBalancedTeams = bBalancedTeams;
    this.options = options;
  }

  getOption(s) {
    if (this.options != null) {
      for (let i = 0; i < this.options.length; ++i) {
        if (this.options[i][0] == s) {
          return this.options[i][1];
        }
      }
    }
    return null;
  }

  addUser(userId, slot) {
    // TODO - check if the slot is empty?
    this.userIds[slot] = userId;
  }

  // remove the user from the room
  removeUser(userId) {
    for (let i = 0; i < this.userIds.length; i++) {
      if (this.userIds[i] == userId) {
        this.userIds[i] = null;
        return i;
      }
    }
  }

  setStatus(status, countdown = this.countdown) {
    if (this.countdown != countdown) {
      this.countdown = countdown;
    }
    if (this.status != status) {
      this.status = status;
    }
  }

  getUserId(slot) {
    return this.userIds[slot];
  }

  getSlot(userId) {
    for (let i = 0; i < this.userIds.length; i++) {
      if (this.userIds[i] == userId) {
        return i;
      }
    }
    return null;
  }

  numUsers() {
    let count = 0;
    for (let i = 0; i < this.userIds.length; i++) {
      // TODO use 'null' for an empty userId slot
      if (this.userIds[i] != null) {
        count++;
      }
    }
    return count;
  }
}

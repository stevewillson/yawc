import ClientRoomManager from "./ClientRoomManager.js";
import ClientUser from "./ClientUser.js";

export default class ClientRoom {
  clientRoomManager;
  clientUserManager;

  roomId;
  status;
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

  users;

  constructor(clientRoomManager, roomPacket) {
    this.clientRoomManager = clientRoomManager;
    this.clientUserManager = clientRoomManager.gameNetLogic.clientUserManager;
    this.userIds = roomPacket.userIds;
    this.roomId = roomPacket.roomId;
    this.numSlots = roomPacket.numSlots;

    // copy the values from userIds into the this.userIds
    // this.userIds = [];
    // for (let i = 0; i < roomPacket.userIds.length; i++) {
    //   this.userIds.push(roomPacket.userIds[i]);
    // }

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
    joinRoomButton.innerText = `Join Room ${this.clientRoomManager.roomIndex(
      this.roomId
    )}`;
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
      this.userIds[0]
    );
    secondElement.id = `${this.roomId}-slot0`;
    thirdElement.innerHTML = this.clientUserManager.getUsername(
      this.userIds[1]
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
        this.userIds[2]
      );
      fifthElement.id = `${this.roomId}-slot2`;

      sixthElement.innerHTML = this.clientUserManager.getUsername(
        this.userIds[3]
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
        this.userIds[2]
      );
      fifthElement.innerHTML = this.clientUserManager.getUsername(
        this.userIds[3]
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
    options
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

  getUserId(slot) {
    return this.userIds[slot];
  }

  getUser(slot, userId) {
    if (slot > this.userIds.length) {
      return "COMPUTER";
    }

    if (slot == this.getSlot(userId)) {
      return "YOU";
    }
    return this.clientUserManager.users.get(userId).username;
  }

  setStatus(status, countdown = this.countdown) {
    if (this.countdown != countdown) {
      this.countdown = countdown;
    }
    if (this.status != status) {
      this.status = status;
    }
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
      // use 'null' for an empty userId slot
      if (this.userIds[i] != null) {
        count++;
      }
    }
    return count;
  }

  resetPowerups() {
    for (let i = 0; i < this.userIds.length; i++) {
      if (this.userIds[i] != null) {
        const user = this.clientUserManager.users.get(this.userIds[i]);
        user.resetPowerups();
      }
    }
  }

  // TODO - want to use the ClientRoomManager / ClientUserManager for this now
  setUsers(gamePacket) {
    // do this when a user joins a room, don't wait until game start

    // have the roomId from the game packet
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      gamePacket.roomId
    );

    for (let i = 0; i < room.numUsers(); i++) {
      const userId = room.userIds[i];
      const user = this.gameNetLogic.clientUserManager.users.get(userId);

      const slot = room.getSlot(userId);

      const gameOver = false;

      if (userId != this.gameNetLogic.userId) {
        // use ClientUserManager settings for this info
        this.setUser(
          user,
          user.teamId,
          // user.icons,
          // this.logic.getUser(userName).getIcons(),
          slot,
          gameOver
        );
        if (gameOver == false) {
        }
      } else {
        this.slot = slot;
        this.color = this.colors.colors[slot][0];
        this.teamId = user.teamId;
      }
    }
    this.refreshUserBar = true;
  }

  // draw the user info block
  // TODO - see about setting the clientUser of the userState
  // to a ClientUser object
  setUser(clientUser, teamId, slot, gameOver) {
    // let userState = this.userStates[this.translateSlot(slot)];
    let userState = this.userStates[slot];
    userState.reset();
    userState.resetPowerups();
    // sets the username and the slot/colors
    userState.setState(clientUser, slot);
    // done in the setState function
    // userState.clientUser = clientUser;
    // userState.rank = rank;
    // userState.icons = icons;

    userState.teamId = teamId;
    userState.numPowerups = 0;
    userState.gameOver = gameOver;
    userState.isEmpty = false;
    this.refreshUserBar = true;
    this.setSlot(slot);
  }
}

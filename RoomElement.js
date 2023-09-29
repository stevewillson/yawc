export default class RoomElement {
  OPENSLOT = "Open Slot";
  roomId;
  status;
  users;
  numUsers;
  numSlots;
  bPrivate;
  bRanked;
  bTeamRoom;
  bAllShipsAllowed;
  bAllPowerupsAllowed;
  boardSize;
  bBalancedTeams;
  text;
  countdown;
  options;
  bOver;
  lastMouseX;
  lastMouseY;

  constructor(
    roomPanel,
    roomId,
    status,
    isRanked,
    isPrivate,
    isBigRoom,
    allShipsAllowed,
    allPowerupsAllowed,
    isTeamRoom,
    boardSize,
    isBalancedRoom,
    roomUsers,
    numSlots,
    password
  ) {
    this.roomPanel = roomPanel;
    this.users = [];
    for (let i = 0; i < numSlots; i++) {
      this.users.push(roomUsers[i]);
    }
    this.roomId = roomId;
    this.numSlots = numSlots;
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
    joinRoomButton.innerText = `Join Room ${this.roomPanel.roomIndex(
      this.roomId
    )}`;
    joinRoomButton.className = "joinRoomButton";
    // TODO
    // joinRoomButton.onclick =

    const roomElementDiv = document.createElement("div");
    roomElementDiv.className = "roomElement";

    const roomTable = document.createElement("table");
    roomTable.className = "roomElementTable";
    const firstRow = document.createElement("tr");
    const firstElement = document.createElement("td");
    const secondElement = document.createElement("td");
    const thirdElement = document.createElement("td");

    firstElement.appendChild(joinRoomButton);
    secondElement.innerHTML = this.users[0];
    thirdElement.innerHTML = this.users[1];

    firstRow.appendChild(firstElement);
    firstRow.appendChild(secondElement);
    firstRow.appendChild(thirdElement);

    const secondRow = document.createElement("tr");
    const fourthElement = document.createElement("td");
    const fifthElement = document.createElement("td");
    const sixthElement = document.createElement("td");

    if (this.numSlots == 4) {
      fourthElement.innerHTML = "Large";
      fifthElement.innerHTML = this.users[2];
      sixthElement.innerHTML = this.users[3];

      secondRow.appendChild(fourthElement);
      secondRow.appendChild(fifthElement);
      secondRow.appendChild(sixthElement);
    } else {
      // TODO - draw for rooms with 8 slots
      const firstRow = document.createElement("tr");
      const fourthElement = document.createElement("td");
      const fifthElement = document.createElement("td");

      fourthElement.innerHTML = this.users[2];
      fifthElement.innerHTML = this.users[3];

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

  removeUser(s) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] == s) {
        this.users[i] = "Open Slot";
        this.numUsers--;
        return;
      }
    }
  }

  setOptions(
    bRanked,
    bPrivate,
    bAllShipsAllowed,
    bAllPowerupsAllowed,
    bTeamRoom,
    boardSize,
    bBalancedTeams,
    options
  ) {
    this.bRanked = bRanked;
    this.bPrivate = bPrivate;
    this.bTeamRoom = bTeamRoom;
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
  // code for the mouse handler
  //  void handleMouseReleased(final int n, final int n2) {
  //     final String roomUserClick = CFSkin.getSkin().isRoomUserClick(this, n, n2);
  //     if (roomUserClick == null) {
  //         if (CFSkin.getSkin().isJoinRoomClick(this, n, n2)) {
  //             this.listener.fireEvent(this, null);
  //         }
  //     }
  //     else {
  //         this.listener.fireEvent(this, roomUserClick);
  //     }
  // }

  addUser(username, slot) {
    // TODO - check if the slot is empty?
    this.users[slot] = username;
    this.numUsers++;
  }

  setStatus(status, countdown = this.countdown) {
    if (this.countdown != countdown) {
      this.countdown = countdown;
    }
    if (this.status != status) {
      this.status = status;
    }
  }
  getUsername(slot) {
    return this.users[slot];
  }

  getSlot(username) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] == username) {
        return i;
      }
    }
    return -1;
  }
}

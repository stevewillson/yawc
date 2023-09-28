export default class RoomElement {
  OPENSLOT = "Open Slot";
  roomId;
  status;
  names;
  numPlayers;
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

  constructor() {
    this.names = new Array(8);
    this.roomId = crypto.randomUUID();
    for (let i = 0; i < this.names.length; i++) {
      this.names[i] = "Open Slot";
    }
  }

  toHtml() {
    // specify how to represent the room as an HTML element
    // draw a 'join' button
    // draw a table size below the joint button
    // set the users in each of the slots
    // 4 slots for a small table
    // 8 slots for a large table

    const roomElementDiv = document.createElement("div");

    roomElementDiv.style.border = "6px solid";
    roomElementDiv.style.borderColor = "#cccccc";
    roomElementDiv.style.backgroundColor = "#3F1710";

    const para = document.createElement("p");
    para.innerText = `A ROOM`;
    roomElementDiv.appendChild(para);
    return roomElementDiv;
  }

  getOptionBool(s) {
    return this.getOption(s) != null;
  }

  removePlayer(s) {
    for (let i = 0; i < this.names.length; i++) {
      if (this.names[i] == s) {
        this.names[i] = "Open Slot";
        this.numPlayers--;
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
  //     final String roomPlayerClick = CFSkin.getSkin().isRoomPlayerClick(this, n, n2);
  //     if (roomPlayerClick == null) {
  //         if (CFSkin.getSkin().isJoinRoomClick(this, n, n2)) {
  //             this.listener.fireEvent(this, null);
  //         }
  //     }
  //     else {
  //         this.listener.fireEvent(this, roomPlayerClick);
  //     }
  // }

  isBigRoom() {
    return this.numPlayers > 4;
  }

  addPlayer(username, slot) {
    // TODO - check if the slot is empty?
    this.names[slot] = username;
    this.numPlayers++;
  }

  setStatus(status, countdown = this.countdown) {
    if (this.countdown != countdown) {
      this.countdown = countdown;
    }
    if (this.status != status) {
      this.status = status;
    }
  }
  getPlayer(slot) {
    return this.names[slot];
  }

  getSlot(username) {
    for (let i = 0; i < this.names.length; i++) {
      if (this.names[i] == username) {
        return i;
      }
    }
    return -1;
  }
}

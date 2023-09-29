import RoomElement from "./RoomElement.js";

export default class RoomPanel {
  rooms;
  gamePanel;

  constructor(gamePanel) {
    this.gamePanel = gamePanel;
    this.rooms = [];
  }

  toHtml() {
    const roomPanelDiv = document.createElement("div");
    roomPanelDiv.className = "lobbyPanel";
    roomPanelDiv.id = "roomPanelDiv";
    this.rooms.forEach((room) => {
      const el = room.toHtml();
      roomPanelDiv.appendChild(el);
    });
    return roomPanelDiv;
  }

  findRoom(n) {
    // get a room by roomId
    // now just get the room by index in the room array
    return this.rooms[n];
  }

  setRoomStatus(n, b, n2) {
    let room = this.findRoom(n);
    if (room != null) {
      room.setStatus(b, n2);
    }
  }

  removeRoom(n) {
    // remove the room from the array of rooms, using a filter?
    // TODO
    let roomElement = this.rooms.remove(n);
    if (roomElement != null) {
      this.removeElement(roomElement);
    }
  }

  addRoom(
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
    // create a new room

    // check if the room already exists by roomId
    if (this.roomIndex(roomId) == -1) {
      // the room is not found
      let newRoomElement = new RoomElement(
        this,
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
      );

      // let generateroomElement = CFSkin.getSkin().generateroomElement(
      // super.listener,
      // n,
      // this.getSize().width - 30,
      // n2
      // );
      // add the room to the sorted order,
      // how should rooms be sorted?
      this.rooms.push(newRoomElement);
      // this.rooms.set(newRoom.roomId, newRoom);
      // this.addSortedElement(newRoom);

      let roomPanelDiv = document.getElementById("roomPanelDiv");
      roomPanelDiv.appendChild(newRoomElement.toHtml());
    }

    // server created the new room, it has a room id assigned
  }

  roomIndex(roomId) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].roomId == roomId) {
        return i;
      }
    }
    return -1;
  }

  addUserToRoom(n, s, b) {
    let room = this.findRoom(n);
    if (room != null) {
      room.addUser(s, b);
    }
  }

  clearRooms() {
    this.rooms = Map();
  }

  removeUserFromRoom(n, s) {
    room = this.findRoom(n);
    if (room != null) {
      room.removeUser(s);
    }
  }
}

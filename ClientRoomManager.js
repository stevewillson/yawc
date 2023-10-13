import ClientRoom from "./ClientRoom.js";

export default class ClientRoomManager {
  gameNetLogic;
  rooms;

  static TEAM_COLORS = ["white", "rgb(232, 224, 0)", "rgb(87, 83, 255)"];
  static TEAM_BG_COLORS = ["black", "black", "white"];
  static TEAM_NAMES = ["", "Gold Team", "Blue Team"];

  static ROOM_STATUS_IDLE = 0;
  static ROOM_STATUS_DELETE = 1;
  static ROOM_STATUS_COUNTDOWN = 3;
  static ROOM_STATUS_PLAYING = 4;
  static ROOM_STATUS_GAMEOVER = 5;

  constructor(gameNetLogic) {
    this.gameNetLogic = gameNetLogic;
    // change to a array
    // so that we have consistent indices
    this.rooms = [];
  }

  addRoom(roomPacket) {
    // create a new room
    // check if the room already exists by roomId
    if (this.roomIndex(roomPacket.roomId) == -1) {
      // the room is not found
      // just use a room object to create a new room, we received one from the server
      let clientRoom = new ClientRoom(this, roomPacket);

      // add the room to the sorted order,
      // how should rooms be sorted?
      this.rooms.push(clientRoom);
      // this.addSortedElement(newRoom);

      // add the room to the RoomListPanel as well
      // TODO
      let roomListPanelDiv = document.getElementById("roomListPanelDiv");
      roomListPanelDiv.appendChild(clientRoom.toHtml());

      return clientRoom;
    }
  }

  // TODO - when a user leaves a room and it is the last
  // user in the room, then delete the room
  removeRoom(targetRoomId) {
    // remove the room with id from the rooms
    this.rooms = this.rooms.filter((room) => room.roomId != targetRoomId);

    // remove the room from the display
    document.getElementById(targetRoomId).remove();

    // update the room display to reindex the rooms
  }

  getRoomById(roomId) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].roomId == roomId) {
        return this.rooms[i];
      }
    }
    return null;
  }

  // set when the room status is changing
  // to playing, countdown ...
  setRoomStatus(roomId, status, countdown) {
    // TODO - what status are we setting
    const room = this.getRoomById(roomId);
    if (room != null) {
      room.setStatus(status, countdown);
    }
  }

  roomIndex(roomId) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].roomId == roomId) {
        return i;
      }
    }
    return -1;
  }

  getRoomById(roomId) {
    let room = null;
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].roomId == roomId) {
        room = this.rooms[i];
      }
    }
    return room;
  }

  addUserToRoom(roomId, userId, slot, shipType, teamId) {
    // get the room by roomId
    const room = this.getRoomById(roomId);
    if (room != null) {
      room.addUser(userId, slot);

      // update the roomId for the user here?
      const user = this.gameNetLogic.clientUserManager.users.get(userId);
      user.roomId = roomId;
      user.slot = slot;
      user.shipType = shipType;
      user.teamId = teamId;

      // update the room slot element
      const roomSlotElement = document.getElementById(`${roomId}-slot${slot}`);
      roomSlotElement.innerHTML = user.username;
    }
  }

  // call this from the gameNetLogic
  removeUserFromRoom(userId) {
    // get the room the user is currently in
    const user = this.gameNetLogic.clientUserManager.users.get(userId);
    // the user's roomId is null at this time, why?
    const room = this.getRoomById(user.roomId);

    // also set the html of the room?
    const roomSlotElement = document.getElementById(
      `${user.roomId}-slot${user.slot}`
    );
    roomSlotElement.innerHTML = "Open Slot";

    user.isInARoom = false;
    user.roomId = null;
    user.slot = null;
    room.removeUser(userId);

    // check if there are any other usres in the room
    // if not, then remove the room
  }
}

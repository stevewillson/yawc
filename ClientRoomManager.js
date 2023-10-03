import ClientRoom from "./ClientRoom.js";

export default class ClientRoomManager {
  gameNetLogic;
  rooms;

  static STATUS_IDLE = 0;
  static STATUS_DELETE = 1;
  static STATUS_COUNTDOWN = 3;
  static STATUS_PLAYING = 4;
  static STATUS_GAMEOVER = 5;

  constructor(gameNetLogic) {
    this.gameNetLogic = gameNetLogic;
    // change to a array
    // so that we have consistent indices
    this.rooms = [];
  }

  addRoom(room) {
    // create a new room
    // check if the room already exists by roomId
    if (this.roomIndex(room.roomId) == -1) {
      // the room is not found
      // just use a room object to create a new room, we received one from the server
      let clientRoom = new ClientRoom(this, room);

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

  // need to get the 'addUser' packet back from the server
  // to tell which slot to put the user in
  addUserToRoom(roomId, userId, slot, teamId) {
    // find the first empty slot in the room to add the user to
    // get the room by roomId

    // need to iterate through the rooms to find the room Id
    const room = this.getRoomById(roomId);
    if (room != null) {
      room.addUser(userId, slot);

      // update the roomId for the user here?
      const user = this.gameNetLogic.clientUserManager.users.get(userId);
      user.roomId = roomId;
      user.slot = slot;
      user.teamId = teamId;
    }
  }

  // call this from the gameNetLogic
  removeUserFromRoom(userId) {
    // get the room the user is currently in
    const user = this.gameNetLogic.clientUserManager.users.get(userId);
    // the user's roomId is null at this time, why?
    const room = this.getRoomById(user.roomId);
    user.isInARoom = false;
    user.roomId = null;
    user.slot = null;
    room.removeUser(userId);

    // check if there are any other usres in the room
    // if not, then remove the room
  }
}

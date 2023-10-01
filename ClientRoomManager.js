import ClientRoom from "./ClientRoom.js";

export default class ClientRoomManager {
  gameNetLogic;
  rooms;

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
    }
  }

  removeRoom(targetRoom) {
    // remove the room with id from the rooms
    this.rooms = this.rooms.filter((room) => room.roomId != targetRoom.roomId);

    // remove the room from the display
    document.getElementById(this.targetRoom.roomId).remove();
  }

  getRoomById(roomId) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].roomId == roomId) {
        return this.rooms[i];
      }
    }
    return null;
  }

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
      const user = this.gameNetLogic.clientUserManager.getUserById(userId);
      user.roomId = roomId;
      user.slot = slot;
      user.teamId = teamId;
    }
  }

  removeUserFromRoom(n, s) {
    room = this.findRoom(n);
    if (room != null) {
      room.removeUser(s);
    }
  }
}

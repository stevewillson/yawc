export class ServerRoomManager {
  rooms;

  constructor() {
    this.rooms = new Map();
  }

  getRoom(id) {
    // return the room associated with the room id
    // returns undefined if there is no room with that id
    return this.rooms.get(id);
  }

  addRoom(room) {
    room.id = crypto.randomUUID();
    this.rooms.set(room.id, room);
  }

  removeRoom(room) {
    // remove the room with id from the rooms Map
    this.rooms.delete(room.id);
  }
}

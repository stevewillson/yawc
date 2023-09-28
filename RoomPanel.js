import RoomElement from "./RoomElement.js";

export default class RoomPanel {
  rooms;

  constructor() {
    // maybe just use an array here
    this.rooms = [];
  }

  toHtml() {
    const roomPanelDiv = document.createElement("div");
    roomPanelDiv.style.border = "6px solid";
    roomPanelDiv.style.borderColor = "#cccccc";
    roomPanelDiv.style.backgroundColor = "#3F1710";
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

  addRoom(n, n2) {
    // create a new room element
    let newRoom = new RoomElement();

    // let generateroomElement = CFSkin.getSkin().generateroomElement(
    // super.listener,
    // n,
    // this.getSize().width - 30,
    // n2
    // );
    // add the room to the sorted order,
    // how should rooms be sorted?
    this.rooms.push(newRoom);
    // this.rooms.set(newRoom.roomId, newRoom);
    // this.addSortedElement(newRoom);
  }

  addPlayerToRoom(n, s, b) {
    let room = this.findRoom(n);
    if (room != null) {
      room.addPlayer(s, b);
    }
  }

  clearRooms() {
    this.rooms = Map();
  }

  removePlayerFromRoom(n, s) {
    room = this.findRoom(n);
    if (room != null) {
      room.removePlayer(s);
    }
  }
}

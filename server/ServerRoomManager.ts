import { Team } from "./Team.ts";

export class ServerRoomManager {
  server;
  rooms;
  userManager;

  constructor(server) {
    this.server = server;
    this.userManager = server.userManager;
    this.rooms = new Map();
  }

  // should also be responsible for adding and removing
  // users from rooms

  addUserToRoom(roomId, userId) {
    // add the user to the room in the first open slot
    const user = this.userManager.users.get(userId);
    const room = this.rooms.get(roomId);

    // TODO - check if the room is full
    if (room.isFull()) {
      // ERROR, can't add the user to the room because there
      // are no empty slots
      return -1;
    }
    // add the user to the room
    // set the user information
    const slot = room.addUser(userId);
    user.slot = slot;
    user.roomId = roomId;
    // default to GOLDTEAM
    user.teamId = room.isTeamRoom ? Team.GOLDTEAM : Team.NOTEAM;

    return slot;
  }

  removeUserFromRoom(roomId, userId) {
    // get the user by the userId
    const user = this.userManager.users.get(userId);
    // get the room by the room Id
    const room = this.rooms.get(roomId);

    room.removeuser(userId);

    user.roomId = null;
    user.slot = null;
    user.teamId = null;
  }

  addRoom(room) {
    this.rooms.set(room.roomId, room);
  }

  removeRoom(roomId) {
    // remove the room with id from the rooms Map
    this.rooms.delete(roomId);
  }

  setUsersAlive(roomId) {
    // get the users for the room
    const userIds = this.rooms.get(roomId).userIds;
    userIds.forEach((userId) => {
      if (userId != "Open Slot") {
        // get the user object and set isAlive = true;
        this.userManager.users.get(userId).isAlive = true;
      }
    });
  }

  numUsersAlive(roomId) {
    const userIds = this.rooms.get(roomId).userIds;
    let count = 0;
    userIds.forEach((userId) => {
      if (userId != "Open Slot") {
        // get the user object and set isAlive = true;
        if (this.userManager.users.get(userId).isAlive) {
          count++;
        }
      }
    });
    return count;
  }

  numUsersAliveForTeam(roomId, teamId: number) {
    const userIds = this.rooms.get(roomId).userIds;
    let count = 0;
    userIds.forEach((userId) => {
      if (userId != "Open Slot") {
        const user = this.userManager.users.get(userId);
        if (user.isAlive && user.teamId == teamId) {
          count++;
        }
      }
    });
    return count;
  }

  gameOver(roomId) {
    const room = this.rooms.get(roomId);
    if (room.isTeamRoom) {
      let goldTeamDead =
        this.numUsersAliveForTeam(room.roomId, Team.GOLDTEAM) == 0;
      let blueTeamDead =
        this.numUsersAliveForTeam(room.roomId, Team.BLUETEAM) == 0;
      return goldTeamDead || blueTeamDead;
    }

    return this.numUsersAlive(roomId) == 1;
  }

  increaseWinCounts(roomId) {
    const room = this.rooms.get(roomId);
    const userIds = room.userIds;
    userIds.forEach((userId) => {
      if (userId != "Open Slot") {
        const user = this.userManager.users.get(userId);
        if (user.isAlive) {
          room.wins[user.slot]++;
        }
      }
    });
  }

  teamSize(roomId, teamId: number) {
    const room = this.rooms.get(roomId);
    const userIds = room.userIds;
    let count = 0;
    userIds.forEach((userId) => {
      if (userId != "Open Slot") {
        const user = this.userManager.users.get(userId);
        if (user.teamId == teamId) {
          count++;
        }
      }
    });
  }

  winnerSlot(roomId) {
    const room = this.rooms.get(roomId);
    const userIds = room.userIds;
    if (room.isTeamRoom) {
      return this.numUsersAliveForTeam(roomId, Team.GOLDTEAM) > 0
        ? Team.GOLDTEAM
        : Team.BLUETEAM;
    } else {
      for (let i = 0; i < userIds.length; i++) {
        if (userIds[i] != "Open Slot") {
          const user = this.userManager.users.get(userIds[i]);
          if (user.isAlive) {
            return user.slot;
          }
        }
      }
    }
    return -1;
  }
}

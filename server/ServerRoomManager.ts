import { Team } from "./Team.ts";
// import { ServerThread } from "./ServerThread.ts";
import { RoomStatus } from "./RoomStatus.ts";
// import { ServerRoom } from "./ServerRoom.ts";

// include the RoomTransitionThread class here
// when a game starts or ends, the room transition thread object is created

export class ServerRoomManager {
  // static TABLE_COUNTDOWN = 5;
  static TABLE_COUNTDOWN = 1;
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
    room.removeUser(userId);

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
      if (userId != null) {
        // get the user object and set isAlive = true;
        this.userManager.users.get(userId).isAlive = true;
      }
    });
  }

  numUsersAlive(roomId) {
    const userIds = this.rooms.get(roomId).userIds;
    let count = 0;
    userIds.forEach((userId) => {
      if (userId != null) {
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
      if (userId != null) {
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
      if (userId != null) {
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
      if (userId != null) {
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
        if (userIds[i] != null) {
          const user = this.userManager.users.get(userIds[i]);
          if (user.isAlive) {
            return user.slot;
          }
        }
      }
    }
    return -1;
  }

  // start status of 3 causes a countdowntransition to happen
  // this should be something that executes with successive 
  // broadcasted messages that the room status is changing
  // need to wait for a second in between the broadcastRoomStatusChange calls
  // I could just send one message to the client to start the countdown
  // we also need to check that nobody has left the room while the countdown is taking place

  async startGameTransition(roomId) {
    const room = this.rooms.get(roomId);
    let countdown = ServerRoomManager.TABLE_COUNTDOWN;
    for (let i = 0; i < ServerRoomManager.TABLE_COUNTDOWN; i++) {
      // want to send a broadcast message every second
      this.server.broadcastRoomStatusChange(
        room.roomId,
        room.status,
        countdown,
      );
      countdown--;
      // what is the TS equivalent for sleep?
      // Thread.sleep(1000);
      // call to utility function to sleep
      await this.sleep(1000);
      if (
        room.numUsers() < 2 ||
        room.isTeamRoom &&
          (room.teamSize(Team.GOLDTEAM) <= 0 ||
            room.teamSize(Team.BLUETEAM) <= 0) ||
        room.isBalancedRoom &&
          (room.teamSize(Team.GOLDTEAM) !=
            room.teamSize(Team.BLUETEAM))
      ) {
        // People left, we need to stop counting down
        room.status = RoomStatus.IDLE;
        this.server.broadcastRoomStatusChange(
          room.roomId,
          room.status,
          ServerRoomManager.TABLE_COUNTDOWN,
        );
        return;
      }
    }
    // Game is ready to start
    room.status = RoomStatus.PLAYING;
    this.setUsersAlive(room.roomId);
    this.server.broadcastRoomStatusChange(
      room.roomId,
      room.status,
      null,
    );
    this.server.broadcastGameStart(room.roomId);
  }

  // wait 3 seconds and then send a room status change packet
  // saying that the room is now idle
  // startStatus of 5 causes an end game transition
  async endGameTransition(roomId) {
    // wait for 3 seconds before sending the end game message
    await this.sleep(3000);
    const room = this.rooms.get(roomId);
    room.status = RoomStatus.IDLE;
    this.server.broadcastRoomStatusChange(
      room.roomId,
      room.status,
      null,
    );
  }

   // utility function to implement async sleep
   sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

import { RoomStatus } from "./RoomStatus.ts";
import { ServerUser } from "./ServerUser.ts";
import { ServerRoom } from "./ServerRoom.ts";
import { Team } from "./Team.ts";
// import { RoomTransitionThread } from "./RoomTransitionThread.ts";

export class ServerThread {
  // moving the TABLE_COUNTDOWN to the ServerRoomManager
  static TABLE_COUNTDOWN = 5;
  server;
  user;
  clientVersion;
  socket;
  clientId;

  constructor(server, socket) {
    this.server = server;
    this.socket = socket;
    this.clientId = crypto.randomUUID();
    this.user = null;
    socket.onopen = () => {
      console.log(`WebSocket Connection Opened`);
    };
    socket.onmessage = (e) => this.processPackets(e.data);
    socket.onclose = () => this.handleUserDisconnect();
    socket.onerror = (error) => console.error("ERROR:", error);
  }

  handleGameEnd(roomId) {
    const room = this.server.roomManager.rooms.get(roomId);
    room.increaseWinCounts();
    room.status = "gameOver";
    this.server.broadcastGameEnd(roomId);
    this.server.broadcastRoomStatusChange(roomId, room.status, -1);
    this.server.roomManager.endGameTransition(roomId);
  }

  receiveLogin(packet) {
    console.log("Login attempted...");

    const username = packet.username;
    console.log(`Login from ${username}`);
    // this.password = packet.password;
    // this.gameId = packet.gameId;
    // this.majorVersion = packet.majorVersion;
    // this.minorVersion = packet.minorVersion;
    this.clientVersion = packet.clientVersion;
    this.user = new ServerUser(this.clientId, username);

    if (this.server.userManager.usernameTaken(this.user.username)) {
      this.sendLoginFailed("Username already taken");
      this.server.clients.delete(this);
      return;
    }

    if (this.clientVersion != 1.2) {
      this.sendLoginFailed(
        "Wrong client version, check website for updated client",
      );
      this.server.clients.delete(this);
      return;
    }

    this.sendLoginSucceed();

    // Add user
    this.server.userManager.addUser(this.user);

    // send out user logging in to all clients
    this.server.broadcastUser(this.user.userId);
  }

  handleUserDisconnect() {
    // check if the user was logged in
    this.server.clients.delete(this.clientId);
    if (this.user != null) {
      console.log(`User ${this.user.username} logged out`);
      if (this.user.roomId != null) {
        this.receiveLeaveRoom();
      }
      this.server.userManager.removeUser(this.user);
      this.server.broadcastUserLogout(this.user.userId);
    }
  }

  // receive a user state packet from a client
  receiveUserState(packet) {
    let userId = packet.userId;
    // let sessionId = packet.sessionId;
    let healthPercent = packet.healthPercent;
    // let numPowerups = packet.numPowerups;
    let powerups = [];
    if (packet.powerups != undefined) {
      powerups = packet.powerups;
    }
    let shipType = packet.shipType;
    // let damagingUser = packet.strDamagedByUser;
    // let damagingPowerup = packet.damagingPowerup;
    // let lostHealth = packet.lostHealth;

    // if this is the user and the ship type has changed,
    // update the server's shipType
    this.user.shipType = shipType;

    // TODO - see why the broadcastUserState is not working
    this.server.broadcastUserState(
      this.user.roomId,
      this.user.userId,
      // sessionId,
      this.user.slot,
      healthPercent,
      powerups,
      shipType,
    );
  }

  receiveUserDeath(packet) {
    let sessionId = packet.sessionId;
    let killedBy = packet.killedBy;

    const room = this.server.roomManager.rooms.get(this.user.roomId);

    // user the room ID here
    this.server.broadcastGameOver(room, sessionId, this.user.slot, killedBy);

    this.user.isAlive = false;
    if (room.gameOver) {
      this.handleGameEnd(room.roomId);
    }
  }

  receiveUserEvent(packet) {
    const eventString = packet.eventString;
    const sessionId = packet.sessionId;

    // may want to track some facts about the user here before sending
    // the packet out

    this.server.broadcastUserEvent(this.user.roomId, sessionId, eventString);
  }

  // /*
  //  * Do nothing here, not sure what receiveCredits is for. We will probably never use.
  //  */
  // public void receiveCredits() throws IOException {
  // 	final DataInputStream stream = this.pr.getStream();

  // 	short	credits			= stream.readShort();
  // 	int		timeElapsed		= stream.readInt();
  // }

  // TODO - make sure that the message sent from the client is formatted properly
  receiveChangeTeam(packet) {
    const teamId = packet.teamId;
    this.user.setTeamId(teamId);
    this.server.broadcastTeamChange(this.user.roomId, this.user.slot, teamId);
  }

  receivePowerup(packet) {
    const sessionId = packet.sessionId;
    const powerupType = packet.powerupType;
    const toUserId = packet.toUserId;
    const upgradeLevel = packet.upgradeLevel;
    // TODO - use the room Id here
    this.server.broadcastPowerup(
      this.user.roomId,
      powerupType,
      this.user.userId,
      toUserId,
      sessionId,
      0,
    );
  }

  receiveCreateRoom(packet) {
    let password = "";

    const isRanked = packet.isRanked;
    const hasPassword = packet.hasPassword;

    if (hasPassword) {
      password = packet.password;
    }

    const isBigRoom = packet.isBigRoom;
    const allShipsAllowed = packet.allShips;
    const allPowerupsAllowed = packet.allPowerups;
    const isTeamRoom = packet.isTeamRoom;
    const boardSize = packet.boardSize;
    const isBalancedRoom = packet.isBalancedRoom;

    // const numStringPairs = packet.arrayLength;
    // if (numStringPairs > 0){	// pretty sure this is always 0
    // 	for (let i = 0; i<numStringPairs; i++){
    // 		let s1 = packet.roomArray[i]
    //     stream.readUTF();
    // 		let  s2 = stream.readUTF();
    // 	}
    // }

    if (this.user.room != null) { // prevents spam clicking create room from doing anything
      return;
    }

    let room = new ServerRoom(
      isRanked,
      password,
      isBigRoom,
      allShipsAllowed,
      allPowerupsAllowed,
      isTeamRoom,
      boardSize,
      isBalancedRoom,
    );

    // add the user to the room by the user object
    // we can get the username from the user

    const slot = 0;
    const teamId = isTeamRoom ? Team.GOLDTEAM : Team.NOTEAM;

    // TODO - check if '-1' returned, there was an error adding the user to the table
    this.server.roomManager.addRoom(room);
    this.server.broadcastRoom(room.roomId);

    this.server.roomManager.addUserToRoom(room.roomId, this.user.userId);
    this.server.broadcastJoinRoom(
      room.roomId,
      this.user.userId,
      slot,
      this.user.shipType,
      teamId,
    );
  }

  receiveJoinRoom(packet) {
    const roomId = packet.roomId;
    const password = packet.password;
    const room = this.server.roomManager.rooms.get(roomId);
    // check for undefined if there is no room with that id
    if (room == undefined || room.isFull() || this.user.roomId == room.roomId) {
      // room doesn't exist, is full, or the user is already in the room
      return;
    }

    const teamId = room.isTeamRoom ? Team.GOLDTEAM : Team.NOTEAM; // Gold team is default when joining

    if (!room.isPrivate || password == room.password) {
      let slot = this.server.roomManager.addUserToRoom(
        roomId,
        this.user.userId,
      );

      this.server.broadcastJoinRoom(
        room.roomId,
        this.user.userId,
        slot,
        this.user.shipType,
        teamId,
      );
      this.sendRoomWins(room);
    } else { // user entered the wrong password to join the room
      this.sendIncorrectRoomPassword();
    }
  }

  // received a packet from the client to leave a room
  receiveLeaveRoom() {
    // get the room from the user's Id
    const room = this.server.roomManager.rooms.get(this.user.roomId);
    this.server.roomManager.removeUserFromRoom(room.roomId, this.user.userId);
    this.server.broadcastLeaveRoom(this.user.userId);
    if (room.numUsers() <= 0) {
      this.server.broadcastRoomStatusChange(room.roomId, RoomStatus.DELETE, -1);
      this.server.roomManager.removeRoom(room.roomId);
    }
    if (room.status == "playing" && room.gameOver) {
      this.handleGameEnd(room.roomId);
    }
  }

  receiveSay(packet) {
    let message = packet.message;
    this.server.broadcastLobbyMessage(this.user.username, message);
  }

  receiveRoomSay(packet) {
    let message = packet.message;
    if (this.user.room() != null) {
      this.server.broadcastRoomMessage(
        this.user.room,
        this.user.username,
        message,
      );
    }
  }

  receiveWhisper(packet) {
    let username = packet.username;
    let message = packet.message;

    this.server.broadcastPrivateMessage(
      this.user.username(),
      username,
      message,
    );
  }

  // client sent the 'startGame' packet from the room
  receiveStartGame(packet) {
    let roomId = packet.roomId;
    let room = this.server.roomManager.rooms.get(roomId);

    // check some settings for the teams,
    // TODO - implement teams, for now we will just have single player
    // games
    if (room.status == "idle" && room.numUsers() > 1) {
      if (
        !room.isTeamRoom ||
        room.teamSize(Team.GOLDTEAM) == room.teamSize(Team.BLUETEAM) ||
        !room.isBalancedRoom() &&
          (room.teamSize(Team.GOLDTEAM) > 0 && room.teamSize(Team.BLUETEAM) > 0)
      ) {
        room.status = "countdown";
        // use the room manager to send out informatino about the room
        this.server.roomManager.startGameTransition(room.roomId);
      }
    }
  }

  sendLobbyMessage(username, message) {
    // 	byte opcode = isForLobby ? (byte)5 : (byte)18;
    const packet = {
      type: "lobbyMessage",
      username,
      message,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendRoomMessage(username, message) {
    // 	byte opcode = isForLobby ? (byte)5 : (byte)18;
    const packet = {
      type: "roomMessage",
      username,
      message,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendPrivateMessage(fromUser: string, toUser: string, message: string) {
    // 	byte opcode = 6;
    const packet = {
      type: "privateMessage",
      fromUser,
      toUser,
      message,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendRoomStatusChange(roomId: number, status: number, countdown: number) {
    // 	byte opcode = 66;
    const packet = {
      type: "roomStatusChange",
      roomId,
      status,
      countdown,
    };
    if (status == 3) {
      packet.countdown = countdown;
    }
    this.socket.send(JSON.stringify(packet));
  }

  sendTeamChange(slot, teamId) {
    // 	byte opcode = 80;
    // 	byte opcode2 = 121;
    const packet = {
      type: "teamChange",
      slot,
      teamId,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendLoginSucceed() {
    const packet = {
      type: "loginSuccess",
      userId: this.user.userId,
      username: this.user.username,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendLoginFailed(errorMsg) {
    const packet = {
      type: "error",
      message: errorMsg,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendUserInfo(user) {
    // byte opcode = 13;
    const packet = {
      type: "userInfo",
      user,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendUsersInfo() {
    // Send current user list to client
    this.server.userManager.users.forEach((user) => {
      this.sendUserInfo(user);
    });
  }

  sendRoom(room) {
    // TODO - don't store the password in the room,
    // make a roomPasswordManager for the server
    // to check if the password is correct
    // byte opcode = 101;
    const packet = {
      type: "roomInfo",
      room,
    };
    this.socket.send(JSON.stringify(packet));
  }

  // send the current list of rooms
  sendRooms() {
    this.server.roomManager.rooms.forEach((room) => {
      // if (room != null) {
      this.sendRoom(room);
      // }
    });
  }

  sendUserLogout(userId) {
    // 	byte opcode = 14;
    const packet = {
      type: "logout",
      userId,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendGameStart(roomId) {
    // 	byte opcode = 80;
    // 	byte opcode2 = 100;
    // let roomUsers: {
    //   userId: string;
    //   slot: number;
    //   isGameOver: boolean;
    //   teamId: number;
    // }[] = [];
    // const room = this.server.roomManager.rooms.get(roomId);
    // room.userIds.forEach((userId) => {
    //   if (userId != null) {
    //     const user = this.server.userManager.users.get(userId);
    //     roomUsers.push({
    //       userId,
    //       slot: user.slot,
    //       isGameOver: false,
    //       teamId: user.teamId,
    //     });
    //   }
    // });

    // const packet = {
    //   type: "startGame",
    //   gameId: 0,
    //   sessionId: 0,
    //   numUsers: room.numUsers,
    //   roomUsers,
    // };

    const packet = {
      type: "startGame",
      roomId,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendJoinRoom(roomId, userId, slot, shipType, teamId) {
    const room = this.server.roomManager.rooms.get(roomId);
    const user = this.server.userManager.users.get(userId);

    // TODO - remove this section to only handle passwords
    // on the server
    let roomPassword = "";
    if (user.roomId == roomId) {
      roomPassword = room.password;
    }

    // let roomUsers: { slot: number; winCount: number, teamId: number }[] = [];
    // room.userIds.forEach((userId) => {
    //   if (userId != "Open Slot") {
    //     const curUser = this.server.userManager.users.get(userId);
    //     roomUsers.push({
    //       slot: user.slot,
    //       winCount: room.winCountOf(user.slot),
    //       teamId: user.teamId
    //     });
    //   }
    // });

    // let userTeamIds: number[] = [];
    // if (room.isTeamRoom && user.userId == userId) {
    //   room.userIds.forEach((userId) => {
    //     if (user != "Open Slot") {
    //       const curUser = this.server.userManager.users.get(userId);
    //       userTeamIds.push(curUser.teamId);
    //     }
    //   });
    // }

    // 	byte opcode = 102;
    const packet = {
      type: "joinRoom",
      roomId,
      userId,
      slot,
      shipType,
      teamId,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendIncorrectRoomPassword() {
    // 	byte opcode = 103;
    const packet = {
      type: "incorrectRoomPassword",
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendLeaveRoom(userId) {
    // 	byte opcode = 65;
    const packet = {
      type: "leaveRoom",
      userId,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendRoomWins(room) {
    let roomUsers: { slot: number; winCount: number }[] = [];
    room.userIds.forEach((userId) => {
      // resolve the userId to a user
      const user = this.server.userManager.users.get(userId);
      if (user != null) {
        roomUsers.push({
          slot: user.slot,
          winCount: room.winCountOf(user.slot),
        });
      }
    });

    // 	byte opcode = 80;
    // 	byte opcode2 = 120;
    const packet = {
      type: "roomWins",
      numUsers: room.numUsers,
      roomUsers: roomUsers,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendPowerup(powerupType, fromUserId, toUserId, sessionId, b2) {
    // 	byte opcode1 = 80;
    // 	byte opcode2 = 107;
    // send the powerup to the client
    const packet = {
      type: "receivePowerup",
      powerupType: powerupType,
      fromUserId,
      toUserId,
      sessionId,
      b2: b2,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendUserState(userId, slot, healthPercent, powerups, shipType) {
    // sendUserState(userId, sessionId, slot, healthPercent, powerups, shipType) {
    // let powerupArray: { powerup: string }[] = [];
    // powerups.forEach((powerup) => {
    //   powerupArray.push(powerup);
    // });
    // 	byte opcode1 = 80;
    // 	byte opcode2 = 106;

    // count the entries in the powerups that are not null
    let numPowerups = 0;
    for (let i = 0; i < powerups.length; i++) {
      if (powerups[i] != null) {
        numPowerups++;
      }
    }
    const packet = {
      type: "userState",
      userId,
      // sessionId,
      slot,
      healthPercent,
      numPowerups,
      powerups,
      shipType,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendUserEvent(gameSession, eventString) {
    // 	byte opcode1 = 80;
    // 	byte opcode2 = 109;
    const packet = {
      type: "userEvent",
      eventString,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendGameOver(gameSession, deceasedSlot, killerSlot) {
    // 	byte opcode1 = 80;
    // 	byte opcode2 = 110;
    const packet = {
      type: "gameOver",
      deceasedSlot,
      killerSlot,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendGameEnd(room) {
    // 	byte opcode1 = 80;
    // 	byte opcode2 = room.isTeamRoom() ? (byte)112 : (byte)111;
    const packet = {
      type: "gameEnd",
      isTeamRoom: room.isTeamRoom,
      winnerSlot: room.winnerSlot,
    };
    this.socket.send(JSON.stringify(packet));
  }

  processPackets(packet) {
    // read the packet that was received from the client
    // get the JSON from the packet
    const packetJSON = JSON.parse(packet);
    let operation = packetJSON.type;
    console.log(`Received ${operation} type packet`);
    switch (operation) {
      case "noop": {
        // TODO - check how to add a "pong" function
        // to send a message back when the server
        // sends a "ping"
        // NOOP, heartbeat
        break;
      }

      case "login": {
        this.receiveLogin(packetJSON);
        break;
      }

      case "logout": {
        this.handleUserDisconnect();
        break;
      }

      case "listUsers": {
        this.sendUsersInfo();
        break;
      }

      case "listRooms": {
        this.sendRooms();
        break;
      }

      case "createRoom": {
        this.receiveCreateRoom(packetJSON);
        break;
      }

      case "changeTeam": {
        this.receiveChangeTeam(packetJSON);
        break;
      }

      case "joinRoom": {
        // case 21:
        this.receiveJoinRoom(packetJSON);
        break;
      }

      case "leaveRoom": {
        // case 22:
        this.receiveLeaveRoom();
        break;
      }

      // case 5:
      // 	receiveSay();
      // 	break;
      // case 6:
      // 	receiveWhisper();
      // 	break;
      // case 18:
      // 	receiveRoomSay();
      // 	break;

      // TODO
      case "userState": {
        // case 106:
        this.receiveUserState(packetJSON);
        break;
      }
      // get a 'sendPowerup' message from the client
      case "sendPowerup": {
        // case 107:
        this.receivePowerup(packetJSON);
        break;
      }
      case "userEvent": {
        // case 109:
        this.receiveUserEvent(packetJSON);
        break;
      }
      case "userDeath": {
        // case 110:
        this.receiveUserDeath(packetJSON);
        break;
      }

      case "startGame": {
        // case 30:
        this.receiveStartGame(packetJSON);
        break;
      }

      default:
        break;
    }
    return operation;
  }
}

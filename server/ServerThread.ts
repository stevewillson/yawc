import { RoomStatus } from "./RoomStatus.ts";
import { ServerUser } from "./ServerUser.ts";
import { ServerRoom } from "./ServerRoom.ts";
import { Team } from "./Team.ts";
import { RoomTransitionThread } from "./RoomTransitionThread.ts";

export class ServerThread {
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

  handleGameEnd(room) {
    room.increaseWinCounts();
    room.status = RoomStatus.GAMEOVER;
    this.server.broadcastGameEnd(room);
    this.server.broadcastRoomStatusChange(room.roomId, room.status, -1);
    let rtt = new RoomTransitionThread(this.server, room, room.status);
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
    this.server.broadcastUser(this.user);
  }

  handleUserDisconnect() {
    // check if the user was logged in
    if (this.user != null) {
      console.log(`User ${this.user.username} logged out`);
      this.server.userManager.removeUser(this.user);
      this.server.clients.delete(this.clientId);
      if (this.user.room != null) {
        this.receiveLeaveRoom();
      }
      this.server.broadcastUserLogout(this.user);
    }
  }

  // receiveUserState() throws IOException {
  // 	 stream = this.pr.getStream();

  // 	short	gameSession		= stream.readShort();
  // 	short	healthPerc		= stream.readShort();
  // 	byte	numPowerups		= stream.readByte();

  // 	Byte[] powerups = new Byte[numPowerups];
  //     for (int i = 0; i < numPowerups; ++i) {
  //     	powerups[i] = stream.readByte();
  //     }

  //     byte 		shipType 		= stream.readByte();
  //     boolean		damagedByUser	= stream.readByte() == 1;
  //     if (damagedByUser) {
  //         String 	damagingUser 	= stream.readUTF();
  //         byte	damagingPowerup = stream.readByte();
  //         byte	lostHealth		= stream.readByte();
  //     }

  //     server.broadcastUserState(user().room(), gameSession, user().slot(), healthPerc, powerups, shipType);
  // }

  // public void receiveUserDeath() throws IOException {
  // 	final DataInputStream stream = this.pr.getStream();

  // 	short	gameSession		= stream.readShort();
  // 	byte	killedBy		= stream.readByte();

  // 	ServerRoom room = user().room();
  // 	server.broadcastGameOver(room, gameSession, user().slot(), killedBy);

  // 	user().setAlive(false);
  // 	if (room.gameOver()) {
  // 		handleGameEnd(room);
  // 	}
  // }

  // public void receiveUserEvent() throws IOException {
  // 	final DataInputStream stream = this.pr.getStream();

  // 	short	gameSession		= stream.readShort();
  // 	String	eventString		= stream.readUTF();

  // 	server.broadcastUserEvent(user().room(), gameSession, eventString);
  // }

  // /*
  //  * Do nothing here, not sure what receiveCredits is for. We will probably never use.
  //  */
  // public void receiveCredits() throws IOException {
  // 	final DataInputStream stream = this.pr.getStream();

  // 	short	credits			= stream.readShort();
  // 	int		timeElapsed		= stream.readInt();
  // }

  receiveChangeTeam(packet) {
    const teamId = packet.teamId;
    this.user.setTeamId(teamId);
    this.server.broadcastTeamChange(this.user.room(), this.user.slot, teamId);
  }

  // public void receivePowerup() throws IOException {
  // 	final DataInputStream stream = this.pr.getStream();

  // 	short	gameSession		= stream.readShort();
  // 	byte	powerupType		= stream.readByte();
  // 	byte	toSlot			= stream.readByte();
  // 	byte 	upgradeLevel	= stream.readByte();

  // 	server.broadcastPowerup(user().room(), powerupType, user().slot(), toSlot, gameSession, (byte)0);
  // }

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

    // TODO - check if '-1' returned, there was an error adding the user to the table
    this.server.roomManager.addRoom(room);
    this.server.roomManager.addUserToRoom(room.roomId, this.user.userId);
    this.server.broadcastRoom(room);
  }

  receiveJoinRoom(packet) {
    const roomId = packet.roomId;
    const password = packet.password;
    const room = this.server.roomManager.rooms.get(roomId);
    // check for undefined if there is no room with that id
    if (room == undefined || room.isFull || this.user.roomId == room.roomId) {
      // room doesn't exist, is full, or the user is already in the room
      return;
    }

    const teamId = room.isTeamRoom ? Team.GOLDTEAM : Team.NOTEAM; // Gold team is default when joining

    if (!room.isPrivate || password == room.password) {
      let slot = room.addUser(this.user.username());
      this.server.roomManager.addUserToRoom(roomId, this.user.userId);
      this.server.broadcastJoinRoom(room, this.user.username, slot, teamId);
      this.sendRoomWins(room);
    } else { // user entered the wrong password to join the room
      this.sendIncorrectRoomPassword();
    }
  }

  receiveLeaveRoom() {
    const room = this.user.room;
    room.removeUser(this.user);
    this.server.broadcastLeaveRoom(room.roomId, this.user.username);
    this.user.room = null;
    if (room.numUsers <= 0) {
      this.server.broadcastRoomStatusChange(room.roomId, RoomStatus.DELETE, -1);
      this.server.roomManager.removeRoom(room.roomId);
    }
    if (room.status == RoomStatus.PLAYING && room.gameOver()) {
      this.handleGameEnd(room);
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

  receiveStartGame(packet) {
    let roomId = packet.roomId;
    let room = this.server.roomManager.rooms.get(roomId);

    if (room.status == RoomStatus.IDLE && room.numUsers() > 1) {
      if (
        !room.isTeamRoom() ||
        room.teamSize(Team.GOLDTEAM) == room.teamSize(Team.BLUETEAM) ||
        !room.isBalancedRoom() &&
          (room.teamSize(Team.GOLDTEAM) > 0 && room.teamSize(Team.BLUETEAM) > 0)
      ) {
        room.setStatus(RoomStatus.COUNTDOWN);
        // start a new RoomTransitionThread
        let rtt = new RoomTransitionThread(this.server, room, room.status);
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

  sendUser(user) {
    // byte opcode = 13;
    const packet = {
      type: "userInfo",
      user,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendUsers() {
    // Send current user list to client
    this.server.userManager.users.forEach((user) => {
      this.sendUser(user);
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

  sendUserLogout(user) {
    // 	byte opcode = 14;
    const packet = {
      type: "logout",
      username: user.username,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendGameStart(room) {
    // 	byte opcode = 80;
    // 	byte opcode2 = 100;
    let roomUsers: {
      username: string;
      slot: number;
      gameOver: boolean;
      teamId: number;
    }[] = [];
    room.users.forEach((user) => {
      if (user != null) {
        roomUsers.push({
          username: user.username,
          slot: user.slot,
          gameOver: false,
          teamId: user.teamId,
        });
      }
    });

    const packet = {
      type: "gameStart",
      gameId: 0,
      sessionId: 0,
      numUsers: room.numUsers,
      roomUsers,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendJoinRoom(roomId, userId, slot, teamId) {
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
      roomId: room.roomId,
      userId,
      slot,
      teamId,
    };
  }

  sendIncorrectRoomPassword() {
    // 	byte opcode = 103;
    const packet = {
      type: "incorrectRoomPassword",
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendLeaveRoom(roomId, username) {
    // 	byte opcode = 65;
    const packet = {
      type: "leaveRoom",
      roomId,
      // TODO - just use the userId here
      username,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendRoomWins(room) {
    let roomUsers: { slot: number; winCount: number }[] = [];
    room.users.forEach((user) => {
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

  sendPowerup(powerupType, toSlot, b1, gameSession, b2) {
    // 	byte opcode1 = 80;
    // 	byte opcode2 = 107;
    const packet = {
      type: "powerup",
      powerupType: powerupType,
      slot: toSlot,
      b1: b1,
      gameSession: gameSession,
      b2: b2,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendUserState(gameSession, slot, healthPercent, powerups, shipType) {
    let powerupArray: { powerup: string }[] = [];
    powerups.forEach((powerup) => {
      powerupArray.push(powerup);
    });
    // 	byte opcode1 = 80;
    // 	byte opcode2 = 106;
    const packet = {
      type: "playerState",
      gameSession,
      slot,
      healthPercent,
      numPowerups: powerups.length,
      powerups: powerupArray,
      shipType,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendUserEvent(gameSession, eventString) {
    // 	byte opcode1 = 80;
    // 	byte opcode2 = 109;
    const packet = {
      type: "playerEvent",
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
        this.sendUsers();
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
      // case 5:
      // 	receiveSay();
      // 	break;
      // case 6:
      // 	receiveWhisper();
      // 	break;
      // case 18:
      // 	receiveRoomSay();
      // 	break;
      // case 106:
      // 	receiveUserState();
      // 	break;
      // case 107:
      // 	receivePowerup();
      // 	break;
      // case 109:
      // 	receiveUserEvent();
      // 	break;
      // case 110:
      // 	receiveUserDeath();
      // 	break;
      // case 21:
      // 	receiveJoinRoom();
      // 	break;
      // case 22:
      // 	receiveLeaveRoom();
      // 	break;
      // case 27:
      // 	receiveCredits();
      // 	break;
      // case 30:
      // 	receiveStartGame(packet);
      // 	break;
      default:
        break;
    }
    return operation;
  }
}

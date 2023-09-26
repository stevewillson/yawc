import { RoomStatus } from "./RoomStatus.ts";
import { ServerUser } from "./ServerUser.ts";
import { ServerRoom } from "./ServerRoom.ts";
import { Team } from "./Team.ts";
import { RoomTransitionThread } from "./RoomTransitionThread.ts";

export class ServerThread {
  static TABLE_COUNTDOWN = 5;
  server;
  user;
  nextTime;
  clientVersion;
  socket;

  constructor(server, socket) {
    this.server = server;
    this.socket = socket;
    socket.onopen = () => {
      console.log(`CONNECTION ESTABLISHED`);
    };
    socket.onmessage = (e) => this.processPackets(e.data);
    socket.onclose = () => {
      console.log(`DISCONNECTED`);
      // remove the socket from the list of client sockets
    };
    socket.onerror = (error) => console.error("ERROR:", error);
  }

  handleGameEnd(room) {
    room.increaseWinCounts();
    room.status = RoomStatus.GAMEOVER;
    this.server.broadcastGameEnd(room);
    this.server.broadcastRoomStatusChange(room.id, room.status, -1);
    let rtt = new RoomTransitionThread(this.server, room, room.status);
  }

  handleUserLogout() {
    this.server.userManager.removeUser(this.user);
    this.server.clients.delete(this);
    if (this.user.room != null) {
      this.receiveLeaveRoom();
    }
    this.server.broadcastUserLogout(this.user);
  }

  receiveLogin(packet) {
    // this.isGuestAccount = packet.guestAccount;
    const username = packet.username;
    // this.password = packet.password;
    // this.gameId = packet.gameId;
    // this.majorVersion = packet.majorVersion;
    // this.minorVersion = packet.minorVersion;
    this.clientVersion = packet.clientVersion;
    this.user = new ServerUser(this, username);
  }

  // receivePlayerState() throws IOException {
  // 	 stream = this.pr.getStream();

  // 	short	gameSession		= stream.readShort();
  // 	short	healthPerc		= stream.readShort();
  // 	byte	numPowerups		= stream.readByte();

  // 	Byte[] powerups = new Byte[numPowerups];
  //     for (int i = 0; i < numPowerups; ++i) {
  //     	powerups[i] = stream.readByte();
  //     }

  //     byte 		shipType 		= stream.readByte();
  //     boolean		damagedByPlayer	= stream.readByte() == 1;
  //     if (damagedByPlayer) {
  //         String 	damagingPlayer 	= stream.readUTF();
  //         byte	damagingPowerup = stream.readByte();
  //         byte	lostHealth		= stream.readByte();
  //     }

  //     server.broadcastPlayerState(user().room(), gameSession, user().slot(), healthPerc, powerups, shipType);
  // }

  // public void receivePlayerDeath() throws IOException {
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

  // public void receivePlayerEvent() throws IOException {
  // 	final DataInputStream stream = this.pr.getStream();

  // 	short	gameSession		= stream.readShort();
  // 	String	eventString		= stream.readUTF();

  // 	server.broadcastPlayerEvent(user().room(), gameSession, eventString);
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
    let slot = room.addUser(this.user.username);
    room.addUser(this.user);
    this.user.slot = slot;
    this.user.room = room;
    this.user.setTeamId(room.isTeamRoom ? Team.GOLDTEAM : Team.NOTEAM);
    this.server.addRoom(room);
    this.server.broadcastCreateRoom(room);
  }

  receiveJoinRoom(packet) {
    let roomId = packet.roomId;
    let password = packet.password;
    let room = this.server.roomManager.getRoom(roomId);
    if (room == null || room.isFull || this.user.room == room) {
      return;
    }

    let teamId = room.isTeamRoom ? Team.GOLDTEAM : Team.NOTEAM; // Gold team is default when joining

    if (!room.isPrivate || password == room.password) {
      let slot = room.addUser(this.user.username());
      room.addUser(this.user);
      this.user.setSlot(slot);
      this.user.setRoom(room);
      this.user.setTeamId(teamId);
      this.server.broadcastJoinRoom(room, this.user.username, slot, teamId);
      this.sendRoomWins(room);
    } else { // user entered the wrong password to join the room
      this.sendIncorrectRoomPassword();
    }
  }

  receiveLeaveRoom() {
    const room = this.user.room;
    room.removeUser(this.user);
    this.server.broadcastLeaveRoom(room.id, this.user.username);
    this.user.room = null;
    if (room.numPlayers() <= 0) {
      this.server.broadcastRoomStatusChange(room.id, RoomStatus.DELETE, -1);
      this.server.roomManager.removeRoom(room);
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
    let room = this.server.roomManager.getRoom(roomId);

    if (room.status == RoomStatus.IDLE && room.numPlayers() > 1) {
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

  sendLobbyMessage(username, message, isForLobby) {
    // 	byte opcode = isForLobby ? (byte)5 : (byte)18;
    const packet = {
      type: "lobbyMessage",
      username,
      message,
      isForLobby,
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

  sendRoomStatusChange(roomId: number, status, countdown) {
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
    let iconArray: string[] = [];
    user.icons.forEach((icon) => {
      iconArray.push(icon);
    });
    // byte opcode = 13;
    const packet = {
      type: "userInfo",
      username: user.username,
      rank: user.rank,
      numIcons: user.icons.length,
      icons: iconArray,
      clan: user.clan,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendUsernames() {
    const packet = {
      type: "usernames",
      usernames: this.server.userManager.usernames.values(),
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendRooms() {
    const packet = {
      type: "rooms",
      usernames: this.server.roomManager.rooms.values(),
    };
    this.socket.send(JSON.stringify(packet));
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
      numPlayers: room.numPlayers,
      roomUsers,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendJoinRoom(room, username, slot, teamId) {
    let roomPassword = "";
    if (this.user.room == room) {
      roomPassword = room.password;
    }

    let roomUsers: { slot: number; winCount: number }[] = [];
    room.users.forEach((user) => {
      if (user != null) {
        roomUsers.push({
          slot: user.slot,
          winCount: room.winCountOf(user.slot),
        });
      }
    });

    // if team room, then we need to send to the new player the teamIds of the other players
    let userTeamIds: number[] = [];
    if (room.isTeamRoom && this.user.username == username) {
      room.users.forEach((user) => {
        if (user != null) {
          userTeamIds.push(user.teamId);
        }
      });
    }

    // 	byte opcode = 102;
    const packet = {
      type: "joinRoom",
      roomId: room.id,
      username,
      slot,
      password: roomPassword,
      userTeamIds,
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
      numPlayers: room.numPlayers,
      roomUsers: roomUsers,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendFullRoom(room) {
    let roomUsers: { username: string }[] = [];
    room.users.forEach((user) => {
      if (user != null) {
        roomUsers.push({
          username: user.username,
        });
      }
    });

    let password = "";
    if (this.user.room == room) {
      password = room.password;
    }
    // 	byte opcode = 101;
    const packet = {
      type: "fullRoom",
      roomId: room.id,
      status: room.status,
      isRanked: room.isRanked,
      isPrivate: room.isPrivate,
      isBigRoom: room.isBigRoom,
      allShipsAllowed: room.allShipsAllowed,
      allPowerupsAllowed: room.allPowerupsAllowed,
      isTeamRoom: room.isTeamRoom,
      boardSize: room.boardSize,
      isBalancedRoom: room.isBalancedRoom,
      roomUsers: roomUsers,
      options: 0,
      password: password,
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

  sendPlayerState(gameSession, slot, healthPercent, powerups, shipType) {
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

  sendPlayerEvent(gameSession, eventString) {
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
      case "noop":
        // NOOP, heartbeat
        break;
      case "login":
        console.log("Login attempted...");
        this.receiveLogin(packetJSON);

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

        // Send current user list to client
        this.server.userManager.users.forEach((user) => {
          if (user != null) {
            this.sendUser(user);
          }
        });
        // Send current table list to client
        // for (ServerTable table : server.tableManager.tables()) {
        //     if (table != null) {
        //         sendFullTable(table);
        //     }
        // }

        // Add user and broadcast to all clients
        this.server.addUser(this.user);
        // this.server.broadcastUser(this.user);
        break;
      case "listUsernames":
        this.sendUsernames();
        break;
      case "listRooms":
        this.sendRooms();
        break;
      case "logout":
        this.handleUserLogout();
        break;
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
      // 	receivePlayerState();
      // 	break;
      // case 107:
      // 	receivePowerup();
      // 	break;
      // case 109:
      // 	receivePlayerEvent();
      // 	break;
      // case 110:
      // 	receivePlayerDeath();
      // 	break;
      // case 20:
      // 	receiveCreateRoom();
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
      case "changeTeam":
        this.receiveChangeTeam(packetJSON);
        break;
      default:
        break;
    }
    return operation;
  }
}

// TODO - implement this method for logging in
// public void run() {
// 	try {
// 		receiveLogin();

// 		if (server.userManager.usernameTaken(user().username())){
// 			sendLoginFailed("Username already taken");
// 			server.clients.remove(this);
// 			return;
// 		}

// 		if (!this.clientVersion.equals("version1.2")){
// 			sendLoginFailed("Wrong client version, check website for updated client");
// 			server.clients.remove(this);
// 			return;
// 		}

// 		sendLoginSucceed();

// 		// Send current user list to client
// 		for (ServerUser user : server.userManager.users()) {
// 			if (user != null) {
// 				sendUser(user);
// 			}
// 		}

// 		// Send current room list to client
// 		for (ServerRoom room : server.roomManager.rooms()) {
// 			if (room != null) {
// 				sendFullRoom(room);
// 			}
// 		}

// 		// Add user and broadcast to all clients
// 		server.addUser(this.user);
// 		server.broadcastUser(this.user);

// 		// Start processing packets from client
// 		final DataInputStream stream = pr.getStream();
// 		this.nextTime = System.currentTimeMillis() + GameNetLogic.NOOP_DURATION*2;
// 		while (true) {
// 			try {
// 				while (!sendMessages.isEmpty()) {
// 					sendMessages.poll().run();
// 				}
// 				if (stream.available() > 0) {
// 					short numBytes = stream.readShort();	// packetStreamWriter/Reader let first short be size, we do not use that here
// 					if (numBytes > 0) {
// 						byte opcode = processPackets(stream);
// 						if (opcode == 1) {	// user logout
// 							break;
// 						}
// 					}
// 					this.nextTime = System.currentTimeMillis() + GameNetLogic.NOOP_DURATION*2;
// 				}
// 				else {
// 					if (System.currentTimeMillis() > this.nextTime) {	// no communication from client
// 						handleUserLogout();
// 						break;
// 					}
// 				}
// 			} catch (EOFException e) {
// 				// No more communication to client
// 				handleUserLogout();
// 				break;
// 			}
// 		}
// 	} catch (Exception e) {
// 		e.printStackTrace();
// 		return;
// 	}
// }

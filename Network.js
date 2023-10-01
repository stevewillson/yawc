export default class Network {
  static LOGIN_TYPE_REGISTERED = 0;
  socket;
  staticbConnected;
  gameNetLogic;

  constructor(gameNetLogic) {
    this.gameNetLogic = gameNetLogic;
  }

  login(gameId, majorVersion, minorVersion, username, password, host, port) {
    // start a new websocket
    this.socket = new WebSocket(`ws://${host}:${port}`);

    this.socket.onerror = (e) => {
      console.log(`Could not connect to server`);
      return "ERROR";
    };
    this.socket.onopen = (e) => {
      const packet = {
        type: "login",
        username,
        // TODO - use a hash of the password
        password,
        gameId,
        majorVersion,
        minorVersion,
        clientVersion: 1.2,
      };
      console.log(`Sending ${JSON.stringify(packet)}`);
      this.socket.send(JSON.stringify(packet));
    };
    this.socket.onmessage = (e) => this.processPackets(e.data);
    // success for login is true
    return true;
  }

  processPackets(packet) {
    this.gameNetLogic.processPackets(packet);
  }

  joinRoom(roomId, password) {
    let roomPassword = "";
    if (password != null) {
      roomPassword = password;
    }
    const packet = {
      type: "joinRoom",
      roomId,
      password: roomPassword,
    };
    this.socket.send(JSON.stringify(packet));
  }

  whisper(username, message) {
    const packet = {
      type: "whisper",
      username,
      message,
    };
    this.socket.send(JSON.stringify(packet));
  }

  sendNoop() {
    const packet = {
      type: "noop",
    };
    this.socket.send(JSON.stringify(packet));
  }

  createRoom(
    password = "",
    isRanked = false,
    isBigRoom = false,
    isTeamRoom = false,
    boardSize = 3,
    isBalancedRoom = false,
    allShips = true,
    allPowerups = true,
  ) {
    console.log(`Sending a packet to create a new room`);
    const packet = {
      type: "createRoom",
      isRanked,
      hasPassword: password.length > 0,
      password,
      isBigRoom,
      allShips,
      allPowerups,
      isTeamRoom,
      boardSize,
      isBalancedRoom,
    };
    this.socket.send(JSON.stringify(packet));
  }

  createRoomDefault(password, isRanked) {
    this.createRoom(password, isRanked, false, false, 3, false, false, false);
  }

  disconnect() {
    this.staticbConnected = false;
    const packet = {
      // stream.writeByte(1);
      type: "logout",
    };
    this.socket.send(JSON.stringify(packet));

    // close the websocket
    this.socket.close();
    this.socket = null;
  }

  roomSay(message) {
    const packet = {
      type: "roomSay",
      message,
    };
    this.socket.send(JSON.stringify(packet));
  }

  changeTeams(teamId) {
    const packet = {
      type: "changeTeam",
      teamId,
    };
    this.socket.send(JSON.stringify(packet));
  }

  startGame(roomId) {
    const packet = {
      type: "startGame",
      roomId,
    };
    this.socket.send(JSON.stringify(packet));
  }

  say(message) {
    const packet = {
      type: "say",
      message,
    };
    this.socket.send(JSON.stringify(packet));
  }

  listUsers() {
    // request a list of users from the server
    // this.sendGeneric((byte)9, (short)(-2));
    const packet = {
      type: "listUsers",
    };
    this.socket.send(JSON.stringify(packet));
  }

  listRooms() {
    // request a list of rooms from the server
    // this.sendGeneric((byte)50, (short)(-2));
    const packet = {
      type: "listRooms",
    };
    this.socket.send(JSON.stringify(packet));
  }

  leaveRoom() {
    // this.sendGeneric((byte)22, (short)(-2));
    const packet = {
      type: "leaveRoom",
    };
    this.socket.send(JSON.stringify(packet));
  }
}

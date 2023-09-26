export default class Network {
  static LOGIN_TYPE_REGISTERED = 0;
  static LOGIN_TYPE_GUEST = 1;
  static LOGIN_TYPE_AUTO_GUEST = 3;
  socket;
  staticbConnected;
  gameNetLogic;

  //  joinRoom( roomId, final String password) {
  //     final DataOutput stream = this.getStream(0);
  //     try {
  //         stream.writeByte(21);
  //         stream.writeShort((short)roomId);
  //         stream.writeUTF((password == null) ? "" : password);
  //         this.sendPacket();
  //     }
  //     catch (Exception ex) {}
  // }

  //  whisper( s,  s2) {
  //     final DataOutput stream = this.getStream(0);
  //     try {
  //         stream.writeByte(6);
  //         stream.writeUTF(s);
  //         stream.writeUTF(s2);
  //         this.sendPacket();
  //     }
  //     catch (Exception ex) {}
  // }

  // private void sendGeneric(final byte b, final short n) {
  //     final DataOutput stream = this.getStream(0);
  //     try {
  //         stream.writeByte(b);
  //         if (n != -2) {
  //             stream.writeShort(n);
  //         }
  //         this.sendPacket();
  //     }
  //     catch (Exception ex) {}
  // }

  constructor(gameNetLogic) {
    this.gameNetLogic = gameNetLogic;
    // this.login();
  }

  login(
    gameId,
    majorVersion,
    minorVersion,
    username,
    password,
    guestAccount,
    host,
    port
  ) {
    // attempt to start a new websocket
    this.socket = new WebSocket(`ws://${host}:${port}`);

    this.socket.onerror = (e) => {
      console.log(`Could not connect to server`);
      return "ERROR";
    };
    this.socket.onopen = (e) => {
      const packet = {
        type: "login",
        guestAccount,
        username,
        // TODO - use a hash of the password
        password,
        gameId,
        majorVersion,
        minorVersion,
        clientVersion: 1.2,
      };
      this.socket.send(JSON.stringify(packet));
      this.socket.onmessage = (e) => this.processPackets(e.data);
    };
    // success for login is null
    return null;
  }

  processPackets(packet) {
    this.gameNetLogic.processPackets(packet);
  }

  // synchronized void sendNoop() {
  //     this.sendGeneric((byte)0, (short)(-2));
  // }

  // synchronized void createRoom(final String password, final boolean isRanked, final boolean isBigRoom, final boolean isTeamRoom, final int boardSize, final boolean isBalancedRoom, final boolean allShips, final boolean allPowerups, final String[][] array) {
  //     final DataOutput stream = this.getStream(0);
  //     try {
  //         stream.writeByte(20);
  //         stream.writeByte((byte)(isRanked ? 1 : 0));
  //         final boolean hasPassword = password.length() > 0;
  //         stream.writeByte((byte)(hasPassword ? 1 : 0));
  //         if (hasPassword) {
  //             stream.writeUTF(password);
  //         }
  //         stream.writeByte((byte)(isBigRoom ? 1 : 0));
  //         stream.writeByte((byte)(allShips ? 1 : 0));
  //         stream.writeByte((byte)(allPowerups ? 1 : 0));
  //         stream.writeByte((byte)(isTeamRoom ? 1 : 0));
  //         stream.writeByte((byte)boardSize);
  //         stream.writeByte(isBalancedRoom ? 1 : 0);
  //         if (array != null) {
  //             stream.writeByte((byte)array.length);
  //             for (int i = 0; i < array.length; ++i) {
  //                 if (array[i] != null) {
  //                     stream.writeUTF(array[i][0]);
  //                     stream.writeUTF(array[i][1]);
  //                 }
  //             }
  //         }
  //         else {
  //             stream.writeByte(0);
  //         }
  //         this.sendPacket();
  //     }
  //     catch (Exception ex) {}
  // }

  // void createRoom(final String s, final boolean b) {
  //     this.createRoom(s, b, false, false, 3, false, false, false, null);
  // }

  // public void disconnect() {
  //     this.staticbConnected = false;
  //     try {	// Send disconnect flag
  //         final DataOutput stream = this.getStream(0);
  //         if (stream != null) {
  //         	stream.writeByte(1);
  //         	this.sendPacket();
  //         }
  //     }
  //     catch (Exception ex) {}

  //     try {
  //         this.staticreader.staticiStream.close();
  //     }
  //     catch (Exception ex) {}
  //     this.staticreader = null;
  //     try {
  //         this.staticwriter.staticoStream.close();
  //     }
  //     catch (Exception ex2) {}
  //     this.staticwriter = null;
  //     try {
  //         this.staticsocket.close();
  //     }
  //     catch (Exception ex3) {}
  //     this.staticsocket = null;
  // }

  // synchronized void roomSay(final String message) {
  //     final DataOutput stream = this.getStream(0);
  //     try {
  //         stream.writeByte(18);
  //         stream.writeUTF(message);
  //         this.sendPacket();
  //     }
  //     catch (Exception ex) {}
  // }

  // public DataInputStream readPacket() {
  //     try {
  //         super.count = this.staticreader.readPacket(super.buf) + 2;
  //         super.pos = 0;
  //     }
  //     catch (IOException ex) {
  //         return null;
  //     }
  //     return this.staticdataStream;
  // }

  // synchronized void changeTeams(final byte b) {
  //     this.sendGeneric((byte)40, b);
  // }

  // synchronized void startGame(final int n) {
  //     this.sendGeneric((byte)30, (short)n);
  // }

  // synchronized void say(final String message) {
  //     final DataOutput stream = this.getStream(0);
  //     try {
  //         stream.writeByte(5);
  //         stream.writeUTF(message);
  //         this.sendPacket();
  //     }
  //     catch (Exception ex) {}
  // }

  listUsernames() {
    // request a list of usernames from the server
    // this.sendGeneric((byte)9, (short)(-2));
    const packet = {
      type: "listUsernames",
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

  // synchronized void leaveRoom() {
  //     this.sendGeneric((byte)22, (short)(-2));
  // }
}

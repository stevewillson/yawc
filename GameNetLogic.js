import ClientUserManager from "./ClientUserManager.js";
import ClientRoomManager from "./ClientRoomManager.js";
import Network from "./Network.js";

export default class GameNetLogic {
  userId;
  tableId;
  loginPort;
  network;
  isInARoom;
  gamePanel;
  threadNetwork;
  username;
  subscriptionLevel;
  host;
  nextTime;
  NOOP_DURATION;
  mtIcons;
  htLoadedIcons;
  htUnloadedIcons;
  commands;
  lastWhisperer;
  isLoggedIn;

  // used to track the users and rooms clientside
  clientUserManager;
  clientRoomManager;

  constructor(gamePanel) {
    // TODO - fallback to localhost when can't reach yetanotherwormholeclone.com
    this.host = "localhost";
    // this.host = "yetanotherwormholeclone.com";
    this.loginPort = 6049;

    this.htLoadedIcons = new Map();
    this.htUnloadedIcons = new Map();
    this.nextTime = Date.now() + 10000000;

    this.gamePanel = gamePanel;

    this.icons = ["icon1", "icon2"];
    this.isLoggedIn = false;

    // create the client user and room managers
    this.clientUserManager = new ClientUserManager(this);
    this.clientRoomManager = new ClientRoomManager(this);
  }

  // login
  login(username, password) {
    if (this.network != null) {
      // this.network.disconnect();
      this.network = null;
    }
    // if (this.threadNetwork != null && this.threadNetwork.isAlive()) {
    //     try {
    //         this.threadNetwork.stop();
    //     }
    //     catch (Exception ex) {}
    // }
    // (this.threadNetwork = new Thread(this)).start();
    // this.pnlGame.getLobbyPanel().getTablePanel().clearTables();
    // this.pnlGame.getLobbyPanel().getUserPanel().clearUsers();
    // this.pnlGame.getLobbyPanel().getChatPanel().clearLines();
    // CFSkin.getSkin().addWelcomeMessage(
    //   this.pnlGame.getLobbyPanel().getChatPanel()
    // );

    this.network = new Network(this);
    if (this.network != undefined) {
      // set up the socket message handler
    }

    const majorVersion = 0;
    const minorVersion = 1;
    const gameId = 1;

    // Login will return true if successful.
    if (
      this.network.login(
        gameId,
        majorVersion,
        minorVersion,
        username,
        password,
        this.host,
        this.loginPort
      ) == true
    ) {
      return true;
    }

    return false;
  }

  finishLogin(userId, username) {
    this.userId = userId;
    this.username = username;
    this.roomId = -1;
    this.gamePanel.lobbyPanel.updateUsername(this.username);

    // setup a UserManager and RoomManager here to receive the new users and rooms

    // list users and rooms
    this.network.listUsers();
    this.network.listRooms();
    this.nextTime = 0;
  }

  handleRoomStatusChange(roomId, status, countdown) {
    // final CFTablePanel tablePanel = this.m_pnlGame.getLobbyPanel().getTablePanel();
    this.clientRoomManager.setRoomStatus(roomId, status, countdown);

    // tablePanel.setTableStatus(n, b, n2);
    switch (status) {
      case ClientRoomManager.STATUS_DELETE: {
        // remove the table if it should be deleted
        this.clientRoomManager.removeRoom(roomId);
        // final CFPrivateTableDialog privateTableDialog = this.findPrivateTableDialog();
        // if (privateTableDialog != null) {
        // privateTableDialog.setTableRemoved();
        // }
        // tablePanel.removeTable(n);
      }
      case ClientRoomManager.STATUS_PLAYING: {
        if (this.roomId == roomId) {
          // set the room in the countdown phase if it is the room we are in
          // this.m_pnlGame.getPlayingPanel().setInCountdown(false, n2);
          this.gamePanel.roomPanel.setInCountdown(false, countdown);
          return;
        }
        break;
      }
      case ClientRoomManager.STATUS_COUNTDOWN: {
        if (this.roomId == roomId) {
          // play a "weapon firing" sound
          // GameBoard.playSound("snd_fire");
          // set in the RoomPanel
          // this.m_pnlGame.getPlayingPanel().setInCountdown(true, n2);
          this.gamePanel.roomPanel.setInCountdown(false, countdown);
          return;
        }
        break;
      }
    }
  }

  setInRoom(roomId, slot) {
    // get the room
    const room = this.clientRoomManager.getRoomById(roomId);
    // final CFTableElement table = this.m_pnlGame.getLobbyPanel().getTablePanel().findTable(tableID);
    // final PlayingPanel playingPanel = this.m_pnlGame.getPlayingPanel();

    // get the game object
    // playingPanel.getGameBoard().getModel().reset();
    this.gamePanel.roomPanel.game.reset();
    // playingPanel.getGameBoard().getModel().setSlot(slot);
    this.gamePanel.roomPanel.game.setSlot(slot);

    // update the room panel with this information
    // we already get the username from the currently logged in user
    // playingPanel.setTableInfo(this.m_username, tablePassword);
    // playingPanel.setTable(table);
    this.gamePanel.roomPanel.game.setRoom(roomId);

    this.roomId = roomId;
    this.isInARoom = true;

    // clear the chat panel lines
    // playingPanel.getChatPanel().clearLines();
    // CFSkin.getSkin().addTableInstructions(playingPanel.getChatPanel());
    // this.m_pnlGame.showGame();
  }

  processPackets(packet) {
    const packetJSON = JSON.parse(packet);
    console.log(`Received: ${packet}`);
    let type = packetJSON.type;
    switch (type) {
      case 0: {
        let connectionStatusMsg = dataInputStream.readUTF();
        this.disconnect(connectionStatusMsg);
        break;
      }

      case "loginFailure": {
        // show the login page again when login failure
        break;
      }

      case "loginSuccess": {
        this.finishLogin(packetJSON.userId, packetJSON.username);
        break;
      }

      case "logout": {
        // remove the user from the clientusermanager
        this.clientUserManager.removeUser(packetJSON.userId);
        // also remove the user from the rooms that the user is in
        break;
      }

      case "roomInfo": {
        // receive a list of rooms from the server
        // TODO - check if a user is contained in the room and update the user's room display on the user panel
        const newRoom = this.clientRoomManager.addRoom(packetJSON.room);
        // get the slot of the user
        const slot = newRoom.getSlot(this.userId);
        // TODO, set according to a team table
        const teamId = newRoom.isTeamRoom ? 1 : 0;
        // add the user to the room
        this.clientRoomManager.addUserToRoom(
          newRoom.roomId,
          this.userId,
          slot,
          teamId
        );

        // check if the current user's id is contained in that room
        // if so, then set that as the active room
        if (packetJSON.room.userIds.indexOf(this.userId) != -1) {
          this.gamePanel.showRoom();
        }
        break;
      }

      case "userInfo": {
        // add the user now with the client user manager
        this.clientUserManager.addUser(packetJSON.user);
        break;
      }

      //             case 4: {
      //                 String utf = null;
      //                 try {
      //                     utf = dataInputStream.readUTF();
      //                 }
      //                 catch (Exception ex2) {}
      //                 this.disconnect((utf == null) ? "Logged out" : utf);
      //                 break;
      //             }
      // send a private message
      // public void sendPrivateMessage(String fromUser, String toUser, String message) {
      //             case 6: {
      //                 final String utf2 = dataInputStream.readUTF();
      //                 final String utf3 = dataInputStream.readUTF();
      //                 final String utf4 = dataInputStream.readUTF();
      //                 final CFUserElement user = this.getUser(utf2);
      //                 if (user != null && user.getIgnored()) {
      //                     return;
      //                 }
      //                 String s;
      //                 String s2;
      //                 if (utf2.equalsIgnoreCase(this.username)) {
      //                     s = "[to " + utf3;
      //                     s2 = utf3;
      //                 }
      //                 else {
      //                     if (!utf3.equalsIgnoreCase(this.username)) {
      //                         return;
      //                     }
      //                     s = "[from " + utf2;
      //                     this.lastWhisperer = utf2;
      //                     s2 = utf2;
      //                 }
      //                 final String string = s + "]";
      //                 this.pnlGame.getPlayingPanel().getChatPanel().addLine(s2, string, utf4, null);
      //                 this.pnlGame.getLobbyPanel().getChatPanel().addLine(s2, string, utf4, null);
      //                 break;
      //             }
      // sendGlobalMessage
      //             case 5:
      //             case 18: {
      //                 final String username = dataInputStream.readUTF();
      //                 final String message = dataInputStream.readUTF();
      //                 final CFUserElement user2 = this.getUser(username);
      //                 if (user2 != null && user2.getIgnored()) {
      //                     return;
      //                 }
      //                 ((byte1 == 5) ? this.pnlGame.getLobbyPanel().getChatPanel() : this.pnlGame.getPlayingPanel().getChatPanel()).addLine(username, message);
      //                 break;
      //             }

      //             case 9: {
      //                 for (short short1 = dataInputStream.readShort(), n2 = 0; n2 < short1; ++n2) {
      //                     this.myAddUser(dataInputStream);
      //                 }
      //                 break;
      //             }
      //             case 41: {
      //                 final short short2 = dataInputStream.readShort();
      //                 final String utf8 = dataInputStream.readUTF();
      //                 final byte byte2 = dataInputStream.readByte();
      //                 if (short2 == this.tableId) {
      //                     this.pnlGame.getPlayingPanel().getGameBoard().getModel().setTeam(utf8, byte2);
      //                     return;
      //                 }
      //                 break;
      //             }
      //             case 50: {
      //                 final CFTablePanel tablePanel = this.pnlGame.getLobbyPanel().getTablePanel();
      //                 for (short short3 = dataInputStream.readShort(), n3 = 0; n3 < short3; ++n3) {
      //                     final short short4 = dataInputStream.readShort();
      //                     final byte byte3 = dataInputStream.readByte();
      //                     final boolean b = dataInputStream.readByte() == 1;
      //                     final boolean b2 = dataInputStream.readByte() == 1;
      //                     final boolean b3 = dataInputStream.readByte() == 1;
      //                     final boolean b4 = dataInputStream.readByte() == 1;
      //                     byte byte4 = -1;
      //                     boolean b5 = false;
      //                     if (b4) {
      //                         byte4 = dataInputStream.readByte();
      //                         b5 = (dataInputStream.readByte() == 1);
      //                     }
      //                     final String[][] tableOptions = this.readTableOptions(dataInputStream);
      //                     if (tablePanel.findTable(short4) == null) {
      //                         tablePanel.addTable(short4, b3 ? 8 : 4);
      //                     }
      //                     tablePanel.setTableStatus(short4, byte3, 0);
      //                     //tablePanel.findTable(short4).setOptions(b, b2, b4, byte4, b5, tableOptions);
      //                     for (short short5 = dataInputStream.readShort(), n4 = 0; n4 < short5; ++n4) {
      //                         final byte byte5 = dataInputStream.readByte();
      //                         final String utf9 = dataInputStream.readUTF();
      //                         tablePanel.addUserToTable(short4, utf9, byte5);
      //                         this.setTableForUser(utf9, short4);
      //                     }
      //                 }
      //                 break;
      //             }
      // causes a room reset
      // TODO find where the server sends this packet
      // this may not be sent by the ServerThread.java
      //             case 20: {
      //                 if (dataInputStream.readByte() == 1) {
      //                     final short short6 = dataInputStream.readShort();
      //                     final String utf10 = dataInputStream.readUTF();
      //                     final boolean b6 = dataInputStream.readByte() == 1;
      //                     final boolean b7 = dataInputStream.readByte() == 1;
      //                     byte byte6 = -1;
      //                     boolean b8 = false;
      //                     if (b7) {
      //                         byte6 = dataInputStream.readByte();
      //                         b8 = (dataInputStream.readByte() == 1);
      //                     }
      //                     final String[][] tableOptions2 = this.readTableOptions(dataInputStream);
      //                     final CFTablePanel tablePanel2 = this.pnlGame.getLobbyPanel().getTablePanel();
      //                     if (tablePanel2.findTable(short6) == null) {
      //                         tablePanel2.addTable(short6, b6 ? 8 : 4);
      //                     }
      //                     //tablePanel2.findTable(short6).setOptions(false, utf10.length() > 0, b7, byte6, b8, tableOptions2);
      //                     this.setInTable(short6, 0, (utf10.length() == 0) ? null : utf10);
      //                     return;
      //                 }
      //                 break;
      //             }
      //             case 60: {
      //                 final CFTablePanel tablePanel3 = this.pnlGame.getLobbyPanel().getTablePanel();
      //                 final short tableId = dataInputStream.readShort();
      //                 final byte status = dataInputStream.readByte();
      //                 final String username = dataInputStream.readUTF();
      //                 final boolean isRanked = dataInputStream.readByte() == 1;
      //                 final boolean isPrivate = dataInputStream.readByte() == 1;
      //                 final int numUserSlots = (dataInputStream.readByte() == 1) ? 8 : 4;
      //                 final boolean isTeamTable = dataInputStream.readByte() == 1;
      //                 byte boardSize = -1;
      //                 boolean isBalancedTable = false;
      //                 if (isTeamTable) {
      //                   boardSize = dataInputStream.readByte();
      //                     isBalancedTable = (dataInputStream.readByte() == 1);
      //                 }
      //                 final String[][] tableOptions = this.readTableOptions(dataInputStream);
      //                 if (tablePanel3.findTable(tableId) == null) {
      //                     tablePanel3.addTable(tableId, numUserSlots);
      //                 }
      //                 tablePanel3.setTableStatus(tableId, status, 0);
      //                 tablePanel3.addUserToTable(tableId, username, (byte)0);
      //                 this.setTableForUser(username, tableId);
      //                 //tablePanel3.findTable(tableId).setOptions(isRanked, isPrivate, isTeamTable, boardSize, isBalancedTable, tableOptions);
      //                 if (username.equals(this.username)){
      //                     this.setInTable(tableId, 0, (username.length() == 0) ? null : username);
      //                     this.pnlGame.getPlayingPanel().repaint();
      //                     return;
      //                 }
      //                 break;
      //             }
      //             case 21: {
      //                 if (dataInputStream.readByte() == 1) {
      //                     String utf12 = null;
      //                     final CFPrivateTableDialog privateTableDialog = this.findPrivateTableDialog();
      //                     if (privateTableDialog != null) {
      //                         privateTableDialog.handleClosing();
      //                     }
      //                     final short short8 = dataInputStream.readShort();
      //                     final byte byte9 = dataInputStream.readByte();
      //                     if (dataInputStream.readByte() == 1) {
      //                         utf12 = dataInputStream.readUTF();
      //                     }
      //                     this.setInTable(short8, byte9, utf12);
      //                     this.pnlGame.getPlayingPanel().getGameBoard().readJoin(dataInputStream);
      //                     return;
      //                 }
      //                 final CFPrivateTableDialog privateTableDialog2 = this.findPrivateTableDialog();
      //                 if (privateTableDialog2 != null) {
      //                     privateTableDialog2.setStatus(dataInputStream.readUTF());
      //                     return;
      //                 }
      //                 break;
      //             }
      //             case 64: {
      //                 final short short9 = dataInputStream.readShort();
      //                 final String utf13 = dataInputStream.readUTF();
      //                 final byte byte10 = dataInputStream.readByte();
      //                 final byte byte11 = dataInputStream.readByte();
      //                 this.pnlGame.getLobbyPanel().getTablePanel().addUserToTable(short9, utf13, byte10);
      //                 this.setTableForUser(utf13, short9);
      //                 if (this.tableId == short9 && this.bInATable) {
      //                     final CFUserElement user3 = this.getUser(utf13);
      //                     this.pnlGame.getPlayingPanel().getGameBoard().addUser(utf13, user3.getRank(), byte11, user3.getIcons(), byte10);
      //                     return;
      //                 }
      //                 break;
      //             }
      case "leaveRoom": {
        const userId = packetJSON.userId;
        this.clientRoomManager.removeUserFromRoom(userId);
        if (this.userId == userId) {
          // show the lobby
          this.gamePanel.showLobby();
        }
        break;
      }
      //             case 65: {
      //                 final CFTablePanel tablePanel4 = this.pnlGame.getLobbyPanel().getTablePanel();
      //                 final short tableId = dataInputStream.readShort();
      //                 final String username = dataInputStream.readUTF();
      //                 tablePanel4.removeUserFromTable(tableId, username);
      //                 this.setTableForUser(username, -1);
      //                 if (this.bInATable && this.tableId == tableId) {
      //                     this.pnlGame.getPlayingPanel().getGameBoard().removeUser(username);
      //                     return;
      //                 }
      //                 break;
      //             }
      // receive a room status change message
      case "roomStatusChange": {
        //                 final short tableId = dataInputStream.readShort();
        //                 final byte status = dataInputStream.readByte();
        this.handleRoomStatusChange(
          packetJSON.roomId,
          packetJSON.status,
          packetJSON.countdown
        );
        break;
      }
      // sendTableStatusChange
      //             case 66: {
      //                 final short tableId = dataInputStream.readShort();
      //                 final byte status = dataInputStream.readByte();
      //                 this.handleTableStatusChange(tableId, status, (short)((status == 3) ? dataInputStream.readShort() : -1));
      //                 break;
      //             }
      //             case 27: {
      //                 final CreditsPanel creditsPanel = this.pnlGame.getPlayingPanel().getCreditsPanel();
      //                 creditsPanel.setTotalCredits(dataInputStream.readInt());
      //                 int credits = creditsPanel.getCredits() - dataInputStream.readShort();
      //                 if (credits < 0) {
      //                     credits = 0;
      //                 }
      //                 creditsPanel.setCredits(credits);
      //                 break;
      //             }
      //             case 75: {
      //                 final short short12 = dataInputStream.readShort();
      //                 for (byte byte13 = dataInputStream.readByte(), b13 = 0; b13 < byte13; ++b13) {
      //                     final String utf15 = dataInputStream.readUTF();
      //                     final short short13 = dataInputStream.readShort();
      //                     final short short14 = dataInputStream.readShort();
      //                     if (short12 == this.tableId) {
      //                         this.pnlGame.getPlayingPanel().getGameBoard().getModel().updateUserRank(utf15, short13, short14);
      //                         if (utf15.equals(this.username)) {
      //                             this.pnlGame.getPlayingPanel().repaint();
      //                         }
      //                     }
      //                     final CFUserElement user4 = this.getUser(utf15);
      //                     if (user4 != null) {
      //                         user4.setRank(short14);
      //                         final CFTableElement table = this.pnlGame.getLobbyPanel().getTablePanel().findTable(user4.getTableId());
      //                         if (table != null) {
      //                             table.repaint();
      //                         }
      //                         final CFUserDialog userDialog2 = this.findUserDialog(utf15);
      //                         if (userDialog2 != null) {
      //                             userDialog2.repaint();
      //                         }
      //                     }
      //                 }
      //                 break;
      //             }

      // the 3 all have an opcode of 80 - they should go to the "handleGamePacket" routine
      case "teamChange": {
        this.gamePanel.roomPanel.game.handleGamePacket(packetJSON);
        break;
      }

      case "startGame": {
        //             case 80: {
        // get the Game object from the RoomPanel
        // this.pnlGame
        // .getPlayingPanel()
        // .getGameBoard()
        // .getModel()
        // .handleGamePacket(dataInputStream);
        this.gamePanel.roomPanel.game.handleGamePacket(packetJSON);
        break;
      }

      case "tableWins": {
        this.gamePanel.roomPanel.game.handleGamePacket(packetJSON);
        break;
      }

      case "powerup": {
        this.gamePanel.roomPanel.game.handleGamePacket(packetJSON);
        break;
      }

      case "userState": {
        this.gamePanel.roomPanel.game.handleGamePacket(packetJSON);
        break;
      }

      case "userEvent": {
        this.gamePanel.roomPanel.game.handleGamePacket(packetJSON);
        break;
      }

      case "gameOver": {
        this.gamePanel.roomPanel.game.handleGamePacket(packetJSON);
        break;
      }

      case "gameEnd": {
        this.gamePanel.roomPanel.game.handleGamePacket(packetJSON);
        break;
      }

      //             case 101: {	// Receive full table
      //                 CFTablePanel tablePanel = this.pnlGame.getLobbyPanel().getTablePanel();
      //                 short tableId = dataInputStream.readShort();
      //                 byte status = dataInputStream.readByte();
      //                 boolean isRanked = dataInputStream.readByte() == 1;
      //                 boolean isPrivate = dataInputStream.readByte() == 1;
      //                 int numUserSlots = (dataInputStream.readByte() == 1) ? 8 : 4;
      //                 boolean allShipsAllowed = dataInputStream.readByte() == 1;
      //                 boolean allPowerupsAllowed = dataInputStream.readByte() == 1;
      //                 boolean isTeamTable = dataInputStream.readByte() == 1;
      //                 byte boardSize = dataInputStream.readByte();
      //                 boolean isBalancedTable = (dataInputStream.readByte() == 1);

      //                 String[] users = new String[numUserSlots];
      //                 for (int i=0; i < numUserSlots; i++) {
      //                   users[i] = dataInputStream.readUTF();
      //                 }

      //                 String[][] tableOptions = this.readTableOptions(dataInputStream);

      //                 CFTableElement table = tablePanel.findTable(tableId);
      //                 if (table == null) {
      //                   tablePanel.addTable(tableId, numUserSlots);
      //                   table = tablePanel.findTable(tableId);
      //                 }
      //                 table.setStatus(status);
      //                 table.setOptions(isRanked, isPrivate, allShipsAllowed, allPowerupsAllowed, isTeamTable, boardSize, isBalancedTable, tableOptions);
      //                 for (int i=0; i < numUserSlots; i++) {
      //                 byte slot = (byte)i;
      //                 String username = users[i];
      //                   if (username.length() > 0) {
      //                     table.addUser(username, slot);
      //                     this.setTableForUser(username, tableId);
      //                         if (username.equals(this.username)){
      //                           String tablePassword = dataInputStream.readUTF();
      //                             this.setInTable(tableId, slot, tablePassword);
      //                             this.pnlGame.getPlayingPanel().repaint();
      //                         }
      //                   }
      //                 }
      //                 break;
      //             }

      case "joinRoom": {
        // case 102: {	// User joined a table

        // get the room id
        // get the user id
        // get the slot
        const roomId = packetJSON.roomId;
        const userId = packetJSON.userId;
        const slot = packetJSON.slot;
        const teamId = packetJSON.teamId;
        // add the user to the table at the slot
        this.clientRoomManager.addUserToRoom(roomId, userId, slot, teamId);

        // if there is an issue with updating player teams, can request roomInfo upon entering the room

        // do we need to do this for the game?
        // or just display that the user is in a game on the lobby panel?
        // add the user to the Game.js table
        // for now, just add the user to the room display on the lobby
        // gameBoard.addUser(username, user.getRank(), teamId, user.getIcons(), slot);

        // if this is the user joining the room
        // TODO - this should be handled by the server
        // String tablePassword = dataInputStream.readUTF();
        // set that the user is in the table

        // TODO - create an instance of a game for that room
        // show that the user is in the table
        // draw the room panel
        // check if the userId is the current user's id, then set to join the room
        if (userId == this.userId) {
          this.gamePanel.showRoom();
          this.setInRoom(roomId, slot);
        }

        // clear the chat lines in the able
        // add the table instructions to the chat lines
        // calls the "showGame" method for the game panel

        // TODO - here add the other users in the room to the game
        // gameBoard.addUser(user.getName(), user.getRank(), teamId, user.getIcons(), i);
        // close the privateTableDialogs
        break;
      }

      //             }
      //             case 103: {
      //                 final CFPrivateTableDialog privateTableDialog = this.findPrivateTableDialog();
      //                 privateTableDialog.setStatus("Incorrect password.");
      //             }
      //         }
      //     }
      //     catch (Exception ex) {
      //         ex.printStackTrace();
      //     }
      // }
    }
  }

  addRoom(packet) {
    // create a new room
    const roomId = packet.roomId;
    const status = packet.status;
    const isRanked = packet.isRanked;
    const isPrivate = packet.isPrivate;
    const isBigRoom = packet.isBigRoom;
    const allShipsAllowed = packet.allShipsAllowed;
    const allPowerupsAllowed = packet.allPowerupsAllowed;
    const isTeamRoom = packet.isTeamRoom;
    const boardSize = packet.boardSize;
    const isBalancedRoom = packet.isBalancedRoom;
    const roomUsers = packet.roomUsers;
    const numSlots = packet.numSlots;
    const password = packet.password;

    // create a room
    // TODO - also create an instance of a game?
    // games should only be created when a user joins a room
    this.gamePanel.lobbyPanel.roomListPanel.addRoom(
      roomId,
      status,
      isRanked,
      isPrivate,
      isBigRoom,
      allShipsAllowed,
      allPowerupsAllowed,
      isTeamRoom,
      boardSize,
      isBalancedRoom,
      roomUsers,
      numSlots,
      password
    );
  }

  handleJoinRoom(roomId) {
    // add the user to the room
    this.network.joinRoom(roomId, "");
  }

  handleLeaveRoom() {
    // send a network packet to leave the room
    // wait for a server response to actually leave the room
    // handled in GameNetLogic for the "leaveRoom" packet
    this.network.leaveRoom();

    // TODO - should this be set in the clientroommanager
    // this.clientRoomManager.removeUserFromRoom(userId);

    // show the lobby will be called from the game panel
    // this.gamePanel.showLobby();
  }
}

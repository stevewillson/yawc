import { ClientRoomManager } from "./ClientRoomManager.js";
import { ClientUserManager } from "./ClientUserManager.js";
import { Network } from "./Network.js";

export class GameNetLogic {
  userId;
  roomId;

  network;

  gamePanel;

  username;
  host;
  NOOP_DURATION;
  htLoadedIcons;
  htUnloadedIcons;
  lastWhisperer;

  // used to track the users and rooms clientside
  clientUserManager;
  clientRoomManager;

  constructor(gamePanel) {
    this.htLoadedIcons = new Map();
    this.htUnloadedIcons = new Map();

    this.gamePanel = gamePanel;

    this.icons = ["icon1", "icon2"];

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
    // this.pnlGame.getLobbyPanel().getTablePanel().clearTables();
    // this.pnlGame.getLobbyPanel().getUserPanel().clearUsers();
    // this.pnlGame.getLobbyPanel().getChatPanel().clearLines();
    // CFSkin.getSkin().addWelcomeMessage(
    //   this.pnlGame.getLobbyPanel().getChatPanel()
    // );

    this.network = new Network(this);

    const majorVersion = 0;
    const minorVersion = 1;
    const gameId = 1;

    // Login will return true if successful.
    return this.network.login(
      gameId,
      majorVersion,
      minorVersion,
      username,
      password
    );
  }

  finishLogin(userId, username) {
    this.userId = userId;
    this.username = username;
    this.roomId = -1;
    this.gamePanel.lobbyPanel.updateUsername(this.username);

    // list users and rooms
    this.network.listUsers();
    this.network.listRooms();
  }

  handleRoomStatusChange(roomId, status, countdown) {
    this.clientRoomManager.setRoomStatus(roomId, status, countdown);

    switch (status) {
      case "delete": {
        // remove the table if it should be deleted
        this.clientRoomManager.removeRoom(roomId);
      }
      case "playing": {
        if (this.roomId == roomId) {
          this.gamePanel.roomPanel.setInCountdown(false, countdown);
          return;
        }
        break;
      }
      case "countdown": {
        if (this.roomId == roomId) {
          // play a "weapon firing" sound
          // GameBoard.playSound("snd_fire");
          // set the room in the countdown phase if it is the room we are in
          this.gamePanel.roomPanel.setInCountdown(true, countdown);
          return;
        }
        break;
      }
    }
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
        this.clientRoomManager.addRoom(packetJSON.room);
        break;
      }

      case "userInfo": {
        // TODO - check if the user already exists on the client
        // by userId, if yes then update the user's info
        // do not add a new user
        if (
          this.clientUserManager.users.get(packetJSON.user.userId) != undefined
        ) {
          // the user already exists, update the userInfo
          this.clientUserManager.updateUser(packetJSON.user);
        } else {
          // add the user now with the client user manager
          this.clientUserManager.addUser(packetJSON.user);
        }
        break;
      }

      case "leaveRoom": {
        const userId = packetJSON.userId;

        // get the user and the roomId before the user is removed from the room
        const user = this.clientUserManager.users.get(userId);
        const roomId = user.roomId;

        // first show the lobby so errors don't
        // happen when redrawing
        if (this.userId == userId) {
          // show the lobby
          this.gamePanel.showLobby();
        }

        this.clientRoomManager.removeUserFromRoom(userId);

        // also update the room from the user
        this.clientUserManager.removeUserFromRoom(userId);

        // another user has left the room that this user is in
        if (roomId == this.roomId && userId != this.userId) {
          this.gamePanel.roomPanel.game.refreshOtherBar = true;
        }

        break;
      }

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

      // below have an opcode of 80 - they should go to the "handleGamePacket" routine
      case "teamChange":
      case "userEvent":
      case "startGame":
      case "tableWins":
      // user has received a powerup
      case "receivePowerup":
      case "userState":
      case "gameOver":
      case "gameEnd":
        this.gamePanel.roomPanel.game.handleGamePacket(packetJSON);
        break;

      case "joinRoom": {
        // case 102: {	// User joined a table
        const roomId = packetJSON.roomId;
        const userId = packetJSON.userId;
        const slot = packetJSON.slot;
        const teamId = packetJSON.teamId;
        const shipType = packetJSON.shipType;

        this.clientRoomManager.addUserToRoom(
          roomId,
          userId,
          slot,
          shipType,
          teamId
        );

        this.clientUserManager.addUserToRoom(
          roomId,
          userId,
          slot,
          shipType,
          teamId
        );

        // if there is an issue with updating player teams, can request roomInfo upon entering the room

        // TODO - passwords should be handled by the server
        // String tablePassword = dataInputStream.readUTF();

        // draw the room panel
        // check if the userId is the current user's id, then set to join the room
        if (userId == this.userId) {
          this.roomId = roomId;

          // calls the "showGame" method for the game panel
          // a new Game instance is created
          this.gamePanel.showRoom();

          // once a user joins a room, we do not need to reset the room
          this.gamePanel.roomPanel.game.reset();

          // clear the chat panel lines
          // playingPanel.getChatPanel().clearLines();
          // CFSkin.getSkin().addTableInstructions(playingPanel.getChatPanel());
        }

        // don't update the user state for others unless the
        // user is in the room
        if (roomId == this.roomId && userId != this.userId) {
          // someone else joined the room
          this.gamePanel.roomPanel.game.refreshOtherBar = true;
        }

        // clear the chat lines in the room
        // add the table instructions to the chat lines

        // close the privateTableDialogs
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

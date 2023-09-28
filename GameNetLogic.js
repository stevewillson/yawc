import Game from "./Game.js";
import Network from "./Network.js";

export default class GameNetLogic {
  userId;
  tableId;
  loginPort;
  loginPort2;
  network;
  bInATable;
  gamePanel;
  threadNetwork;
  username;
  subscriptionLevel;
  host;
  host2;
  nextTime;
  NOOP_DURATION;
  mtIcons;
  htLoadedIcons;
  htUnloadedIcons;
  commands;
  lastWhisperer;
  isLoggedIn;

  constructor(gamePanel) {
    this.host = "localhost";
    this.loginPort = 6049;

    this.host2 = "localhost";
    this.loginPort2 = 7042;

    this.htLoadedIcons = new Map();
    this.htUnloadedIcons = new Map();
    // this.pnlGame = pnlGame;
    this.nextTime = Date.now() + 10000000;

    // TODO - attempt to login before starting a new game
    this.game = new Game(this);
    this.gamePanel = gamePanel;

    // TODO - set a fake username
    // this.username = "testUsername";
    // this.password = "testPassword";

    this.icons = ["icon1", "icon2"];
    this.isLoggedIn = false;

    // this.login(this.username, this.password);

    // set up a fake gamePacket
    let gamePacket = {
      type: "newGame",
      gameId: 12345,
      gameSession: 54321,
      totalPlayers: 3,
      players: [
        {
          name: "player1",
          teamId: 2,
          icons: ["test", "asdf"],
          slot: 0,
          isGameOver: false,
        },
        {
          name: "player2",
          teamId: 1,
          icons: ["test", "asdf"],
          slot: 1,
          isGameOver: false,
        },
        {
          name: "player3",
          teamId: 1,
          icons: ["test", "asdf"],
          slot: 2,
          isGameOver: false,
        },
      ],
    };

    // this.game.handleGamePacket(gamePacket);
  }

  getPlayer(playerName) {
    // TODO - return actual player name
    return "player1";
  }

  getPlayerRank(playerName) {
    // TODO - return actual player rank
    return 123;
  }

  // processLogin() {
  //   // get information from the username / password text fields
  //   // final LoginPanel loginPanel = this.pnlGame.getLoginPanel();
  //   // loginPanel.setLoginEnabled(false);

  //   // display a logging in message
  //   loginPanel.setConnectionStatus("Logging in");

  //   // get the username from the login area
  //   // username = loginPanel.getUsername();

  //   // get the password from the login area
  //   loginPanel.getPassword();
  //   if (username.length() == 0) {
  //     this.disconnect("Please enter username");
  //     return;
  //   }
  //   let login = this.login(username, loginPanel.getPassword());
  //   if (login != null) {
  //     this.disconnect(login);
  //   }
  // }

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
    // this.pnlGame.getLobbyPanel().getPlayerPanel().clearPlayers();
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
    // Try to connect twice.
    // Login will return null if successful. If not null, then login will be retried.
    if (
      this.network.login(
        gameId,
        majorVersion,
        minorVersion,
        username,
        password,
        this.host,
        this.loginPort
      ) != null
    ) {
      return this.network.login(
        gameId,
        majorVersion,
        minorVersion,
        username,
        password,
        this.host2,
        this.loginPort2
      );
    }
    return null;
  }

  finishLogin(userId, username) {
    this.userId = userId;
    this.username = username;
    this.roomId = -1;
    // TODO
    // this.pnlGame.getLobbyPanel().setUsername(this.username);

    this.gamePanel.lobbyPanel.updateUsername(this.username);

    // this.pnlGame
    //   .getPlayingPanel()
    //   .getCreditsPanel()
    // this.pnlGame.getLoginPanel().setLoginEnabled(true);
    // this.pnlGame.showLobby();
    this.network.listUsernames();
    this.network.listRooms();
    this.nextTime = 0;
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

      case "loginSuccess": {
        this.finishLogin(packetJSON.userId, packetJSON.username);
        break;
      }

      case "usernames": {
        // set the list of usernames received those
        break;
      }

      case "userInfo": {
        // add this info to the player?
        this.myAddPlayer(packetJSON);
        break;
      }
    }
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
  //             case 6: {
  //                 final String utf2 = dataInputStream.readUTF();
  //                 final String utf3 = dataInputStream.readUTF();
  //                 final String utf4 = dataInputStream.readUTF();
  //                 final CFPlayerElement player = this.getPlayer(utf2);
  //                 if (player != null && player.getIgnored()) {
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
  //             case 5:
  //             case 18: {
  //                 final String username = dataInputStream.readUTF();
  //                 final String message = dataInputStream.readUTF();
  //                 final CFPlayerElement player2 = this.getPlayer(username);
  //                 if (player2 != null && player2.getIgnored()) {
  //                     return;
  //                 }
  //                 ((byte1 == 5) ? this.pnlGame.getLobbyPanel().getChatPanel() : this.pnlGame.getPlayingPanel().getChatPanel()).addLine(username, message);
  //                 break;
  //             }
  //             case 13: {
  //                 this.myAddPlayer(dataInputStream);
  //                 break;
  //             }
  //             case 14: {
  //                 final String username = dataInputStream.readUTF();
  //                 this.pnlGame.getLobbyPanel().getPlayerPanel().removePlayer(username);
  //                 final CFPlayerDialog playerDialog = this.findPlayerDialog(username);
  //                 if (playerDialog != null) {
  //                     playerDialog.setUserLoggedOff();
  //                     return;
  //                 }
  //                 break;
  //             }
  //             case 9: {
  //                 for (short short1 = dataInputStream.readShort(), n2 = 0; n2 < short1; ++n2) {
  //                     this.myAddPlayer(dataInputStream);
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
  //                         tablePanel.addPlayerToTable(short4, utf9, byte5);
  //                         this.setTableForPlayer(utf9, short4);
  //                     }
  //                 }
  //                 break;
  //             }
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
  //                 final int numPlayerSlots = (dataInputStream.readByte() == 1) ? 8 : 4;
  //                 final boolean isTeamTable = dataInputStream.readByte() == 1;
  //                 byte boardSize = -1;
  //                 boolean isBalancedTable = false;
  //                 if (isTeamTable) {
  //                   boardSize = dataInputStream.readByte();
  //                     isBalancedTable = (dataInputStream.readByte() == 1);
  //                 }
  //                 final String[][] tableOptions = this.readTableOptions(dataInputStream);
  //                 if (tablePanel3.findTable(tableId) == null) {
  //                     tablePanel3.addTable(tableId, numPlayerSlots);
  //                 }
  //                 tablePanel3.setTableStatus(tableId, status, 0);
  //                 tablePanel3.addPlayerToTable(tableId, username, (byte)0);
  //                 this.setTableForPlayer(username, tableId);
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
  //                 this.pnlGame.getLobbyPanel().getTablePanel().addPlayerToTable(short9, utf13, byte10);
  //                 this.setTableForPlayer(utf13, short9);
  //                 if (this.tableId == short9 && this.bInATable) {
  //                     final CFPlayerElement player3 = this.getPlayer(utf13);
  //                     this.pnlGame.getPlayingPanel().getGameBoard().addPlayer(utf13, player3.getRank(), byte11, player3.getIcons(), byte10);
  //                     return;
  //                 }
  //                 break;
  //             }
  //             case 65: {
  //                 final CFTablePanel tablePanel4 = this.pnlGame.getLobbyPanel().getTablePanel();
  //                 final short tableId = dataInputStream.readShort();
  //                 final String username = dataInputStream.readUTF();
  //                 tablePanel4.removePlayerFromTable(tableId, username);
  //                 this.setTableForPlayer(username, -1);
  //                 if (this.bInATable && this.tableId == tableId) {
  //                     this.pnlGame.getPlayingPanel().getGameBoard().removePlayer(username);
  //                     return;
  //                 }
  //                 break;
  //             }
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
  //                         this.pnlGame.getPlayingPanel().getGameBoard().getModel().updatePlayerRank(utf15, short13, short14);
  //                         if (utf15.equals(this.username)) {
  //                             this.pnlGame.getPlayingPanel().repaint();
  //                         }
  //                     }
  //                     final CFPlayerElement player4 = this.getPlayer(utf15);
  //                     if (player4 != null) {
  //                         player4.setRank(short14);
  //                         final CFTableElement table = this.pnlGame.getLobbyPanel().getTablePanel().findTable(player4.getTableId());
  //                         if (table != null) {
  //                             table.repaint();
  //                         }
  //                         final CFPlayerDialog playerDialog2 = this.findPlayerDialog(utf15);
  //                         if (playerDialog2 != null) {
  //                             playerDialog2.repaint();
  //                         }
  //                     }
  //                 }
  //                 break;
  //             }
  //             case 80: {
  //                 this.pnlGame.getPlayingPanel().getGameBoard().getModel().handleGamePacket(dataInputStream);
  //                 break;
  //             }
  //             case 101: {	// Receive full table
  //                 CFTablePanel tablePanel = this.pnlGame.getLobbyPanel().getTablePanel();
  //                 short tableId = dataInputStream.readShort();
  //                 byte status = dataInputStream.readByte();
  //                 boolean isRanked = dataInputStream.readByte() == 1;
  //                 boolean isPrivate = dataInputStream.readByte() == 1;
  //                 int numPlayerSlots = (dataInputStream.readByte() == 1) ? 8 : 4;
  //                 boolean allShipsAllowed = dataInputStream.readByte() == 1;
  //                 boolean allPowerupsAllowed = dataInputStream.readByte() == 1;
  //                 boolean isTeamTable = dataInputStream.readByte() == 1;
  //                 byte boardSize = dataInputStream.readByte();
  //                 boolean isBalancedTable = (dataInputStream.readByte() == 1);

  //                 String[] players = new String[numPlayerSlots];
  //                 for (int i=0; i < numPlayerSlots; i++) {
  //                   players[i] = dataInputStream.readUTF();
  //                 }

  //                 String[][] tableOptions = this.readTableOptions(dataInputStream);

  //                 CFTableElement table = tablePanel.findTable(tableId);
  //                 if (table == null) {
  //                   tablePanel.addTable(tableId, numPlayerSlots);
  //                   table = tablePanel.findTable(tableId);
  //                 }
  //                 table.setStatus(status);
  //                 table.setOptions(isRanked, isPrivate, allShipsAllowed, allPowerupsAllowed, isTeamTable, boardSize, isBalancedTable, tableOptions);
  //                 for (int i=0; i < numPlayerSlots; i++) {
  //                 byte slot = (byte)i;
  //                 String username = players[i];
  //                   if (username.length() > 0) {
  //                     table.addPlayer(username, slot);
  //                     this.setTableForPlayer(username, tableId);
  //                         if (username.equals(this.username)){
  //                           String tablePassword = dataInputStream.readUTF();
  //                             this.setInTable(tableId, slot, tablePassword);
  //                             this.pnlGame.getPlayingPanel().repaint();
  //                         }
  //                   }
  //                 }
  //                 break;
  //             }
  //             case 102: {	// User joined a table
  //                 short tableId = dataInputStream.readShort();
  //                 String username = dataInputStream.readUTF();
  //                 byte slot = dataInputStream.readByte();
  //                 CFTablePanel tablePanel = this.pnlGame.getLobbyPanel().getTablePanel();
  //                 CFTableElement table = tablePanel.findTable(tableId);

  //                 table.addPlayer(username, slot);
  //                 this.setTableForPlayer(username, tableId);
  //                 GameBoard gameBoard = this.pnlGame.getPlayingPanel().getGameBoard();
  //                 if (this.tableId == tableId && this.bInATable) {
  //                     byte teamId = Team.NOTEAM;
  //                     if (table.isTeamTable()) {
  //                       teamId = Team.GOLDTEAM;	// gold team is default starting team
  //                     }
  //                     CFPlayerElement player = this.getPlayer(username);
  //                     gameBoard.addPlayer(username, player.getRank(), teamId, player.getIcons(), slot);
  //                 }
  //                 else if (username.equals(this.username)){
  //                   String tablePassword = dataInputStream.readUTF();
  //                     this.setInTable(tableId, slot, tablePassword);
  //                     for (byte i=0; i<table.getNumPlayers(); i++) {
  //                         CFPlayerElement player = this.getPlayer(table.getPlayer(i));
  //                         if (player != null) {
  //                             byte teamId = Team.NOTEAM;
  //                             if (table.isTeamTable()) {
  //                               teamId = dataInputStream.readByte();
  //                             }
  //                           gameBoard.addPlayer(player.getName(), player.getRank(), teamId, player.getIcons(), i);
  //                         }
  //                     }
  //                     this.pnlGame.getPlayingPanel().repaint();
  //                     final CFPrivateTableDialog privateTableDialog = this.findPrivateTableDialog();
  //                     if (privateTableDialog != null) {
  //                       privateTableDialog.handleClosing();
  //                     }
  //                 }
  //                 break;
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

  myAddPlayer(packet) {
    const username = packet.username;
    if (username.length == 0) {
      return;
    }
    const rank = packet.rank;
    const numIcons = packet.numIcons;
    const clan = packet.clan;
    let iconNames = [];
    for (let i = 0; i < numIcons; i++) {
      let iconName = packet.icons[i];
      iconNames.push(iconName);
      // if (
      // this.m_htLoadedIcons.get(iconName) == null &&
      // this.m_htUnloadedIcons.get(iconName) == null
      // ) {
      //final Image image = GamePanel.m_applet.getImage(GamePanel.m_applet.getCodeBase(), "images/icons/" + iconName);
      //this.m_htUnloadedIcons.put(iconName, image);
      //this.m_mtIcons.addImage(image, 0);
      // }
    }
    // add the player to a local store of players
    this.gamePanel.playerPanel.addPlayer(username, clan, rank, iconNames);
  }
}

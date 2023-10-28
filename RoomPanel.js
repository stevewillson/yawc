import { Game } from "./Game.js";

// called PlayingPanel.java for wormhole
export class RoomPanel {
  constructor(gamePanel) {
    this.gamePanel = gamePanel;

    this.countdown = null;
    this.inCountdown = null;

    this.userStatusCanvas = undefined;
    this.otherUserStatusCanvas = undefined;
    this.gameCanvas = undefined;
    this.roomChatPanel = undefined;
    this.gameNetLogic = undefined;
  }

  toHtml() {
    const roomPanelDiv = document.createElement("div");

    // make 3 divs (one for each column)
    const leftDiv = document.createElement("div");
    const centerDiv = document.createElement("div");
    const rightDiv = document.createElement("div");

    roomPanelDiv.className = "roomDiv";
    roomPanelDiv.id = "roomPanelDiv";

    roomPanelDiv.style.display = "grid";
    roomPanelDiv.style["grid-template-columns"] = "1fr 2fr 1fr";

    leftDiv.appendChild(this.userAreaHtml());
    // TODO add a roomChatPanel

    const gameCanvas = document.createElement("canvas");
    gameCanvas.id = "GameCanvas";
    gameCanvas.style.margin = 0;
    gameCanvas.style.padding = 0;

    const userStatusBar = document.createElement("canvas");
    userStatusBar.id = "UserStatusCanvas";
    userStatusBar.style.margin = 0;
    userStatusBar.style.padding = 0;
    // set the width and the height here

    centerDiv.appendChild(userStatusBar);
    centerDiv.appendChild(gameCanvas);
    centerDiv.style.display = "grid";
    centerDiv.style.justifyItems = "center";

    // left div will contain another canvas
    const otherStatusBar = document.createElement("canvas");
    otherStatusBar.id = "OtherStatusCanvas";
    otherStatusBar.style.margin = 0;
    otherStatusBar.style.padding = 0;

    rightDiv.appendChild(otherStatusBar);
    rightDiv.style.display = "grid";
    rightDiv.style.alignItems = "top";

    roomPanelDiv.appendChild(leftDiv);
    roomPanelDiv.appendChild(centerDiv);
    roomPanelDiv.appendChild(rightDiv);

    // setup a new area for the game to populate
    this.game = new Game(this.gamePanel.gameNetLogic);

    return roomPanelDiv;
  }

  userAreaHtml() {
    // user: username
    // password: table password
    // rank: user rank
    // table: unranked
    // buttons
    //     public CFButton m_cfBtnLeaveTable;
    //     public CFButton m_cfBtnStartGame;
    //     public CFButton m_cfBtnSoundToggle;

    const userArea = document.createElement("div");
    const usernameText = document.createElement("p");
    usernameText.id = "loggedInUsername";
    usernameText.innerText = `User: ${this.gamePanel.gameNetLogic.username}`;
    usernameText.className = "roomText";

    userArea.appendChild(usernameText);

    // add additional information

    const startGameButton = document.createElement("button");
    startGameButton.innerText = "Start Game";
    startGameButton.className = "roomButton";

    // need to get the room id for the current user?
    const user = this.gamePanel.gameNetLogic.clientUserManager.users.get(
      this.gamePanel.gameNetLogic.userId
    );

    startGameButton.onclick = () =>
      this.gamePanel.gameNetLogic.network.startGame(user.roomId);

    const toggleSoundButton = document.createElement("button");
    toggleSoundButton.innerText = "Sound off";
    toggleSoundButton.id = "toggleSoundButton";
    toggleSoundButton.className = "roomButton";

    toggleSoundButton.onclick = () => this.gamePanel.gameNetLogic.toggleSound();

    const instructionsButton = document.createElement("button");
    instructionsButton.innerText = "Instructions & Tips";
    instructionsButton.className = "roomButton";

    //instructionsButton.onclick = () => showInstructions();

    const leaveRoomButton = document.createElement("button");
    leaveRoomButton.innerText = "Leave Room";
    leaveRoomButton.className = "roomButton";

    leaveRoomButton.onclick = () =>
      this.gamePanel.gameNetLogic.handleLeaveRoom();

    userArea.appendChild(startGameButton);
    userArea.appendChild(toggleSoundButton);
    userArea.appendChild(instructionsButton);
    userArea.appendChild(leaveRoomButton);

    return userArea;
  }

  //   }

  //     public void setTable(final CFTableElement cfTableElement) {
  //         this.m_tableElement = cfTableElement;
  //         this.m_cfGameBoard.setTable(cfTableElement);
  //         this.repaint();
  //     }

  //     public String getTablePassword() {
  //         return this.m_password;
  //     }

  //     public void addURLButton(final CFButton cfButton) {
  //         this.add(cfButton);
  //         this.m_vURLButtons.addElement(cfButton);
  //         this.repaint();
  //     }

  //     public CFButton getLeaveTableButton() {
  //         return this.m_cfBtnLeaveTable;
  //     }

  //     public void fireEvent(final Object o, final Object o2) {
  //         if (this.m_vURLButtons.contains(o)) {
  //             ((CFButton)o).openURLPage();
  //         }
  //     }

  //     public CFChatPanel getChatPanel() {
  //         return this.m_cfChatPanel;
  //     }

  //     public PlayingPanel(final GamePanel pnlGame, final IListener listener) {
  //         this.m_vURLButtons = new Vector();
  //         this.setLayout(null);
  //         this.m_listener = listener;
  //         this.m_pnlGame = pnlGame;
  //         final CFSkin skin = CFSkin.getSkin();
  //         this.add(this.m_cfChatPanel = skin.generateCFChatPanel(listener));
  //         this.add(this.m_cfBtnLeaveTable = skin.generateCFButton("Leave Table", listener, 6));
  //         this.add(this.m_cfBtnSoundToggle = skin.generateCFButton("Sound on", listener, 2));
  //         this.add(this.m_cfBtnStartGame = skin.generateCFButton("Start Game", listener, 5));
  //         this.add(this.m_cfGameBoard = new GameBoard(pnlGame.getProps(), pnlGame.getNetLogic(), GameLoader.g_mediaElements));
  //         this.add(this.m_pnlCredits = new CreditsPanel());
  //     }

  //     public void paint(final Graphics graphics) {
  //         super.paint(graphics);
  //         CFSkin.getSkin().paintPlayingPanel(graphics, this);
  //     }

  //     /**
  //      * called from GamePanel
  //      *
  //      */
  //     public void doOneCycle() {
  //         this.m_cfGameBoard.doOneCycle();
  //     }

  //     public CFButton getStartGameButton() {
  //         return this.m_cfBtnStartGame;
  //     }

  //     public String getUsername() {
  //         return this.m_username;
  //     }

  //     public CFTableElement getTableElement() {
  //         return this.m_tableElement;
  //     }

  //     public void update(final Graphics graphics) {
  //         this.paint(graphics);
  //     }

  //     public GameBoard getGameBoard() {
  //         return this.m_cfGameBoard;
  //     }

  //     public Vector getURLButtons() {
  //         return this.m_vURLButtons;
  //     }

  //     public CFButton getSoundButton() {
  //         return this.m_cfBtnSoundToggle;
  //     }

  //     public CreditsPanel getCreditsPanel() {
  //         return this.m_pnlCredits;
  //     }

  //     public void setTableInfo(final String username, final String password) {
  //         this.m_username = username;
  //         this.m_password = password;
  //     }

  setInCountdown(inCountdown, countdown) {
    this.inCountdown = inCountdown;
    this.countdown = countdown;
  }
}

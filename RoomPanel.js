// called PlayingPanel.java for wormhole
export default class RoomPanel {
  userStatusCanvas;
  otherUserStatusCanvas;
  gameCanvas;

  roomChatPanel;
  gameNetLogic;
  gamePanel;

  //     private int m_countdown;
  //     private boolean m_bCountdown;

  constructor(gamePanel) {
    this.gamePanel = gamePanel;
  }

  toHtml() {
    const roomPanelDiv = document.createElement("div");
    roomPanelDiv.className = "roomDiv";

    roomPanelDiv.appendChild(this.userAreaHtml());
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

    // startGameButton.onclick = () => startCountdown(roomId);

    const toggleSoundButton = document.createElement("button");
    toggleSoundButton.innerText = "Sound on";
    toggleSoundButton.className = "roomButton";

    // toggleSoundButton.onclick = () => toggleSound();

    const instructionsButton = document.createElement("button");
    instructionsButton.innerText = "Instructions & Tips";
    instructionsButton.className = "roomButton";

    // instructionsButton.onclick = () => showInstructions();

    const leaveRoomButton = document.createElement("button");
    leaveRoomButton.innerText = "Leave Room";
    leaveRoomButton.className = "roomButton";

    // leaveRoomButton.onclick = () => leaveRoom(roomId, userId);

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

  //     public void setInCountdown(final boolean bCountdown, final int countdown) {
  //         this.m_bCountdown = bCountdown;
  //         this.m_countdown = countdown;
  //     }
}

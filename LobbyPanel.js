// import RoomListPanel from "./RoomListPanel.js";
import UserListPanel from "./UserListPanel.js";
import ChatPanel from "./ChatPanel.js";
import RoomListPanel from "./RoomListPanel.js";

export default class LobbyPanel {
  roomListPanel;
  userListPanel;
  chatPanel;
  gameNetLogic;
  gamePanel;

  constructor(gamePanel) {
    // this.vURLButtons = new Vector();
    // this.cfTablePanel = skin.generateCFTablePanel(listener);
    // this.cfUserPanel = skin.generateCFUserPanel(listener);
    // this.cfChatPanel = skin.generateCFChatPanel(listener);
    // this.add(this.cfTablePanel);
    // this.add(this.cfUserPanel);
    // this.add(this.cfChatPanel);
    // this.cfBtnLogout = skin.generateCFButton("Logout", listener, 1);
    // this.cfBtnCreateTable = skin.generateCFButton("Create Table", listener, 3);
    // this.cfBtnCreateTableOptions = skin.generateCFButton(
    //   "Create Table Options",
    //   listener,
    //   4
    // );
    // this.add(this.cfBtnLogout);
    // this.add(this.cfBtnCreateTable);
    // this.add(this.cfBtnCreateTableOptions);
    this.gamePanel = gamePanel;
    this.gameNetLogic = gamePanel.gameNetLogic;
    this.roomListPanel = new RoomListPanel(
      this.gamePanel,
      this.gameNetLogic.clientRoomManager
    );
    this.userPanel = new UserListPanel(
      this.gamePanel,
      this.gameNetLogic.clientUserManager
    );
    this.chatPanel = new ChatPanel(this.gamePanel);
  }

  updateUsername(username) {
    document.getElementById("loggedInUsername").innerText = `User: ${username}`;
  }

  // create user area here
  userAreaHtml() {
    // colors for text - #C09760
    // color for background - #735A49
    // panel backgrounds - #3F1710
    // mouse over button color - #FCD39C
    // TODO - change the color of the button on hover
    const userArea = document.createElement("div");
    const usernameText = document.createElement("p");
    usernameText.id = "loggedInUsername";
    usernameText.innerText = `User: ${this.gameNetLogic.username}`;
    usernameText.className = "lobbyText";

    userArea.appendChild(usernameText);

    // make some buttons
    const instructionsButton = document.createElement("button");
    instructionsButton.innerText = "Instructions & Tips";
    instructionsButton.className = "lobbyButton";

    // instructionsButton.onclick = () => this.processLogin();

    const signupButton = document.createElement("button");
    signupButton.innerText = "Sign Up!";
    signupButton.className = "lobbyButton";

    // signupButton.onclick = () => this.processLogin();

    const missionsButton = document.createElement("button");
    missionsButton.innerText = "Missions";
    missionsButton.className = "lobbyButton";

    // missionsButton.onclick = () => this.processLogin();

    const clansButton = document.createElement("button");
    clansButton.innerText = "Clans";
    clansButton.className = "lobbyButton";

    // clansButton.onclick = () => this.processLogin();

    const logoutButton = document.createElement("button");
    logoutButton.innerText = "Logout";
    logoutButton.className = "lobbyButton";

    // logoutButton.onclick = () => this.processLogin();

    const buttonTable = document.createElement("table");
    const firstRow = document.createElement("tr");
    const firstButton = document.createElement("th");
    firstButton.colSpan = 2;
    firstButton.appendChild(instructionsButton);
    firstRow.appendChild(firstButton);
    buttonTable.appendChild(firstRow);

    const secondRow = document.createElement("tr");
    const secondButton = document.createElement("th");
    const thirdButton = document.createElement("th");
    secondButton.appendChild(missionsButton);
    thirdButton.appendChild(clansButton);
    secondRow.appendChild(secondButton);
    secondRow.appendChild(thirdButton);
    buttonTable.appendChild(secondRow);

    const thirdRow = document.createElement("tr");
    const fourthButton = document.createElement("th");
    const fifthButton = document.createElement("th");
    fourthButton.appendChild(signupButton);
    fifthButton.appendChild(logoutButton);
    thirdRow.appendChild(fourthButton);
    thirdRow.appendChild(fifthButton);
    buttonTable.appendChild(thirdRow);

    userArea.appendChild(buttonTable);

    return userArea;
  }

  createRoomButtonsDiv() {
    const createRoomButtonsDiv = document.createElement("div");

    const createRoomButton = document.createElement("button");
    createRoomButton.innerText = "Create Room";
    createRoomButton.className = "lobbyButton";
    // create a room with default options
    createRoomButton.onclick = () => this.gameNetLogic.network.createRoom();

    const createRoomOptionsButton = document.createElement("button");
    createRoomOptionsButton.innerText = "Create Room Options";
    createRoomOptionsButton.className = "lobbyButton";

    createRoomButtonsDiv.appendChild(createRoomButton);
    createRoomButtonsDiv.appendChild(createRoomOptionsButton);
    return createRoomButtonsDiv;
  }

  toHtml() {
    // used to return HTML that will show the lobby
    // include click handlers for the various items
    // TODO

    // set the layout to a grid layout two columns
    const lobbyPanelDiv = document.createElement("div");
    lobbyPanelDiv.className = "lobbyDiv";
    lobbyPanelDiv.id = "lobbyPanelDiv";

    lobbyPanelDiv.style.display = "grid";
    lobbyPanelDiv.style["grid-template-columns"] = "1fr 2fr";

    const leftDiv = document.createElement("div");
    const rightDiv = document.createElement("div");

    leftDiv.appendChild(this.userAreaHtml());

    // add the user panel to the left side of the lobby
    leftDiv.appendChild(this.userPanel.toHtml());

    rightDiv.appendChild(this.createRoomButtonsDiv());

    rightDiv.appendChild(this.roomListPanel.toHtml());
    rightDiv.appendChild(this.chatPanel.toHtml());

    lobbyPanelDiv.appendChild(leftDiv);
    lobbyPanelDiv.appendChild(rightDiv);

    return lobbyPanelDiv;

    // Users Area below on left
    // Clan / User / Table / Rank
    // show Ranking Key on Bottom
    // on right column
    // buttons - Create Table / Create Table Options
    // Tables
    // Join Table
    // show the users in the table
    // below
    // Chat
    // Instructions:
    // Click on a table to jump into a game.
    // (green text) Green tables are collecting users.
    // (yellow text) Yellow tables are about to start.
    // (red text) Red tables are playing
    // Type '/help' to list chat commands
    // -----------------------------------
    // Welcome to Wormhole Redux! Enjoy your stay :)
    // This is a version with no permanent accounts and no ranked games.
    // For chat
    // Help: this message
    // Whisper: /whisper [username]
    // Reply /reply [message]
    // Ignore: /ignore [username]
    // Unignore: /unignore [username]
    // at the bottom there is a text box titled "Say:" with a field to type a chat
  }
}

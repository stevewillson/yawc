// import RoomPanel from "./RoomPanel.js";
import PlayerPanel from "./PlayerPanel.js";
import ChatPanel from "./ChatPanel.js";
import RoomPanel from "./RoomPanel.js";

export default class LobbyPanel {
  roomPanel;
  playerPanel;
  chatPanel;
  gameNetLogic;
  gamePanel;

  constructor(gamePanel) {
    // this.vURLButtons = new Vector();
    // this.cfTablePanel = skin.generateCFTablePanel(listener);
    // this.cfPlayerPanel = skin.generateCFPlayerPanel(listener);
    // this.cfChatPanel = skin.generateCFChatPanel(listener);
    // this.add(this.cfTablePanel);
    // this.add(this.cfPlayerPanel);
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

    this.roomPanel = new RoomPanel();
    this.playerPanel = new PlayerPanel();
    this.chatPanel = new ChatPanel();
    this.gameNetLogic = gamePanel.gameNetLogic;
    this.gamePanel = gamePanel;
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
    usernameText.style.color = "#C09760";
    userArea.appendChild(usernameText);

    // make some buttons
    const instructionsButton = document.createElement("button");
    instructionsButton.innerText = "Instructions & Tips";
    instructionsButton.style.color = "#C09760";
    instructionsButton.style.backgroundColor = "#735A49";
    instructionsButton.style.borderRadius = "8px";

    // instructionsButton.onclick = () => this.processLogin();

    const signupButton = document.createElement("button");
    signupButton.innerText = "Sign Up!";
    signupButton.style.color = "#C09760";
    signupButton.style.backgroundColor = "#735A49";
    signupButton.style.borderRadius = "8px";

    // signupButton.onclick = () => this.processLogin();

    const missionsButton = document.createElement("button");
    missionsButton.innerText = "Missions";
    missionsButton.style.color = "#C09760";
    missionsButton.style.backgroundColor = "#735A49";
    missionsButton.style.borderRadius = "8px";

    // missionsButton.onclick = () => this.processLogin();

    const clansButton = document.createElement("button");
    clansButton.innerText = "Clans";
    clansButton.style.color = "#C09760";
    clansButton.style.backgroundColor = "#735A49";
    clansButton.style.borderRadius = "8px";

    // clansButton.onclick = () => this.processLogin();

    const logoutButton = document.createElement("button");
    logoutButton.innerText = "Logout";
    logoutButton.style.color = "#C09760";
    logoutButton.style.backgroundColor = "#735A49";
    logoutButton.style.borderRadius = "8px";

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
    createRoomButton.style.color = "#C09760";
    createRoomButton.style.backgroundColor = "#735A49";
    createRoomButton.style.borderRadius = "8px";

    // clansButton.onclick = () => this.processLogin();

    const createRoomOptionsButton = document.createElement("button");
    createRoomOptionsButton.innerText = "Create Room Options";
    createRoomOptionsButton.style.color = "#C09760";
    createRoomOptionsButton.style.backgroundColor = "#735A49";
    createRoomOptionsButton.style.borderRadius = "8px";

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
    lobbyPanelDiv.style.backgroundColor = "#735A49";

    lobbyPanelDiv.style.display = "grid";
    lobbyPanelDiv.style["grid-template-columns"] = "1fr 2fr";

    const leftDiv = document.createElement("div");
    const rightDiv = document.createElement("div");

    leftDiv.appendChild(this.userAreaHtml());

    // add the player panel to the left side of the lobby
    leftDiv.appendChild(this.playerPanel.toHtml());

    rightDiv.appendChild(this.createRoomButtonsDiv());

    rightDiv.appendChild(this.roomPanel.toHtml());
    rightDiv.appendChild(this.chatPanel.toHtml());

    lobbyPanelDiv.appendChild(leftDiv);
    lobbyPanelDiv.appendChild(rightDiv);

    return lobbyPanelDiv;

    // Players Area below on left
    // Clan / User / Table / Rank
    // show Ranking Key on Bottom
    // on right column
    // buttons - Create Table / Create Table Options
    // Tables
    // Join Table
    // show the players in the table
    // below
    // Chat
    // Instructions:
    // Click on a table to jump into a game.
    // (green text) Green tables are collecting players.
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

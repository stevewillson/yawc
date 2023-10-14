import GameNetLogic from "./GameNetLogic.js";
import LoginPanel from "./LoginPanel.js";
import LobbyPanel from "./LobbyPanel.js";
import RoomPanel from "./RoomPanel.js";

// GamePanel is a wrapper for the different displays
export default class GamePanel {
  lobbyPanel;
  loginPanel;
  roomPanel;
  playingPanel;
  gameNetLogic;

  constructor() {
    // lobby panel
    // playing panel (for the game)
    // connection between the logic and the display
    this.gameNetLogic = new GameNetLogic(this);

    // display for login and lobby
    this.loginPanel = new LoginPanel(this);
    this.lobbyPanel = new LobbyPanel(this);
    this.roomPanel = new RoomPanel(this);

    this.showLogin();
  }

  showLogin() {
    // add the loginPanel div to the html
    let loginPanelDiv = document.getElementById("loginPanelDiv");
    if (loginPanelDiv != undefined) {
      loginPanelDiv.hidden = false;
    } else {
      loginPanelDiv = this.loginPanel.toHtml();
      document.body.appendChild(loginPanelDiv);
      loginPanelDiv.hidden = false;
    }
  }

  showLobby() {
    // show the lobby
    // draw user area in upper left
    // User: USERNAME
    // button - Instructions & Tips
    // button - Missions    Clans
    // button - Sign Up!    Logout

    // clear the page
    // need to wait until the

    // hide the lobby and the room panel

    const loginPanelDiv = document.getElementById("loginPanelDiv");
    const roomPanelDiv = document.getElementById("roomPanelDiv");

    if (loginPanelDiv != undefined) {
      loginPanelDiv.hidden = true;
    }
    if (roomPanelDiv != undefined) {
      roomPanelDiv.hidden = true;
      // remove so we don't error out when trying to redraw
      // delete this.roomPanel.game;
      // roomPanelDiv.remove();
    }

    let lobbyPanelDiv = document.getElementById("lobbyPanelDiv");

    if (lobbyPanelDiv != undefined) {
      lobbyPanelDiv.hidden = false;
    } else {
      lobbyPanelDiv = this.lobbyPanel.toHtml();
      document.body.appendChild(lobbyPanelDiv);
    }
  }

  showRoom() {
    // shows a room with users inside
    // allows selecting a ship
    // shows the users name and bar across the top
    // chat panel on the left of the screen for the game
    // <!-- <main>
    // <canvas id="GameCanvas"></canvas>
    // </main> -->

    // hide the lobby and the login panel
    const loginPanelDiv = document.getElementById("loginPanelDiv");
    const lobbyPanelDiv = document.getElementById("lobbyPanelDiv");
    let roomPanelDiv = document.getElementById("roomPanelDiv");

    if (loginPanelDiv != undefined || loginPanelDiv != null) {
      loginPanelDiv.hidden = true;
    }

    // TODO - does not appear to hide the lobby Panel
    if (lobbyPanelDiv != undefined || lobbyPanelDiv != null) {
      lobbyPanelDiv.hidden = true;
    }

    if (roomPanelDiv != undefined || roomPanelDiv != null) {
      roomPanelDiv.hidden = false;
    } else {
      roomPanelDiv = this.roomPanel.toHtml();
      document.body.appendChild(roomPanelDiv);
    }
  }
}

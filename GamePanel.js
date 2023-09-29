import GameNetLogic from "./GameNetLogic.js";
import LoginPanel from "./LoginPanel.js";
import LobbyPanel from "./LobbyPanel.js";
import UserPanel from "./UserPanel.js";
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
    this.gameNetLogic = new GameNetLogic(this);
    this.loginPanel = new LoginPanel(this);
    this.lobbyPanel = new LobbyPanel(this);

    this.showLogin();
  }

  showLogin() {
    // add the loginPanel div to the html
    if (document.getElementById("loginPanelDiv") != undefined) {
      document.getElementById("loginPanelDiv").hidden = false;
    } else {
      const loginPanelDiv = this.loginPanel.toHtml();
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
    document.getElementById("loginPanelDiv").hidden = true;
    // document.body.removeChild(document.getElementById("loginScreen"));
    const lobbyPanelDiv = this.lobbyPanel.toHtml();

    document.body.appendChild(lobbyPanelDiv);
  }

  showRoom() {
    // shows a room for users to join
    // allows selecting a ship
    // shows the users name and bar across the top
    // chat panel on the left of the screen for the game
    // <!-- <main>
    // <canvas id="GameCanvas"></canvas>
    // </main> -->
  }

  showGame() {
    // show a game once it starts from the lobby
    // this.cardLayout.show(this, "Playing");
  }
}

import GameNetLogic from "./GameNetLogic.js";
import GamePanel from "./GamePanel.js";
import LobbyPanel from "./LobbyPanel.js";

// check here about logging in?
let gamePanel;
window.onload = function () {
  gamePanel = new GamePanel();
};

// only use key handlers when the game is in focus?
// key press handlers
// document.onkeydown = function (e) {
//   e.preventDefault();
//   whGameNetLogic.game.onkeydown(e);
// };

// document.onkeyup = function (e) {
//   e.preventDefault();
//   whGameNetLogic.game.onkeyup(e);
// };

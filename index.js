import GameNetLogic from "./GameNetLogic.js";

// check here about logging in?

let whGameNetLogic;
window.onload = function () {
  whGameNetLogic = new GameNetLogic();
};

// key press handlers
document.onkeydown = function (e) {
  e.preventDefault();
  whGameNetLogic.game.onkeydown(e);
};

document.onkeyup = function (e) {
  e.preventDefault();
  whGameNetLogic.game.onkeyup(e);
};

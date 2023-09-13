import GameBoard from "./GameBoard.js";

let whGameBoard = new GameBoard(window);

window.onload = function () {
  whGameBoard.start();
};

// key press handlers
document.onkeydown = function (e) {
  e.preventDefault();
  whGameBoard.onkeydown(e);
};

document.onkeyup = function (e) {
  e.preventDefault();
  whGameBoard.onkeyup(e);
};

// add a player to here,
// this displays the players in the Lobby
import PlayerElement from "./PlayerElement.js";

export default class PlayerPanel {
  players;
  gamePanel;

  constructor(gamePanel) {
    this.players = new Map();
    this.gamePanel = gamePanel;
  }

  toHtml() {
    const playerPanelDiv = document.createElement("div");
    playerPanelDiv.style.border = "6px solid";
    playerPanelDiv.style.borderColor = "#cccccc";
    playerPanelDiv.style.backgroundColor = "#3F1710";
    playerPanelDiv.id = "playerPanelDiv";
    this.players.forEach((player) => {
      const el = player.toHtml();
      playerPanelDiv.appendChild(el);
    });
    return playerPanelDiv;
  }

  getPlayer(username) {
    return this.players.get(username);
  }

  removePlayer(username) {
    this.players.delete(username);
  }

  // add the player to the panel
  addPlayer(username, clan, rank, icons) {
    if (this.getPlayer(username) != null) {
      return;
    }
    let newPlayerElement = new PlayerElement(username, clan, rank, icons);

    // make a function to add a sorted element to the panel
    this.addSortedElement(newPlayerElement);

    // TODO - check if the element is already on the playerPanel
    // also add to the DOM here
    let playerPanelDiv = document.getElementById("playerPanelDiv");
    playerPanelDiv.appendChild(newPlayerElement.toHTML());
  }

  addSortedElement(element) {
    // TODO - add an element to the player panel
    // add the player element to the map in a sorted way
    // use the username as the key and the value for now
    this.players.set(element, element);
  }

  clearPlayers() {
    // create a new map for the players
    this.players = new Map();
  }

  setPlayerRank(username, rank) {
    this.players.get(username).rank = rank;
  }
}

export default class RoomListPanel {
  gamePanel;
  clientRoomManager;

  constructor(gamePanel) {
    this.gamePanel = gamePanel;
    this.clientRoomManager = gamePanel.gameNetLogic.clientRoomManager;
  }

  toHtml() {
    const roomListPanelDiv = document.createElement("div");
    roomListPanelDiv.className = "lobbyPanel";
    roomListPanelDiv.id = "roomListPanelDiv";
    this.clientRoomManager.rooms.forEach((room) => {
      const el = room.toHtml();
      roomListPanelDiv.appendChild(el);
    });
    return roomListPanelDiv;
  }
}

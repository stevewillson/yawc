export default class CFChatPanel {
  gamePanel;
  maxLines;
  tfChat;

  constructor(gamePanel) {
    this.gamePanel = gamePanel;
    this.maxLines = 20;
    // this.maxLines = maxLines;
    // (this.tfChat = new TextField(128)).setSize(1, n);
    // this.tfChat.addActionListener(this);
    // this.add(this.tfChat);
  }

  clearLines() {
    this.resetChatLine();
    this.removeAllElements();
  }

  toHtml() {
    const chatPanelDiv = document.createElement("div");

    chatPanelDiv.className = "lobbyPanel";
    chatPanelDiv.id = "chatPanelDiv";

    // function addMessage(username, message) {
    //   // displays new message
    //   document.getElementById(
    //     "conversation",
    //   ).innerHTML += `<b> ${username} </b>: ${message} <br/>`;
    // }

    const chatArea = document.createElement("div");
    chatArea.id = "chatArea";
    chatArea.className = "chatArea";
    chatPanelDiv.appendChild(chatArea);

    chatArea.innerHTML = "";
    chatArea.innerHTML += "Instructions:<br>";
    chatArea.innerHTML += "Click on a table to jump into a game.<br>";
    chatArea.innerHTML +=
      "<p style='color: green;'>Green tables are collecting players.</p><br>";
    chatArea.innerHTML +=
      "<p style='color: yellow;'>Yellow tables are about to start.</p><br>";
    chatArea.innerHTML +=
      "<p style='color: red;'>Red tables are playing.</p><br>";
    chatArea.innerHTML += "Type '/help' to list chat commands.<br>";
    chatArea.innerHTML +=
      "----------------------------------------------------------------------<br>";
    chatArea.innerHTML +=
      "Welcome to Yet Another Wormhole Clone! Enjoy your stay :)<br>";
    chatArea.innerHTML +=
      "This is a version with no permanent accounts and no ranked games.<br>";

    // area where the text will be entered
    const textInput = document.createElement("input");
    chatPanelDiv.appendChild(textInput);

    // <input id="data" placeholder="send message" />;
    return chatPanelDiv;
  }

  addLine(s, s2, s3, color) {
    super.vComponents.addElement(
      CFSkin.getSkin().generateCFChatElement(
        super.listener,
        s,
        s2,
        s3,
        super.scrollingAreaWidth,
        color,
      ),
    );
    while (super.vComponents.size() > this.maxLines) {
      super.vComponents.removeElementAt(0);
    }
    n = super.bIEFix
      ? super.vBar.getMaximum() - 5
      : super.vBar.getMaximum() - super.vBar.getVisibleAmount() - 5;
    n2 = super.bIEFix
      ? super.vBar.getMaximum() + super.scrollingAreaHeight
      : super.vBar.getMaximum();
    if (super.vBar.getValue() >= n) {
      this.layoutComponents(n2);
    } else {
      this.layoutComponents();
    }
    super.offsetY = super.vBar.getValue();
    this.repaint();
  }

  addLine(s, s2) {
    this.addLine(s, s, s2, null);
  }

  addLine(s) {
    this.addLine(null, null, s, null);
  }

  resetChatLine() {
    this.tfChat.setText("");
  }

  setBounds(bounds) {
    super.setBounds(bounds);
    height = this.tfChat.getSize().height;
    super.scrollingAreaHeight -= height;
    this.tfChat.setBounds(
      super.leftGutter + 30,
      bounds.height - super.bottomGutter - height + 1,
      bounds.width - 30 - super.totalHorizontalGutter + 2,
      height,
    );
    super.vBar.setSize(15, bounds.height - super.totalVerticalGutter - height);
  }
}

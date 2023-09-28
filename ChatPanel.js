export default class CFChatPanel {
  maxLines;
  tfChat;

  clearLines() {
    this.resetChatLine();
    this.removeAllElements();
  }

  constructor(maxLines, n) {
    this.maxLines = maxLines;
    // (this.tfChat = new TextField(128)).setSize(1, n);
    // this.tfChat.addActionListener(this);
    // this.add(this.tfChat);
  }

  toHtml() {
    const chatPanelDiv = document.createElement("div");

    chatPanelDiv.style.border = "6px solid";
    chatPanelDiv.style.borderColor = "#cccccc";
    chatPanelDiv.style.backgroundColor = "#3F1710";
    chatPanelDiv.id = "chatPanelDiv";

    const para = document.createElement("p");
    para.innerText = `SOME TEXT`;
    chatPanelDiv.appendChild(para);
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
        color
      )
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
      height
    );
    super.vBar.setSize(15, bounds.height - super.totalVerticalGutter - height);
  }
}

export class LoginPanel {
  connectionStatusMsg;
  pnlGame;
  tfUsername;
  tfPassword;

  setLoginEnabled(enabled) {
    this.tfUsername.setEnabled(enabled);
    this.tfPassword.setEnabled(enabled);
    this.cfBtnLogin.setEnabled(enabled);
    if (enabled) {
      this.tfPassword.setText("");
    }
    this.tfUsername.transferFocus();
  }

  constructor(gamePanel) {
    this.connectionStatusMsg = "";
    this.gamePanel = gamePanel;
  }

  toHtml() {
    document.body.style.display = "grid";

    const loginDiv = document.createElement("div");
    loginDiv.className = "loginPanelDiv";
    loginDiv.id = "loginPanelDiv";

    const wormholeGraphic = document.createElement("img");
    wormholeGraphic.src = "./images/leftbanner.gif";
    loginDiv.appendChild(wormholeGraphic);

    const usernameLabel = document.createElement("label");
    usernameLabel.innerText = "Username:";
    loginDiv.appendChild(usernameLabel);

    const usernameField = document.createElement("input");
    usernameField.name = "username";
    usernameField.id = "username";
    usernameField.type = "text";
    loginDiv.appendChild(usernameField);

    usernameLabel.for = usernameField.id;

    const passwordLabel = document.createElement("label");
    passwordLabel.innerText = "Password:";
    loginDiv.appendChild(passwordLabel);

    const passwordField = document.createElement("input");
    passwordField.name = "password";
    passwordField.id = "password";
    passwordField.type = "password";
    loginDiv.appendChild(passwordField);

    passwordLabel.for = passwordField.id;

    const loginButton = document.createElement("button");
    loginButton.className = "loginButton";
    loginButton.innerText = "Login";
    loginButton.id = "submit";
    loginButton.type = "submit";
    loginButton.onclick = () => this.processLogin();

    loginDiv.appendChild(loginButton);

    return loginDiv;
  }

  processLogin() {
    // get username
    // get password
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log(`Logging in. Username: ${username} Password: ${password}`);

    const loginSuccess = this.gamePanel.gameNetLogic.login(username, password);

    // if a successful login, show the lobby screen
    if (loginSuccess) {
      this.gamePanel.showLobby();
    }
  }
}

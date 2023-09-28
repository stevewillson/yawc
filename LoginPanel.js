export default class LoginPanel {
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
    // make background gray
    // add username and password box
    // add form with target for "login"
    // add endpoint for websocket here too?
    // host and port

    document.body.style.display = "grid";
    document.body.style.background = "gray";

    const loginDiv = document.createElement("div");
    loginDiv.id = "loginPanelDiv";

    const wormholeGraphic = document.createElement("img");
    wormholeGraphic.src = "./images/leftbanner.gif";
    loginDiv.appendChild(wormholeGraphic);

    const loginForm = document.createElement("form");

    const usernameLabel = document.createElement("label");
    usernameLabel.innerText = "Username:";
    loginForm.appendChild(usernameLabel);

    const usernameField = document.createElement("input");
    usernameField.name = "username";
    usernameField.id = "username";
    usernameField.type = "text";
    loginForm.appendChild(usernameField);

    usernameLabel.for = usernameField.id;

    const passwordLabel = document.createElement("label");
    passwordLabel.innerText = "Password:";
    loginForm.appendChild(passwordLabel);

    const passwordField = document.createElement("input");
    passwordField.name = "password";
    passwordField.id = "password";
    passwordField.type = "password";
    loginForm.appendChild(passwordField);

    passwordLabel.for = passwordField.id;

    const loginButton = document.createElement("button");
    loginButton.innerText = "Login";
    loginButton.id = "submit";
    loginButton.type = "submit";
    loginButton.onclick = () => this.processLogin();

    loginForm.appendChild(loginButton);

    loginDiv.appendChild(loginForm);

    return loginDiv;
  }

  processLogin() {
    // get username
    // get password
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log(`Logging in. Username: ${username} Password: ${password}`);

    const loginSuccess =
      this.gamePanel.gameNetLogic.login(username, password) == null;

    // if a successful login, show the lobby screen
    if (loginSuccess) {
      this.gamePanel.showLobby();
    }

    // return false so the page does not get reloaded
    return false;

    // otherwise, show a message and then show the login page
  }
}

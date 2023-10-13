import SpriteColors from "./SpriteColors.js";
import WHUtil from "./WHUtil.js";
import UserSprite from "./sprites/UserSprite.js";
import ClientRoomManager from "./ClientRoomManager.js";
// block on the right side of the screen that show the information
// about users and their associated health

/**
 * ClientUser Class
 * Contains all information about a user on the client side.
 * The userId is added to a ClientRoom for a Game
 */
export default class ClientUser {
  static BLOCKSIZE = 5;
  static powerupPoints = [
    [20, 60],
    [7, 100],
    [41, 147],
    [91, 147],
    [97, 60],
    [105, 100],
  ];
  static POWERUP_FIELDS = 6;
  static POWERUP_LEN = 10;
  static POWERUP_DISPLAY_TIMEOUT = 10000;

  refresh;

  username;
  userId;

  roomId;
  rank;
  icons;
  clan;
  bIgnored;
  userPanel;
  shipType;

  portalSprite;

  gameOver;
  wins;
  kills;

  width;
  height;
  teamId;

  myHeight;
  cx;
  cy;
  imgPowerups;
  offsetCycle;
  y;
  h;

  powerups;
  numPowerups;

  healthPercent;
  oldHealth;
  color;
  slot;
  game;

  userSprite;

  constructor(gameNetLogic) {
    this.gameNetLogic = gameNetLogic;

    this.refresh = false;

    this.userId = null;
    this.username = null;

    this.wins = 0;
    this.kills = 0;

    this.portalSprite = null;

    this.powerups = new Array(5);
    // this.titleBarH = 40;
    this.powerupTimeouts = new Array(6);
    this.colors = new SpriteColors();
    this.reset();
    // this.imgPowerups = (Image[])WormholeModel.g_mediaTable.get("img_smallpowerups");
    this.myHeight = 158;
    this.userHeight = 60;

    // this.y = 0;
    // this.h = 0;
  }

  /**
   * Sets the draw location for the ClientUser representation
   * @param {number} x
   * @param {number} y
   */
  // setDrawLocation(x, y) {
  //   this.y = x;
  //   this.h = y;
  // }

  /**
   * Sets the slot for a ClientUser
   * Updates the color
   * @param {number} slot
   */
  setSlot(slot) {
    this.refresh = true;
    this.slot = slot;
    this.color = this.colors.colors[slot][0];
  }

  getUserState() {
    let healthPercent =
      (100 * this.userSprite.health) / this.userSprite.MAX_HEALTH;
    const packet = {
      type: "userState",
      userId: this.userId,
      healthPercent,
      numPowerups: this.numPowerups,
      powerups: this.powerups,
      shipType: this.shipType,
      strDamagedByUser: this.strDamagedByUser,
      damagingPowerup: this.damagingPowerup,
      lostHealth: this.userSprite.lostHealth,
    };
    return packet;
  }

  // TODO this was the previous constructor
  setClientUser(userId, username, clan, rank, icons) {
    this.roomId = null;
    this.username = username;
    this.userId = userId;
    this.clan = clan;
    this.rank = rank;
    this.icons = icons;
    this.teamId = 0;
    this.shipType = 1;
  }

  fullReset() {
    this.wins = 0;
    this.kills = 0;
    this.reset();
  }

  reset() {
    this.numPowerups = 0;
    this.healthPercent = 100;
    this.refresh = true;
    this.color = "gray";
    this.gameOver = false;
    if (this.portalSprite != null) {
      this.portalSprite.killSelf();
      this.portalSprite = null;
    }
    this.teamId = 0;
  }

  draw(context, width, height) {
    this.refresh = false;

    WHUtil.drawBoundRect(
      context,
      0,
      0,
      width,
      height,
      this.color,
      this.gameOver ? "gray" : this.offsetCycle == 30 ? "orange" : "black"
    );
    context.font = "12px Helvetica";
    context.fillStyle = "white";

    if (this.username != null) {
      context.fillText(
        this.username.length > 12
          ? this.username.substring(0, 11)
          : this.username,
        30,
        11
      );
    }
    // TODO
    // where to put the draw icons function?
    // CFSkin.getSkin().drawIcons(graphics, this.icons, 97, 2, 15, 3);
    context.fillText(`wins: ${this.wins}`, 85, 24);
    context.fillText(`rank: ${this.rank != null ? this.rank : "n/a"}`, 30, 24);
    for (let b = 0; b < this.numPowerups; b++) {
      let shiftedNumber = this.powerups[b] - 6;
      let powerupNumber;
      if (shiftedNumber <= 0) {
        powerupNumber = 0;
      } else {
        powerupNumber = shiftedNumber;
      }

      let img = document.getElementById("smallPowerupImages");
      let imgWidth = 21;
      let imgHeight = 17;

      context.drawImage(
        img,
        powerupNumber + powerupNumber * imgWidth + 1,
        1,
        imgWidth,
        imgHeight - 2,
        34 + b * 21,
        29,
        imgWidth,
        imgHeight - 2
      );
    }
    let n3 = width - 10;
    let min = Math.min((n3 * this.healthPercent) / 100, n3);
    context.strokeStyle = this.color;
    context.fillStyle = this.color;
    context.strokeRect(5, height - 13, n3, 10);
    context.fillRect(5, height - 13, min, 10);
    let n4 = 15;
    let n5 = height / 2;
    if (this.offsetCycle > 0) {
      this.offsetCycle--;
      n4 += WHUtil.randInt(2);
      n5 += WHUtil.randInt(2);
      this.refresh = true;
    }
    let n6 = UserSprite.fighterData[this.shipType].shipScale;
    context.translate(n4, n5);

    // TODO - get the room the user is in in another way
    const room = this.gameNetLogic.clientRoomManager.getRoomById(this.roomId);

    // make a new polygon for the fighterData
    const polygon = WHUtil.createPolygon(UserSprite.shipShapes[this.shipType]);
    WHUtil.drawScaledPoly(context, polygon, n6);
    context.translate(-n4, -n5);
    if (this.teamId != 0 && room.isTeamRoom) {
      this.drawTeamShape(context, 1, 1, this.teamId);
    }
  }

  toHtml() {
    // TODO - add a click handler to bring up a dialog box for this user to see stats and whisper to them

    // make a new table row
    const tableRow = document.createElement("tr");
    tableRow.className = "userElementRow";
    tableRow.id = `user:${this.username}`;

    const clanElement = document.createElement("td");
    const usernameElement = document.createElement("td");
    const roomIndexElement = document.createElement("td");
    const rankElement = document.createElement("td");
    clanElement.innerText = this.clan;
    usernameElement.innerText = this.username;

    // get the room index from the user manager
    roomIndexElement.innerText =
      this.userPanel.gamePanel.lobbyPanel.roomPanel.roomIndex(this.roomId);
    // TODO - use graphic for rank rather than text
    rankElement.innerText = this.rank;

    tableRow.appendChild(clanElement);
    tableRow.appendChild(usernameElement);
    tableRow.appendChild(roomIndexElement);
    tableRow.appendChild(rankElement);

    return tableRow;
  }

  static drawTeamShape(context, x, y, teamNum) {
    if (teamNum == 1) {
      WHUtil.drawBoundRect(
        context,
        x,
        y,
        8,
        8,
        ClientRoomManager.TEAM_COLORS[teamNum],
        ClientRoomManager.TEAM_BG_COLORS[teamNum]
      );
    } else {
      WHUtil.drawBoundCircle(
        context,
        x,
        y,
        10,
        ClientRoomManager.TEAM_COLORS[teamNum],
        ClientRoomManager.TEAM_BG_COLORS[teamNum]
      );
    }
  }

  //   void addEnemyPowerupAttack( paramShort, paramByte) {}

  /**
   * Read the information in a userState packet
   * and update the user
   * @param {*} packet
   */
  readState(packet) {
    this.refresh = true;
    this.oldHealth = this.healthPercent;
    this.healthPercent = packet.healthPercent;
    if (this.oldHealth > this.healthPercent) {
      this.offsetCycle = 30;
    }
    this.numPowerups = packet.numPowerups;
    for (let b = 0; b < this.numPowerups; b++) {
      this.powerups[b] = packet.powerups[b];
    }
    this.shipType = packet.shipType;
    if (this.shipType < 0 || this.shipType > 10) {
      this.shipType = 0;
    }
  }

  isPlaying() {
    return !(
      this.gameOver ||
      this.portalSprite == null ||
      this.portalSprite.shouldRemoveSelf
    );
  }

  timeoutAttacks() {
    let n = Date.now();
    let b = false;
    for (let i = 0; i < 6; i++) {
      this.powerupTimeouts[i] = Array(10);
      for (let j = 0; j < 10; j++) {
        if (this.powerupTimeouts[i][j] > 0 && n > this.powerupTimeouts[i][j]) {
          this.powerupTimeouts[i][j] = 0;
          b = true;
          this.refresh = true;
        }
      }
    }
    return b;
  }

  resetPowerups() {
    for (let i = 0; i < 6; i++) {
      this.powerupTimeouts[i] = Array(10);

      for (let j = 0; j < 10; j++) {
        this.powerupTimeouts[i][j] = 0;
      }
    }
  }
}

import SpriteColors from "./SpriteColors.js";
import WHUtil from "./WHUtil.js";
import UserSprite from "./UserSprite.js";
import ClientRoomManager from "./ClientRoomManager.js";
// block on the right side of the screen that show the information
// about users and their associated health

export default class UserState {
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

  isEmpty;
  refresh;

  // store the ClientUser object here
  clientUser;

  // userId;
  // username;

  portalSprite;

  gameOver;
  wins;
  refresh;
  width;
  height;
  // shipType;
  icons;
  teamId;

  myHeight;
  cx;
  cy;
  imgPowerups;
  offsetCycle;
  y;
  h;
  healthPercent;
  numPowerups;
  oldHealth;
  color;
  slot;

  game;

  constructor(game) {
    this.isEmpty = true;
    this.refresh = false;

    // this.userId = null;
    // this.username = null;
    this.clientUser = null;

    this.portalSprite = null;
    this.game = game;

    this.powerups = new Array(5);
    // this.titleBarH = 40;
    this.powerupTimeouts = new Array(6);
    this.colors = new SpriteColors();
    this.reset();
    // this.imgPowerups = (Image[])WormholeModel.g_mediaTable.get("img_smallpowerups");
    this.myHeight = 158;
    this.y = 0;
    this.h = 0;
  }

  setDrawLocation(y, h) {
    this.y = y;
    this.h = h;
  }

  setState(clientUser, slot) {
    this.clientUser = clientUser;
    this.refresh = true;
    this.slot = slot;
    this.color = this.colors.colors[slot][0];
    this.isEmpty = false;
  }

  reset() {
    this.isEmpty = true;

    this.clientUser = null;

    // this.userId = null;
    // this.username = null;

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

  draw(context, n, n2) {
    this.refresh = false;
    if (this.isEmpty) {
      return;
    }
    WHUtil.drawBoundRect(
      context,
      0,
      0,
      n,
      n2,
      this.color,
      this.gameOver ? "gray" : this.offsetCycle == 30 ? "orange" : "black"
    );
    context.font = "12px Helvetica";

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
      // graphics.drawImage(
      //   this.imgPowerups[PowerupSprite.convertToSmallImage(this.powerups[b])],
      //   34 + b * 21,
      //   29,
      //   null
      // );
    }
    let n3 = n - 10;
    let min = Math.min((n3 * this.healthPercent) / 100, n3);
    context.strokeStyle = this.color;
    context.fillStyle = this.color;
    context.strokeRect(5, n2 - 13, n3, 10);
    context.fillRect(5, n2 - 13, min, 10);
    let n4 = 15;
    let n5 = n2 / 2;
    if (this.offsetCycle > 0) {
      this.offsetCycle--;
      n4 += WHUtil.randInt() % 2;
      n5 += WHUtil.randInt() % 2;
      this.refresh = true;
      this.game.refreshOtherBar = true;
    }
    let n6 = UserSprite.fighterData[this.clientUser.shipType].shipScale;
    context.translate(n4, n5);

    const room = this.game.gameNetLogic.clientRoomManager.getRoomById(
      this.game.gameNetLogic.roomId
    );

    // make a new polygon for the fighterData
    const polygon = WHUtil.createPolygon(
      UserSprite.shipShapes[this.clientUser.shipType]
    );
    WHUtil.drawScaledPoly(context, polygon, n6);
    context.translate(-n4, -n5);
    if (this.teamId != 0 && room.isTeamRoom) {
      this.drawTeamShape(context, 1, 1, this.teamId);
    }
  }

  fullReset() {
    this.wins = 0;
    this.reset();
  }

  // TODO - drawTeamShape method
  static drawTeamShape(context, n, n2, n3) {
    if (n3 == 1) {
      WHUtil.drawBoundRect(
        context,
        n,
        n2,
        8,
        8,
        ClientRoomManager.TEAM_COLORS[n3],
        ClientRoomManager.TEAM_BG_COLORS[n3]
      );
      return;
    }
    WHUtil.drawBoundCircle(
      context,
      n,
      n2,
      10,
      ClientRoomManager.TEAM_COLORS[n3],
      ClientRoomManager.TEAM_BG_COLORS[n3]
    );
  }

  //   void addEnemyPowerupAttack( paramShort, paramByte) {}

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
    this.clientUser.shipType = packet.shipType;
    if (this.clientUser.shipType > 10 || this.clientUser.shipType < 0) {
      this.clientUser.shipType = 0;
    }
  }

  isPlaying() {
    return !(
      this.isEmpty ||
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

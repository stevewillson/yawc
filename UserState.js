import SpriteColors from "./SpriteColors.js";

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
  POWERUP_FIELDS = 6;
  POWERUP_LEN = 10;
  POWERUP_DISPLAY_TIMEOUT = 10000;
  gameOver;
  wins;
  bRefresh;
  width;
  height;
  canvas;
  shipType;
  icons;
  teamId;

  myHeight;
  cx;
  cy;
  portalSprite;
  imgPowerups;
  offsetCycle;
  y;
  h;
  healthPercent;
  nPowerups;
  oldHealth;
  color;
  slot;
  username;
  userId;

  constructor() {
    this.isEmpty = true;

    this.userId = null;
    this.username = null;

    this.portalSprite = null;

    this.powerups = new Array(5);
    this.titleBarH = 40;
    this.powerupTimeouts = new Array(6);
    this.colors = new SpriteColors();
    this.reset();
    // this.imgPowerups = (Image[])WormholeModel.g_mediaTable.get("img_smallpowerups");
    this.myHeight = 158;
  }

  setDrawLocation(y, h) {
    this.y = y;
    this.h = h;
  }

  setState(username, slot) {
    this.username = username;
    this.bRefresh = true;
    this.slot = slot;
    this.color = this.colors.colors[slot][0];
    this.isEmpty = false;
  }

  reset() {
    this.isEmpty = true;

    this.userId = null;
    this.username = null;

    this.nPowerups = 0;
    this.healthPercent = 100;
    this.bRefresh = true;
    this.color = "gray";
    this.gameOver = false;
    if (this.portalSprite != null) {
      this.portalSprite.killSelf();
      this.portalSprite = null;
    }
    this.teamId = 0;
  }

  // TODO - complete draw method
  draw(context, n, n2) {
    this.bRefresh = false;
    WHUtil.drawBoundRect(
      context,
      0,
      0,
      n,
      n2,
      this.color,
      this.gameOver ? "gray" : this.offsetCycle == 30 ? "orange" : "black"
    );
    graphics.setFont(WormholeModel.fontTwelve);
    graphics.drawString(
      this.username.length() > 12
        ? this.username.substring(0, 11)
        : this.username,
      30,
      11
    );
    if (this.isEmpty) {
      return;
    }
    CFSkin.getSkin().drawIcons(graphics, this.icons, 97, 2, 15, 3);
    graphics.drawString(`wins: ${this.wins}`, 85, 24);
    graphics.drawString(
      `rank: ${this.rank != null ? this.rank : "n/a"}`,
      30,
      24
    );
    for (let b = 0; b < this.nPowerups; b++) {
      graphics.drawImage(
        this.imgPowerups[PowerupSprite.convertToSmallImage(this.powerups[b])],
        34 + b * 21,
        29,
        null
      );
    }
    let n3 = n - 10;
    let min = Math.min(int((n3 * this.healthPercent) / 100.0), n3);
    graphics.setColor(this.color);
    graphics.drawRect(5, n2 - 13, n3, 10);
    graphics.fillRect(5, n2 - 13, min, 10);
    let n4 = 15;
    let n5 = n2 / 2;
    if (this.offsetCycle > 0) {
      --this.offsetCycle;
      n4 += WHUtil.randInt() % 2;
      n5 += WHUtil.randInt() % 2;
      this.bRefresh = true;
      Sprite.model.bRefreshUserBar = true;
    }
    let n6 = UserSprite.g_fighterData[this.shipType][1];
    graphics.translate(n4, n5);
    WHUtil.drawScaledPoly(
      graphics,
      UserSprite.g_polyShip[this.shipType][0],
      n6
    );
    graphics.translate(-n4, -n5);
    if (this.teamId != 0 && Sprite.model.tableElement.isTeamTable()) {
      drawTeamShape(graphics, 1, 1, this.teamId);
    }
  }

  fullReset() {
    this.wins = 0;
    this.reset();
  }

  // TODO - drawTeamShape method
  drawTeamShape(graphics, n, n2, n3) {
    if (n3 == 1) {
      WHUtil.drawBoundRect(
        graphics,
        n,
        n2,
        8,
        8,
        CFSkin.TEACOLORS[n3],
        CFSkin.TEABG_COLORS[n3]
      );
      return;
    }
    WHUtil.drawBoundCircle(
      graphics,
      n,
      n2,
      10,
      CFSkin.TEABG_COLORS[n3],
      CFSkin.TEACOLORS[n3]
    );
  }

  //   void addEnemyPowerupAttack( paramShort, paramByte) {}

  readState(packet) {
    // Received: {"type":"userInfo",
    // "user":{"username":"e",
    // "slot":null,
    // "clientId":"d591621b-98f3-42e4-aa0e-ebf35a4bc407",
    // "userId":"72fccbb2-4e74-4011-b0af-ce0220dfc0d5",
    // "teamId":null,
    // "rank":0,
    // "clan":"--",
    // "roomId":null,
    // "icons":["small-platinumWeapons.gif"],
    // "isAlive":null}}
    this.bRefresh = true;
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
    if (this.shipType > 10 || this.shipType < 0) {
      this.shipType = 0;
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
          this.bRefresh = true;
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

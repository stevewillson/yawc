export default class PlayerInfo {
  constructor() {
    this.BLOCKSIZE = 5;
    this.powerupPoints = [
      [20, 60],
      [7, 100],
      [41, 147],
      [91, 147],
      [97, 60],
      [105, 100],
    ];
    this.gameOver;
    this.whacksAtYou;
    this.whacksAgainst;
    this.whacksAtYouTotal;
    this.whacksAgainstTotal;
    this.wins;
    this.bRefresh;
    this.width;
    this.height;
    this.canvas;
    this.shipType;
    this.rank = -1;
    this.icons;
    this.teamID;
    this.titleBarH = 40;
    this.myHeight;
    this.cx;
    this.cy;
    this.portalSprite;
    this.imgPowerups;
    this.offsetCycle;
    this.y;
    this.h;
    this.healthPercentage;
    this.nPowerups;
    this.powerups = new Array(5);
    this.POWERUP_FIELDS = 6;
    this.POWERUP_LEN = 10;
    this.powerupTimeouts = new Array(6);
    this.POWERUP_DISPLAY_TIMEOUT = 10000;
    this.oldHealth;
    this.username = "Empty";
    this.color;
    this.bEmpty = true;
    this.slot;

    this.reset();
    // this.imgPowerups = WormholeModel.mediaTable.get("img_smallpowerups");
    this.myHeight = 158;
  }

  setDrawLocation(paramInt1, paramInt2) {
    this.y = paramInt1;
    this.h = paramInt2;
  }

  setState(paramString, paramByte) {
    this.bRefresh = true;
    this.username = paramString;
    this.slot = paramByte;
    this.color = Sprite.colors[paramByte][0];
    this.bEmpty = false;
  }

  reset() {
    this.nPowerups = 0;
    this.healthPercentage = 100;
    this.bRefresh = true;
    this.username = "Empty";
    this.bEmpty = true;
    this.color = "gray";
    this.gameOver = false;
    if (this.portalSprite != null) {
      this.portalSprite.killSelf();
      this.portalSprite = null;
    }
    this.teamID = 0;
  }

  draw(paramGraphics, paramInt1, paramInt2) {
    this.bRefresh = false;
    WHUtil.drawBoundRect(
      paramGraphics,
      0,
      0,
      paramInt1,
      paramInt2,
      this.color,
      this.gameOver ? "gray" : this.offsetCycle == 30 ? "orange" : Color.black
    );
    paramGraphics.setFont(WormholeModel.fontEleven);
    paramGraphics.drawString(
      this.username.length() > 12
        ? this.username.substring(0, 11)
        : this.username,
      30,
      11
    );
    if (this.bEmpty) return;
    CFSkin.getSkin().drawIcons(paramGraphics, this.icons, 97, 2, 15, 3);
    paramGraphics.drawString("wins: " + this.wins, 95, 24);
    paramGraphics.drawString(
      "rank: " + (this.rank >= 0 ? "" + this.rank : "n/a"),
      30,
      24
    );
    let i;
    for (i = 0; i < this.nPowerups; i = byte(i + 1))
      paramGraphics.drawImage(
        this.imgPowerups[PowerupSprite.convertToSmallImage(this.powerups[i])],
        34 + i * 21,
        29,
        null
      );
    i = paramInt1 - 10;
    let j = Math.min(int((i * this.healthPercentage) / 100), i);
    paramGraphics.setColor(this.color);
    paramGraphics.drawRect(5, paramInt2 - 13, i, 10);
    paramGraphics.fillRect(5, paramInt2 - 13, j, 10);
    let k = 15;
    let m = paramInt2 / 2;
    if (this.offsetCycle > 0) {
      this.offsetCycle--;
      k += WHUtil.randInt() % 2;
      m += WHUtil.randInt() % 2;
      this.bRefresh = true;
      Sprite.model.bRefreshPlayerBar = true;
    }
    let d = PlayerSprite.fighterData[this.shipType][1];
    paramGraphics.translate(k, m);
    WHUtil.drawScaledPoly(
      paramGraphics,
      PlayerSprite.polyShip[this.shipType][0],
      d
    );
    paramGraphics.translate(-k, -m);
    if (this.teamID != 0 && Sprite.model.tableElement.isTeamTable())
      drawTeamShape(paramGraphics, 1, 1, this.teamID);
  }

  fullReset() {
    this.wins = 0;
    reset();
  }

  drawTeamShape(paramGraphics, paramInt1, paramInt2, paramInt3) {
    if (paramInt3 == 1) {
      WHUtil.drawBoundRect(
        paramGraphics,
        paramInt1,
        paramInt2,
        8,
        8,
        CFSkin.TEACOLORS[paramInt3],
        CFSkin.TEABG_COLORS[paramInt3]
      );
      return;
    }
    WHUtil.drawBoundCircle(
      paramGraphics,
      paramInt1,
      paramInt2,
      10,
      CFSkin.TEABG_COLORS[paramInt3],
      CFSkin.TEACOLORS[paramInt3]
    );
  }

  //   void addEnemyPowerupAttack( paramShort, paramByte) {}

  readState(paramDataInput) {
    this.bRefresh = true;
    this.oldHealth = this.healthPercentage;
    this.healthPercentage = paramDataInput.readShort();
    if (this.oldHealth > this.healthPercentage) this.offsetCycle = 30;
    this.nPowerups = paramDataInput.readByte();
    for (let b = 0; b < this.nPowerups; b++)
      this.powerups[b] = paramDataInput.readByte();
    this.shipType = paramDataInput.readByte();
    System.out.println("SHIP TYPE: " + this.shipType);
    if (this.shipType > 10 || this.shipType < 0) this.shipType = 0;
  }

  isPlaying() {
    return !(
      this.bEmpty ||
      this.gameOver ||
      this.portalSprite == null ||
      this.portalSprite.shouldRemoveSelf
    );
  }

  timeoutAttacks() {
    let d = Date.now();
    // let d = System.currentTimeMillis();
    let bool = false;
    let b = 0;
    // while (true) {
    //   let b1 = 0;
    //   while (true) {
    //     if (
    //       this.powerupTimeouts[b][b1] > 0 &&
    //       d > this.powerupTimeouts[b][b1]
    //     ) {
    //       this.powerupTimeouts[b][b1] = 0;
    //       bool = true;
    //       this.bRefresh = true;
    //     }
    //     if (++b1 >= 10 && ++b >= 6) {
    //       return bool;
    //     }
    //   }
    //   break;
    // }
  }

  containsClick(paramInt) {
    return !(paramInt < this.y || paramInt > this.h + this.y);
  }

  resetPowerups() {
    let b = 0;
    while (true) {
      let b1 = 0;
      do {
        this.powerupTimeouts[b][b1] = 0;
      } while (++b1 < 10 || ++b < 6);
    }
  }
}

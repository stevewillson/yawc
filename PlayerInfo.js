export default class PlayerInfo {
  BLOCKSIZE = 5;
  g_powerupPoints = [
    [20, 60],
    [7, 100],
    [41, 147],
    [91, 147],
    [97, 60],
    [105, 100],
  ];
  m_gameOver;
  whacksAtYou;
  whacksAgainst;
  whacksAtYouTotal;
  whacksAgainstTotal;
  m_wins;
  m_bRefresh;
  m_width;
  m_height;
  m_canvas;
  m_shipType;
  m_rank = -1;
  m_icons;
  m_teamID;
  g_titleBarH = 40;
  m_myHeight;
  m_cx;
  m_cy;
  m_portalSprite;
  m_imgPowerups;
  offsetCycle;
  m_y;
  m_h;
  m_healthPercentage;
  m_nPowerups;
  m_powerups = new Array(5);
  POWERUP_FIELDS = 6;
  POWERUP_LEN = 10;
  m_powerupTimeouts = new Array(6);
  POWERUP_DISPLAY_TIMEOUT = 10000;
  m_oldHealth;
  m_username = "Empty";
  m_color;
  m_bEmpty = true;
  m_slot;

  constructor() {
    this.reset();
    // this.m_imgPowerups = WormholeModel.g_mediaTable.get("img_smallpowerups");
    this.m_myHeight = 158;
  }

  setDrawLocation(paramInt1, paramInt2) {
    this.m_y = paramInt1;
    this.m_h = paramInt2;
  }

  setState(paramString, paramByte) {
    this.m_bRefresh = true;
    this.m_username = paramString;
    this.m_slot = paramByte;
    this.m_color = Sprite.g_colors[paramByte][0];
    this.m_bEmpty = false;
  }

  reset() {
    this.m_nPowerups = 0;
    this.m_healthPercentage = 100;
    this.m_bRefresh = true;
    this.m_username = "Empty";
    this.m_bEmpty = true;
    this.m_color = "gray";
    this.m_gameOver = false;
    if (this.m_portalSprite != null) {
      this.m_portalSprite.killSelf();
      this.m_portalSprite = null;
    }
    this.m_teamID = 0;
  }

  draw(paramGraphics, paramInt1, paramInt2) {
    this.m_bRefresh = false;
    WHUtil.drawBoundRect(
      paramGraphics,
      0,
      0,
      paramInt1,
      paramInt2,
      this.m_color,
      this.m_gameOver ? "gray" : this.offsetCycle == 30 ? "orange" : Color.black
    );
    paramGraphics.setFont(WormholeModel.fontEleven);
    paramGraphics.drawString(
      this.m_username.length() > 12
        ? this.m_username.substring(0, 11)
        : this.m_username,
      30,
      11
    );
    if (this.m_bEmpty) return;
    CFSkin.getSkin().drawIcons(paramGraphics, this.m_icons, 97, 2, 15, 3);
    paramGraphics.drawString("wins: " + this.m_wins, 95, 24);
    paramGraphics.drawString(
      "rank: " + (this.m_rank >= 0 ? "" + this.m_rank : "n/a"),
      30,
      24
    );
    let i;
    for (i = 0; i < this.m_nPowerups; i = byte(i + 1))
      paramGraphics.drawImage(
        this.m_imgPowerups[
          PowerupSprite.convertToSmallImage(this.m_powerups[i])
        ],
        34 + i * 21,
        29,
        null
      );
    i = paramInt1 - 10;
    let j = Math.min(int((i * this.m_healthPercentage) / 100), i);
    paramGraphics.setColor(this.m_color);
    paramGraphics.drawRect(5, paramInt2 - 13, i, 10);
    paramGraphics.fillRect(5, paramInt2 - 13, j, 10);
    let k = 15;
    let m = paramInt2 / 2;
    if (this.offsetCycle > 0) {
      this.offsetCycle--;
      k += WHUtil.randInt() % 2;
      m += WHUtil.randInt() % 2;
      this.m_bRefresh = true;
      Sprite.model.m_bRefreshPlayerBar = true;
    }
    let d = PlayerSprite.g_fighterData[this.m_shipType][1];
    paramGraphics.translate(k, m);
    WHUtil.drawScaledPoly(
      paramGraphics,
      PlayerSprite.g_polyShip[this.m_shipType][0],
      d
    );
    paramGraphics.translate(-k, -m);
    if (this.m_teamID != 0 && Sprite.model.m_tableElement.isTeamTable())
      drawTeamShape(paramGraphics, 1, 1, this.m_teamID);
  }

  fullReset() {
    this.m_wins = 0;
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
        CFSkin.TEAM_COLORS[paramInt3],
        CFSkin.TEAM_BG_COLORS[paramInt3]
      );
      return;
    }
    WHUtil.drawBoundCircle(
      paramGraphics,
      paramInt1,
      paramInt2,
      10,
      CFSkin.TEAM_BG_COLORS[paramInt3],
      CFSkin.TEAM_COLORS[paramInt3]
    );
  }

  //   void addEnemyPowerupAttack( paramShort, paramByte) {}

  readState(paramDataInput) {
    this.m_bRefresh = true;
    this.m_oldHealth = this.m_healthPercentage;
    this.m_healthPercentage = paramDataInput.readShort();
    if (this.m_oldHealth > this.m_healthPercentage) this.offsetCycle = 30;
    this.m_nPowerups = paramDataInput.readByte();
    for (let b = 0; b < this.m_nPowerups; b++)
      this.m_powerups[b] = paramDataInput.readByte();
    this.m_shipType = paramDataInput.readByte();
    System.out.println("SHIP TYPE: " + this.m_shipType);
    if (this.m_shipType > 10 || this.m_shipType < 0) this.m_shipType = 0;
  }

  isPlaying() {
    return !(
      this.m_bEmpty ||
      this.m_gameOver ||
      this.m_portalSprite == null ||
      this.m_portalSprite.shouldRemoveSelf
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
    //       this.m_powerupTimeouts[b][b1] > 0 &&
    //       d > this.m_powerupTimeouts[b][b1]
    //     ) {
    //       this.m_powerupTimeouts[b][b1] = 0;
    //       bool = true;
    //       this.m_bRefresh = true;
    //     }
    //     if (++b1 >= 10 && ++b >= 6) {
    //       return bool;
    //     }
    //   }
    //   break;
    // }
  }

  containsClick(paramInt) {
    return !(paramInt < this.m_y || paramInt > this.m_h + this.m_y);
  }

  resetPowerups() {
    let b = 0;
    while (true) {
      let b1 = 0;
      do {
        this.m_powerupTimeouts[b][b1] = 0;
      } while (++b1 < 10 || ++b < 6);
    }
  }
}

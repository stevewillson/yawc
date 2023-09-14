import Sprite from "./Sprite.js";
import WHUtil from "./WHUtil.js";
import Rectangle from "./Rectangle.js";

export default class PortalSprite extends Sprite {
  constructor(n, info, model) {
    super(0, 0);
    this.m_vOutgoingPowerups = [];
    this.m_powerupQ = new Array(30);
    this.m_powerupUpgradeQ = new Array(30);
    this.m_powerupCycleQ = new Array(30);
    this.m_powerupSlotQ = new Array(30);
    this.m_currentDegrees = n;
    this.m_currentArcs = this.m_currentDegrees * 0.017453292519943295;
    this.setOrbit();
    this.init("wh", this.location.x, this.location.y, true);
    super.spriteType = 1;
    super.shapeRect = new Rectangle(
      this.location.x - 60,
      this.location.y - 30,
      120,
      60
    );
    this.m_viewingRect = new Rectangle(100, 130);
    super.indestructible = true;
    super.m_damage = 0;
    this.m_info = info;
    super.m_color = this.m_info.m_color;
    super.m_slot = this.m_info.m_slot;

    this.m_info;
    this.m_currentDegrees;
    this.m_currentArcs;
    this.ARC_SPEED = 0.5;
    this.m_bGenEnemy;
    this.BASE_W = 30;
    this.MAX_W = 60;
    this.m_damageTaken;
    this.MAX_TAKEN = 150;
    this.m_vOutgoingPowerups;
    this.NMISSILES = 12;
    this.NMINES = 15;
    this.MINE_VEL = 6.0;
    this.NUMPOWERUPQ = 30;
    this.m_powerupQ;
    this.m_powerupUpgradeQ;
    this.m_powerupCycleQ;
    this.m_powerupSlotQ;
    this.POWERUP_DELAY = 30;
    this.m_viewingRect;
    this.m_warpDx;
    this.m_warpDist;
    this.m_bWarpingIn;
  }

  genMines(n, n2, player) {
    let n3 = 0.4188790204786391;
    let n4 = 0.0;
    let n5 = 0;
    do {
      let mineSprite = new MineSprite(n, n2);
      mineSprite.vectorx = Math.cos(n4) * 6.0;
      mineSprite.vectory = Math.sin(n4) * 6.0;
      mineSprite.setPlayer(player);
      mineSprite.addSelf();
      n4 += n3;
    } while (++n5 < 15);
  }

  setOrbit() {
    if (!this.m_bWarpingIn) {
      this.setLocation(
        WormholeModel.gOrbitDistance * Math.cos(this.m_currentArcs) +
          Sprite.g_centerX,
        WormholeModel.gOrbitDistance * Math.sin(this.m_currentArcs) +
          Sprite.g_centerY
      );
      this.m_currentDegrees += 0.5;
      this.m_currentDegrees %= 360.0;
      this.m_currentArcs = this.m_currentDegrees * 0.017453292519943295;
      return;
    }
    if (this.m_warpDist < WormholeModel.gOrbitDistance) {
      this.setLocation(
        this.m_warpDist * Math.cos(this.m_currentArcs) + Sprite.g_centerX,
        this.m_warpDist * Math.sin(this.m_currentArcs) + Sprite.g_centerY
      );
      this.m_warpDist +=
        Math.max(6.0, WormholeModel.gOrbitDistance - this.m_warpDist) / 3.0;
      return;
    }
    this.m_bWarpingIn = false;
  }

  genEnemy(n, n2, n3, player, b) {
    n4 = PowerupSprite.g_enemyRatios[n3];
    if (n3 == 18) {
      n4 += b;
    }
    for (let b2 = 0; b2 < n4; ++b2) {
      let n5 = n + WHUtil.randInt(70);
      let n6 = n2 + WHUtil.randInt(70);
      sprite = null;
      switch (n3) {
        case 9: {
          sprite = new UFOSprite(n5, n6);
          break;
        }
        case 10: {
          sprite = new InflatorSprite(n5, n6);
          break;
        }
        case 11: {
          sprite = new MineLayerSprite(n5, n6);
          break;
        }
        case 12: {
          sprite = new GunshipSprite(n5, n6);
          break;
        }
        case 15: {
          sprite = new WallCrawlerSprite(n5, n6, WHUtil.randABSInt() % 2 == 0);
          break;
        }
        case 13: {
          sprite = new ScarabSprite(n5, n6, this);
          break;
        }
        case 16: {
          sprite = new PortalBeamSprite(this);
          break;
        }
        case 7: {
          sprite = new PortalTurretSprite(this);
          break;
        }
        case 17: {
          sprite = new EMPSprite(this);
          break;
        }
        case 18: {
          sprite = new GhostPudSprite(this, b2);
          break;
        }
        case 19: {
          sprite = new ArtillerySprite(n5, n6);
          break;
        }
        default: {
          sprite = new InflatorSprite(n5, n6);
          break;
        }
      }
      sprite.setPlayer(player);
      sprite.setDegreeAngle(WHUtil.randABSInt() % 360);
      sprite.addSelf();
    }
  }

  drawSelf(context) {
    if (this.m_info.m_bEmpty) {
      return;
    }

    for (let n = 30; n < 60; n++) {
      graphics.setColor(
        Sprite.g_colors[super.m_slot][(super.spriteCycle + n) % 20]
      );
      graphics.drawOval(this.location.x - n, this.location.y - n / 2, n * 2, n);
    }

    graphics.setColor(this.m_info.m_color);
    graphics.setFont(WormholeModel.fontLarge);
    graphics.drawString(
      this.m_info.m_username + "'s WORMHOLE",
      this.location.x - 70,
      this.location.y + 60
    );
    Sprite.model.drawEnemyTeamShape(
      graphics,
      this.location.x - 70,
      this.location.y + 70
    );
    for (let i = this.m_vOutgoingPowerups.size() - 1; i >= 0; --i) {
      let bulletSprite = this.m_vOutgoingPowerups.elementAt(i);
      bulletSprite.setLocation(bulletSprite.x * 0.95, bulletSprite.y * 0.95);
      graphics.drawImage(
        WormholeModel.getImages("img_smallpowerups")[
          PowerupSprite.convertToSmallImage(bulletSprite.m_powerupType)
        ],
        this.location.x + bulletSprite.location.x - 8,
        this.location.y + bulletSprite.location.y - 5,
        null
      );
      if (bulletSprite.spriteCycle++ > 9) {
        this.m_vOutgoingPowerups.removeElementAt(i);
      }
    }
  }

  setCollided(sprite) {
    if (sprite.m_bIsBullet) {
      sprite.shouldRemoveSelf = true;
      sprite.setCollided(this);
      this.m_damageTaken += sprite.m_damage;
      if (this.m_damageTaken > 150) {
        PowerupSprite.genPowerup(this.location.x, this.location.y).addSelf();
        this.m_damageTaken = 0;
      }
      if (sprite.m_bIsHeatSeeker) {
        return;
      }
      let bulletSprite = sprite;
      if (bulletSprite.m_bPowerup) {
        this.m_vOutgoingPowerups.addElement(bulletSprite);
        bulletSprite.setLocation(
          bulletSprite.x - super.x,
          bulletSprite.y - super.y
        );
        bulletSprite.spriteCycle = 0;
        Sprite.model.usePowerup(
          bulletSprite.m_powerupType,
          bulletSprite.m_upgradeLevel,
          this.m_info.m_slot,
          Sprite.model.m_gameSession,
          WormholeModel.m_gameID
        );
      }
    }
  }

  genBadPowerupEffect(n, b, b2) {
    let n2 = 0;
    while (this.m_powerupCycleQ[n2] != 0) {
      if (++n2 >= 30) {
        return;
      }
    }
    this.m_powerupCycleQ[n2] = super.spriteCycle + 30;
    this.m_powerupUpgradeQ[n2] = b2;
    this.m_powerupQ[n2] = n;
    this.m_powerupSlotQ[n2] = b;
  }

  genNuke(n, n2, b) {
    nukeSprite = new NukeSprite(n, n2, b);
    nukeSprite.setVelocity(
      (n - Sprite.g_centerX) / 125.0,
      (n2 - Sprite.g_centerY) / 125.0
    );
    nukeSprite.addSelf();
  }

  inViewingRect(rectangle) {
    this.m_viewingRect.move(super.shapeRect.x, super.shapeRect.y);
    return rectangle.intersects(this.m_viewingRect);
  }

  behave() {
    super.behave();
    this.setOrbit();
    if (this.m_bGenEnemy) {
      switch (WHUtil.randABSInt() % 5) {
        case 0:
        case 1: {
          new InflatorSprite(this.location.x, this.location.y).addSelf();
          break;
        }
        case 2:
        case 3: {
          new UFOSprite(this.location.x, this.location.y).addSelf();
          break;
        }
        case 4: {
          new GunshipSprite(this.location.x, this.location.y).addSelf();
          break;
        }
      }
      this.m_bGenEnemy = false;
    }
    let n = 0;
    do {
      if (
        this.m_powerupCycleQ[n] != 0 &&
        this.m_powerupCycleQ[n] < super.spriteCycle
      ) {
        this.m_powerupCycleQ[n] = 0;
        switch (this.m_powerupQ[n]) {
          default: {
            continue;
          }
          case 6: {
            let n2 = 0;
            do {
              let heatSeekerMissile = new HeatSeekerMissile(
                this.location.x + (WHUtil.randInt() % 50),
                this.location.y + (WHUtil.randInt() % 50)
              );
              heatSeekerMissile.rotate(WHUtil.randABSInt() % 360);
              heatSeekerMissile.doMaxThrust(heatSeekerMissile.maxThrust);
              heatSeekerMissile.addSelf();
              heatSeekerMissile.setPlayer(this.m_powerupSlotQ[n]);
            } while (++n2 < 12);
            continue;
          }
          case 8: {
            this.genMines(
              this.location.x,
              this.location.y,
              this.m_powerupSlotQ[n]
            );
            continue;
          }
          case 7:
          case 9:
          case 10:
          case 11:
          case 12:
          case 13:
          case 15:
          case 16:
          case 17:
          case 18:
          case 19: {
            this.genEnemy(
              this.location.x,
              this.location.y,
              this.m_powerupQ[n],
              this.m_powerupSlotQ[n],
              this.m_powerupUpgradeQ[n]
            );
            continue;
          }
          case 14: {
            this.genNuke(
              this.location.x,
              this.location.y,
              this.m_powerupSlotQ[n]
            );
            continue;
          }
        }
      }
    } while (++n < 30);
  }

  setWarpingIn() {
    this.m_bWarpingIn = true;
    this.m_warpDist = 0.0;
    PortalSprite.m_warpDx = WormholeModel.gOrbitDistance / 30.0;
  }
}

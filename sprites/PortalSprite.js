import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { ArtillerySprite } from "./ArtillerySprite.js";
import { EMPSprite } from "./EMPSprite.js";
import { GhostPudSprite } from "./GhostPudSprite.js";
import { GunshipSprite } from "./GunshipSprite.js";
import { HeatSeekerMissile } from "./HeatSeekerMissile.js";
import { InflatorSprite } from "./InflatorSprite.js";
import { MineLayerSprite } from "./MineLayerSprite.js";
import { MineSprite } from "./MineSprite.js";
import { NukeSprite } from "./NukeSprite.js";
import { PortalBeamSprite } from "./PortalBeamSprite.js";
import { PortalTurretSprite } from "./PortalTurretSprite.js";
import { PowerupSprite } from "./PowerupSprite.js";
import { ScarabSprite } from "./ScarabSprite.js";
import { Sprite } from "./Sprite.js";
import { UFOSprite } from "./UFOSprite.js";
import { WallCrawlerSprite } from "./WallCrawlerSprite.js";

export class PortalSprite extends Sprite {
  static ARC_SPEED = 0.5;
  static BASE_W = 30;
  static MAX_W = 60;
  static MAX_TAKEN = 150;
  static NMISSILES = 12;
  static NMINES = 15;
  static MINE_VEL = 6;
  static NUMPOWERUPQ = 30;
  static POWERUP_DELAY = 30;

  constructor(n, user, game) {
    super(0, 0, game);
    this.init("wh", this.x, this.y, true);
    this.outgoingPowerups = [];
    this.powerupMap = new Map();
    this.currentDegrees = n;
    this.currentArcs = this.currentDegrees * 0.017453292519943295;
    this.setOrbit();
    this.spriteType = 1;
    this.shapeRect = new Rectangle(this.x - 60, this.y - 30, 120, 60);
    this.indestructible = true;
    this.damage = 0;
    this.damageTaken = 0;
    this.user = user;
    this.color = this.user.color;
    this.slot = this.user.slot;
    this.shouldGenEnemy = false;
    this.warpDx;
    this.warpDist;
    this.warpingIn;
  }

  /**
   * genMines
   */
  genMines(x, y, userId) {
    let n3 = 0.4188790204786391;
    let n4 = 0;

    for (let i = 0; i < 15; i++) {
      let mineSprite = new MineSprite(x, y, this.game);
      mineSprite.vx = Math.cos(n4) * 6;
      mineSprite.vy = Math.sin(n4) * 6;
      mineSprite.setUser(userId);
      mineSprite.addSelf();
      n4 += n3;
    }
  }

  setOrbit() {
    if (!this.warpingIn) {
      this.setLocation(
        this.game.orbitDistance * Math.cos(this.currentArcs) +
          this.game.world.width / 2,
        this.game.orbitDistance * Math.sin(this.currentArcs) +
          this.game.world.height / 2
      );
      this.currentDegrees += 0.5;
      this.currentDegrees %= 360;
      this.currentArcs = this.currentDegrees * 0.017453292519943295;
      return;
    }
    if (this.warpDist < this.game.orbitDistance) {
      this.setLocation(
        this.warpDist * Math.cos(this.currentArcs) + this.game.world.width / 2,
        this.warpDist * Math.sin(this.currentArcs) + this.game.world.height / 2
      );
      this.warpDist += Math.max(6, this.game.orbitDistance - this.warpDist) / 3;
      return;
    }
    this.warpingIn = false;
  }

  /**
   * genEnemy
   * use random numbers to generate new enemies
   * add the enemy to the sprite array
   */
  genEnemy(x, y, n3, userId, b) {
    let enemyRatio = PowerupSprite.enemyRatios[n3];
    if (n3 == 18) {
      enemyRatio += b;
    }
    for (let b2 = 0; b2 < enemyRatio; b2++) {
      let spriteXLoc = x + WHUtil.randInt(70);
      let spriteYLoc = y + WHUtil.randInt(70);
      let sprite = null;

      switch (n3) {
        case 9: {
          sprite = new UFOSprite(spriteXLoc, spriteYLoc, this.game);
          break;
        }
        case 10: {
          sprite = new InflatorSprite(spriteXLoc, spriteYLoc, this.game);
          break;
        }
        case 11: {
          sprite = new MineLayerSprite(spriteXLoc, spriteYLoc, this.game);
          break;
        }
        case 12: {
          sprite = new GunshipSprite(spriteXLoc, spriteYLoc, this.game);
          break;
        }
        case 15: {
          sprite = new WallCrawlerSprite(
            spriteXLoc,
            spriteYLoc,
            this.game,
            WHUtil.randInt(2) == 0
          );
          break;
        }
        case 13: {
          sprite = new ScarabSprite(spriteXLoc, spriteYLoc, this.game, this);
          break;
        }
        case 16: {
          sprite = new PortalBeamSprite(this);
          break;
        }
        case 7: {
          sprite = new PortalTurretSprite(this, this.game);
          break;
        }
        case 17: {
          sprite = new EMPSprite(this, this.game);
          break;
        }
        case 18: {
          sprite = new GhostPudSprite(this, b2, this.game);
          break;
        }
        case 19: {
          sprite = new ArtillerySprite(spriteXLoc, spriteYLoc, this.game);
          break;
        }
        default: {
          sprite = new InflatorSprite(spriteXLoc, spriteYLoc);
          break;
        }
      }
      sprite.setUser(userId);
      sprite.sentByUser = true;
      sprite.setDegreeAngle(WHUtil.randInt(360));
      sprite.addSelf();
    }
  }

  drawSelf(context) {
    for (let i = 30; i < 60; i++) {
      context.strokeStyle =
        this.game.colors.colors[this.slot][(this.spriteCycle + i) % 20];
      context.beginPath();
      context.ellipse(this.x, this.y, i * 2, i, 0, 0, 2 * Math.PI);
      context.stroke();
    }

    // set the font to the WormholeModel's large font
    context.strokeStyle = this.color;
    context.fillStyle = this.color;
    context.font = "20pt helvetica";
    context.textAlign = "center";
    context.fillText(`${this.user.username}'s WORMHOLE`, this.x, this.y + 80);
    context.stroke();

    this.game.drawEnemyTeamShape(context, this.x - 70, this.y + 70);

    // draw the bullet powerups going into the portal
    for (let i = this.outgoingPowerups.length - 1; i >= 0; i--) {
      let bulletSprite = this.outgoingPowerups[i];
      bulletSprite.setLocation(bulletSprite.x * 0.95, bulletSprite.y * 0.95);

      const img = document.getElementById("smallPowerupImages");
      const imgWidth = 21;
      const imgHeight = 17;
      let shiftedNumber = bulletSprite.powerupType - 6;
      let powerupNumber;
      if (shiftedNumber <= 0) {
        powerupNumber = 0;
      } else {
        powerupNumber = shiftedNumber;
      }
      context.drawImage(
        img,
        powerupNumber + powerupNumber * imgWidth + 1,
        1,
        imgWidth,
        imgHeight - 2,
        this.x + bulletSprite.x - 8,
        this.y + bulletSprite.y - 5,
        imgWidth,
        imgHeight - 2
      );

      if (bulletSprite.spriteCycle++ > 9) {
        this.outgoingPowerups.splice(i, 1);
      }
    }
  }

  setCollided(sprite) {
    if (sprite.isBullet) {
      sprite.shouldRemoveSelf = true;
      sprite.setCollided(this);
      this.damageTaken += sprite.damage;
      if (this.damageTaken > 150) {
        // the portal is shot enough, generate a powerup
        let powerupSprite = PowerupSprite.genPowerup(this.x, this.y, this.game);
        powerupSprite.addSelf();
        this.damageTaken = 0;
      }
      if (sprite.isHeatSeeker) {
        return;
      }
      let bulletSprite = sprite;
      if (bulletSprite.isPowerup) {
        this.outgoingPowerups.push(bulletSprite);
        bulletSprite.setLocation(
          bulletSprite.x - this.x,
          bulletSprite.y - this.y
        );
        bulletSprite.spriteCycle = 0;
        this.game.usePowerup(
          bulletSprite.powerupType,
          bulletSprite.upgradeLevel,
          this.user.userId
        );
      }
    }
  }

  genBadPowerupEffect(powerupType, fromUserId, b2) {
    this.powerupMap.set(this.spriteCycle + 30, {
      upgrade: b2,
      powerupType,
      fromUserId,
    });
  }

  genNuke(x, y, userId) {
    // get the user's slot from the userId
    const user = this.game.gameNetLogic.clientUserManager.users.get(userId);
    const nukeSprite = new NukeSprite(this.x, this.y, this.game);
    nukeSprite.setUser(userId);
    nukeSprite.setVelocity(
      (x - this.game.board.width / 2) / 125,
      (y - this.game.board.height / 2) / 125
    );
    nukeSprite.addSelf();
  }

  behave() {
    super.behave();
    this.setOrbit();
    if (this.shouldGenEnemy) {
      switch (WHUtil.randInt(5)) {
        case 0:
        case 1: {
          new InflatorSprite(this.x, this.y, this.game).addSelf();
          break;
        }
        case 2:
        case 3: {
          new UFOSprite(this.x, this.y, this.game).addSelf();
          break;
        }
        case 4: {
          new GunshipSprite(this.x, this.y, this.game).addSelf();
          break;
        }
      }
      this.shouldGenEnemy = false;
    }

    // check the powerups in the map
    this.powerupMap.forEach((value, key, map) => {
      if (key < this.spriteCycle) {
        // remove the entry from the map
        switch (value.powerupType) {
          default: {
            break;
          }
          case 6: {
            for (let n2 = 0; n2 < 12; n2++) {
              let heatSeekerMissile = new HeatSeekerMissile(
                this.x + WHUtil.randInt(50),
                this.y + WHUtil.randInt(50),
                this.game
              );
              heatSeekerMissile.rotate(WHUtil.randInt(360));
              heatSeekerMissile.doMaxThrust(heatSeekerMissile.maxThrust);
              heatSeekerMissile.addSelf();
              // contains slot numbers or userIds
              // TODO need to clean this up
              // may need to create a 'computer' userId
              // for the computer player
              heatSeekerMissile.setUser(value.fromUserId);
            }
            break;
          }
          case 8: {
            this.genMines(this.x, this.y, value.fromUserId);
            break;
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
              this.x,
              this.y,
              value.powerupType,
              value.fromUserId,
              value.upgrade
            );
            break;
          }
          case 14: {
            this.genNuke(this.x, this.y, value.fromUserId);
            break;
          }
        }
        // remove the entry from the map
        map.delete(key);
      }
    });
  }

  setWarpingIn() {
    this.warpingIn = true;
    this.warpDist = 0;
    this.warpDx = this.game.orbitDistance / 30;
  }
}

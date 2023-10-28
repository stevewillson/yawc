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
  constructor(degrees, game, user) {
    super(0, 0, game);
    this.init("wh", this.x, this.y, true);
    this.shapeRect = new Rectangle(this.x - 60, this.y - 30, 120, 60);

    this.spriteType = 1;

    this.damage = 0;

    this.outgoingPowerups = [];
    this.powerupMap = new Map();

    this.currentDegrees = degrees;
    this.currentArcs = this.currentDegrees * 0.017453292519943295;
    this.warpingIn = true;
    this.warpDist = 0;
    this.warpDx = this.game.orbitDistance / 30;
    this.setOrbit();

    this.indestructible = true;
    this.damageTaken = 0;
    this.user = user;
    this.color = user.color;
    this.slot = user.slot;
    this.shouldGenEnemy = false;
  }

  drawSelf(context) {
    context.lineWidth = 1;
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
        imgHeight - 2,
      );

      if (bulletSprite.spriteCycle++ > 9) {
        this.outgoingPowerups.splice(i, 1);
      }
    }
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
        switch (value.powerupType) {
          default: {
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
              this.game,
              this,
              value.powerupType,
              value.fromUserId,
              value.upgrade,
            );
            break;
          }
          case 6: {
            this.genHeatSeekerMissiles(
              this.x,
              this.y,
              this.game,
              value.fromUserId,
            );
            break;
          }
          case 8: {
            this.genMines(this.x, this.y, this.game, value.fromUserId);
            break;
          }
          case 14: {
            this.genNuke(this.x, this.y, this.game, value.fromUserId);
            break;
          }
        }
        // remove the entry from the map
        map.delete(key);
      }
    });
  }

  setOrbit() {
    if (!this.warpingIn) {
      this.setLocation(
        this.game.orbitDistance * Math.cos(this.currentArcs) +
          this.game.world.width / 2,
        this.game.orbitDistance * Math.sin(this.currentArcs) +
          this.game.world.height / 2,
      );
      this.currentDegrees += 0.5;
      this.currentDegrees %= 360;
      this.currentArcs = this.currentDegrees * 0.017453292519943295;
      return;
    }
    if (this.warpDist < this.game.orbitDistance) {
      this.setLocation(
        this.warpDist * Math.cos(this.currentArcs) + this.game.world.width / 2,
        this.warpDist * Math.sin(this.currentArcs) + this.game.world.height / 2,
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
  genEnemy(x, y, game, portal, n3, userId, b) {
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
          sprite = new UFOSprite(spriteXLoc, spriteYLoc, game);
          break;
        }
        case 10: {
          sprite = new InflatorSprite(spriteXLoc, spriteYLoc, game);
          break;
        }
        case 11: {
          sprite = new MineLayerSprite(spriteXLoc, spriteYLoc, game);
          break;
        }
        case 12: {
          sprite = new GunshipSprite(spriteXLoc, spriteYLoc, game);
          break;
        }
        case 15: {
          sprite = new WallCrawlerSprite(
            spriteXLoc,
            spriteYLoc,
            game,
            WHUtil.randInt(2) == 0,
          );
          break;
        }
        case 13: {
          sprite = new ScarabSprite(spriteXLoc, spriteYLoc, game, portal);
          break;
        }
        case 16: {
          sprite = new PortalBeamSprite(portal, game);
          break;
        }
        case 7: {
          sprite = new PortalTurretSprite(portal, game);
          break;
        }
        case 17: {
          sprite = new EMPSprite(portal, game);
          break;
        }
        case 18: {
          sprite = new GhostPudSprite(portal, b2, game);
          break;
        }
        case 19: {
          sprite = new ArtillerySprite(spriteXLoc, spriteYLoc, game);
          break;
        }
        default: {
          sprite = new InflatorSprite(spriteXLoc, spriteYLoc, game);
          break;
        }
      }
      sprite.setUser(userId);
      sprite.sentByUser = true;
      sprite.setDegreeAngle(WHUtil.randInt(360));
      sprite.addSelf();
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
          bulletSprite.y - this.y,
        );
        bulletSprite.spriteCycle = 0;
        this.game.usePowerup(
          bulletSprite.powerupType,
          bulletSprite.upgradeLevel,
          this.user.userId,
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

  genHeatSeekerMissiles(x, y, game, userId) {
    for (let i = 0; i < 12; i++) {
      let heatSeekerMissile = new HeatSeekerMissile(
        x + WHUtil.randInt(50),
        y + WHUtil.randInt(50),
        game,
      );
      heatSeekerMissile.rotate(WHUtil.randInt(360));
      heatSeekerMissile.doMaxThrust(heatSeekerMissile.maxThrust);
      heatSeekerMissile.addSelf();
      // contains slot numbers or userIds
      // TODO need to clean this up
      // may need to create a 'computer' userId
      // for the computer player
      heatSeekerMissile.setUser(userId);
    }
  }

  /**
   * genMines
   */
  genMines(x, y, game, userId) {
    let n3 = 0.4188790204786391;
    let n4 = 0;

    for (let i = 0; i < 15; i++) {
      let mineSprite = new MineSprite(x, y, game);
      mineSprite.vx = Math.cos(n4) * 6;
      mineSprite.vy = Math.sin(n4) * 6;
      mineSprite.setUser(userId);
      mineSprite.addSelf();
      n4 += n3;
    }
  }

  genNuke(x, y, game, userId) {
    const nukeSprite = new NukeSprite(x, y, game);
    nukeSprite.setUser(userId);
    nukeSprite.setVelocity(
      (x - this.game.board.width / 2) / 125,
      (y - this.game.board.height / 2) / 125,
    );
    nukeSprite.addSelf();
  }
}

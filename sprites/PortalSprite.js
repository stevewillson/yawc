import Sprite from "./Sprite.js";
import WHUtil from "../WHUtil.js";
import Rectangle from "../Rectangle.js";
import InflatorSprite from "./InflatorSprite.js";
import UFOSprite from "./UFOSprite.js";
import PowerupSprite from "./PowerupSprite.js";
import NukeSprite from "./NukeSprite.js";

export default class PortalSprite extends Sprite {
  constructor(n, user, game) {
    super({ x: 0, y: 0 }, game);
    this.outgoingPowerups = [];
    // arrays with 30 elements
    // this.powerupQ = new Array(30);
    // this.powerupUpgradeQ = new Array(30);
    // this.powerupCycleQ = new Array(30);
    // this.powerupUserIdQ = new Array(30);

    this.powerupQ = [];
    this.powerupUpgradeQ = [];
    this.powerupCycleQ = [];
    this.powerupUserIdQ = [];

    // initialize arrays
    for (let i = 0; i < 30; i++) {
      this.powerupQ.push(0);
      this.powerupUpgradeQ.push(0);
      this.powerupCycleQ.push(0);
      this.powerupUserIdQ.push("");
    }

    this.currentDegrees = n;
    this.currentArcs = this.currentDegrees * 0.017453292519943295;
    this.setOrbit();
    this.init("wh", this.location.x, this.location.y, true);
    this.spriteType = 1;

    this.shapeRect = new Rectangle(
      this.location.x - 60,
      this.location.y - 30,
      120,
      60
    );

    this.viewingRect = new Rectangle(100, 130);
    this.indestructible = true;
    this.damage = 0;
    this.user = user;
    this.color = this.user.color;
    this.slot = this.user.slot;

    this.currentDegrees;
    this.currentArcs;
    this.ARC_SPEED = 0.5;
    this.genEnemy = false;
    this.BASE_W = 30;
    this.MAX_W = 60;
    this.damageTaken = 0;
    this.MAX_TAKEN = 150;
    this.outgoingPowerups;
    this.NMISSILES = 12;
    this.NMINES = 15;
    this.MINE_VEL = 6;
    this.NUMPOWERUPQ = 30;
    this.POWERUP_DELAY = 30;
    this.viewingRect;
    this.warpDx;
    this.warpDist;
    this.bWarpingIn;
  }

  /**
   * genMines
   */
  genMines(n, n2, userId) {
    let n3 = 0.4188790204786391;
    let n4 = 0;

    for (let i = 0; i < 15; i++) {
      let mineSprite = new MineSprite(n, n2);
      mineSprite.velocity.x = Math.cos(n4) * 6;
      mineSprite.velocity.y = Math.sin(n4) * 6;
      mineSprite.setUser(userId);
      mineSprite.addSelf();
      n4 += n3;
    }
  }

  setOrbit() {
    if (!this.bWarpingIn) {
      this.setLocation(
        this.game.orbitDistance * Math.cos(this.currentArcs) +
          this.game.worldCenter.x,
        this.game.orbitDistance * Math.sin(this.currentArcs) +
          this.game.worldCenter.y
      );
      this.currentDegrees += 0.5;
      this.currentDegrees %= 360;
      this.currentArcs = this.currentDegrees * 0.017453292519943295;
      return;
    }
    if (this.warpDist < this.game.orbitDistance) {
      this.setLocation(
        this.warpDist * Math.cos(this.currentArcs) + this.game.worldCenter.x,
        this.warpDist * Math.sin(this.currentArcs) + this.game.worldCenter.y
      );
      this.warpDist += Math.max(6, this.game.orbitDistance - this.warpDist) / 3;
      return;
    }
    this.bWarpingIn = false;
  }

  /**
   * genEnemy
   * use random numbers to generate new enemies
   * add the enemy to the sprite array
   */
  genEnemy(location, n3, userId, b) {
    let enemyRatio = PowerupSprite.g_enemyRatios[n3];
    if (n3 == 18) {
      enemyRatio += b;
    }
    for (let b2 = 0; b2 < enemyRatio; ++b2) {
      let spriteXLoc = location.x + WHUtil.randInt(70);
      let spriteYLoc = location.y + WHUtil.randInt(70);
      let sprite = null;
      switch (n3) {
        case 9: {
          sprite = new UFOSprite(spriteXLoc, spriteYLoc);
          break;
        }
        case 10: {
          sprite = new InflatorSprite(spriteXLoc, spriteYLoc);
          break;
        }
        case 11: {
          sprite = new MineLayerSprite(spriteXLoc, spriteYLoc);
          break;
        }
        case 12: {
          sprite = new GunshipSprite(spriteXLoc, spriteYLoc);
          break;
        }
        case 15: {
          sprite = new WallCrawlerSprite(
            spriteXLoc,
            spriteYLoc,
            WHUtil.randInt(2) == 0
          );
          break;
        }
        case 13: {
          sprite = new ScarabSprite(spriteXLoc, spriteYLoc, this);
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
          sprite = new ArtillerySprite(spriteXLoc, spriteYLoc);
          break;
        }
        default: {
          sprite = new InflatorSprite(spriteXLoc, spriteYLoc);
          break;
        }
      }
      sprite.setUser(userId);
      sprite.setDegreeAngle(WHUtil.randInt(360));
      sprite.addSelf();
    }
  }

  drawSelf(context) {
    for (let n = 30; n < 60; n++) {
      context.strokeStyle =
        this.game.colors.colors[this.slot][(this.spriteCycle + n) % 20];
      context.beginPath();
      context.ellipse(
        this.location.x,
        this.location.y,
        n * 2,
        n,
        0,
        0,
        2 * Math.PI
      );
      context.stroke();
    }

    // set the font to the WormholeModel's large font
    context.strokeStyle = this.color;
    context.fillStyle = this.color;
    context.font = "20pt helvetica";
    context.textAlign = "center";
    context.fillText(
      `${this.user.username}'s WORMHOLE`,
      this.location.x,
      this.location.y + 80
    );
    context.stroke();

    // Sprite.model.drawEnemyTeamShape(
    //   graphics,
    //   this.location.x - 70,
    //   this.location.y + 70
    // );

    // TODO - where does this draw the bulletSprite?
    // vOutgoingPowerups is a vector of BulletSprites
    // for (let i = this.vOutgoingPowerups.size() - 1; i >= 0; --i) {
    //   let bulletSprite = this.vOutgoingPowerups.elementAt(i);
    //   bulletSprite.setLocation(bulletSprite.x * 0.95, bulletSprite.y * 0.95);
    //   graphics.drawImage(
    //     WormholeModel.getImages("img_smallpowerups")[
    //       PowerupSprite.convertToSmallImage(bulletSprite.powerupType)
    //     ],
    //     this.location.x + bulletSprite.location.x - 8,
    //     this.location.y + bulletSprite.location.y - 5,
    //     null
    //   );
    //   if (bulletSprite.spriteCycle++ > 9) {
    //     this.vOutgoingPowerups.removeElementAt(i);
    //   }
    // }
  }

  setCollided(sprite) {
    if (sprite.bIsBullet) {
      sprite.shouldRemoveSelf = true;
      sprite.setCollided(this);
      this.damageTaken += sprite.damage;
      if (this.damageTaken > 150) {
        // the portal is shot enough, generate a powerup
        let powerupSprite = PowerupSprite.genPowerup(
          this.location.x,
          this.location.y,
          this.game
        );
        powerupSprite.addSelf();
        this.damageTaken = 0;
      }
      if (sprite.bIsHeatSeeker) {
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
          this.user.userId,
          this.game.sessionId,
          this.game.gameId
        );
      }
    }
  }

  genBadPowerupEffect(powerupType, fromUserId, b2) {
    let n2 = 0;
    while (this.powerupCycleQ[n2] != 0) {
      if (++n2 >= 30) {
        return;
      }
    }
    this.powerupCycleQ[n2] = this.spriteCycle + 30;
    // b2 is used to set the powerupUpgradeQ
    this.powerupUpgradeQ[n2] = b2;
    this.powerupQ[n2] = powerupType;
    this.powerupUserIdQ[n2] = fromUserId;
  }

  genNuke(location, userId) {
    // get the user's slot from the userId
    const user = this.game.gameNetLogic.clientUserManager.users.get(userId);
    const nukeSprite = new NukeSprite({ ...location }, user.slot, this.game);
    nukeSprite.setVelocity(
      (location.x - this.game.boardCenter.x) / 125,
      (location.y - this.game.boardCenter.y) / 125
    );
    nukeSprite.addSelf();
  }

  // inViewingRect(rectangle) {
  //   this.viewingRect.move(this.shapeRect.x, this.shapeRect.y);
  //   return rectangle.intersects(this.viewingRect);
  // }

  behave() {
    super.behave();
    this.setOrbit();
    if (this.genEnemy) {
      switch (WHUtil.randInt(5)) {
        case 0:
        case 1: {
          let inf = new InflatorSprite({ ...this.location }, this.game);
          inf.addSelf();
          break;
        }
        case 2:
        case 3: {
          let ufo = new UFOSprite({ ...this.location }, this.game);
          ufo.addSelf();
          break;
        }
        //   case 4: {
        //     // new GunshipSprite(this.location.x, this.location.y).addSelf();
        //     break;
        //   }
      }
      this.genEnemy = false;
    }

    // use the powerupCycleQ
    // iterate i from 0 to 29
    // check that the
    for (let i = 0; i < 30; i++) {
      if (
        this.powerupCycleQ[i] != 0 &&
        this.powerupCycleQ[i] < this.spriteCycle
      ) {
        this.powerupCycleQ[i] = 0;
        switch (this.powerupQ[i]) {
          default: {
            continue;
          }
          case 6: {
            for (n2 = 0; n2 < 12; n2++) {
              let heatSeekerMissile = new HeatSeekerMissile(
                this.location.x + WHUtil.randInt(50),
                this.location.y + WHUtil.randInt(50)
              );
              heatSeekerMissile.rotate(WHUtil.randABSInt(360));
              heatSeekerMissile.doMaxThrust(heatSeekerMissile.maxThrust);
              heatSeekerMissile.addSelf();
              heatSeekerMissile.setUser(this.powerupUserIdQ[i]);
            }
            continue;
          }
          case 8: {
            this.genMines(
              this.location.x,
              this.location.y,
              this.powerupUserIdQ[i]
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
              this.location,
              this.powerupQ[i],
              this.powerupUserIdQ[i],
              this.powerupUpgradeQ[i]
            );
            continue;
          }
          case 14: {
            this.genNuke(this.location, this.powerupUserIdQ[i]);
            continue;
          }
        }
      }
    }
  }

  setWarpingIn() {
    this.bWarpingIn = true;
    this.warpDist = 0;
    this.warpDx = this.game.orbitDistance / 30;
  }
}

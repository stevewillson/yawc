import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { GunshipSprite } from "./GunshipSprite.js";
import { InflatorSprite } from "./InflatorSprite.js";
import { NukeSprite } from "./NukeSprite.js";
import { PortalTurretSprite } from "./PortalTurretSprite.js";
import { PowerupSprite } from "./PowerupSprite.js";
import { Sprite } from "./Sprite.js";
import { UFOSprite } from "./UFOSprite.js";

export class PortalSprite extends Sprite {
  constructor(n, user, game) {
    // start portalsprite at location
    // 0,0
    super(0, 0, game);
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
    this.init("wh", this.x, this.y, true);
    this.spriteType = 1;

    this.shapeRect = new Rectangle(this.x - 60, this.y - 30, 120, 60);

    this.viewingRect = new Rectangle(100, 130);
    this.indestructible = true;
    this.damage = 0;
    this.user = user;
    this.color = this.user.color;
    this.slot = this.user.slot;

    this.currentDegrees;
    this.currentArcs;
    this.ARC_SPEED = 0.5;
    this.shouldGenEnemy = false;
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
      // TODO - implement MineSprite
      let mineSprite = new MineSprite(n, n2);
      mineSprite.vx = Math.cos(n4) * 6;
      mineSprite.vy = Math.sin(n4) * 6;
      mineSprite.setUser(userId);
      mineSprite.addSelf();
      n4 += n3;
    }
  }

  setOrbit() {
    if (!this.bWarpingIn) {
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
    this.bWarpingIn = false;
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

      // testing for generating a portal turret sprite
      n3 = 7;

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
          sprite = new MineLayerSprite(spriteXLoc, spriteYLoc);
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
          sprite = new PortalTurretSprite(this, this.game);
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

    // Sprite.model.drawEnemyTeamShape(
    //   graphics,
    //   this.x - 70,
    //   this.y + 70
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
    //     this.x + bulletSprite.x - 8,
    //     this.y + bulletSprite.y - 5,
    //     null
    //   );
    //   if (bulletSprite.spriteCycle++ > 9) {
    //     this.vOutgoingPowerups.removeElementAt(i);
    //   }
    // }
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

  // inViewingRect(rectangle) {
  //   this.viewingRect.move(this.shapeRect.x, this.shapeRect.y);
  //   return rectangle.intersects(this.viewingRect);
  // }

  behave() {
    super.behave();
    this.setOrbit();
    if (this.shouldGenEnemy) {
      // DEBUG - generate this type of enemy
      // new GunshipSprite(this.x, this.y, this.game).addSelf();
      // this.shouldGenEnemy = false;
      // return;
      let sprite;
      sprite = new PortalTurretSprite(this, this.game);

      // sprite.setUser(userId);
      sprite.slot = 8;
      sprite.color = this.game.colors.colors[sprite.slot][0];

      sprite.setDegreeAngle(WHUtil.randInt(360));
      sprite.addSelf();
      this.shouldGenEnemy = false;
      return;
      // END DEBUG

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

    // DEBUG - generate a portal sprite
    // this.powerupQ[0] = 7;

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
                this.x + WHUtil.randInt(50),
                this.y + WHUtil.randInt(50)
              );
              heatSeekerMissile.rotate(WHUtil.randInt(360));
              heatSeekerMissile.doMaxThrust(heatSeekerMissile.maxThrust);
              heatSeekerMissile.addSelf();
              heatSeekerMissile.setUser(this.powerupUserIdQ[i]);
            }
            continue;
          }
          case 8: {
            this.genMines(this.x, this.y, this.powerupUserIdQ[i]);
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
            this.genNuke(this.x, this.y, this.powerupUserIdQ[i]);
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

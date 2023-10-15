import Sprite from "./Sprite.js";
import Rectangle from "../Rectangle.js";
import ExplosionSprite from "./ExplosionSprite.js";
import ParticleSprite from "./ParticleSprite.js";
import WHUtil from "../WHUtil.js";

export default class BulletSprite extends Sprite {
  // tracked in Game now
  // nBullets;
  static BULLETSIZE = 10;
  static INNER_BULLETSIZE = 8;
  static INNER_BOX = 3;
  static INNER_BOX_SIZE = 6;
  static CONCUSSIVE_RECOIL = 5;
  lifespan = 100;
  maxVelocity = 10;
  isPowerup;
  bCountTowardsQuota;
  upgradeLevel;
  internalColor;
  powerupShipType;
  bConcussive;
  offx;
  offy;

  constructor(x, y, bulletDamage, bulletSize, internalColor, spriteType, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.game = game;
    super.init("blt", x, y, true);
    this.shapeRect = new Rectangle(x - 5, y - 5, bulletSize, bulletSize);
    this.spriteType = spriteType;
    this.internalColor = internalColor;
    this.setHealth(1, bulletDamage);
    this.bIsBullet = true;
    if (this.spriteType == 2) {
      this.color = this.game.color;
      this.bCountTowardsQuota = true;
    }
    this.spriteCycle = 0;
  }

  addSelf() {
    super.addSelf();
    if (this.bCountTowardsQuota) {
      this.game.nBullets++;
    }
  }

  drawSelf(context) {
    context.strokeStyle = this.internalColor;
    context.translate(this.x, this.y);

    if (this.bConcussive) {
      context.strokeStyle = this.internalColor;
      WHUtil.drawCenteredCircle(context, 0, 0, 10);
      context.strokeStyle =
        this.game.colors.colors[super.slot][super.spriteCycle % 20];
      context.fillStyle =
        this.game.colors.colors[super.slot][super.spriteCycle % 20];
      WHUtil.fillCenteredCircle(context, 0, 0, 7);

      context.moveTo(0, 0);
      context.lineTo(this.offx, this.offy);
      context.stroke();
    } else {
      context.beginPath();

      context.moveTo(-8, -8);
      context.lineTo(8, 8);

      context.moveTo(-8, 8);
      context.lineTo(8, -8);

      context.fillRect(-3, -3, 6, 6);

      context.strokeStyle = this.color;

      context.moveTo(-this.shapeRect.width, 0);
      context.lineTo(this.shapeRect.width, 0);

      context.moveTo(0, -this.shapeRect.width);
      context.lineTo(0, this.shapeRect.width);

      if (this.isPowerup) {
        WHUtil.drawCenteredCircle(context, 0, 0, 20);

        let shiftedNumber = this.powerupType - 6;
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
          -8,
          -5,
          imgWidth,
          imgHeight - 2
        );
      }

      context.moveTo(0, 0);
      context.lineTo(this.offx, this.offy);
      context.stroke();
    }
    context.translate(-this.x, -this.y);
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.bConcussive) {
      let angle = WHUtil.findAngle(collided.x, collided.y, this.x, this.y);
      collided.vx += 5 * Math.cos(angle * 0.017453292519943295);
      collided.vy += 5 * Math.sin(angle * 0.017453292519943295);
    }
    if (this.shouldRemoveSelf) {
      if (this.isPowerup) {
        let explosionSprite = new ExplosionSprite(
          this.x,
          this.y,
          this.game,
          this.game.slot
        );
        explosionSprite.setPowerupExplosion();
        explosionSprite.addSelf();
      } else {
        let explosionSprite2 = new ExplosionSprite(
          this.x,
          this.y,
          this.game,
          9
        );
        explosionSprite2.RINGS = 2;
        explosionSprite2.addSelf();
      }
      let particleSprite = new ParticleSprite(this.x, this.y, this.game);
      particleSprite.particleInit(8, 5);
      particleSprite.addSelf();
    }
  }

  // TODO update to use the userId
  // actually, just use a high slot right now
  setSentByEnemy(slot, powerupShipType) {
    this.slot = slot;
    this.powerupShipType = powerupShipType;
  }

  removeSelf() {
    super.removeSelf();
    if (this.bCountTowardsQuota) {
      this.game.nBullets--;
    }
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.offx = -1 * (this.vx * 8);
    this.offy = -1 * (this.vy * 8);
  }

  setPowerup(powerupType) {
    this.powerupType = powerupType;
    this.isPowerup = true;
  }

  setConcussive() {
    this.bConcussive = true;
  }

  // remove the bullet after 100 spriteCycles
  behave() {
    super.behave();
    if (this.spriteCycle > 100) {
      this.shouldRemoveSelf = true;
    }
  }
}

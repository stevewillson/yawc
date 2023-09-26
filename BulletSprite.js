import Sprite from "./Sprite.js";
import Rectangle from "./Rectangle.js";
import ExplosionSprite from "./ExplosionSprite.js";
import ParticleSprite from "./ParticleSprite.js";
import SpriteColors from "./SpriteColors.js";

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
  bPowerup;
  bCountTowardsQuota;
  upgradeLevel;
  internalColor;
  powerupShipType;
  bConcussive;
  offx;
  offy;

  constructor(
    location,
    bulletDamage,
    bulletSize,
    internalColor,
    spriteType,
    game,
  ) {
    super(location, game);
    this.location = location;
    this.game = game;
    super.init("blt", location.x, location.y, true);
    this.shapeRect = new Rectangle(
      location.x - 5,
      location.y - 5,
      bulletSize,
      bulletSize,
    );
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
    context.translate(this.location.x, this.location.y);

    if (this.bConcussive) {
      WHUtil.drawCenteredCircle(context, 0, 0, 10, this.internalColor);
      context.strokeStyle =
        this.game.colors.colors[super.slot][super.spriteCycle % 20];
      WHUtil.fillCenteredCircle(
        context,
        0,
        0,
        7,
        this.game.colors.colors[super.slot][super.spriteCycle % 20],
      );

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

      if (this.bPowerup) {
        WHUtil.drawCenteredCircle(context, 0, 0, 20);
        // graphics.drawImage(
        //   Wormholegame.getImages("img_smallpowerups")[
        //     PowerupSprite.convertToSmallImage(super.powerupType)
        //   ],
        //   -8,
        //   -5,
        //   null
        // );
      }

      context.moveTo(0, 0);
      context.lineTo(this.offx, this.offy);

      context.stroke();
    }
    context.translate(-this.location.x, -this.location.y);
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.bConcussive) {
      let angle = WHUtil.findAngle(collided.x, collided.y, this.x, this.y);
      collided.velocity.x += 5.0 * Math.cos(angle * 0.017453292519943295);
      collided.velocity.y += 5.0 * Math.sin(angle * 0.017453292519943295);
    }
    if (this.shouldRemoveSelf) {
      if (this.bPowerup) {
        let explosionSprite = new ExplosionSprite(
          { x: this.location.x, y: this.location.y },
          this.game,
          this.game.slot,
        );
        explosionSprite.setPowerupExplosion();
        explosionSprite.addSelf();
      } else {
        let explosionSprite2 = new ExplosionSprite(
          { x: this.location.x, y: this.location.y },
          this.game,
          9,
        );
        explosionSprite2.RINGS = 2;
        explosionSprite2.addSelf();
      }
      let particleSprite = new ParticleSprite(
        { x: this.location.x, y: this.location.y },
        this.game,
      );
      particleSprite.particleInit(8, 5);
      particleSprite.addSelf();
    }
  }

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

  setVelocity(x, y) {
    this.velocity.x = x;
    this.velocity.y = y;
    this.offx = -1 * (x * 8);
    this.offy = -1 * (y * 8);
  }

  setPowerup(powerupType) {
    this.powerupType = powerupType;
    this.bPowerup = true;
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

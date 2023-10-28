import { Rectangle } from "../Rectangle.js";
import { RotationalPolygon } from "../RotationalPolygon.js";
import { WHUtil } from "../WHUtil.js";
import { BulletSprite } from "./BulletSprite.js";
import { PowerupSprite } from "./PowerupSprite.js";
import { Sprite } from "./Sprite.js";

export class ArtillerySprite extends Sprite {
  static points = [
    [-5, -23],
    [-5, -20],
    [0, -20],
    [-9, -20],
    [-9, 20],
    [9, 20],
    [9, -20],
    [0, -20],
    [5, -20],
    [5, -23],
  ];

  constructor(x, y, game) {
    super(x, y, game);
    this.init("art", this.x, this.y, false);
    this.shapeRect = new Rectangle(this.x - 20, this.y - 20, 40, 40);

    /** @type {number} specified good or bad sprite */
    this.spriteType = 1;

    /** sets the health and the damage the sprite causes */
    this.setHealth(10);
    this.damage = 5;

    /** @type {number} specify the powerup type for the sprite */
    this.powerupType = 19;

    this.rPoly = new RotationalPolygon(ArtillerySprite.points);

    this.userSprite = this.game.user.userSprite;

    this.mode = 3;
    this.teleportationCounter = 45;
    this.shotsFiredThisRound = 0;
    this.framesDrawn = 0;
  }

  drawSelf(context) {
    super.drawSelf(context);
    this.framesDrawn++;
    context.translate(this.x, this.y);
    WHUtil.setColor(context, this.game.colors.colors[this.slot][3]);
    let n = 1;
    if (this.mode == 3) {
      if (this.teleportationCounter < 2) {
        n = 0;
      } else {
        n = this.teleportationCounter / 45;
      }
    } else if (this.mode == 0) {
      n = this.teleportationCounter / 45;
    }
    let n2 = 8 * n;
    let n3 = 20 * n;
    context.beginPath();
    context.strokeRect(-n2 / 2, -(5 + n3), n2, n3);
    context.strokeRect(-(5 + n3), -n2 / 2, n3, n2);

    context.strokeRect(-n2 / 2, 5, n2, n3);
    context.strokeRect(5, -n2 / 2, n3, n2);

    WHUtil.setColor(context, this.game.colors.colors[this.slot][(1 - n) * 19]);

    this.rPoly.polygon.drawPolygon(context);
    context.translate(-this.x, -this.y);
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      this.killSelf();
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
    }
  }

  setDegreeAngle(degreeAngle) {
    if (degreeAngle == this.angle) {
      return;
    }
    super.setDegreeAngle(degreeAngle);
    this.rPoly.setAngle(this.radAngle + 1.5707963267948966);
  }

  behave() {
    super.behave();
    this.setDegreeAngle(
      WHUtil.findAngle(this.userSprite.x, this.userSprite.y, this.x, this.y),
    );
    if (this.mode != 3 && this.framesDrawn > 50) {
      this.mode = 3;
      this.teleportationCounter = 45;
    }
    switch (this.mode) {
      case 0: {
        if (this.teleportationCounter-- <= 0) {
          this.mode = 1;
          this.damage = 5;
          return;
        }
        break;
      }
      case 1: {
        if (this.spriteCycle % 60 == 0) {
          this.mode = 2;
          this.shotsFiredThisRound = 0;
          return;
        }
        break;
      }
      case 2: {
        if (this.shotsFiredThisRound > 2) {
          this.mode = 1;
          return;
        }
        if (this.spriteCycle % 5 == 0) {
          this.shotsFiredThisRound++;
          let bulletSprite = new BulletSprite(
            this.x,
            this.y,
            this.game,
            2,
            10,
            this.color,
            1,
          );
          bulletSprite.setSentByEnemy(this.slot, 19);
          bulletSprite.concussive = true;
          let calcLead = this.calcLead();
          bulletSprite.setVelocity(
            8 * WHUtil.scaleVector(calcLead.x, calcLead.y),
            8 * WHUtil.scaleVector(calcLead.y, calcLead.x),
          );
          bulletSprite.addSelf();
          return;
        }
        break;
      }
      case 3: {
        if (this.teleportationCounter-- <= 0) {
          this.setLocation(
            WHUtil.randInt(this.game.board.width),
            WHUtil.randInt(this.game.board.height),
          );
          this.framesDrawn = 0;
          this.mode = 0;
          this.damage = 0;
          this.teleportationCounter = 45;
          return;
        }
        break;
      }
    }
  }
}

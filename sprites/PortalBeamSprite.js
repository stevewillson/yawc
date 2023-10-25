import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class PortalBeamSprite extends Sprite {
  static BEAFORMING_DURATION = 45;
  static BEASHOOTING_DURATION = 320;
  static BEAMAX_SIZE = 20;
  static MAX_D_ANGLE = 0.006;
  static BEAFORMING = 0;
  static BEASHRINK_RATE = 30;

  constructor(portal, game) {
    super(0, 0, game);
    this.init("beam", 0, 0, true);
    this.portal = portal;
    this.setHealth(10);
    this.damage = 1;
    this.spriteType = 1;
    this.indestructible = true;
    this.userSprite = this.game.user.userSprite;
    this.shapeRect = new Rectangle(
      this.userSprite.x - 20,
      this.userSprite.y - 20,
      40,
      40
    );
    this.color = portal.color;
    this.slot = portal.slot;
    let n;
    if (WHUtil.randInt(2) == 1) {
      n = -0.25;
      this.beamDirection = 0.006;
    } else {
      n = 0.25;
      this.beamDirection = -0.006;
    }
    this.attackAngle =
      Math.atan2(
        this.userSprite.y - this.portal.y,
        this.userSprite.x - this.portal.x
      ) + n;
    this.beamRad = 20;
    this.powerupType = 16;

    this.stage = 0;
    this.timeLeft = 1;
    this.formation = 0;
  }

  drawSelf(context) {
    context.fillStyle = this.userSprite.color;
    context.strokeStyle = this.userSprite.color;
    if (this.stage == 0) {
      context.fillStyle =
        this.game.colors.colors[this.slot][
          Math.max(0, 19 - this.timeLeft * 20)
        ];
      context.strokeStyle =
        this.game.colors.colors[this.slot][
          Math.max(0, 19 - this.timeLeft * 20)
        ];
    }
    let n = 1200 * Math.cos(this.attackAngle);
    let n2 = 1200 * Math.sin(this.attackAngle);
    context.translate(this.portal.x, this.portal.y);
    let spriteCycle = this.spriteCycle;
    for (let n3 = 0; n3 < 10; n3++) {
      if (this.stage != 0) {
        context.fillStyle =
          this.game.colors.colors[this.slot][(n3 + this.spriteCycle) % 20];
        context.strokeStyle =
          this.game.colors.colors[this.slot][(n3 + this.spriteCycle) % 20];
      }
      spriteCycle += 36;
      let n4 =
        2 *
        this.beamRad *
        this.timeLeft *
        Math.cos(spriteCycle * 0.017453292519943295);
      let n5 =
        this.beamRad *
        this.timeLeft *
        Math.sin(spriteCycle * 0.017453292519943295);
      context.beginPath();
      //   context.lineWidth = this.beamRad;
      // what thickness should the line be?
      context.moveTo(n4, n5);
      context.lineTo(n4 + n, n5 + n2);
      context.stroke();
    }
    context.translate(-this.portal.x, -this.portal.y);
  }

  setCollided(sprite) {
    if (sprite == this.userSprite) {
      this.beamRad--;
    }
  }

  inViewingRect() {
    return true;
  }

  behave() {
    super.behave();
    if (this.stage == 0) {
      if (this.formation++ > 45) {
        this.stage++;
        this.spriteCycle = 0;
        this.timeLeft = 1;
        return;
      }
      this.timeLeft = this.formation / 45;
    } else {
      let n = this.userSprite.x - this.portal.x;
      let n2 = this.userSprite.y - this.portal.y;
      this.attackAngle += this.beamDirection;
      let n3 = Math.hypot(n, n2);
      this.shapeRect.setBounds(
        Math.cos(this.attackAngle) * n3 + this.portal.x - this.beamRad,
        Math.sin(this.attackAngle) * n3 + this.portal.y - this.beamRad,
        this.beamRad * 2,
        this.beamRad * 2
      );
      if (this.spriteCycle % 30 == 0) {
        --this.beamRad;
      }
      if (this.spriteCycle > 320 || this.beamRad <= 2) {
        this.shouldRemoveSelf = true;
      }
    }
  }
}

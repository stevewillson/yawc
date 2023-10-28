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
    this.userSprite = this.game.user.userSprite;
    this.shapeRect = new Rectangle(
      this.userSprite.x - 20,
      this.userSprite.y - 20,
      40,
      40,
    );

    this.spriteType = 1;

    this.setHealth(10);
    this.damage = 1;

    this.powerupType = 16;

    this.portal = portal;
    this.indestructible = true;
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
    this.attackAngle = Math.atan2(
      this.userSprite.y - this.portal.y,
      this.userSprite.x - this.portal.x,
    ) + n;
    this.beamRad = 20;
    this.stage = 0;
    this.timeLeft = 1;
    this.formation = 0;
  }

  drawSelf(context) {
    WHUtil.setColor(context, this.userSprite.color);
    if (this.stage == 0) {
      WHUtil.setColor(
        context,
        this.game.colors
          .colors[this.slot][Math.max(0, 19 - this.timeLeft * 20)],
      );
    }
    let x = 1200 * Math.cos(this.attackAngle);
    let y = 1200 * Math.sin(this.attackAngle);
    context.translate(this.portal.x, this.portal.y);
    let spriteCycle = this.spriteCycle;
    context.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      if (this.stage != 0) {
        WHUtil.setColor(
          context,
          this.game.colors.colors[this.slot][(i + this.spriteCycle) % 20],
        );
      }
      spriteCycle += 36;
      let xOff = 2 *
        this.beamRad *
        this.timeLeft *
        Math.cos(spriteCycle * 0.017453292519943295);
      let yOff = this.beamRad *
        this.timeLeft *
        Math.sin(spriteCycle * 0.017453292519943295);
      context.beginPath();
      //   context.lineWidth = this.beamRad;
      // what thickness should the line be?
      context.moveTo(xOff, yOff);
      context.lineTo(xOff + x, yOff + y);
      context.stroke();
    }
    context.translate(-this.portal.x, -this.portal.y);
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
        this.beamRad * 2,
      );
      if (this.spriteCycle % 30 == 0) {
        --this.beamRad;
      }
      if (this.spriteCycle > 320 || this.beamRad <= 2) {
        this.shouldRemoveSelf = true;
      }
    }
  }

  setCollided(sprite) {
    if (sprite == this.userSprite) {
      this.beamRad--;
    }
  }

  inViewingRect() {
    return true;
  }
}

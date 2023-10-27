import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class EMPSprite extends Sprite {
  constructor(portal, game) {
    super(0, 0, game);
    this.init("emp", game.user.userSprite.x, game.user.userSprite.y, true);

    this.spriteType = 0;

    this.portal = portal;
    this.distX = this.portal.x - game.user.userSprite.x;
    this.distY = this.portal.y - game.user.userSprite.y;
    let atan2 = Math.atan2(this.distY, this.distX);
    this.lagX = Math.cos(atan2) * 15;
    this.lagY = Math.sin(atan2) * 15;
    this.radius = 0;
    this.formation = 0;
    this.stage = 0;
  }

  drawSelf(context) {
    WHUtil.setColor(context, this.color);
    WHUtil.drawTarget(context, this.x, this.y);
    context.translate(this.x, this.y);
    context.font = "12px helvetica";
    context.fillText("EMP", -5, -3);
    if (this.stage == 0) {
      let n = this.formation / 65;
      let n2 = this.distX * (1 - n);
      let n3 = this.distY * (1 - n);
      context.translate(n2, n3);
      for (let n4 = 0; n4 < 4; n4++) {
        WHUtil.drawCenteredCircle(
          context,
          n4 * this.lagX,
          n4 * this.lagY,
          20 - n4
        );
      }
      context.translate(-n2, -n3);
      WHUtil.setColor(
        context,
        this.game.colors.colors[this.slot][Math.max(0, 19 - n * 20)]
      );
      WHUtil.drawCenteredCircle(context, 0, 0, n * 320);
      WHUtil.drawCenteredCircle(context, 0, 0, n * 320 + 1);
      WHUtil.drawCenteredCircle(context, 0, 0, (1 - n) * 320 + 1);
      WHUtil.drawCenteredCircle(context, 0, 0, (1 - n) * 320 + 1);
    } else if (this.stage == 1) {
      for (let n5 = 0; n5 < 10; n5++) {
        WHUtil.setColor(
          context,
          this.game.colors.colors[this.slot][(this.spriteCycle + n5) % 20]
        );
        let n6 = this.radius - n5 * 2;
        if (n6 < 0) {
          break;
        }
        WHUtil.drawCenteredCircle(context, 0, 0, n6);
      }
    }
    context.translate(-this.x, -this.y);
  }

  behave() {
    super.behave();
    switch (this.stage) {
      case 0: {
        this.formation += 2;
        if (this.formation > 65) {
          this.formation = 65;
          this.stage++;
          return;
        }
        break;
      }
      case 1: {
        this.radius += 8;
        if (this.radius >= 320) {
          this.radius = 320;
          this.formation = 65;
          this.stage++;
        }
        if (
          this.radius >
          WHUtil.distanceFrom(
            this.x,
            this.y,
            this.game.user.userSprite.x,
            this.game.user.userSprite.y
          )
        ) {
          this.game.user.userSprite.activateEMP();
          return;
        }
        break;
      }
      case 2: {
        this.formation -= 3;
        if (this.formation <= 0) {
          this.formation = 0;
          this.shouldRemoveSelf = true;
          return;
        }
        break;
      }
    }
  }

  inViewingRect() {
    return true;
  }
}

import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class ThrustSprite extends Sprite {
  static thrustColors = ["orange", "yellow", "red"];
  static MAX_CYCLE = 30;

  constructor(x, y, game) {
    super(x, y, game);
    super.init("thrust", x, y, false);
    this.shapeRect = new Rectangle(x, y, 0, 0);

    this.spriteType = 0;

    this.radius = 10;
    this.color =
      ThrustSprite.thrustColors[
        WHUtil.randInt(ThrustSprite.thrustColors.length)
      ];
  }

  drawSelf(context) {
    context.strokeStyle = this.color;
    context.beginPath();
    context.lineWidth = 1;
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.stroke();
  }

  behave() {
    super.behave();
    if (this.spriteCycle++ > ThrustSprite.MAX_CYCLE) {
      this.shouldRemoveSelf = true;
    }
    this.radius = Math.max(2, 10 - this.spriteCycle / 2);
  }
}

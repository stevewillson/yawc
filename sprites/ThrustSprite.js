import Rectangle from "../Rectangle.js";
import Sprite from "./Sprite.js";
import WHUtil from "../WHUtil.js";

export default class ThrustSprite extends Sprite {
  x;
  y;
  radius;

  constructor(x, y, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.game = game;
    super.init("thrust", x, y, false);
    this.MAX_CYCLE = 30;
    this.radius = 10;
    this.spriteType = 0;
    this.thrustColors = ["orange", "yellow", "red"];

    // create a new shapeRect
    this.shapeRect = new Rectangle(x, y, 0, 0);
    this.color = this.thrustColors[WHUtil.randInt(this.thrustColors.length)];
  }

  drawSelf(context) {
    // console.log(
    // `Thrust: x: ${parseInt(this.x)} y: ${parseInt(this.y)}`
    // );

    // start a new path so that the previous path is not included in the thrust display color
    context.strokeStyle = this.color;
    WHUtil.drawCenteredCircle(context, this.x, this.y, this.radius);
  }

  behave() {
    super.behave();
    if (this.spriteCycle++ > 30) {
      this.shouldRemoveSelf = true;
    }
    this.radius = Math.max(2, 10 - this.spriteCycle / 2);
  }
}

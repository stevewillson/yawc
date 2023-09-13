import Rectangle from "./Rectangle.js";
import Sprite from "./Sprite.js";
import WHUtil from "./WHUtil.js";

let g_colors = ["orange", "yellow", "red"];

export default class ThrustSprite extends Sprite {
  constructor(location, model) {
    super(location, model);
    super.init("thrust", location.x, location.y, false);
    this.MAX_CYCLE = 30;
    this.radius = 10;
    this.spriteType = 0;
    this.model = model;

    // create a new shapeRect
    this.shapeRect = new Rectangle(location.x, location.y, 0, 0);
    this.color = g_colors[WHUtil.randInt() % g_colors.length];
  }

  drawSelf(context) {
    // console.log(
    // `Thrust: x: ${parseInt(this.location.x)} y: ${parseInt(this.location.y)}`
    // );

    // start a new path so that the previous path is not included in the thrust display color
    context.beginPath();
    context.strokeStyle = this.color;
    context.stroke();
    WHUtil.drawCenteredCircle(
      context,
      this.location.x,
      this.location.y,
      this.radius,
      this.color
    );
  }

  behave() {
    super.behave();
    if (this.spriteCycle++ > 30) {
      this.shouldRemoveSelf = true;
    }
    this.radius = Math.max(2, 10 - this.spriteCycle / 2);
  }
}

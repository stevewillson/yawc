import Rectangle from "../Rectangle.js";
import Sprite from "./Sprite.js";
import WHUtil from "../WHUtil.js";

export default class ThrustSprite extends Sprite {
  x;
  y;
  radius;
  static thrustColors = ["orange", "yellow", "red"];
  static MAX_CYCLE = 30;

  constructor(x, y, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.game = game;
    super.init("thrust", x, y, false);
    this.radius = 10;
    this.spriteType = 0;

    // create a new shapeRect
    this.shapeRect = new Rectangle(x, y, 0, 0);
    this.color =
      ThrustSprite.thrustColors[
        WHUtil.randInt(ThrustSprite.thrustColors.length)
      ];
  }

  // TODO - determine why the thrust sprites 'cut off' after some
  // time and just show around the ships exhaust
  drawSelf(context) {
    // console.log(
    // `Thrust: x: ${parseInt(this.x)} y: ${parseInt(this.y)}`
    // );

    // start a new path so that the previous path is not included in the thrust display color
    context.strokeStyle = this.color;
    context.beginPath();
    context.lineWidth = 1;
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.stroke();
  }

  behave() {
    // ADDED FOR DEBUGGING
    if (this.spriteCycle % 10 == 0) {
      this.shouldRemoveSelf = this.shouldRemoveSelf;
    }
    super.behave();
    if (this.spriteCycle++ > ThrustSprite.MAX_CYCLE) {
      this.shouldRemoveSelf = true;
    }
    this.radius = Math.max(2, 10 - this.spriteCycle / 2);
  }
}

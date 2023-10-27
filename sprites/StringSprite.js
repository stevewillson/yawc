import { Rectangle } from "../Rectangle.js";
import { Sprite } from "./Sprite.js";

export class StringSprite extends Sprite {
  static MAX_CYCLE = 100;
  constructor(x, y, string, game) {
    super(x, y, game);
    this.init(string, x, y, true);
    this.shapeRect = new Rectangle(x, y, 20, 100);

    this.spriteType = 0;

    this.string = string;
    this.color = "white";
  }

  drawSelf(context) {
    context.fillStyle = this.color;
    context.strokeStyle = this.color;
    context.font = "12px Helvetica";
    context.fillText(this.string, this.x, this.y);
  }

  behave() {
    if (this.spriteCycle++ > StringSprite.MAX_CYCLE) {
      this.shouldRemoveSelf = true;
    }
  }
}

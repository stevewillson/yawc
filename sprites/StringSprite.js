import Rectangle from "../Rectangle.js";
import Sprite from "./Sprite.js";

export default class StringSprite extends Sprite {
  color;
  MAX_CYCLE = 100;
  x;
  y;
  string;

  constructor(x, y, string, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.string = string;
    this.game = game;
    this.color = "white";
    this.init(string, x, y, true);
    this.spriteType = 0;
    this.shapeRect = new Rectangle(x, y, 20, 100);
  }

  drawSelf(context) {
    context.fillStyle = this.color;
    context.strokeStyle = this.color;
    context.font = "12px Helvetica";
    context.fillText(this.string, this.x, this.y);
  }

  behave() {
    if (this.spriteCycle++ > 100) {
      this.shouldRemoveSelf = true;
    }
  }
}

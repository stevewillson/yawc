import Rectangle from "./Rectangle.js";
import Sprite from "./Sprite.js";

export default class StringSprite extends Sprite {
  color;
  MAX_CYCLE = 100;
  location;

  constructor(location, string, game) {
    super({ x: location.x, y: location.y }, game);
    this.location = location;
    this.string = string;
    this.game = game;
    this.color = "white";
    this.init(string, location.x, location.y, true);
    this.spriteType = 0;
    this.shapeRect = new Rectangle(location.x, location.y, 20, 100);
  }

  drawSelf(context) {
    context.fillStyle = this.color;
    context.strokeStyle = this.color;
    context.font = "12px Helvetica";
    context.fillText(this.string, this.location.x, this.location.y);
  }

  behave() {
    if (this.spriteCycle++ > 100) {
      this.shouldRemoveSelf = true;
    }
  }
}

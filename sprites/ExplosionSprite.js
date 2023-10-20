import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class ExplosionSprite extends Sprite {
  constructor(x, y, game, colorType = 0) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.game = game;
    this.RINGS = 6;
    this.init("explosion", x, y, true);
    this.spriteType = 0;
    this.shapeRect = new Rectangle(x - 50, y - 50, 100, 100);
    // TODO - explosion sound
    // GameBoard.playSound("snd_explosion");
    this.colorType = colorType;
    this.MAX_CYCLE = 40;
  }

  setPowerupExplosion() {
    this.spriteType = 2;
    this.setHealth(100, 500);
    let n = (this.spriteCycle - this.RINGS) * 2;
    if (n < 0) {
      n = 0;
    }
    this.shapeRect.reshape(this.x - n, this.y - n, n * 2, n * 2);
  }

  drawSelf(context) {
    for (let i = 0; i < this.RINGS; i++) {
      // max specifies the color of the explosion ring
      let max = Math.max(Math.min(19, i + this.spriteCycle - 10), 0);
      context.strokeStyle = this.game.colors.colors[this.colorType][max];

      let n = (this.spriteCycle - i) * 2;
      if (n < 0) {
        n = 0;
      }

      if (max != 19) {
        WHUtil.drawCenteredCircle(context, this.x, this.y, n);
      }
    }
  }

  behave() {
    if (this.spriteType != 0) {
      let n = (this.spriteCycle - this.RINGS) * 2;
      if (n < 0) {
        n = 0;
      }
      this.shapeRect.reshape(this.x - n, this.y - n, n * 2, n * 2);
      super.behave();
    }
    if (this.spriteCycle > 40) {
      this.shouldRemoveSelf = true;
    }
    this.spriteCycle++;
  }
}

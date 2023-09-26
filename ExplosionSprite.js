import Rectangle from "./Rectangle.js";
import WHUtil from "./WHUtil.js";
import Sprite from "./Sprite.js";

export default class ExplosionSprite extends Sprite {
  constructor(location, game, colorType = null) {
    super(location, game);

    this.game = game;
    this.RINGS = 6;
    this.init("explosion", location.x, location.y, true);
    this.spriteType = 0;
    this.shapeRect = new Rectangle(location.x - 50, location.y - 50, 100, 100);
    // TODO - explosion sound
    // GameBoard.playSound("snd_explosion");
    this.colorscolorType = colorType;
    this.MAX_CYCLE = 40;
  }

  setPowerupExplosion() {
    this.spriteType = 2;
    this.setHealth(100, 500);
    let n = (this.spriteCycle - this.RINGS) * 2;
    if (n < 0) {
      n = 0;
    }
    this.shapeRect.reshape(
      this.location.x - n,
      this.location.y - n,
      n * 2,
      n * 2,
    );
  }

  drawSelf(context) {
    for (let i = 0; i < this.RINGS; i++) {
      // max specifies the color of the explosion ring
      let max = Math.max(Math.min(19, i + this.spriteCycle - 10), 0);
      context.strokeStyle = this.game.colors.colors[this.colorscolorType][max];

      let n = (this.spriteCycle - i) * 2;
      if (n < 0) {
        n = 0;
      }

      if (max != 19) {
        WHUtil.drawCenteredCircle(
          context,
          this.location.x,
          this.location.y,
          n,
          context.strokeStyle,
        );
      }
    }
  }

  behave() {
    if (this.spriteType != 0) {
      let n = (this.spriteCycle - this.RINGS) * 2;
      if (n < 0) {
        n = 0;
      }
      this.shapeRect.reshape(
        this.location.x - n,
        this.location.y - n,
        n * 2,
        n * 2,
      );
      super.behave();
    }
    if (this.spriteCycle > 40) {
      this.shouldRemoveSelf = true;
    }
    this.spriteCycle++;
  }
}

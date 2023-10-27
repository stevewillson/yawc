import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class MineSprite extends Sprite {
  static MINESIZE = 15;
  static INNER_MINESIZE = 11;
  static INNER_BOX = 5;
  static INNER_BOX_SIZE = 10;

  constructor(x, y, game) {
    super(x, y, game);
    this.init("mns", x, y, true);
    this.shapeRect = new Rectangle(this.x - 15, this.y - 15, 30, 30);

    this.spriteType = 1;

    this.setHealth(10);
    this.damage = 0;

    this.powerupType = 8;

    this.indestructible = true;
  }

  drawSelf(context) {
    context.lineWidth = 1;
    WHUtil.setColor(
      context,
      this.game.colors.colors[this.slot][this.spriteCycle % 20]
    );

    context.translate(this.x, this.y);
    context.beginPath();
    context.moveTo(-11, -11);
    context.lineTo(11, 11);

    context.moveTo(-11, 11);
    context.lineTo(11, -11);
    context.stroke();

    context.fillRect(-5, -5, 10, 10);

    context.strokeStyle = this.game.colors.colors[this.slot][0];

    context.beginPath();
    context.moveTo(-15, 0);
    context.lineTo(15, 0);

    context.moveTo(0, -15);
    context.lineTo(0, 15);
    context.stroke();

    context.translate(-this.x, -this.y);
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      this.killSelf(5, 30);
    }
  }

  behave() {
    super.behave();
    if (this.spriteCycle == 40) {
      this.indestructible = false;
      this.setHealth(5);
      this.damage = 20;
      this.vx = 0;
      this.vy = 0;
    }
  }
}

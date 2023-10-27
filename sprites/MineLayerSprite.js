import { WHUtil } from "../WHUtil.js";
import { MineSprite } from "./MineSprite.js";
import { PowerupSprite } from "./PowerupSprite.js";
import { Sprite } from "./Sprite.js";

export class MineLayerSprite extends Sprite {
  static MAX_VEL = 5.0;
  static directions = [
    [1, 0],
    [-1, 0],
    [0, -1],
    [0, 1],
  ];

  constructor(x, y, game) {
    super(x, y, game);
    this.init("ml", x, y, true);
    this.polygon = WHUtil.symPolygon(8, 35, 0);

    this.spriteType = 1;
    this.shapeType = 1;

    this.setHealth(50);
    this.damage = 10;

    this.powerupType = 11;
    this.directionalCycles = WHUtil.randInt(150);
  }

  drawSelf(context) {
    context.fillStyle = this.color;
    context.lineWidth = 1;

    WHUtil.drawCenteredCircle(context, this.x, this.y, 30);
    context.fillStyle =
      this.game.colors.colors[this.slot][this.spriteCycle % 20];
    context.beginPath();
    context.arc(this.x, this.y, 20, 0, 2 * Math.PI);
    context.fill();

    context.strokeStyle =
      this.game.colors.colors[this.slot][this.spriteCycle % 20];

    context.moveTo(this.x - 30, this.y);
    context.lineTo(this.x + 30, this.y);

    context.moveTo(this.x, this.y - 30);
    context.lineTo(this.x, this.y + 30);

    context.stroke();
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      this.killSelf(10, 20);
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
    }
  }

  behave() {
    super.behave();
    this.polygon = WHUtil.symPolygon(8, 35, 0);
    if (this.spriteCycle > this.directionalCycles) {
      this.spriteCycle = 0;
      this.directionalCycles = WHUtil.randInt(150) + 100;
      let n = WHUtil.randInt(4);
      this.vx = 5 * MineLayerSprite.directions[n][0];
      this.vy = 5 * MineLayerSprite.directions[n][1];
      return;
    }
    if (this.spriteCycle % 50 == 0) {
      let mineSprite = new MineSprite(this.x, this.y, this.game);
      // get the user in the slot
      // const user = this.game.user;
      // get the user that sent the mine layer
      mineSprite.setUser(this.slot);
      mineSprite.spriteCycle = 20;
      mineSprite.addSelf();
    }
  }

  getShapeRect() {
    const bounds = this.polygon.bounds;
    bounds.setLocation(this.x - bounds.width / 2, this.y - bounds.height / 2);
    return bounds;
  }
}

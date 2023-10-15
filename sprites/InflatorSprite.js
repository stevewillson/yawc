import WHUtil from "../WHUtil.js";
import Sprite from "./Sprite.js";
import PowerupSprite from "./PowerupSprite.js";

export default class InflatorSprite extends Sprite {
  inflationSize;
  maxAttackDistance = 100;
  perceivedSize;

  constructor(x, y, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.init("inf", x, y, true);
    this.spriteType = 1;
    this.polygon = WHUtil.symPolygon(8, 30, 0);
    this.shapeType = 1;
    this.setHealth(30, 15);
    this.perceivedSize = 20;
    this.powerupType = 10;
    this.shapeRect = this.getShapeRect();
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.health < 8 || this.shouldRemoveSelf) {
      this.killSelf();
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
    }
  }

  behave() {
    super.behave();
    if (this.perceivedSize != this.health) {
      if (this.perceivedSize > this.health) {
        if (this.perceivedSize > this.health + 20) {
          this.perceivedSize -= 5;
        } else {
          this.perceivedSize--;
        }
      } else if (this.perceivedSize + 20 < this.health) {
        this.perceivedSize += 5;
      } else {
        this.perceivedSize++;
      }
      this.polygon = WHUtil.symPolygon(8, 10 + this.perceivedSize, 15);
    }
    if (this.spriteCycle % 2 == 0) {
      this.perceivedSize++;
      this.health++;
      this.polygon = WHUtil.symPolygon(8, 10 + this.perceivedSize, 15);
    }
  }

  getShapeRect() {
    let bounds = this.polygon.getBounds();
    bounds.setLocation(this.x - bounds.width / 2, this.y - bounds.height / 2);
    return bounds;
  }
}

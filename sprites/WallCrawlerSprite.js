import { Rectangle } from "../Rectangle.js";
import { RotationalPolygon } from "../RotationalPolygon.js";
import { WHUtil } from "../WHUtil.js";
import { Sprite } from "../sprites/Sprite.js";
import { BulletSprite } from "./BulletSprite.js";
import { PowerupSprite } from "./PowerupSprite.js";

export class WallCrawlerSprite extends Sprite {
  static WC_WIDTH = 30;
  static WC_HEIGHT = 60;
  static drawPoints = [
    [-10, -16],
    [0, -22],
    [0, -30],
    [12, -25],
    [15, -20],
    [8, -20],
    [8, 20],
    [15, 20],
    [12, 25],
    [0, 30],
    [0, 22],
    [-10, 16],
  ];
  static c_directions = [
    [4, 0, 90],
    [0, 4, 180],
    [-4, 0, 270],
    [0, -4, 0],
  ];
  static cc_directions = [
    [-4, 0, 90],
    [0, 4, 0],
    [4, 0, 270],
    [0, -4, 180],
  ];
  constructor(x, y, game, b) {
    super(x, y, game);
    this.init("wc", x, y, false);
    this.shapeRect = new Rectangle(
      x - 15,
      y - 30,
      WallCrawlerSprite.WC_WIDTH,
      WallCrawlerSprite.WC_HEIGHT,
    );

    this.spriteType = 1;

    this.setHealth(150);
    this.damage = 20;

    this.powerupType = 15;

    this.rPoly = new RotationalPolygon(WallCrawlerSprite.drawPoints);

    this.direction = 0;
    if (b) {
      this.directionData = WallCrawlerSprite.c_directions;
    } else {
      this.directionData = WallCrawlerSprite.cc_directions;
    }
    this.rPoly.setAngle(
      this.directionData[this.direction][2] * 0.017453292519943295,
    );

    this.vx = this.directionData[this.direction][0];
    this.vy = this.directionData[this.direction][1];
  }

  drawSelf(context) {
    context.strokeStyle =
      this.game.colors.colors[this.slot][this.spriteCycle % 20];
    context.translate(this.x, this.y);
    this.rPoly.polygon.drawPolygon(context);
    context.translate(-1, -1);

    context.strokeStyle = this.game.colors.colors[this.slot][0];
    this.rPoly.polygon.drawPolygon(context);
    context.translate(1 - this.x, 1 - this.y);

    this.shapeRect = this.getShapeRect();

    if (this.sentByUser) {
      Sprite.drawFlag(
        context,
        this.color,
        this.shapeRect.x + this.shapeRect.width + 5,
        this.shapeRect.y + this.shapeRect.height + 5,
      );
    }
  }

  behave() {
    if (this.hasCollided) {
      this.shouldRemoveSelf = true;
    }
    this.move(this.vx, this.vy);
    this.spriteCycle++;
    if (this.inView && this.spriteCycle % 35 == 0) {
      let bulletSprite = new BulletSprite(
        this.x,
        this.y,
        this.game,
        3,
        10,
        this.color,
        1,
      );

      // TODO - find a way to use a computer
      // userId or a slot number
      // const user = this.game.gameNetLogic.clientUserManager.users.get(
      //   room.userIds[i]
      // );
      bulletSprite.setSentByEnemy(this.slot, 15);
      const calcLead = this.calcLead();
      bulletSprite.setVelocity(
        6 * WHUtil.scaleVector(calcLead.x, calcLead.y),
        6 * WHUtil.scaleVector(calcLead.y, calcLead.x),
      );
      bulletSprite.addSelf();
    }
  }

  handleCrash() {
    this.direction++;
    this.direction %= 4;
    if (this.direction % 2 == 0) {
      this.shapeRect.reshape(
        this.shapeRect.x,
        this.shapeRect.y,
        WallCrawlerSprite.WC_WIDTH,
        WallCrawlerSprite.WC_HEIGHT,
      );
    } else {
      this.shapeRect.reshape(
        this.shapeRect.x,
        this.shapeRect.y,
        WallCrawlerSprite.WC_HEIGHT,
        WallCrawlerSprite.WC_WIDTH,
      );
    }
    this.rPoly.setAngle(this.directionData[this.direction][2] * WHUtil.DTOR);
    this.move(-this.vx, -this.vy);
    this.vx = this.directionData[this.direction][0];
    this.vy = this.directionData[this.direction][1];
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      this.killSelf(30, 30);
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
    }
  }
}

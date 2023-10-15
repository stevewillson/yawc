import Rectangle from "../Rectangle.js";
import RotationalPolygon from "../RotationalPolygon.js";
import WHUtil from "../WHUtil.js";
import Sprite from "../sprites/Sprite.js";
import BulletSprite from "./BulletSprite.js";
import PowerupSprite from "./PowerupSprite.js";

export default class WallCrawlerSprite extends Sprite {
  static WC_WIDTH = 30;
  static WC_HEIGHT = 60;
  static drawPoints = [
    { x: -10, y: -16 },
    { x: 0, y: -22 },
    { x: 0, y: -30 },
    { x: 12, y: -25 },
    { x: 15, y: -20 },
    { x: 8, y: -20 },
    { x: 8, y: 20 },
    { x: 15, y: 20 },
    { x: 12, y: 25 },
    { x: 0, y: 30 },
    { x: 0, y: 22 },
    { x: -10, y: 16 },
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
  direction;
  directionData;
  rotPolygon;
  x;
  y;
  game;
  shapeRect;

  constructor(x, y, game, b) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.game = game;
    this.direction = 0;
    this.rotPolygon = new RotationalPolygon(WallCrawlerSprite.drawPoints);
    this.init("wc", x, y, false);
    this.spriteType = 1;
    this.shapeRect = new Rectangle(x - 15, y - 30, 30, 60);
    this.setHealth(150, 20);
    if (b) {
      this.directionData = WallCrawlerSprite.c_directions;
    } else {
      this.directionData = WallCrawlerSprite.cc_directions;
    }
    this.vx = this.directionData[this.direction][0];
    this.vy = this.directionData[this.direction][1];
    this.rotPolygon.setAngle(
      this.directionData[this.direction][2] * 0.017453292519943295
    );
    this.powerupType = 15;
  }

  handleCrash() {
    this.direction++;
    this.direction %= 4;
    if (this.direction % 2 == 0) {
      this.shapeRect.reshape(this.shapeRect.x, this.shapeRect.y, 30, 60);
    } else {
      this.shapeRect.reshape(this.shapeRect.x, this.shapeRect.y, 60, 30);
    }
    this.rotPolygon.setAngle(
      this.directionData[this.direction][2] * 0.017453292519943295
    );
    this.move(-this.vx, -this.vy);
    this.vx = this.directionData[this.direction][0];
    this.vy = this.directionData[this.direction][1];
  }

  drawSelf(context) {
    context.strokeStyle =
      this.game.colors.colors[this.slot][this.spriteCycle % 20];
    context.translate(this.x, this.y);
    this.rotPolygon.polygon.drawPolygon(context);
    context.translate(-1, -1);

    context.strokeStyle = this.game.colors.colors[this.slot][0];
    this.rotPolygon.polygon.drawPolygon(context);
    context.translate(1 - this.x, 1 - this.y);
    this.shapeRect = this.getShapeRect();
    // if (this.bSentByUser) {
    //   Sprite.drawFlag(
    //     graphics,
    //     this.color,
    //     shapeRect.x + shapeRect.width + 5,
    //     shapeRect.y + shapeRect.height + 5
    //   );
    // }
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      this.killSelf(30, 30);
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
    }
  }

  behave() {
    if (this.hasCollided) {
      this.shouldRemoveSelf = true;
    }
    this.move(this.vx, this.vy);
    this.spriteCycle++;
    if (this.isInDrawingRect && this.spriteCycle % 35 == 0) {
      let bulletSprite = new BulletSprite(
        this.x,
        this.y,
        3,
        10,
        this.color,
        1,
        this.game
      );

      // TODO - find a way to use an computer
      // userId or a slot number
      // const user = this.game.gameNetLogic.clientUserManager.users.get(
      //   room.userIds[i]
      // );
      bulletSprite.setSentByEnemy(this.slot, 15);
      let calcLead = this.calcLead();
      bulletSprite.setVelocity(
        6 * WHUtil.scaleVector(calcLead.x, calcLead.y),
        6 * WHUtil.scaleVector(calcLead.y, calcLead.x)
      );
      bulletSprite.addSelf();
    }
  }
}

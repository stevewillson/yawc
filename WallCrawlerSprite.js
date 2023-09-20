import WHUtil from "./WHUtil.js";
import BulletSprite from "./BulletSprite.js";
import Rectangle from "./Rectangle.js";
import Sprite from "./Sprite.js";
import RotationalPolygon from "./RotationalPolygon.js";

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
  rPoly;
  location;
  game;
  shapeRect;

  constructor(location, game, b) {
    super(location, game);
    this.location = location;
    this.game = game;
    this.direction = 0;
    this.rPoly = new RotationalPolygon(WallCrawlerSprite.drawPoints);
    this.init("wc", location.x, location.y, false);
    this.spriteType = 1;
    this.shapeRect = new Rectangle(location.x - 15, location.y - 30, 30, 60);
    this.setHealth(150, 20);
    if (b) {
      this.directionData = WallCrawlerSprite.c_directions;
    } else {
      this.directionData = WallCrawlerSprite.cc_directions;
    }
    this.velocity.x = this.directionData[this.direction][0];
    this.velocity.y = this.directionData[this.direction][1];
    this.rPoly.setAngle(
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
    this.rPoly.setAngle(
      this.directionData[this.direction][2] * 0.017453292519943295
    );
    this.move({ x: -this.velocity.x, y: -this.velocity.y });
    this.velocity.x = this.directionData[this.direction][0];
    this.velocity.y = this.directionData[this.direction][1];
  }

  drawSelf(context) {
    context.strokeStyle =
      this.game.colors.colors[this.slot][this.spriteCycle % 20];
    context.translate(this.location.x, this.location.y);
    WHUtil.drawPoly(context, this.rPoly.polygon);
    context.translate(-1, -1);

    context.strokeStyle = this.game.colors.colors[this.slot][0];
    WHUtil.drawPoly(context, this.rPoly.polygon);
    context.translate(1 - this.location.x, 1 - this.location.y);
    this.shapeRect = this.getShapeRect();
    // if (this.bSentByPlayer) {
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
      //   PowerupSprite.genPowerup(super.intx, super.inty).addSelf();
    }
  }

  behave() {
    if (this.hasCollided) {
      this.shouldRemoveSelf = true;
    }
    this.move(this.velocity);
    this.spriteCycle++;
    if (this.bInDrawingRect && this.spriteCycle % 35 == 0) {
      bulletSprite = new BulletSprite(
        this.location,
        3,
        10,
        this.color,
        1,
        this.game
      );
      bulletSprite.setSentByEnemy(this.slot, 15);
      calcLead = this.calcLead();
      bulletSprite.setVelocity(
        6 * WHUtil.scaleVector(calcLead.x, calcLead.y),
        6 * WHUtil.scaleVector(calcLead.y, calcLead.x)
      );
      bulletSprite.addSelf();
    }
  }
}

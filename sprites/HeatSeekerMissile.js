import { Rectangle } from "../Rectangle.js";
import { RotationalPolygon } from "../RotationalPolygon.js";
import { Sprite } from "./Sprite.js";

export class HeatSeekerMissile extends Sprite {
  static points = [
    [0, -8],
    [-3, -3],
    [5, 0],
    [0, 5],
  ];

  constructor(x, y, game) {
    super(x, y, game);
    this.init("hs", x, y, false);
    this.shapeRect = new Rectangle(this.x, this.y, 10, 10);

    this.spriteType = 1;

    this.setHealth(1);
    this.damage = 10;

    this.powerupType = 6;

    this.rPoly = new RotationalPolygon(HeatSeekerMissile.points);

    this.dRotate = 16;
    this.thrust = 0.1;
    this.maxThrust = 7;
    this.rotate(0);
    this.trackingSprite = this.game.user;
  }

  drawSelf(context) {
    if (this.spriteType == 2) {
      context.strokeStyle = this.game.color;
      let x = this.x;
      let y = this.y;

      for (let i = 1; i < 20; i++) {
        let n2 = (this.index - i + 20) % 20;
        context.moveTo(this.lastJointPoint[n2][0], this.lastJointPoint[n2][1]);
        context.lineTo(x, y);
        x = this.lastJointPoint[n2][0];
        y = this.lastJointPoint[n2][1];
      }

      for (let i = 1; i < 20; i++) {
        context.translate(this.trackingX, this.trackingY);
        context.moveTo(0, -10);
        context.lineTo(0, 10);
        context.moveTo(-10, 0);
        context.lineTo(10, 0);
        context.translate(-this.trackingX, -this.trackingY);
      }
    } else {
      context.translate(this.x, this.y);
      context.strokeStyle = this.game.colors.colors[this.slot][0];
      this.rPoly.polygon.drawPolygon(context);
      context.translate(-this.x, -this.y);
    }
  }

  behave() {
    super.behave();
    if (this.spriteType == 2) {
      if (this.delayTime-- <= 0) {
        this.delayTime = 5;
        let n = 0;
        this.vx = n;
        this.vy = n;
        this.realTrack(this.trackingX, this.trackingY, false);
      }
      this.lastJointPoint[this.index][0] = this.x;
      this.lastJointPoint[this.index++][1] = this.y;
      this.index %= 20;
      return;
    }
    this.realTrack(this.trackingSprite.x, this.trackingSprite.y, false);
  }

  setGood(trackingX, trackingY, delayTime) {
    this.spriteType = 2;
    this.trackingSprite = undefined;
    this.trackingX = trackingX;
    this.trackingY = trackingY;

    super.isBullet = true;
    this.isHeatSeeker = true;

    this.dRotate = 20;
    this.thrust = 8;
    this.maxThrust = 8;
    this.setHealth(1);
    this.damage = 50;
    this.delayTime = delayTime;

    this.index = undefined;

    this.lastJointPoint = [];
    for (let i = 0; i < 20; i++) {
      this.lastJointPoint.push([this.x, this.y]);
    }
  }

  handleCrash() {
    this.killSelf(10, 15);
  }

  setCollided(collided) {
    super.setCollided(collided);
    this.killSelf(3, 15);
  }

  inViewingRect(rectangle) {
    if (this.spriteType != 2) {
      return super.inViewingRect(rectangle);
    }
    if (!rectangle.contains(this.x, this.y)) {
      let array = this.lastJointPoint[(this.index + 1 + 20) % 20];
      return rectangle.contains(array[0], array[1]);
    }
    return true;
  }
}

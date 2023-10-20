import { Rectangle } from "../Rectangle.js";
import { RotationalPolygon } from "../RotationalPolygon.js";
import { Sprite } from "./Sprite.js";
export class HeatSeekerMissile extends Sprite {
  points;
  polygon;
  trackingSprite;
  delayTime;
  trackingX;
  trackingY;
  MAX_JOINTS = 20;
  lastJointPt;
  index;

  static points = [
    [0, -8],
    [-3, -3],
    [5, 0],
    [0, 5],
  ];

  setGood(trackingX, trackingY, delayTime) {
    this.spriteType = 2;
    this.trackingSprite = null;
    this.trackingX = trackingX;
    this.trackingY = trackingY;
    this.bIsHeatSeeker = true;
    this.dRotate = 20;
    this.thrust = 8;
    this.maxThrust = 8;
    this.setHealth(1, 50);
    super.bIsBullet = true;
    this.delayTime = delayTime;

    this.lastJointPt = [];
    for (let i = 0; i < 20; i++) {
      this.lastJointPt.push([this.x, this.y]);
    }
  }

  handleCrash() {
    super.handleCrash();
    this.killSelf(10, 15);
  }

  constructor(x, y, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.game = game;
    this.init("hs", x, y, false);
    this.dRotate = 16;
    this.thrust = 0.1;
    this.maxThrust = 7;
    this.setHealth(1, 10);
    this.shapeRect = new Rectangle(this.x, this.y, 10, 10);
    this.spriteType = 1;
    this.rotate(0);
    this.powerupType = 6;
    const user = this.game.gameNetLogic.clientUserManager.users.get(
      this.game.gameNetLogic.userId
    );
    this.trackingSprite = user.userSprite;
    this.polygon = new RotationalPolygon(HeatSeekerMissile.points);
  }

  drawSelf(context) {
    if (this.spriteType == 2) {
      context.strokeStyle = this.game.color;
      let x = this.x;
      let y = this.y;

      for (let i = 1; i < 20; i++) {
        let n2 = (this.index - i + 20) % 20;
        context.moveTo(this.lastJointPt[n2][0], this.lastJointPt[n2][1]);
        context.lineTo(x, y);
        x = this.lastJointPt[n2][0];
        y = this.lastJointPt[n2][1];
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
      this.polygon.getPolygon().drawPolygon(context);
      context.translate(-this.x, -this.y);
    }
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
      let array = this.lastJointPt[(this.index + 1 + 20) % 20];
      return rectangle.contains(array[0], array[1]);
    }
    return true;
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
      this.lastJointPt[this.index][0] = this.x;
      this.lastJointPt[this.index++][1] = this.y;
      this.index %= 20;
      return;
    }
    this.realTrack(this.trackingSprite.x, this.trackingSprite.y, false);
  }
}

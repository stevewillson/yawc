import { WHUtil } from "../WHUtil.js";
import { PowerupSprite } from "./PowerupSprite.js";
import { Sprite } from "./Sprite.js";
import { RotationalPolygon } from "../RotationalPolygon.js";
export class ScarabSprite extends Sprite {
  static points = [
    [35, 18],
    [-26, 18],
    [-26, -18],
    [35, -18],
  ];
  static drawPoints = [
    [
      [20, -3],
      [29, -12],
      [35, -11],
      [40, -10],
      [48, -5],
      [40, -12],
      [35, -17],
      [29, -17],
      [15, -5],
      [15, 5],
      [29, 17],
      [35, 17],
      [40, 10],
      [48, 5],
      [40, 12],
      [35, 11],
      [29, 12],
      [20, 3],
    ],
    [
      [20, -4],
      [17, -11],
      [13, -15],
      [15, -30],
      [13, -15],
      [10, -16],
      [0, -18],
      [2, -28],
      [0, -18],
      [-20, -13],
      [-25, -10],
      [-23, -15],
      [-25, -10],
      [-27, 0],
      [-25, 10],
      [-23, 15],
      [-25, 10],
      [-20, 13],
      [0, 18],
      [2, 28],
      [0, 18],
      [10, 16],
      [13, 15],
      [15, 30],
      [13, 15],
      [17, 11],
      [20, 4],
    ],
  ];

  constructor(x, y, game, portalSprite) {
    super(x, y, game);
    this.rPoly = new RotationalPolygon(ScarabSprite.points);
    this.init("scb", x, y, true);
    this.portalSprite = portalSprite;
    this.shapeType = 1;
    this.dRotate = 20.0;
    this.thrust = 0.3;
    this.maxThrust = 5.0;
    this.spriteType = 1;
    this.setHealth(20);
    this.damage = 5;
    this.rDrawPoly = new Array(ScarabSprite.drawPoints.length);
    // this.rDrawPoly = new RotationalPolygon[ScarabSprite.drawPoints.length]();
    for (let i = 0; i < ScarabSprite.drawPoints.length; ++i) {
      this.rDrawPoly[i] = new RotationalPolygon(ScarabSprite.drawPoints[i]);
    }
    if (portalSprite != null) {
      this.trackingSprite = this.findClosestPowerup();
    } else {
      this.trackingSprite = undefined;
    }
    this.powerupType = 13;

    this.gotPowerup = undefined;
    this.storedSprite = undefined;
  }

  getShapeRect() {
    const bounds = this.polygon.bounds;
    bounds.setLocation(this.x - bounds.width / 2, this.y - bounds.height / 2);
    return bounds;
  }

  drawSelf(context) {
    if (this.gotPowerup) {
      this.storedSprite.drawSelf(context);
    }
    context.translate(this.x, this.y);
    context.strokeStyle = this.color;
    for (let i = 0; i < ScarabSprite.drawPoints.length; i++) {
      let polygon = this.rDrawPoly[i].polygon;
      polygon.drawPolygon(context);
    }
    context.translate(-this.x, -this.y);
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      if (this.gotPowerup) {
        this.storedSprite.spriteCycle = 0;
        this.storedSprite.indestructible = true;
        this.storedSprite.shouldRemoveSelf = false;
        this.storedSprite.addSelf();
      }
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
    }
  }

  findClosestPowerup() {
    let n = 5000;
    let powerupSprite = null;
    for (let i = 0; i < this.game.badGuys.length; i++) {
      let sprite = this.game.badGuys[i];
      if (sprite != null && sprite instanceof PowerupSprite) {
        let powerupSprite2 = sprite;
        if (powerupSprite2.powerupType > 6) {
          let distance = WHUtil.distanceFrom(
            this.x,
            this.y,
            powerupSprite2.x,
            powerupSprite2.y
          );
          if (distance < n) {
            powerupSprite = powerupSprite2;
            n = distance;
          }
        }
      }
    }
    return powerupSprite;
  }

  setDegreeAngle(degreeAngle) {
    super.setDegreeAngle(degreeAngle);
    this.rPoly.setAngle(this.radAngle);
    for (let i = 0; i < ScarabSprite.drawPoints.length; i++) {
      this.rDrawPoly[i].setAngle(this.radAngle);
    }
    this.polygon = this.rPoly.polygon;
  }

  behave() {
    super.behave();
    if (this.gotPowerup) {
      this.storedSprite.setLocation(this.x, this.y);
      if (this.portalSprite.shouldRemoveSelf) {
        this.killSelf(10, 5);
        return;
      }
      this.realTrack(this.portalSprite.x, this.portalSprite.y, false);
      if (
        WHUtil.distanceFrom(
          this.portalSprite.x,
          this.portalSprite.y,
          this.x,
          this.y
        ) < 40
      ) {
        // change to use the slot rather than the userId
        this.game.addIncomingPowerup(
          this.portalSprite,
          this.storedSprite.powerupType,
          this.slot,
          0
        );
        this.killSelf(5, 5);
      }
    } else {
      if (this.trackingSprite == null || this.trackingSprite.shouldRemoveSelf) {
        this.reverseTrack();
        this.trackingSprite = this.findClosestPowerup();
        return;
      }
      let n = WHUtil.distanceFrom(this, this.trackingSprite);
      if (this.spriteCycle % 50 == 99 && n > 150) {
        this.trackingSprite = this.findClosestPowerup();
      }
      if (n > 20) {
        this.realTrack(
          this.trackingSprite.x + this.trackingSprite.vx * 10,
          this.trackingSprite.y + this.trackingSprite.vy * 10,
          false
        );
        return;
      }
      this.gotPowerup = true;
      this.storedSprite = this.trackingSprite;
      this.storedSprite.setLocation(this.x, this.y);
      this.storedSprite.shouldRemoveSelf = true;
    }
  }
}

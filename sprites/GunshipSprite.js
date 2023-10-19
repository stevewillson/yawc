import RotationalPolygon from "../RotationalPolygon.js";
import WHUtil from "../WHUtil.js";
import PowerupSprite from "./PowerupSprite.js";
import Sprite from "./Sprite.js";
import BulletSprite from "./BulletSprite.js";

export default class GunshipSprite extends Sprite {
  rPoly;
  rTurretPoly;
  bRightSeeker;
  static START_STRAFE = 0;
  static STRAFE = 1;
  static RETREAT = 2;
  static KAMIKAZE = 3;
  mode;
  strafeOffsetX;
  strafeOffsetY;
  retreatCounter;

  static points = [
    { x: 40, y: 0 },
    { x: 35, y: -6 },
    { x: 25, y: -11 },
    { x: 2, y: -15 },
    { x: -25, y: -15 },
    { x: -35, y: 0 },
    { x: -25, y: 15 },
    { x: 2, y: 15 },
    { x: 25, y: 11 },
    { x: 35, y: 6 },
  ];
  static turretPoints = [
    { x: 22, y: 0 },
    { x: -16, y: 0 },
  ];

  behave() {
    super.behave();
    let n = WHUtil.distanceFrom(this, this.game.user.userSprite);
    if (this.spriteCycle % 40 == 0 && this.bInDrawingRect) {
      for (let i = 0; i < GunshipSprite.turretPoints.length; i++) {
        let bulletSprite = new BulletSprite(
          this.rTurretPoly.polygon.xpoints[i] + this.x,
          this.rTurretPoly.polygon.ypoints[i] + this.y,
          2,
          10,
          this.color,
          1
        );
        bulletSprite.setSentByEnemy(this.slot, 12);
        let calcLead = this.calcLead();
        bulletSprite.setVelocity(
          6 * WHUtil.scaleVector(calcLead.x, calcLead.y),
          6 * WHUtil.scaleVector(calcLead.y, calcLead.x)
        );
        bulletSprite.addSelf();
      }
    }
    switch (this.mode) {
      case 0: {
        let n2 =
          (WHUtil.findAngle(
            this.game.user.userSprite.x,
            this.game.user.userSprite.y,
            this.x,
            this.y
          ) +
            (this.bRightSeeker ? 90 : -90)) *
          0.017453292519943295;
        this.strafeOffsetX = int(200 * Math.cos(n2));
        this.strafeOffsetY = int(200 * Math.sin(n2));
        this.mode = 1;
        break;
      }
      case 1: {
        let n3 = this.game.user.userSprite.x + this.strafeOffsetX;
        let n4 = this.game.user.userSprite.y + this.strafeOffsetY;
        let distance = WHUtil.distance(n3, n4, this.x, this.y);
        if (n < 120) {
          this.mode = 2;
        } else if (distance > 50) {
          this.realTrack(n3, n4, false);
        } else {
          this.mode = 2;
        }
        this.retreatCounter = 0;
        break;
      }
      case 2: {
        this.reverseTrack();
        if (this.retreatCounter++ > 200) {
          this.mode = 3;
          return;
        }
        if (this.health < 10) {
          this.mode = 3;
          return;
        }
        if (n > 400) {
          this.mode = 0;
          return;
        }
        break;
      }
      case 3: {
        this.track();
      }
    }
  }

  constructor(x, y, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.game = game;
    // start in track mode
    this.mode = 3;
    this.rPoly = new RotationalPolygon(GunshipSprite.points);
    this.rTurretPoly = new RotationalPolygon(GunshipSprite.turretPoints);
    this.init("gs", x, y, true);
    this.spriteType = 1;
    this.setHealth(50, 10);
    this.shapeType = 1;
    this.polygon = this.rPoly.polygon;
    this.bRightSeeker = WHUtil.randInt(2) == 0;
    this.dRotate = 2;
    this.thrust = 0.25;
    this.maxThrust = 4;
    this.powerupType = 12;

    this.color = this.game.colors.colors[this.slot][0];
  }

  drawSelf(context) {
    context.strokeStyle = this.color;
    super.drawSelf(context);
    context.translate(this.x, this.y);
    for (let i = 0; i < this.rTurretPoly.polygon.npoints; i++) {
      let x = this.rTurretPoly.polygon.xpoints[i];
      let y = this.rTurretPoly.polygon.ypoints[i];
      let gunAngle = WHUtil.findAngleRad(
        this.game.user.userSprite.x,
        this.game.user.userSprite.y,
        x + this.x,
        y + this.y
      );
      context.fillStyle = this.color;
      context.beginPath();
      context.moveTo(x, y);
      context.arc(
        x,
        y,
        8,
        gunAngle + Math.PI / 8,
        gunAngle - Math.PI / 8,
        true
      );
      context.lineTo(x, y);
      context.fill();

      context.beginPath();
      context.arc(x, y, 8, 0, 2 * Math.PI);
      context.stroke();
    }
    context.translate(-this.x, -this.y);
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      this.killSelf(20, 10);
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
    }
  }

  setDegreeAngle(degreeAngle) {
    super.setDegreeAngle(degreeAngle);
    this.rPoly.setAngle(this.radAngle);
    this.rTurretPoly.setAngle(this.radAngle);
    this.polygon = this.rPoly.polygon;
  }

  getShapeRect() {
    let bounds = this.polygon.getBounds();
    bounds.setLocation(this.x - bounds.width / 2, this.y - bounds.height / 2);
    return bounds;
  }
}

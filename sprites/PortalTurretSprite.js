import { WHUtil } from "../WHUtil.js";
import { BulletSprite } from "./BulletSprite.js";
import { Sprite } from "./Sprite.js";

export class PortalTurretSprite extends Sprite {
  g_points;
  g_turretPoints;
  rPoly;
  rTurretPoly;
  shotDelay;
  portal;
  static TURRET_ORBIT_DISTANCE = 115;
  static TURRET_ATTACK_DISTANCE = 260;
  static TURRET_ATTACK_DELAY = 16;
  static TURRET_D_ANGLE = 1;
  orbitAngle;
  static points = [
    [-28, 0, 1],
    [-7, -25, 0],
    [30, -40, 1],
    [15, -10, 0],
    [15, 10, 0],
    [30, 40, 1],
    [-7, 25, 0],
  ];
  static turretPoints = [
    [0, -11],
    [0, 11],
  ];

  behave() {
    super.behave();
    if (this.portal.shouldRemoveSelf) {
      this.killSelf(this.x, this.y);
      return;
    }
    this.handleOrbit();
    this.handleShot();
  }

  calcOrbit() {
    this.orbitAngle = super.radAngle + 1.5707963267948966;
    this.setLocation(
      int(this.portal.x + 115 * Math.cos(this.orbitAngle)),
      int(this.portal.y + 115 * Math.sin(this.orbitAngle))
    );
  }

  handleOrbit() {
    this.setDegreeAngle(super.angle + 1);
    this.calcOrbit();
  }

  constructor(portal, game) {
    super(0, 0, game);
    this.x = 0;
    this.y = 0;
    this.game = game;
    this.rPoly = new RotationalPolygon(PortalTurretSprite.g_points);
    this.rTurretPoly = new RotationalPolygon(PortalTurretSprite.g_turretPoints);
    this.portal = portal;
    this.calcOrbit();
    this.init("trt", this.x, this.y, true);
    super.spriteType = 1;
    this.setHealth(50, 7);
    super.shapeType = 1;
    super.polygon = this.rPoly.polygon;
    super.powerupType = 7;
  }

  drawSelf(context) {
    super.drawSelf(context);
    context.translate(this.x, this.y);
    for (let i = 0; i < this.rTurretPoly.polygon.npoints; i++) {
      let x = this.rTurretPoly.poly.xpoints[i];
      let y = this.rTurretPoly.poly.ypoints[i];
      context.fillStyle = this.color;
      context.strokeStyle = this.color;

      context.beginPath();
      context.arc(x, y, 8, 0, 2 * Math.PI);
      context.fill();

      let n3 = WHUtil.findAngle(
        Sprite.model.player.x,
        Sprite.model.player.y,
        n + this.x,
        n2 + this.y
      );
      context.fillStyle = "black";

      context.beginPath();
      // context.lineWidth = 1;
      context.arc(x, y, 8, -n3 - Math.PI / 9, (2 * Math.PI) / 9);
      context.fill();
    }
    context.translate(-this.x, -this.y);
    for (let i = 0; i < 3; i++) {
      context.beginPath();
      context.arc(
        this.portal.x + 115 * Math.cos(this.orbitAngle + i * 0.1),
        this.portal.x + 115 * Math.sin(this.orbitAngle + i * 0.1),
        3,
        0,
        2 * Math.PI
      );
      context.fill();
    }
  }

  handleShot() {
    if (this.shotDelay > 0) {
      this.shotDelay--;
    }
    if (
      this.bInDrawingRect &&
      this.shotDelay <= 0 &&
      WHUtil.distanceFrom(this, Sprite.model.player) < 260
    ) {
      if (Sprite.model.player == null) {
        return;
      }
      let calcLead = this.calcLead();
      this.shotDelay = 16;
      for (let i = 0; i < PortalTurretSprite.turretPoints.length; i++) {
        let bulletSprite = new BulletSprite(
          this.rTurretPoly.polygon.xpoints[i] + this.x,
          this.rTurretPoly.polygon.ypoints[i] + this.y,
          1,
          10,
          super.color,
          1
        );
        bulletSprite.setSentByEnemy(super.slot, 7);
        bulletSprite.setVelocity(
          8 * WHUtil.scaleVector(calcLead.x, calcLead.y),
          8 * WHUtil.scaleVector(calcLead.y, calcLead.x)
        );
        bulletSprite.addSelf();
      }
    }
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (super.shouldRemoveSelf) {
      this.killSelf(20, 10);
      PowerupSprite.genPowerup(this.x, this.y).addSelf();
      PowerupSprite.genPowerup(this.x, this.y).addSelf();
    }
  }

  setDegreeAngle(degreeAngle) {
    super.setDegreeAngle(degreeAngle);
    this.rPoly.setAngle(super.radAngle);
    this.rTurretPoly.setAngle(super.radAngle);
    super.polygon = this.rPoly.polygon;
  }

  getShapeRect() {
    bounds = this.polygon.getBounds();
    bounds.move(this.x - bounds.width / 2, this.y - bounds.height / 2);
    return bounds;
  }
}

import { RotationalPolygon } from "../RotationalPolygon.js";
import { WHUtil } from "../WHUtil.js";
import { BulletSprite } from "./BulletSprite.js";
import { PowerupSprite } from "./PowerupSprite.js";
import { Sprite } from "./Sprite.js";

export class PortalTurretSprite extends Sprite {
  static TURRET_ATTACK_DISTANCE = 260;
  static TURRET_ATTACK_DELAY = 16;
  static TURRET_D_ANGLE = 1;
  static points = [
    { x: -28, y: 0 },
    { x: -7, y: -25 },
    { x: 30, y: -40 },
    { x: 15, y: -10 },
    { x: 15, y: 10 },
    { x: 30, y: 40 },
    { x: -7, y: 25 },
  ];
  static turretPoints = [
    { x: 0, y: -11 },
    { x: 0, y: 11 },
  ];
  constructor(portal, game) {
    super(portal.x, portal.y, game);
    this.portal = portal;
    this.game = game;
    this.x = portal.x;
    this.y = portal.y;
    this.rotationalPolygon = new RotationalPolygon(PortalTurretSprite.points);
    this.rTurretPoly = new RotationalPolygon(PortalTurretSprite.turretPoints);
    this.calcOrbit();
    this.init("trt", this.x, this.y, true);
    super.spriteType = 1;
    this.setHealth(50);
    this.damage = 7;
    this.shapeType = 1;
    this.powerupType = 7;

    this.shotDelay = PortalTurretSprite.TURRET_ATTACK_DELAY;
    this.orbitAngle = undefined;

    // TODO - debug why the angle is not set
    this.radAngle = 0;
  }

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
    this.orbitAngle = this.radAngle + 1.5707963267948966;
    this.setLocation(
      this.portal.x + 115 * Math.cos(this.orbitAngle),
      this.portal.y + 115 * Math.sin(this.orbitAngle),
    );
  }

  handleOrbit() {
    this.setDegreeAngle(super.angle + 1);
    this.calcOrbit();
  }

  drawSelf(context) {
    super.drawSelf(context);
    context.translate(this.x, this.y);
    for (let i = 0; i < this.rTurretPoly.polygon.npoints; i++) {
      let x = this.rTurretPoly.polygon.xpoints[i];
      let y = this.rTurretPoly.polygon.ypoints[i];
      context.fillStyle = this.color;

      context.beginPath();
      context.arc(x, y, 8, 0, 2 * Math.PI);
      context.fill();

      let n3 = WHUtil.findAngle(
        this.game.user.userSprite.x,
        this.game.user.userSprite.y,
        x + this.x,
        y + this.y,
      );
      context.fillStyle = "black";

      context.beginPath();
      context.lineWidth = 1;
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
        2 * Math.PI,
      );
      context.fill();
    }
  }

  handleShot() {
    if (this.shotDelay > 0) {
      this.shotDelay--;
    }
    if (
      this.inDrawingRect &&
      this.shotDelay <= 0 &&
      WHUtil.distanceFrom(this, Sprite.model.player) < 260
    ) {
      if (this.game.user.userSprite == null) {
        return;
      }
      let calcLead = this.calcLead();
      this.shotDelay = 16;
      for (let i = 0; i < PortalTurretSprite.turretPoints.length; i++) {
        let bulletSprite = new BulletSprite(
          this.rTurretPoly.polygon.xpoints[i] + this.x,
          this.rTurretPoly.polygon.ypoints[i] + this.y,
          this.game,
          1,
          10,
          this.color,
          1,
        );
        bulletSprite.setSentByEnemy(super.slot, 7);
        bulletSprite.setVelocity(
          8 * WHUtil.scaleVector(calcLead.x, calcLead.y),
          8 * WHUtil.scaleVector(calcLead.y, calcLead.x),
        );
        bulletSprite.addSelf();
      }
    }
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      this.killSelf(20, 10);
      new PowerupSprite.genPowerup(this.x, this.y).addSelf();
      new PowerupSprite.genPowerup(this.x, this.y).addSelf();
    }
  }

  setDegreeAngle(degreeAngle) {
    super.setDegreeAngle(degreeAngle);
    this.rotationalPolygon.setAngle(this.radAngle);
    this.rTurretPoly.setAngle(this.radAngle);
  }

  getShapeRect() {
    let bounds = this.getPolygon().bounds;
    bounds.setLocation(this.x - bounds.width / 2, this.y - bounds.height / 2);
    return bounds;
  }
}

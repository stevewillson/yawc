import { Rectangle } from "../Rectangle.js";
import { RotationalPolygon } from "../RotationalPolygon.js";
import { WHUtil } from "../WHUtil.js";
import { BulletSprite } from "./BulletSprite.js";
import { PowerupSprite } from "./PowerupSprite.js";
import { Sprite } from "./Sprite.js";

export class PortalTurretSprite extends Sprite {
  static TURRET_ATTACK_DELAY = 16;
  static points = [
    [-28, 0],
    [-7, -25],
    [30, -40],
    [15, -10],
    [15, 10],
    [30, 40],
    [-7, 25],
  ];
  static turretPoints = [
    [0, -11],
    [0, 11],
  ];
  constructor(portal, game) {
    super(portal.x, portal.y, game);
    this.init("trt", this.x, this.y, true);
    this.shapeRect = new Rectangle(portal.x - 10, portal.y - 10, 20, 20);

    this.spriteType = 1;
    this.shapeType = 1;

    this.setHealth(50);
    this.damage = 7;

    this.powerupType = 7;

    this.rPoly = new RotationalPolygon(PortalTurretSprite.points);
    this.rTurretPoly = new RotationalPolygon(PortalTurretSprite.turretPoints);
    this.shotDelay = PortalTurretSprite.TURRET_ATTACK_DELAY;
    this.portal = portal;
    this.radAngle = 0;
    this.orbitAngle = undefined;
    this.inView = undefined;
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
        y + this.y
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
        2 * Math.PI
      );
      context.fill();
    }
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
      this.portal.y + 115 * Math.sin(this.orbitAngle)
    );
  }

  handleOrbit() {
    this.setDegreeAngle(this.angle + 1);
    this.calcOrbit();
  }

  handleShot() {
    if (this.shotDelay > 0) {
      this.shotDelay--;
    }
    if (
      this.inView &&
      this.shotDelay <= 0 &&
      WHUtil.distanceFrom(
        this.x,
        this.y,
        this.game.user.userSprite.x,
        this.game.user.userSprite.y
      ) < 260
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
          1
        );
        bulletSprite.setSentByEnemy(this.slot, 7);
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
    if (this.shouldRemoveSelf) {
      this.killSelf(20, 10);
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
    }
  }

  setDegreeAngle(degreeAngle) {
    super.setDegreeAngle(degreeAngle);
    this.rPoly.setAngle(this.radAngle);
    this.rTurretPoly.setAngle(this.radAngle);
  }

  getShapeRect() {
    let bounds = this.getPolygon().bounds;
    bounds.setLocation(this.x - bounds.width / 2, this.y - bounds.height / 2);
    return bounds;
  }
}

import Sprite from "./Sprite.js";
import Rectangle from "./Rectangle.js";

export default class UFOSprite extends Sprite {
  ufoW = 60;
  ufoH = 26;
  ufoW2 = 30;
  ufoH2 = 13;
  currentColor;

  constructor(location, game) {
    super(location, game);
    this.location = location;
    this.game = game;
    this.init("ufo", location.x, location.y, true);
    this.spriteType = 1;
    // TODO - update shape to bound the UFO
    this.shapeRect = new Rectangle(location.x - 30, location.y - 13, 60, 26);
    this.setHealth(40, 20);
    this.dRotate = 30;
    this.thrust = 0.2;
    this.maxThrust = 5;
    this.powerupType = 9;
  }

  drawSelf(context) {
    context.strokeStyle = this.color;
    context.beginPath();
    context.ellipse(
      this.location.x - 30,
      this.location.y - 13,
      60,
      26,
      0,
      0,
      2 * Math.PI
    );
    context.stroke();
    context.beginPath();
    context.strokeStyle =
      this.game.colors.colors[this.slot][this.currentColor++ % 20];

    context.ellipse(
      this.location.x - 18,
      this.location.y - 10,
      36,
      12,
      0,
      0,
      2 * Math.PI
    );
    context.fill();
    context.stroke();
    context.beginPath();
    context.strokeStyle = this.color;

    context.ellipse(
      this.location.x - 18,
      this.location.y - 10,
      36,
      12,
      0,
      0,
      2 * Math.PI
    );
    context.stroke();
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      this.killSelf(20, 10);
      // PowerupSprite.genPowerup(super.intx, super.inty).addSelf();
      // PowerupSprite.genPowerup(super.intx, super.inty).addSelf();
    }
  }

  behave() {
    super.behave();
    this.track();
    if (this.spriteCycle % 150 == 0) {
      for (let i = 0; i < 3; i++) {
        // let heatSeekerMissile = new HeatSeekerMissile(this.location, this.game);
        // heatSeekerMissile.addSelf();
        // heatSeekerMissile.setDegreeAngle(i * 120);
        // heatSeekerMissile.doMaxThrust(heatSeekerMissile.maxThrust);
      }
    }
  }
}

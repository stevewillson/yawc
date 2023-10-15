import Sprite from "./Sprite.js";
import Rectangle from "../Rectangle.js";
import PowerupSprite from "./PowerupSprite.js";

export default class UFOSprite extends Sprite {
  ufoW = 60;
  ufoH = 26;
  ufoW2 = 30;
  ufoH2 = 13;
  currentColor;

  constructor(x, y, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.game = game;
    this.init("ufo", x, y, true);
    this.spriteType = 1;
    this.shapeRect = new Rectangle(
      x - this.ufoW / 2,
      y - this.ufoH / 2,
      this.ufoW,
      this.ufoH
    );
    this.setHealth(40, 20);
    this.dRotate = 30;
    this.thrust = 0.2;
    this.maxThrust = 5;
    this.powerupType = 9;
  }

  drawSelf(context) {
    context.strokeStyle = this.color;
    context.beginPath();
    context.ellipse(this.x, this.y, this.ufoW, this.ufoH, 0, 0, 2 * Math.PI);
    context.stroke();
    context.beginPath();
    context.strokeStyle =
      this.game.colors.colors[this.slot][this.currentColor++ % 20];

    context.ellipse(
      this.x,
      this.y - this.ufoH / 2,
      this.ufoW * 0.6,
      this.ufoH * 0.6,
      0,
      0,
      2 * Math.PI
    );
    context.fill();
    context.stroke();
    context.beginPath();
    context.strokeStyle = this.color;

    context.ellipse(
      this.x,
      this.y - this.ufoH / 2,
      this.ufoW * 0.6,
      this.ufoH * 0.6,
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
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
      PowerupSprite.genPowerup(this.x, this.y, this.game).addSelf();
    }
  }

  behave() {
    super.behave();
    this.track();
    if (this.spriteCycle % 150 == 0) {
      for (let i = 0; i < 3; i++) {
        // let heatSeekerMissile = new HeatSeekerMissile(this.x, this.y, this.game);
        // heatSeekerMissile.addSelf();
        // heatSeekerMissile.setDegreeAngle(i * 120);
        // heatSeekerMissile.doMaxThrust(heatSeekerMissile.maxThrust);
      }
    }
  }
}

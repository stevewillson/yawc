import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class ParticleSprite extends Sprite {
  static GSTATES = 12;
  static MAX_CYCLE = 40;
  static PARTICLES = 20;

  constructor(x, y, game) {
    super(x, y, game);
    super.init("particles", x, y, true);
    super.shapeRect = new Rectangle(x - 70, y - 70, 140, 140);
    super.spriteType = 0;
    this.spriteCycle = 0;

    this.particles = undefined;
    this.maxVelocity = undefined;
    this.state = undefined;
    this.xArr = undefined;
    this.yArr = undefined;
    this.dx = undefined;
    this.dy = undefined;
  }

  drawSelf(context) {
    context.strokeStyle = "white";
    context.beginPath();
    for (let i = 0; i < this.particles; i++) {
      context.fillRect(
        this.xArr[i],
        this.yArr[i],
        12 - this.state[i],
        12 - this.state[i]
      );
    }
    context.stroke();
  }

  particleInit(particles, maxVelocity) {
    this.xArr = new Array(particles);
    this.yArr = new Array(particles);
    this.particles = particles;
    this.maxVelocity = maxVelocity;
    this.state = new Array(particles);
    this.dx = new Array(particles);
    this.dy = new Array(particles);
    for (let i = 0; i < particles; i++) {
      this.xArr[i] = this.x;
      this.yArr[i] = this.y;
      this.dx[i] = WHUtil.randInt(maxVelocity);
      this.dy[i] = WHUtil.randInt(maxVelocity);
      this.state[i] = 0;
    }
  }

  behave() {
    if (this.spriteCycle++ > 12) {
      this.shouldRemoveSelf = true;
      return;
    }
    for (let i = 0; i < this.particles; i++) {
      this.state[i]++;
      this.xArr[i] += this.dx[i];
      this.yArr[i] += this.dy[i];
    }
  }
}

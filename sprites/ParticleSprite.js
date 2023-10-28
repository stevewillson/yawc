import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class ParticleSprite extends Sprite {
  constructor(x, y, game, particles, maxVelocity) {
    super(x, y, game);
    super.init("particles", x, y, true);
    super.shapeRect = new Rectangle(x - 70, y - 70, 140, 140);

    super.spriteType = 0;

    this.particles = particles;
    this.maxVelocity = maxVelocity;

    this.xArr = new Array(particles);
    this.yArr = new Array(particles);
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

  drawSelf(context) {
    WHUtil.setColor(context, "white");
    context.beginPath();
    for (let i = 0; i < this.particles; i++) {
      context.fillRect(
        this.xArr[i],
        this.yArr[i],
        12 - this.state[i],
        12 - this.state[i],
      );
    }
  }

  behave() {
    if (this.spriteCycle++ > 12) {
      this.shouldRemoveSelf = true;
    } else {
      for (let i = 0; i < this.particles; i++) {
        this.state[i]++;
        this.xArr[i] += this.dx[i];
        this.yArr[i] += this.dy[i];
      }
    }
  }
}

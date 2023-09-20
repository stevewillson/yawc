import Sprite from "./Sprite.js";
import Rectangle from "./Rectangle.js";
import WHUtil from "./WHUtil.js";

export default class ParticleSprite extends Sprite {
  static GSTATES = 12;
  static MAX_CYCLE = 40;
  static PARTICLES = 20;
  location;
  game;
  x;
  y;
  shapeRect;
  particles;
  maxVelocity;
  x;
  y;
  state;
  dx;
  dy;
  spriteCycle;

  constructor(location, game) {
    super(location, game);
    this.location = location;
    this.game = game;
    super.init("particles", location.x, location.y, true);
    super.shapeRect = new Rectangle(location.x - 70, location.y - 70, 140, 140);
    super.spriteType = 0;
    this.spriteCycle = 0;
  }

  drawSelf(context) {
    context.strokeStyle = "white";
    context.beginPath();
    for (let i = 0; i < this.particles; ++i) {
      context.fillRect(
        this.x[i],
        this.y[i],
        12 - this.state[i],
        12 - this.state[i]
      );
    }
    context.stroke();
  }

  particleInit(particles, maxVelocity) {
    this.x = new Array(particles);
    this.y = new Array(particles);
    this.particles = particles;
    this.maxVelocity = maxVelocity;
    this.state = new Array(particles);
    this.dx = new Array(particles);
    this.dy = new Array(particles);
    for (let i = 0; i < particles; i++) {
      this.x[i] = this.location.x;
      this.y[i] = this.location.y;
      this.dx[i] = WHUtil.randInt() % maxVelocity;
      this.dy[i] = WHUtil.randInt() % maxVelocity;
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
      this.x[i] += this.dx[i];
      this.y[i] += this.dy[i];
    }
  }
}

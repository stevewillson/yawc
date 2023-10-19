import Sprite from "./Sprite.js";
import Rectangle from "../Rectangle.js";
import WHUtil from "../WHUtil.js";

export default class ShrapnelSprite extends Sprite {
  shrapnel;
  xArr;
  yArr;
  dx;
  dy;
  rotation;
  angle;
  len;
  static MAX_CYCLE = 200;

  constructor(x, y, game, n3, color, shrapnel = 10) {
    super(x, y, game);
    this.game = game;
    this.init("shrapnel", x, y, false);
    this.shrapnel = shrapnel;
    super.spriteType = 0;
    super.shapeRect = new Rectangle(0, 0);
    super.color = color;

    this.xArr = new Array(shrapnel);
    this.yArr = new Array(shrapnel);
    this.dx = new Array(shrapnel);
    this.dy = new Array(shrapnel);
    this.rotation = new Array(shrapnel);
    this.angle = new Array(shrapnel);
    this.len = new Array(shrapnel);
    for (let i = 0; i < this.shrapnel; i++) {
      this.xArr[i] = x + WHUtil.randInt(n3);
      this.yArr[i] = y + WHUtil.randInt(n3);
      this.dx[i] = WHUtil.randInt(3);
      this.dy[i] = WHUtil.randInt(3);
      this.rotation[i] = WHUtil.randInt(70) / 100;
      this.angle[i] = WHUtil.randInt(3) / 100;
      this.len[i] = WHUtil.randInt(3) + 4;
    }
  }

  drawSelf(context) {
    context.strokeStyle = this.color;
    for (let i = 0; i < this.shrapnel; i++) {
      let x = (this.len[i] * Math.cos(this.angle[i])) / 2;
      let y = (this.len[i] * Math.sin(this.angle[i])) / 2;
      context.beginPath();
      context.moveTo(this.xArr[i] - x, this.yArr[i] - y);
      context.lineTo(this.xArr[i] + x, this.yArr[i] + y);
      context.stroke();
    }
  }

  behave() {
    super.behave();
    if (super.spriteCycle++ > 200) {
      super.shouldRemoveSelf = true;
      return;
    }
    for (let i = 0; i < this.shrapnel; ++i) {
      this.angle[i] += this.rotation[i];
      this.xArr[i] += this.dx[i];
      this.yArr[i] += this.dy[i];
    }
  }
}
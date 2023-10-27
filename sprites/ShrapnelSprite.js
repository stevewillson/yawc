import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class ShrapnelSprite extends Sprite {
  constructor(x, y, game, n3, color, shrapnel = 10) {
    super(x, y, game);
    this.init("shrapnel", x, y, false);

    this.spriteType = 0;

    this.shrapnel = shrapnel;
    this.color = color;
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
      this.dx[i] = WHUtil.randInt(3) - 1;
      this.dy[i] = WHUtil.randInt(3) - 1;
      this.rotation[i] = WHUtil.randInt(70) / 100;
      this.angle[i] = WHUtil.randInt(3) / 100;
      this.len[i] = WHUtil.randInt(3) + 4;
    }
  }

  drawSelf(context) {
    context.lineWidth = 1;
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
    if (this.spriteCycle++ > 200) {
      this.shouldRemoveSelf = true;
      return;
    }
    for (let i = 0; i < this.shrapnel; i++) {
      this.angle[i] += this.rotation[i];
      this.xArr[i] += this.dx[i] - WHUtil.randInt(1);
      this.yArr[i] += this.dy[i] - WHUtil.randInt(1);
    }
  }
}

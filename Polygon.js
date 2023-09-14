import Rectangle from "./Rectangle.js";

export default class Polygon {
  constructor(xpoints = [], ypoints = [], npoints = 0) {
    this.xpoints = xpoints;
    this.ypoints = ypoints;
    this.npoints = npoints;

    //calculate the bounds of the polygon
    this.bounds = new Rectangle(
      Math.min(...xpoints),
      Math.min(...ypoints),
      Math.max(...xpoints),
      Math.max(...ypoints)
    );
  }

  getBounds() {
    return this.bounds;
  }

  drawPolygon(context, color) {
    context.beginPath();

    context.strokeStyle = color;
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(this.xpoints[0], this.ypoints[0]);

    for (let i = 0; i < this.npoints; i++) {
      context.lineTo(this.xpoints[i], this.ypoints[i]);
    }

    context.closePath();
    context.stroke();
  }
}

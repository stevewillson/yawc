import Rectangle from "./Rectangle.js";

export default class Polygon {
  constructor(xpoints = [], ypoints = [], npoints = 0) {
    this.xpoints = xpoints;
    this.ypoints = ypoints;
    this.npoints = npoints;
    this.updateBounds();
  }

  getBounds() {
    return this.bounds;
  }

  updateBounds() {
    //calculate the bounds of the polygon
    this.bounds = new Rectangle(
      Math.min(...this.xpoints),
      Math.min(...this.ypoints),
      Math.max(...this.xpoints) - Math.min(...this.xpoints),
      Math.max(...this.ypoints) - Math.min(...this.ypoints)
    );
  }

  addPoint(xval, yval) {
    this.xpoints.push(xval);
    this.ypoints.push(yval);
    this.npoints++;
    this.updateBounds();
  }

  drawPolygon(context, color = null) {
    context.beginPath();

    if (color != null) {
      context.strokeStyle = color;
    }
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(this.xpoints[0], this.ypoints[0]);

    for (let i = 0; i < this.npoints; i++) {
      context.lineTo(this.xpoints[i], this.ypoints[i]);
    }

    context.closePath();
    context.stroke();
  }

  contains(x, y) {
    // check if the x, y points are inside the rectangle
    if (
      this.bounds.x <= x &&
      this.bounds.x + this.bounds.width >= x &&
      this.bounds.y <= y &&
      this.bounds.y + this.bounds.height >= y
    ) {
      return true;
    }
    return false;
  }
}

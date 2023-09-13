import Polygon from "./Polygon.js";

export default class RotationalPolygon {
  constructor(points) {
    this.xpoints = [];
    this.ypoints = [];
    this.npoints = 0;

    this.distances = [];
    this.angles = [];

    this.currentAngle = 0;
    points.forEach((point) => {
      this.addIntPoint(point.x, point.y);
    });

    this.polygon = new Polygon(this.xpoints, this.ypoints, this.npoints);
  }

  getPolygon() {
    return this.polygon;
  }

  getBounds() {
    return this.polygon.getBounds();
  }

  addDistAnglePoint(distance, angle) {
    this.distances.push(distance);
    this.angles.push(angle * 0.017453292519943295);
    let x = Math.cos(this.angles[this.npoints]) * distance;
    let y = Math.sin(this.angles[this.npoints]) * distance;
    this.xpoints.push(x);
    this.ypoints.push(y);
    this.npoints++;
  }

  addIntPoint(xval, yval) {
    let i = Math.hypot(xval, yval);
    let d = Math.atan2(yval, xval) * 57.29577951308232;
    this.addDistAnglePoint(i, d);
  }

  rotate(angle) {
    this.setAngle((this.currentAngle + angle * 0.017453292519943295) % 360);
  }

  setAngle(angle) {
    if (angle == this.currentAngle) return;
    this.currentAngle = angle;
    this.currentAngle %= 360;
    for (let i = 0; i < this.npoints; i++) {
      this.xpoints[i] =
        Math.cos(this.angles[i] + this.currentAngle) * this.distances[i];
      this.ypoints[i] =
        Math.sin(this.angles[i] + this.currentAngle) * this.distances[i];
    }

    // update the polygon with the new points
    this.polygon = new Polygon(this.xpoints, this.ypoints, this.npoints);
  }
}

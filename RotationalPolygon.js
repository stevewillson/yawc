export default class RotationalPolygon {
  constructor(points) {
    this.xpoints = [];
    this.ypoints = [];
    this.numPoints = 0;

    this.distances = [];
    this.angles = [];

    this.currentAngle = 0;
    points.forEach((point) => {
      this.addIntPoint(point.x, point.y);
    });
  }

  addDistAnglePoint(distance, angle) {
    this.distances.push(distance);
    this.angles.push(angle * 0.017453292519943295);
    let x = Math.cos(this.angles[this.numPoints]) * distance;
    let y = Math.sin(this.angles[this.numPoints]) * distance;
    this.xpoints.push(x);
    this.ypoints.push(y);
    this.numPoints++;
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
    for (let b = 0; b < this.numPoints; b++) {
      this.xpoints[b] =
        Math.cos(this.angles[b] + this.currentAngle) * this.distances[b];
      this.ypoints[b] =
        Math.sin(this.angles[b] + this.currentAngle) * this.distances[b];
    }
  }
}

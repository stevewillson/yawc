import Rectangle from "./Rectangle";

export default class Polygon {
  constructor(xpoints = [], ypoints = [], npoints = 0) {
    this.xpoints = xpoints;
    this.ypoints = ypoints;
    this.npoints = npoints;

    //calculate the bounds of the polygon
    this.bounds = new Rectangle(
      Math.min(xpoints),
      Math.min(ypoints),
      Math.max(xpoints),
      Math.max(ypoints)
    );
  }

  getBounds() {
    return this.bounds;
  }
}

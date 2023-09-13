export default class Rectangle {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  setLocation(x, y) {
    this.x = x;
    this.y = y;
  }

  setDimensions(width, height) {
    this.width = width;
    this.height = height;
  }

  // TODO
  intersects(rect2) {
    return false;
  }

  // TODO
  isInside(rect2) {
    return false;
  }
}

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

  reshape(x, y, width, height) {
    this.setLocation(x, y);
    this.setDimensions(width, height);
  }

  // check if there is any overlap between the two rectangles
  intersects(rect2) {
    // get the corners of the two rects
    let lx1 = this.x;
    let uy1 = this.y;
    let rx1 = this.x + this.width;
    let by1 = this.y + this.height;

    let lx2 = rect2.x;
    let uy2 = rect2.y;
    let rx2 = rect2.x + rect2.width;
    let by2 = rect2.y + rect2.height;

    // upper left corner of the rect2 is within rect1
    if (lx1 <= lx2 && lx2 <= rx1) {
      if (uy1 <= uy2 && uy2 <= by1) {
        return true;
      }
    }

    // bottom right corner of the rect2 is within rect1
    if (lx1 <= rx2 && rx2 <= rx1) {
      if (uy1 <= by2 && by2 <= by1) {
        return true;
      }
    }

    // upper left corner of the rect1 is within rect2
    if (lx2 <= lx1 && lx1 <= rx2) {
      if (uy2 <= uy1 && uy1 <= by2) {
        return true;
      }
    }

    // bottom right corner of the rect1 is within rect2
    if (lx2 <= rx1 && rx1 <= rx2) {
      if (uy2 <= by1 && by1 <= by2) {
        return true;
      }
    }

    return false;
  }

  // TODO
  isInside(rect2) {
    return false;
  }
}

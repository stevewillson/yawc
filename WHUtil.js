import { Polygon } from "./Polygon.js";

export class WHUtil {
  static DTOR = 0.017453292519943295;
  static RTOD = 57.29577951308232;
  static target = [
    [-60, -60, -40, -60],
    [-60, -60, -60, -40],
    [-60, 60, -40, 60],
    [-60, 60, -60, 40],
    [60, -60, 40, -60],
    [60, -60, 60, -40],
    [60, 60, 40, 60],
    [60, 60, 60, 40],
  ];

  static randInt(number = Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * number);
  }

  static setColor(context, color) {
    context.fillStyle = color;
    context.strokeStyle = color;
  }

  static createPolygon(points) {
    let x = [];
    let y = [];
    for (let i = 0; i < points.length; i++) {
      x.push(points[i][0]);
      y.push(points[i][1]);
    }
    return new Polygon(x, y, points.length);
  }

  static symPolygon(numPoints, radius, rotation) {
    let polygon = new Polygon();
    for (let i = 0; i < numPoints; i++) {
      let n4 = rotation + (360 / numPoints) * i * WHUtil.DTOR;
      polygon.addPoint(radius * Math.cos(n4), radius * Math.sin(n4));
    }
    return polygon;
  }

  drawTarget(context, xOffset, yOffset) {
    for (let i = 0; i < WHUtil.target.length; i++) {
      context.moveTo(
        xOffset + WHUtil.target[i][0],
        yOffset + WHUtil.target[i][1]
      );
      context.lineTo(
        xOffset + WHUtil.target[i][2],
        yOffset + WHUtil.target[i][3]
      );
    }
  }

  static scaleVector(n, n2) {
    return n / Math.hypot(n, n2);
  }

  static findAngle(x1, y1, x2, y2) {
    return Math.atan2(y1 - y2, x1 - x2) * WHUtil.RTOD;
  }

  static findAngleRad(x1, y1, x2, y2) {
    return Math.atan2(y1 - y2, x1 - x2);
  }

  static drawBoundCircle(context, x, y, radius, color, color2) {
    context.beginPath();
    context.fillStyle = color2;
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();

    context.strokeStyle = color;
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
  }

  static drawCenteredCircle(context, x, y, radius) {
    context.beginPath();
    context.lineWidth = 1;
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
  }

  static drawScaledPoly(context, polygon, scale) {
    if (scale == 1) {
      polygon.drawPolygon(context);
      return;
    }
    context.beginPath();
    let i = polygon.xpoints[0] * scale;
    let j = polygon.ypoints[0] * scale;
    for (let b = 1; b < polygon.npoints; b++) {
      let k = polygon.xpoints[b] * scale;
      let m = polygon.ypoints[b] * scale;
      context.moveTo(i, j);
      context.lineTo(k, m);
      i = k;
      j = m;
    }
    context.moveTo(i, j);
    context.lineTo(polygon.xpoints[0] * scale, polygon.ypoints[0] * scale);
    context.stroke();
  }

  static distanceFrom(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
  }

  // get an RGB value from a named color
  // https://css-tricks.com/converting-color-spaces-in-javascript/
  static nameToRGB(name) {
    // Create fake div
    let fakeDiv = document.createElement("div");
    fakeDiv.style.color = name;
    document.body.appendChild(fakeDiv);

    // Get color of div
    let cs = window.getComputedStyle(fakeDiv),
      pv = cs.getPropertyValue("color");

    // Remove div after obtaining desired color value
    document.body.removeChild(fakeDiv);

    return pv;
  }
}

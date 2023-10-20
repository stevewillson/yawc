import { Polygon } from "./Polygon.js";

export class WHUtil {
  static DTOR = 0.017453292519943295;
  static RTOD = 57.29577951308232;
  static DIST = 60;
  static IN = 40;
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
    return parseInt(Math.random() * Number.MAX_SAFE_INTEGER) % number;
  }

  static createPolygon(points) {
    let x = [];
    let y = [];
    points.forEach((point) => {
      x.push(point.x);
      y.push(point.y);
    });
    let polygon = new Polygon(x, y, x.length);
    return polygon;
  }

  static drawRect(context, rectangle) {
    context.beginPath();
    context.strokeRect(
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height
    );
    context.stroke();
  }

  static symPolygon(n, n2, n3) {
    let polygon = new Polygon();
    for (let i = 0; i < n; i++) {
      let n4 = n3 + (360 / n) * i * 0.017453292519943295;
      polygon.addPoint(n2 * Math.cos(n4), n2 * Math.sin(n4));
    }
    return polygon;
  }

  // fillRect(context, rectangle) {
  //   context.fillRect(
  //     rectangle.x,
  //     rectangle.y,
  //     rectangle.width,
  //     rectangle.height
  //   );
  // }

  drawTarget(context, n, n2) {
    for (let i = 0; i < WHUtil.g_target.length; ++i) {
      context.moveTo(n + WHUtil.target[i][0], n2 + WHUtil.target[i][1]);
      context.lineTo(n + WHUtil.target[i][2], n2 + WHUtil.target[i][3]);
    }
  }

  static scaleVector(n, n2) {
    return n / Math.hypot(n, n2);
  }

  static fillCenteredArc(
    context,
    x,
    y,
    radius,
    startAngle = 0,
    arcAngle = 2 * Math.PI
  ) {
    context.beginPath();
    // context.lineWidth = 1;
    context.arc(x, y, radius, startAngle, arcAngle);
    context.fill();
  }

  static findAngle(x1, y1, x2, y2) {
    return Math.atan2(y1 - y2, x1 - x2) * 57.29577951308232;
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

  static fillCenteredCircle(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
  }

  static drawBoundRect(context, x, y, width, height, color1, color2) {
    context.fillStyle = color2;
    context.fillRect(x, y, width, height);
    context.strokeStyle = color1;
    context.strokeRect(x, y, width, height);
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

  // isPolygonIntersect(paramPolygon1, paramPolygon2) {
  //   let b;
  //   for (b = 0; b < paramPolygon1.npoints; b++) {
  //     if (
  //       paramPolygon2.contains(
  //         paramPolygon1.xpoints[b],
  //         paramPolygon1.ypoints[b]
  //       )
  //     ) {
  //       return true;
  //     }
  //   }
  //   for (b = 0; b < paramPolygon2.npoints; b++) {
  //     if (
  //       paramPolygon1.contains(
  //         paramPolygon2.xpoints[b],
  //         paramPolygon2.ypoints[b]
  //       )
  //     ) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // isPolygonIntersect(
  //   paramPolygon1,
  //   paramPolygon2,
  //   paramInt1,
  //   paramInt2,
  //   paramInt3,
  //   paramInt4
  // ) {
  //   let b;
  //   for (b = 0; b < paramPolygon1.npoints; b++) {
  //     System.out.println(
  //       "test: " +
  //         (paramPolygon1.xpoints[b] + paramInt1) +
  //         "y: " +
  //         (paramPolygon1.ypoints[b] + paramInt2)
  //     );
  //     if (
  //       paramPolygon2.contains(
  //         paramPolygon1.xpoints[b] + paramInt1,
  //         paramPolygon1.ypoints[b] + paramInt2
  //       )
  //     ) {
  //       return true;
  //     }
  //   }
  //   for (b = 0; b < paramPolygon2.npoints; b++) {
  //     System.out.println(
  //       "test: " +
  //         (paramPolygon2.xpoints[b] + paramInt3) +
  //         "Y: " +
  //         (paramPolygon2.ypoints[b] + paramInt4)
  //     );
  //     if (
  //       paramPolygon1.contains(
  //         paramPolygon2.xpoints[b] + paramInt3,
  //         paramPolygon2.ypoints[b] + paramInt4
  //       )
  //     ) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // check if a rectangle is inside another rectangle
  inside(paramRectangle1, paramRectangle2) {
    return !(
      !paramRectangle2.inside(paramRectangle1.x, paramRectangle1.y) ||
      !paramRectangle2.inside(
        paramRectangle1.x + paramRectangle1.width,
        paramRectangle1.y + paramRectangle1.height
      )
    );
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

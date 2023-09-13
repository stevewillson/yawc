export default class WHUtil {
  DTOR = 0.017453292519943295;

  RTOD = 57.29577951308232;

  DIST = 60;

  IN = 40;

  // implement later
  // target indicator around objects
  //    g_target = { { -60, -60, -40, -60 }, { -60, -60, -60, -40 }, { -60, 60, -40, 60 }, { -60, 60, -60, 40 }, { 60, -60, 40, -60 }, { 60, -60, 60, -40 }, { 60, 60, 40, 60 }, { 60, 60, 60, 40 } };
  static randInt() {
    return parseInt(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  drawRect(paramGraphics, paramRectangle) {
    paramGraphics.drawRect(
      paramRectangle.x,
      paramRectangle.y,
      paramRectangle.width,
      paramRectangle.height
    );
  }

  symPolygon(paramInt1, paramInt2, paramInt3) {
    let polygon = new Polygon();
    let d = 0.0;
    for (let b = 0; b < paramInt1; b++) {
      d = paramInt3 + (360 / paramInt1) * b * 0.017453292519943295;
      let i = int(paramInt2 * Math.cos(d));
      let j = int(paramInt2 * Math.sin(d));
      polygon.addPoint(i, j);
    }
    return polygon;
  }

  fillRect(paramGraphics, paramRectangle) {
    paramGraphics.fillRect(
      paramRectangle.x,
      paramRectangle.y,
      paramRectangle.width,
      paramRectangle.height
    );
  }

  drawTarget(paramGraphics, paramInt1, paramInt2) {
    for (let b = 0; b < g_target.length; b++)
      paramGraphics.drawLine(
        paramInt1 + g_target[b][0],
        paramInt2 + g_target[b][1],
        paramInt1 + g_target[b][2],
        paramInt2 + g_target[b][3]
      );
  }

  drawPoly(paramGraphics, paramPolygon) {
    paramGraphics.drawPolygon(
      paramPolygon.xpoints,
      paramPolygon.ypoints,
      paramPolygon.npoints
    );
  }

  scaleVector(paramDouble1, paramDouble2) {
    return paramDouble1 / Math.hypot(paramDouble1, paramDouble2);
  }

  fillCenteredArc(
    paramGraphics,
    paramDouble1,
    paramDouble2,
    paramInt1,
    paramInt2,
    paramInt3
  ) {
    paramGraphics.fillArc(
      paramDouble1 - paramInt1,
      paramDouble2 - paramInt1,
      paramInt1 * 2,
      paramInt1 * 2,
      paramInt2,
      paramInt3
    );
  }

  findAngle(paramDouble1, paramDouble2, paramDouble3, paramDouble4) {
    return (
      Math.atan2(paramDouble2 - paramDouble4, paramDouble1 - paramDouble3) *
      57.29577951308232
    );
  }

  drawBoundCircle(
    paramGraphics,
    paramInt1,
    paramInt2,
    paramInt3,
    paramColor1,
    paramColor2
  ) {
    paramGraphics.setColor(paramColor2);
    paramGraphics.fillOval(paramInt1, paramInt2, paramInt3, paramInt3);
    paramGraphics.setColor(paramColor1);
    paramGraphics.drawOval(paramInt1, paramInt2, paramInt3, paramInt3);
  }

  static drawCenteredCircle(context, x, y, radius, color) {
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.stroke();
  }

  drawBoundRect(
    paramGraphics,
    paramInt1,
    paramInt2,
    paramInt3,
    paramInt4,
    paramColor1,
    paramColor2
  ) {
    paramGraphics.setColor(paramColor2);
    paramGraphics.fillRect(paramInt1, paramInt2, paramInt3, paramInt4);
    paramGraphics.setColor(paramColor1);
    paramGraphics.drawRect(paramInt1, paramInt2, paramInt3, paramInt4);
  }

  drawScaledPoly(paramGraphics, paramPolygon, paramDouble) {
    if (paramDouble == 1.0) {
      drawPoly(paramGraphics, paramPolygon);
      return;
    }
    let i = paramPolygon.xpoints[0] * paramDouble;
    let j = paramPolygon.ypoints[0] * paramDouble;
    for (let b = 1; b < paramPolygon.npoints; b++) {
      let k = int(paramPolygon.xpoints[b] * paramDouble);
      let m = int(paramPolygon.ypoints[b] * paramDouble);
      paramGraphics.drawLine(i, j, k, m);
      i = k;
      j = m;
    }
    paramGraphics.drawLine(
      i,
      j,
      int(paramPolygon.xpoints[0] * paramDouble),
      int(paramPolygon.ypoints[0] * paramDouble)
    );
  }

  fillCenteredCircle(paramGraphics, paramDouble1, paramDouble2, paramInt) {
    paramGraphics.fillOval(
      paramDouble1 - paramInt,
      paramDouble2 - paramInt,
      paramInt * 2,
      paramInt * 2
    );
  }

  isPolygonIntersect(paramPolygon1, paramPolygon2) {
    let b;
    for (b = 0; b < paramPolygon1.npoints; b++) {
      if (
        paramPolygon2.inside(paramPolygon1.xpoints[b], paramPolygon1.ypoints[b])
      )
        return true;
    }
    for (b = 0; b < paramPolygon2.npoints; b++) {
      if (
        paramPolygon1.inside(paramPolygon2.xpoints[b], paramPolygon2.ypoints[b])
      )
        return true;
    }
    return false;
  }

  isPolygonIntersect(
    paramPolygon1,
    paramPolygon2,
    paramInt1,
    paramInt2,
    paramInt3,
    paramInt4
  ) {
    let b;
    for (b = 0; b < paramPolygon1.npoints; b++) {
      System.out.println(
        "test: " +
          (paramPolygon1.xpoints[b] + paramInt1) +
          "y: " +
          (paramPolygon1.ypoints[b] + paramInt2)
      );
      if (
        paramPolygon2.contains(
          paramPolygon1.xpoints[b] + paramInt1,
          paramPolygon1.ypoints[b] + paramInt2
        )
      )
        return true;
    }
    for (b = 0; b < paramPolygon2.npoints; b++) {
      System.out.println(
        "test: " +
          (paramPolygon2.xpoints[b] + paramInt3) +
          "Y: " +
          (paramPolygon2.ypoints[b] + paramInt4)
      );
      if (
        paramPolygon1.contains(
          paramPolygon2.xpoints[b] + paramInt3,
          paramPolygon2.ypoints[b] + paramInt4
        )
      )
        return true;
    }
    return false;
  }

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

  distanceFrom(location1, location2) {
    return distance(location1.x, location1.y, location2.x, location2.y);
  }

  distance(pt1x, pt1y, pt2x, pt2y) {
    return Math.hypot(pt1x - pt2x, pt1y - pt2y);
  }

  // reference https://hackernoon.com/using-javascript-to-create-and-generate-uuids
  static uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}

import Rectangle from "./Rectangle.js";
import WHUtil from "./WHUtil.js";

export default class Sprite {
  constructor(location = { x: 0, y: 0 }, model = null) {
    // this.location = null;
    // this.setLocation(location.x, location.y);

    // used to track the location of the sprite
    this.location = location;
    // this.intx = null;
    // this.inty = null;

    this.polygon;

    this.collisionType = null;
    this.bIsBulthis = null;
    this.bIsHeatSeeker = null;
    this.bSentByPlayer = null;
    this.slot = 8;
    this.color = "white";
    this.allIndex = [];
    this.secondaryIndex = null;
    // used to share a common list of sprites in the model
    this.model = model;
    this.name = null;
    this.type = null;

    // handle rotation
    this.dRotate = 0;
    this.isRotating = false;

    this.spriteType = null;
    this.powerupType = null;
    this.spriteCycle = 0;
    this.shouldRemoveSelf = null;

    this.bounded = false;
    this.bZappable = null;

    this.bInDrawingRect = null;
    this.shapeRect = null;
    this.boundingRect = new Rectangle(
      0,
      0,
      model.world.width,
      model.world.height
    );

    this.shapeType = 0;
    this.REBOUND_COEFF = -0.5;
    this.dVector = [];

    //initialize the angle and the radAngle for the ship
    this.angle = 0;
    this.radAngle = 0;

    // handles the speed of the ship
    this.velocity = { x: 0, y: 0 };

    this.maxThrust;
    this.maxVelocity;
    this.g_centerX;
    this.g_centerY;
    this.indestructible = false;

    this.health = 1;
    this.damage = 1;
    this.bUseHealth;

    this.hasCollided = false;
    this.collidedObject = null;

    this.MAX_HEALTH;
    this.images;
    this.heights;
    this.widths;
    this.numImages = 0;
    this.currentFrame = 0;
    this.cachedWidth;
    this.cachedHeight;
    this.thrust;
    this.leadPoint;
    // used to specify which sprite we are referring to
    this.uuid = WHUtil.uuid();
    // need to have a secure browser context to use this method
    // this.uuid = crypto.randomUUID();
  }

  // getShapeRect() {
  //   return this.shapeRect;
  // }

  addSelf() {
    switch (this.spriteType) {
      case 2:
        // may not need to keep track of the secondaryIndex because we will track them by a uuid
        // this.secondaryIndex =
        this.model.goodGuys.push(this);
        break;
      case 1:
        // this.secondaryIndex =
        this.model.badGuys.push(this);
        break;
    }
    // this.allIndex =
    this.model.allSprites.push(this);
  }

  distanceFrom(sprite) {
    return WHUtil.distance(this.intx, this.inty, sprite.intx, sprite.inty);
  }

  /**
   *
   * @param thrustAmount
   * @description sets the x/y velocity of the Sprite based on the angle of the thrust
   */
  doMaxThrust(thrustAmount) {
    let vectorx = Math.cos(this.radAngle) * thrustAmount + this.velocity.x;
    let vectory = Math.sin(this.radAngle) * thrustAmount + this.velocity.y;
    let hyp = Math.hypot(vectorx, vectory);
    if (hyp > this.maxThrust) {
      this.velocity.x = (this.maxThrust * vectorx) / hyp;
      this.velocity.y = (this.maxThrust * vectory) / hyp;
    } else {
      this.velocity.x = vectorx;
      this.velocity.y = vectory;
    }
  }

  handleCrash() {}

  reverseTrack() {
    realTrack(model.player.intx, model.player.inty, true);
  }

  oob() {
    // check if the ship is outside of the bounds of the board
    return (
      this.location.x < 0 ||
      this.location.x > this.boundingRect.width ||
      this.location.y < 0 ||
      this.location.y > this.boundingRect.height
    );
  }

  handleRebound() {
    let width = this.boundingRect.width;
    let height = this.boundingRect.height;
    let x = this.location.x;
    let y = this.location.y;
    if (x < 0) {
      x = 1;
      this.velocity.x *= -0.5;
    } else if (x >= width) {
      x = width - 1;
      this.velocity.x *= -0.5;
    }
    if (y < 0) {
      y = 1;
      this.velocity.y *= -0.5;
    } else if (y >= height) {
      y = height - 1;
      this.velocity.y *= -0.5;
    }
    this.setLocation(x, y);
    this.setVelocity(this.velocity.x, this.velocity.y);
  }

  removeSelf() {
    // go through the list and check for a sprite with the same uuid
    // if found, remove it
    // model.allSprites.remove(this.allIndex);
    this.model.allSprites = this.model.allSprites.filter(
      (el) => el.uuid != this.uuid
    );
    switch (this.spriteType) {
      case 2:
        // model.goodGuys.remove(this.secondaryIndex);
        this.model.goodGuys = this.model.goodGuys.filter(
          (el) => el.uuid != this.uuid
        );
        return;
      case 1:
        this.model.badGuys = this.model.badGuys.filter(
          (el) => el.uuid != this.uuid
        );
        // model.badGuys.remove(this.secondaryIndex);
        return;
    }
  }

  drawImage(paramGraphics) {
    if (this.currentFrame >= this.numImages) return;
    paramGraphics.drawImage(
      this.images[this.currentFrame],
      this.intx - this.cachedWidth,
      this.inty - this.cachedHeight,
      null
    );
  }

  // moveTowards(paramInt1, paramInt2, paramDouble) {
  //   calcTowards(paramInt1, paramInt2, paramDouble);
  //   this.velocity.x = this.dVector[0];
  //   this.velocity.y = this.dVector[1];
  //   move(this.velocity);
  // }

  decel(decelAmount) {
    if (Math.abs(this.velocity.x) < 0.05) this.velocity.x = 0.0;
    if (Math.abs(this.velocity.y) < 0.05) this.velocity.y = 0.0;
    this.velocity.x *= decelAmount;
    this.velocity.y *= decelAmount;
  }

  /**
   * move the sprite around the map
   */
  move(velocity) {
    this.setLocation(
      this.location.x + velocity.x,
      this.location.y + velocity.y
    );
    if (this.bounded) {
      this.handleRebound();
    } else if (this.oob()) {
      this.handleCrash();
    }

    if (this.shapeRect != null) {
      // moving the shaperect, for use in collisions?
      this.shapeRect.setLocation(
        this.location.x - this.shapeRect.width / 2,
        this.location.y - this.shapeRect.height / 2
      );
      // this.myr = this.shapeRect;
    }
  }

  behave() {
    this.move(this.velocity);
    this.spriteCycle++;
    // if (this.hasCollided || (!this.bounded && !inGlobalBounds())) {
    //   this.shouldRemoveSelf = true;
    // }
  }

  setPlayer(paramByte) {
    setPlayer(paramByte, g_colors[paramByte][0]);
  }

  setPlayer(paramByte, paramColor) {
    this.slot = paramByte;
    this.color = paramColor;
    this.bSentByPlayer = true;
  }

  isRectPolyCollision(paramSprite1, paramSprite2) {
    let rectangle = paramSprite1.shapeRect;
    let polygon = paramSprite2.poly;
    if (rectangle == null || polygon == null) return false;
    let bool = false;
    if (paramSprite2.getShapeRect().intersects(rectangle)) {
      let polygon1 = new Polygon();
      for (let b = 0; b < polygon.npoints && !bool; b++) {
        polygon1.addPoint(
          polygon.xpoints[b] + paramSprite2.intx,
          polygon.ypoints[b] + paramSprite2.inty
        );
        if (
          rectangle.inside(
            polygon.xpoints[b] + paramSprite2.intx,
            polygon.ypoints[b] + paramSprite2.inty
          )
        )
          bool = true;
      }
      if (!bool)
        bool =
          !polygon1.contains(rectangle.x, rectangle.y) &&
          !polygon1.contains(rectangle.x + rectangle.width, rectangle.y) &&
          !polygon1.contains(rectangle.x, rectangle.y + rectangle.height) &&
          !polygon1.contains(
            rectangle.x + rectangle.width,
            rectangle.y + rectangle.height
          )
            ? false
            : true;
    }
    return bool;
  }

  isCollision(paramSprite) {
    switch (paramSprite.shapeType + this.shapeType) {
      case 0:
        return isRectCollision(paramSprite);
      case 1:
        return paramSprite.shapeType == 0
          ? isRectPolyCollision(paramSprite, this)
          : isRectPolyCollision(this, paramSprite);
      case 2:
        return isPolyCollision(paramSprite);
    }
    return false;
  }

  calcLead() {
    if (this.leadPoint == null) this.leadPoint = new Point();
    let playerSprite = model.player;
    this.leadPoint.x = int(
      playerSprite.x + playerSprite.vectorx * 15.0 - this.x
    );
    this.leadPoint.y = int(
      playerSprite.y + playerSprite.vectory * 15.0 - this.y
    );
    return this.leadPoint;
  }

  rotate(rotationDegrees) {
    this.setDegreeAngle(this.angle + rotationDegrees);
  }

  getShapePoly() {
    return this.polygon;
  }

  drawFlag(paramGraphics, paramColor, paramInt1, paramInt2) {
    if (paramColor != null) {
      paramGraphics.setColor(paramColor);
      paramGraphics.fillRect(paramInt1, paramInt2, 10, 7);
      paramGraphics.drawLine(
        paramInt1,
        paramInt2 + 7,
        paramInt1,
        paramInt2 + 14
      );
    }
  }

  killSelf(paramInt1, paramInt2) {
    this.shouldRemoveSelf = true;
    new ExplosionSprite(this.intx, this.inty, this.slot).addSelf();
    if (paramInt1 > 0) {
      let particleSprite = new ParticleSprite(this.intx, this.inty);
      particleSprite.particleInit(paramInt1, paramInt2);
      particleSprite.addSelf();
    }
  }

  drawSelf() {
    let polygon = this.getShapePoly();

    if (this.color != null) {
      paramGraphics.setColor(this.color);
    } else {
      paramGraphics.setColor(Color.green);
    }
    if (polygon != null) {
      this.model.context.translate(this.location.x, this.location.y);

      paramGraphics.drawPolygon(
        polygon.xpoints,
        polygon.ypoints,
        polygon.npoints
      );

      paramGraphics.translate(-this.location.x, -this.location.y);
    }
    if (this.bSentByPlayer)
      drawFlag(
        paramGraphics,
        this.color,
        this.shapeRect.x + this.shapeRect.width + 5,
        this.shapeRect.y + this.shapeRect.height + 5
      );
  }

  // calcTowards(paramInt1, paramInt2, paramDouble) {
  //   let d1 = paramInt1 - this.location.x;
  //   let d2 = paramInt2 - this.location.y;
  //   let d3 = Math.hypot(d1, d2);
  //   this.dVector[0] = (paramDouble * d1) / d3;
  //   this.dVector[1] = (paramDouble * d2) / d3;
  // }

  // used to set up the global bounds for the map - consider moving this to the model constructor
  // setGlobalBounds(width, height) {
  //   globalBoundingRect = new Rectangle(0, 0, paramInt1, paramInt2);
  //   g_centerX = paramInt1 / 2;
  //   g_centerY = paramInt2 / 2;
  // }

  realTrack(paramInt1, paramInt2, paramBoolean) {
    if (model.player.shouldRemoveSelf) return;
    let d1 =
      (WHUtil.findAngle(paramInt1, paramInt2, this.x, this.y) +
        (paramBoolean ? "´" : "Ũ")) %
      360.0;
    let d2 = this.dRotate;
    let d3 = d1 - this.angle;
    if (Math.abs(d3) <= this.dRotate) {
      d2 = d3;
    } else if (Math.abs(d3) <= 180.0) {
      if (d3 < 0.0) d2 = -this.dRotate;
    } else if (d3 > 0.0) {
      d2 = -this.dRotate;
    }
    this.rotate(d2);
    this.doMaxThrust(this.thrust);
  }

  setCollided(paramSprite) {
    if (!this.indestructible) {
      this.hasCollided = true;
      this.collidedObject = paramSprite;
      if (this.bUseHealth) {
        this.changeHealth(-paramSprite.damage);
        if (this.health < 1) {
          this.shouldRemoveSelf = true;
          return;
        }
        this.hasCollided = false;
      }
    }
  }

  isPolyCollision(paramSprite) {
    let polygon = paramSprite.getShapePoly();
    if (polygon == null || this.poly == null) return false;
    let i = this.intx - paramSprite.intx;
    let j = this.inty - paramSprite.inty;
    let b;
    for (b = 0; b < this.poly.npoints; b++) {
      if (polygon.contains(this.poly.xpoints[b] - i, this.poly.ypoints[b] - j))
        return true;
    }
    for (b = 0; b < polygon.npoints; b++) {
      if (this.poly.contains(polygon.xpoints[b] + i, polygon.ypoints[b] + j))
        return true;
    }
    return false;
  }

  setVelocity(x, y) {
    this.velocity.x = x;
    this.velocity.y = y;
  }

  isRectCollision(paramSprite) {
    let rectangle1 = paramSprite.shapeRect;
    let rectangle2 = this.shapeRect;
    return rectangle1 == null && rectangle2 == null
      ? false
      : rectangle1 == null && rectangle2 != null
      ? rectangle2.inside(paramSprite.intx, paramSprite.inty)
      : rectangle2 == null
      ? rectangle1.inside(this.intx, this.inty)
      : rectangle1.intersects(rectangle2);
  }

  inViewingRect(paramRectangle) {
    return this.shapeRect == null
      ? false
      : this.shapeRect.intersects(paramRectangle);
  }

  // find out how arena checks for where the ship is
  // inGlobalBounds() {
  //   return !(
  //     globalBoundingRect == null ||
  //     !globalBoundingRect.inside(this.intx, this.inty)
  //   );
  // }

  setImages(paramArrayOfImage, paramInt) {
    this.images = paramArrayOfImage;
    this.numImages = paramInt;
    this.cachedWidth = paramArrayOfImage[0].getWidth(null) / 2;
    this.cachedHeight = paramArrayOfImage[0].getHeight(null) / 2;
  }

  init(spriteName, x, y, isBounded) {
    this.setLocation(x, y);
    this.name = spriteName;
    // this.boundingRect = globalBoundingRect;
    this.bounded = isBounded;
  }

  track() {
    if (model.player != null)
      realTrack(model.player.intx, model.player.inty, false);
  }

  setHealth(health, damage) {
    this.bUseHealth = true;
    this.health = health;
    this.damage = damage;
    this.MAX_HEALTH = this.health;
  }

  changeHealth(amount) {
    this.health += amount;

    if (this.health < 0) {
      this.health = 0;
    }
    if (this.health > this.MAX_HEALTH) {
      this.health = this.MAX_HEALTH;
    }
  }

  setDegreeAngle(n) {
    this.angle = (n + 360.0) % 360.0;
    this.radAngle = this.angle * 0.017453292519943295;
  }

  setLocation(x, y) {
    this.location.x = x;
    this.location.y = y;
  }
}

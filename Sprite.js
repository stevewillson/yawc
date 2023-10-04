import Rectangle from "./Rectangle.js";
import WHUtil from "./WHUtil.js";
// import ExplosionSprite from "./ExplosionSprite.js";
import Polygon from "./Polygon.js";

export default class Sprite {
  static REBOUND_COEFF = -0.5;
  colors;
  location;
  velocity;
  polygon;
  slot;
  name;
  type;
  uuid;
  shapeRect;

  bZappable;

  isInDrawingRect;
  spriteType;
  powerupType;

  collisionType;
  bIsBulthis;
  bIsHeatSeeker;
  bSentByUser;
  shouldRemoveSelf;

  maxThrust;
  maxVelocity;
  bUseHealth;
  collidedObject;

  thrust;
  leadPoint;

  MAX_HEALTH;
  images;

  constructor(location, game) {
    // used to track the location of the sprite
    this.location = location;
    this.game = game;

    this.slot = 8;

    // handle rotation
    this.dRotate = 0;
    this.isRotating = false;

    this.spriteCycle = 0;
    this.bounded = false;

    // set up the shape rect for the sprite, use the x,y coordinates and then offset by the bounding box of the polygon
    // this.shapeRect;
    // this.boundingRect = new Rectangle(
    //   0,
    //   0,
    //   game.world.width,
    //   game.world.height
    // );

    this.shapeType = 0;
    this.dVector = [];

    //initialize the angle and the radAngle for the ship
    this.angle = 0;
    this.radAngle = 0;

    // the speed of the ship
    this.velocity = { x: 0, y: 0 };

    this.indestructible = false;
    this.hasCollided = false;

    this.health = 1;
    this.damage = 1;

    // this.heights;
    // this.widths;
    this.numImages = 0;
    this.currentFrame = 0;
    // this.cachedWidth;
    // this.cachedHeight;

    this.shouldRemoveSelf = false;

    // used to specify which sprite we are referring to
    this.uuid = WHUtil.uuid();
    // need to have a secure browser context to use this method
    // this.uuid = crypto.randomUUID();
  }

  getShapeRect() {
    return this.shapeRect;
  }

  addSelf() {
    if (this.spriteType == 1) {
      this.game.badGuys.push(this);
    } else if (this.spriteType == 2) {
      this.game.goodGuys.push(this);
    }
    this.game.allSprites.push(this);
  }

  distanceFrom(sprite) {
    return WHUtil.distance(
      this.location.x,
      this.location.y,
      sprite.location.x,
      sprite.location.y
    );
  }

  /**
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
    realTrack(this.game.user.location.x, this.game.user.location.y, true);
  }

  oob() {
    // check if the ship is outside of the bounds of the board
    return (
      this.location.x < 0 ||
      this.location.x > this.game.world.width ||
      this.location.y < 0 ||
      this.location.y > this.game.world.height
    );
  }

  handleRebound() {
    let width = this.game.world.width;
    let height = this.game.world.height;
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
    this.game.allSprites = this.game.allSprites.filter(
      (el) => el.uuid != this.uuid
    );
    switch (this.spriteType) {
      case 1:
        this.game.badGuys = this.game.badGuys.filter(
          (el) => el.uuid != this.uuid
        );
        return;
      case 2:
        this.game.goodGuys = this.game.goodGuys.filter(
          (el) => el.uuid != this.uuid
        );
        return;
    }
  }

  drawImage(paramGraphics) {
    if (this.currentFrame >= this.numImages) return;
    paramGraphics.drawImage(
      this.images[this.currentFrame],
      this.location.x - this.cachedWidth,
      this.location.y - this.cachedHeight,
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
    if (Math.abs(this.velocity.x) < 0.05) {
      this.velocity.x = 0;
    }
    if (Math.abs(this.velocity.y) < 0.05) {
      this.velocity.y = 0;
    }
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
    } else {
      // if there is no shapeRect, create one around where the object is located
      this.shapeRect = new Rectangle(this.location.x, this.location.y, 0, 0);
    }
  }

  behave() {
    this.move(this.velocity);
    this.spriteCycle++;
    if (
      this.hasCollided ||
      (!this.bounded && !this.inGlobalBounds(this.location.x, this.location.y))
    ) {
      this.shouldRemoveSelf = true;
    }
  }

  setUser(slot, color = null) {
    this.slot = slot;
    if (color != null) {
      this.color = color;
      this.bSentByUser = true;
    } else {
      this.color = this.game.colors.colors[slot][0];
    }
  }

  isRectPolyCollision(sprite, sprite2) {
    let shapeRect = sprite.shapeRect;
    let poly = sprite2.polygon;
    if (shapeRect == null || poly == null) {
      return false;
    }
    let isCollision = false;
    if (sprite2.getShapeRect().intersects(shapeRect)) {
      let polygon = new Polygon();
      for (let i = 0; i < poly.npoints && !isCollision; i++) {
        polygon.addPoint(
          poly.xpoints[i] + sprite2.location.x,
          poly.ypoints[i] + sprite2.location.y
        );
        if (
          shapeRect.contains(
            poly.xpoints[i] + sprite2.location.x,
            poly.ypoints[i] + sprite2.location.y
          )
        ) {
          isCollision = true;
        }
      }
      if (!isCollision) {
        isCollision =
          polygon.contains(shapeRect.x, shapeRect.y) ||
          polygon.contains(shapeRect.x + shapeRect.width, shapeRect.y) ||
          polygon.contains(shapeRect.x, shapeRect.y + shapeRect.height) ||
          polygon.contains(
            shapeRect.x + shapeRect.width,
            shapeRect.y + shapeRect.height
          );
      }
    }
    return isCollision;
  }

  // handle collisions based on the shape types of the two objects colliding
  isCollision(sprite) {
    switch (sprite.shapeType + this.shapeType) {
      case 0: {
        return this.isRectCollision(sprite);
      }
      case 1: {
        if (sprite.shapeType == 0) {
          return this.isRectPolyCollision(sprite, this);
        }
        return this.isRectPolyCollision(this, sprite);
      }
      case 2: {
        return this.isPolyCollision(sprite);
      }
      default: {
        return false;
      }
    }
  }

  calcLead() {
    if (this.leadPoint == null || this.leadPoint === undefined) {
      this.leadPoint = { x: 0, y: 0 };
    }
    let userSprite = this.game.user;
    this.leadPoint.x =
      userSprite.location.x + userSprite.velocity.x * 15 - this.location.x;
    this.leadPoint.y =
      userSprite.location.y + userSprite.velocity.y * 15 - this.location.y;
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
    // let explosionSprite = new ExplosionSprite(
    //   this.location,
    //   this.game,
    //   this.slot
    // );
    // explosionSprite.addSelf();
    if (paramInt1 > 0) {
      // let particleSprite = new ParticleSprite(this.location.x, this.location.y);
      // particleSprite.particleInit(paramInt1, paramInt2);
      // particleSprite.addSelf();
    }
  }

  drawSelf(context) {
    let polygon = this.getShapePoly();

    // set the color to draw
    if (this.color != null) {
      context.strokeStyle = this.color;
    } else {
      context.strokeStyle = "green";
    }
    if (polygon != null) {
      context.translate(this.location.x, this.location.y);
      polygon.drawPolygon(context);
      context.translate(-this.location.x, -this.location.y);
    }
    // if (this.bSentByUser) {
    //   drawFlag(
    //     paramGraphics,
    //     this.color,
    //     this.shapeRect.x + this.shapeRect.width + 5,
    //     this.shapeRect.y + this.shapeRect.height + 5
    //   );
    // }
  }

  // calcTowards(paramInt1, paramInt2, paramDouble) {
  //   let d1 = paramInt1 - this.location.x;
  //   let d2 = paramInt2 - this.location.y;
  //   let d3 = Math.hypot(d1, d2);
  //   this.dVector[0] = (paramDouble * d1) / d3;
  //   this.dVector[1] = (paramDouble * d2) / d3;
  // }

  // used to set up the global bounds for the map - consider moving this to the game constructor
  // setGlobalBounds(width, height) {
  //   globalBoundingRect = new Rectangle(0, 0, paramInt1, paramInt2);
  //   g_centerX = paramInt1 / 2;
  //   g_centerY = paramInt2 / 2;
  // }

  setDegreeAngle(n) {
    this.angle = (n + 360) % 360;
    this.radAngle = this.angle * 0.017453292519943295;
  }

  setLocation(x, y) {
    this.location.x = x;
    this.location.y = y;
  }

  setVelocity(x, y) {
    this.velocity.x = x;
    this.velocity.y = y;
  }

  realTrack(x, y, b) {
    if (this.game.user.shouldRemoveSelf) {
      return;
    }
    let n3 =
      (WHUtil.findAngle(x, y, this.location.x, this.location.y) +
        (b ? 180 : 360)) %
      360;
    let dRotate = this.dRotate;
    let n4 = n3 - this.angle;
    if (Math.abs(n4) <= this.dRotate) {
      dRotate = n4;
    } else if (Math.abs(n4) <= 180) {
      if (n4 < 0) {
        dRotate = -this.dRotate;
      }
    } else if (n4 > 0) {
      dRotate = -this.dRotate;
    }
    this.rotate(dRotate);
    this.doMaxThrust(this.thrust);
  }

  setCollided(collidedObject) {
    if (!this.indestructible) {
      this.hasCollided = true;
      this.collidedObject = collidedObject;
      if (this.bUseHealth) {
        this.changeHealth(-collidedObject.damage);
        if (this.health < 1) {
          this.shouldRemoveSelf = true;
        } else {
          this.hasCollided = false;
        }
      }
    }
  }

  isPolyCollision(sprite) {
    // get the polygon (not the RotationalPolygon)
    let shapePoly = sprite.getShapePoly().polygon;
    if (shapePoly == null || this.polygon == null) {
      return false;
    }
    let n = this.location.x - sprite.location.x;
    let n2 = this.location.y - sprite.location.y;
    for (let i = 0; i < this.polygon.npoints; i++) {
      if (
        shapePoly.contains(
          this.polygon.xpoints[i] - n,
          this.polygon.ypoints[i] - n2
        )
      ) {
        return true;
      }
    }
    for (let j = 0; j < shapePoly.npoints; j++) {
      if (
        this.polygon.contains(
          shapePoly.xpoints[j] + n,
          shapePoly.ypoints[j] + n2
        )
      ) {
        return true;
      }
    }
    return false;
  }

  isRectCollision(sprite) {
    let shapeRect = sprite.getShapeRect();
    let shapeRect2 = this.getShapeRect();
    if (shapeRect == null && shapeRect2 == null) {
      return false;
    }
    if (shapeRect == null && shapeRect2 != null) {
      return shapeRect2.contains(sprite.location.x, sprite.location.y);
    }
    if (shapeRect2 == null) {
      return shapeRect.contains(this.location.x, this.location.y);
    }
    return shapeRect.intersects(shapeRect2);
  }

  inViewingRect(viewportRect) {
    if (this.shapeRect == null) {
      return null;
    } else {
      return this.shapeRect.intersects(viewportRect);
    }
  }

  inGlobalBounds(x, y) {
    if (this.game.globalBoundingRect == null) {
      return false;
    }
    if (this.game.globalBoundingRect.contains(x, y)) {
      return true;
    }
    return false;
  }

  setImages(paramArrayOfImage, paramInt) {
    this.images = paramArrayOfImage;
    this.numImages = paramInt;
    this.cachedWidth = paramArrayOfImage[0].getWidth(null) / 2;
    this.cachedHeight = paramArrayOfImage[0].getHeight(null) / 2;
  }

  init(spriteName, x, y, isBounded) {
    this.setLocation(x, y);
    this.name = spriteName;
    this.bounded = isBounded;
  }

  track() {
    if (this.game.user != null) {
      this.realTrack(
        this.game.user.location.x,
        this.game.user.location.y,
        false
      );
    }
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
    } else if (this.health > this.MAX_HEALTH) {
      this.health = this.MAX_HEALTH;
    }
  }
}

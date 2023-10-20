import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { Polygon } from "../Polygon.js";

export class Sprite {
  static REBOUND_COEFF = -0.5;

  polygon;
  name;
  type;
  shapeRect;

  bZappable;

  isInDrawingRect;
  spriteType;
  powerupType;

  collisionType;
  bIsBulthis;
  bIsHeatSeeker;
  setByUser;
  shouldRemoveSelf;

  maxThrust;
  maxVelocity;
  bUseHealth;
  collidedObject;

  thrust;
  leadPoint;

  MAX_HEALTH;
  images;

  constructor(x, y, game) {
    /** @type {number} horizontal location */
    this.x = x;
    /** @type {number} vertical location */
    this.y = y;

    /** @type {Object<Game>} instance of the game */
    this.game = game;

    /** @type {number} slot for the sprite, defaults to 8 */
    this.slot = 8;

    /** @type {number} rotation degrees */
    this.dRotate = 0;
    /** @type {Boolean} is the sprite rotating */
    this.isRotating = false;

    /** @type {number} number of cycles the sprite has existed */
    this.spriteCycle = 0;

    /** @type {Boolean} is the sprite bounded */
    this.bounded = false;

    // set up the shape rect for the sprite, use the x,y coordinates and then offset by the bounding box of the polygon
    // this.shapeRect;
    // this.boundingRect = new Rectangle(
    //   0,
    //   0,
    //   game.world.width,
    //   game.world.height
    // );

    /** @type {number} shape type, used for collisions */
    this.shapeType = 0;
    this.dVector = [];

    //initialize the angle and the radAngle for the ship
    this.angle = 0;
    this.radAngle = 0;

    // the velocity of the ship
    this.vx = 0;
    this.vy = 0;

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

    // need to have a secure browser context to use this method

    this.spriteId = crypto.randomUUID();
  }

  getShapeRect() {
    return this.shapeRect;
  }

  /**
   * Add the sprite to the appropriate array
   * 0 - neutral
   * 1 - bad
   * 2 - good
   */
  addSelf() {
    if (this.spriteType == 1) {
      this.game.badGuys.push(this);
    } else if (this.spriteType == 2) {
      this.game.goodGuys.push(this);
    }
    this.game.allSprites.push(this);
  }

  distanceFrom(sprite) {
    return WHUtil.distanceFrom(this.x, this.y, sprite.x, sprite.y);
  }

  /**
   * @param thrustAmount
   * @description sets the x/y velocity of the Sprite based on the angle of the thrust
   */
  doMaxThrust(thrustAmount) {
    const vx = Math.cos(this.radAngle) * thrustAmount + this.vx;
    const vy = Math.sin(this.radAngle) * thrustAmount + this.vy;
    const hyp = Math.hypot(vx, vy);
    if (hyp > this.maxThrust) {
      this.vx = (this.maxThrust * vx) / hyp;
      this.vy = (this.maxThrust * vy) / hyp;
    } else {
      this.vx = vx;
      this.vy = vy;
    }
  }

  handleCrash() {}

  reverseTrack() {
    const user = this.game.gameNetLogic.clientUserManager.users.get(
      this.game.gameNetLogic.userId
    );
    realTrack(user.userSprite.x, user.userSprite.y, true);
  }

  oob() {
    // check if the ship is outside of the bounds of the board
    return (
      this.x < 0 ||
      this.x > this.game.world.width ||
      this.y < 0 ||
      this.y > this.game.world.height
    );
  }

  handleRebound() {
    const width = this.game.world.width;
    const height = this.game.world.height;
    let x = this.x;
    let y = this.y;
    let vx = this.vx;
    let vy = this.vy;
    if (x < 0) {
      x = 1;
      vx *= -0.5;
    } else if (x >= width) {
      x = width - 1;
      vx *= -0.5;
    }
    if (y < 0) {
      y = 1;
      vy *= -0.5;
    } else if (y >= height) {
      y = height - 1;
      vy *= -0.5;
    }
    this.setLocation(x, y);
    this.setVelocity(vx, vy);
  }

  removeSelf() {
    // remove sprites with a matching spriteId
    this.game.allSprites = this.game.allSprites.filter(
      (el) => el.spriteId != this.spriteId
    );
    switch (this.spriteType) {
      case 1:
        this.game.badGuys = this.game.badGuys.filter(
          (el) => el.spriteId != this.spriteId
        );
        break;
      case 2:
        this.game.goodGuys = this.game.goodGuys.filter(
          (el) => el.spriteId != this.spriteId
        );
        break;
    }
  }

  // moveTowards(paramInt1, paramInt2, paramDouble) {
  //   calcTowards(paramInt1, paramInt2, paramDouble);
  //   this.vx = this.dVector[0];
  //   this.vy = this.dVector[1];
  //   move(this.vx, this.vy);
  // }

  decel(decelAmount) {
    if (Math.abs(this.vx) < 0.05) {
      this.vx = 0;
    }
    if (Math.abs(this.vy) < 0.05) {
      this.vy = 0;
    }
    this.vx *= decelAmount;
    this.vy *= decelAmount;
  }
  /**
   * Change the sprite's location by the current velocity
   * @param {number} vx - x velocity
   * @param {number} vy - y velocity
   */
  move(vx, vy) {
    this.setLocation(this.x + vx, this.y + vy);
    if (this.bounded) {
      this.handleRebound();
    } else if (this.oob()) {
      this.handleCrash();
    }

    if (this.shapeRect != null) {
      // moving the shaperect, for use in collisions?
      this.shapeRect.setLocation(
        this.x - this.shapeRect.width / 2,
        this.y - this.shapeRect.height / 2
      );
    } else {
      // if there is no shapeRect, create one around where the object is located
      this.shapeRect = new Rectangle(this.x, this.y, 0, 0);
    }
  }

  /**
   * execute the default behavior for the sprite
   * move the sprite according to its current velocity
   * advance the sprite cycle
   * if it has collided or it's not bounded and it's not in the global bounds
   * then set that the sprite should remove itself
   */
  behave() {
    this.move(this.vx, this.vy);
    this.spriteCycle++;
    if (
      this.hasCollided ||
      (!this.bounded && !this.inGlobalBounds(this.x, this.y))
    ) {
      this.shouldRemoveSelf = true;
    }
  }

  /**
   * Set the user's color by the slot that the user is in
   * @param {uuid} userId
   */
  setUser(userId) {
    const user = this.game.gameNetLogic.clientUserManager.users.get(userId);
    this.slot = user.slot;
    this.color = this.game.colors.colors[user.slot][0];
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
          poly.xpoints[i] + sprite2.x,
          poly.ypoints[i] + sprite2.y
        );
        if (
          shapeRect.contains(
            poly.xpoints[i] + sprite2.x,
            poly.ypoints[i] + sprite2.y
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
    const user = this.game.gameNetLogic.clientUserManager.users.get(
      this.game.gameNetLogic.userId
    );
    if (this.leadPoint == null || this.leadPoint === undefined) {
      this.leadPoint = { x: 0, y: 0 };
    }
    let userSprite = user.userSprite;
    this.leadPoint.x = userSprite.x + userSprite.vx * 15 - this.x;
    this.leadPoint.y = userSprite.y + userSprite.vy * 15 - this.y;
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
    //   this.x, this.y,
    //   this.game,
    //   this.slot
    // );
    // explosionSprite.addSelf();
    if (paramInt1 > 0) {
      // let particleSprite = new ParticleSprite(this.x, this.y);
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
      context.translate(this.x, this.y);
      polygon.drawPolygon(context);
      context.translate(-this.x, -this.y);
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
  //   let d1 = paramInt1 - this.x;
  //   let d2 = paramInt2 - this.y;
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
    this.x = x;
    this.y = y;
  }

  setVelocity(x, y) {
    this.vx = x;
    this.vy = y;
  }

  realTrack(x, y, b) {
    const user = this.game.gameNetLogic.clientUserManager.users.get(
      this.game.gameNetLogic.userId
    );
    if (user.userSprite.shouldRemoveSelf) {
      return;
    }
    let n3 = (WHUtil.findAngle(x, y, this.x, this.y) + (b ? 180 : 360)) % 360;
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
        // send the userState with the updated health
        this.game.sendState();

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
    let n = this.x - sprite.x;
    let n2 = this.y - sprite.y;
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
      return shapeRect2.contains(sprite.x, sprite.y);
    }
    if (shapeRect2 == null) {
      return shapeRect.contains(this.x, this.y);
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
    const user = this.game.gameNetLogic.clientUserManager.users.get(
      this.game.gameNetLogic.userId
    );
    if (user.userSprite != null) {
      this.realTrack(user.userSprite.x, user.userSprite.y, false);
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

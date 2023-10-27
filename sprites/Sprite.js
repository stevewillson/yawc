import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { Polygon } from "../Polygon.js";

export class Sprite {
  constructor(x, y, game) {
    /** @type {number} horizontal location */
    this.x = x;

    /** @type {number} vertical location */
    this.y = y;

    /** @type {Object<Game>} instance of the game */
    this.game = game;

    /** @type {number} slot for the sprite, defaults to 8 */
    this.slot = 8;

    /** @type {color} set the color based off of the slot */
    this.color = this.game.colors.colors[this.slot][0];

    /** @type {number} rotation degrees */
    this.dRotate = 0;

    /** @type {Boolean} is the sprite rotating */
    this.isRotating = false;

    /** @type {number} number of cycles the sprite has existed */
    this.spriteCycle = 0;

    /** @type {Boolean} is the sprite bounded */
    this.bounded = false;

    this.shapeRect = new Rectangle(this.x, this.y, 0, 0);

    /** @type {number} shape type, used for collisions */
    this.shapeType = 0;

    //initialize the angle and the radAngle for the ship
    this.angle = 0;

    // the velocity of the sprite
    this.vx = 0;
    this.vy = 0;

    this.indestructible = false;
    this.hasCollided = false;

    this.health = 1;
    this.damage = 1;

    this.shouldRemoveSelf = false;

    this.useHealth = false;

    // need to have a secure browser context to use this method
    this.spriteId = crypto.randomUUID();
  }

  drawSelf(context) {
    const polygon = this.getPolygon();
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
    this.shapeRect = this.getShapeRect();
    if (this.sentByUser) {
      Sprite.drawFlag(
        context,
        this.color,
        this.shapeRect.x + this.shapeRect.width + 5,
        this.shapeRect.y + this.shapeRect.height + 5
      );
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
      this.hasCollided
      // need to set the global bounds
      // this caused the thrust to disappear when it was
      // outside of the GlobalBounds
      // ||
      // (!this.bounded && !this.inGlobalBounds(this.x, this.y))
    ) {
      this.shouldRemoveSelf = true;
    }
  }

  /**
   * Add the sprite to the appropriate array
   * 0 - neutral
   * 1 - bad
   * 2 - good
   */
  addSelf() {
    if (this.spriteType == 1) {
      this.game.badGuys.set(this.spriteId, this);
    } else if (this.spriteType == 2) {
      this.game.goodGuys.set(this.spriteId, this);
    }
    this.game.allSprites.set(this.spriteId, this);
  }

  /**
   * Remove the sprite from the appropriate array
   */
  removeSelf() {
    // remove sprites with a matching spriteId
    this.game.allSprites.delete(this.spriteId);
    switch (this.spriteType) {
      case 1:
        this.game.badGuys.delete(this.spriteId);
        break;
      case 2:
        this.game.goodGuys.delete(this.spriteId);
        break;
    }
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

  reverseTrack() {
    const user = this.game.gameNetLogic.clientUserManager.users.get(
      this.game.gameNetLogic.userId
    );
    this.realTrack(user.userSprite.x, user.userSprite.y, true);
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

  // TODO - redefined by WallCrawlerSprite to make sure the wall
  // crawlers change directions when they hit the sidewall
  // also implemented by HeatSeekerMissile
  handleCrash() {}

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
   * Set the user's color by the slot that the user is in
   * @param {uuid} userId
   */
  setUser(userId) {
    const user = this.game.gameNetLogic.clientUserManager.users.get(userId);
    // if the user is null, use the userId as the slot number
    if (user != null) {
      this.slot = user.slot;
      this.color = this.game.colors.colors[user.slot][0];
    } else {
      this.slot = userId;
      this.color = this.game.colors.colors[this.slot][0];
    }
  }

  /**
   * check if two sprites collide
   * @param {Object<Sprite>} sprite - use this sprite's shapeRect
   * @param {Object<Sprite>} sprite2 - use this sprite's polygon
   * @returns
   */
  isRectPolyCollision(sprite, sprite2) {
    let shapeRect = sprite.shapeRect;
    let polygon = sprite2.getPolygon();
    if (shapeRect == null || polygon == null) {
      return false;
    }
    let isCollision = false;
    if (sprite2.getShapeRect().intersects(shapeRect)) {
      let newPolygon = new Polygon();
      for (let i = 0; i < polygon.npoints && !isCollision; i++) {
        newPolygon.addPoint(
          polygon.xpoints[i] + sprite2.x,
          polygon.ypoints[i] + sprite2.y
        );
        if (
          shapeRect.contains(
            polygon.xpoints[i] + sprite2.x,
            polygon.ypoints[i] + sprite2.y
          )
        ) {
          return true;
        }
      }
      isCollision =
        newPolygon.contains(shapeRect.x, shapeRect.y) ||
        newPolygon.contains(shapeRect.x + shapeRect.width, shapeRect.y) ||
        newPolygon.contains(shapeRect.x, shapeRect.y + shapeRect.height) ||
        newPolygon.contains(
          shapeRect.x + shapeRect.width,
          shapeRect.y + shapeRect.height
        );
    }
    return isCollision;
  }

  /**
   * Check if this sprite is in collision with another sprite
   * @param {Object<Sprite>} sprite
   * @returns {Boolean} is the sprite in collision
   */
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

  /**
   * Calculate the point to aim at to lead a target
   * @returns {Object<x:number,y:number>} the lead point location
   */
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

  /**
   * Rotate the sprite by the specified number of degrees
   * @param {number} rotationDegrees
   */
  rotate(rotationDegrees) {
    this.setDegreeAngle(this.angle + rotationDegrees);
  }

  static drawFlag(context, color, x, y) {
    if (color != null) {
      WHUtil.setColor(context, color);
      context.lineWidth = 1;
      context.fillRect(x, y, 10, 7);
      context.beginPath();
      context.moveTo(x, y + 7);
      context.lineTo(x, y + 14);
      context.stroke();
    }
  }

  /**
   * Set to kill a sprite
   * TODO - refactor to move the ExplosionSprite and
   * ParticleSprite to another location
   * @param {*} particles
   * @param {*} maxVelocity
   */
  killSelf(particles, maxVelocity) {
    this.shouldRemoveSelf = true;
    // let explosionSprite = new ExplosionSprite(
    //   this.x, this.y,
    //   this.game,
    //   this.slot
    // );
    // explosionSprite.addSelf();
    if (particles > 0) {
      // let particleSprite = new ParticleSprite(this.x, this.y, this.game, paramInt1, paramInt2);
      // particleSprite.addSelf();
    }
  }

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

  /**
   * Set the location of the sprite in x,y
   * @param {number} x
   * @param {number} y
   */
  setLocation(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Set the velocity of the sprite
   * @param {number} vx
   * @param {number} vy
   */
  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
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
      if (this.useHealth) {
        this.changeHealth(-collidedObject.damage);
        if (this.health < 1) {
          this.shouldRemoveSelf = true;
        } else {
          this.hasCollided = false;
        }
      }
    }
  }

  /**
   * There may be two types of polygon for a sprite
   * RotationalPolygon
   * Polygon
   * @returns {Object<Polygon>} that is a polygon representing the sprite
   */
  getPolygon() {
    if (this.rPoly != undefined) {
      return this.rPoly.polygon;
    } else {
      return this.polygon;
    }
  }

  isPolyCollision(sprite) {
    // get the polygon (not the RotationalPolygon)
    const shapePoly = sprite.getPolygon();
    const thisPolygon = this.getPolygon();

    if (shapePoly == null || thisPolygon == null) {
      return false;
    }
    let n = this.x - sprite.x;
    let n2 = this.y - sprite.y;
    for (let i = 0; i < thisPolygon.npoints; i++) {
      if (
        shapePoly.contains(
          thisPolygon.xpoints[i] - n,
          thisPolygon.ypoints[i] - n2
        )
      ) {
        return true;
      }
    }
    for (let j = 0; j < shapePoly.npoints; j++) {
      if (
        thisPolygon.contains(
          shapePoly.xpoints[j] + n,
          shapePoly.ypoints[j] + n2
        )
      ) {
        return true;
      }
    }
    return false;
  }

  getShapeRect() {
    return this.shapeRect;
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

  /**
   * Set the name, location, and whether the sprite is bounded
   * @param {string} spriteName
   * @param {number} x
   * @param {number} y
   * @param {Boolean} isBounded
   */
  init(spriteName, x, y, isBounded) {
    this.spriteName = spriteName;
    this.setLocation(x, y);
    this.bounded = isBounded;
  }

  /**
   * track the user's sprite
   */
  track() {
    const user = this.game.gameNetLogic.clientUserManager.users.get(
      this.game.gameNetLogic.userId
    );
    if (user.userSprite != null) {
      this.realTrack(user.userSprite.x, user.userSprite.y, false);
    }
  }

  /**
   * set the health to the number specified
   * also sets the MAX_HEALTH to that number
   * @param {number} health
   */
  setHealth(health) {
    this.useHealth = true;
    this.health = health;
    this.MAX_HEALTH = health;
  }

  /**
   * change the sprite's health by the amount specified
   * @param {number} amount
   */
  changeHealth(amount) {
    this.health += amount;
    if (this.health < 0) {
      this.health = 0;
    } else if (this.health > this.MAX_HEALTH) {
      this.health = this.MAX_HEALTH;
    }
  }
}

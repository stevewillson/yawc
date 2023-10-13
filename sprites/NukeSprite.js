import WHUtil from "../WHUtil.js";
import Rectangle from "../Rectangle.js";
import Sprite from "./Sprite.js";
export default class NukeSprite extends Sprite {
  static D_RADIUS = 30;
  static MAX_RADIUS = 1000;
  static NUKE_SIZE = 40;
  static COUNTDOWN = 0;
  static DETONATE = 1;
  static COUNTDOWN_TIME = 9;

  shotAlready;
  radius;
  countdown;
  dropTime;
  mode;

  addSelf() {
    super.addSelf();
    this.dropTime = Date.now();
    this.game.flashScreenColor = this.game.colors.colors[this.slot][0];
  }

  isCollision(sprite) {
    let distance = WHUtil.distanceFrom(this.location, sprite.location);
    return distance <= this.radius && distance > this.radius - 50;
  }

  constructor(location, slot, game) {
    super(location, game);
    this.radius = 10;
    this.mode = 0;
    this.init("nuke", location.x, location.y, true);
    this.shapeRect = new Rectangle(location.x - 20, location.y - 20, 40, 40);
    this.spriteType = 1;
    this.slot = slot;
    this.color = this.game.colors.colors[this.slot][0];
    this.indestructible = false;
    this.setHealth(100, 0);
    this.powerupType = 14;
  }

  drawSelf(context) {
    if (this.mode == 0) {
      for (let n = 0; n < 3; n++) {
        let n2 = this.spriteCycle + n * 120;
        context.fillStyle = this.color;
        WHUtil.fillCenteredArc(
          context,
          this.location.x,
          this.location.y,
          40,
          n2,
          60
        );

        context.fillStyle = "black";
        WHUtil.fillCenteredArc(
          context,
          this.location.x,
          this.location.y,
          20,
          n2,
          60
        );
      }
      context.fillStyle = this.color;
      WHUtil.fillCenteredCircle(context, this.location.x, this.location.y, 15);
      context.strokeStyle = "black";
      context.fillStyle = "black";
      context.font = "20pt helvetica";
      if (this.countdown >= 0) {
        context.fillText(
          `${this.countdown}`,
          this.location.x - 6,
          this.location.y + 6
        );
      }
    } else {
      for (let n3 = 0; n3 < 10; n3++) {
        context.fillStyle = this.game.colors.colors[this.slot][n3];
        context.strokeStyle = this.game.colors.colors[this.slot][n3];
        if (this.radius - n3 * 5 > 0) {
          WHUtil.drawCenteredCircle(
            context,
            this.location.x,
            this.location.y,
            this.radius - n3 * 5
          );
        }
      }
    }
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (collided == this.game.userSprite) {
      this.game.flashScreenColor = this.game.colors.colors[this.slot][0];
      this.shouldRemoveSelf = false;
      this.mode = 1;
      let angle = WHUtil.findAngle(
        collided.location.x,
        collided.location.y,
        this.location.x,
        this.location.y
      );
      collided.velocity.x += 2 * Math.cos(angle * 0.017453292519943295);
      collided.velocity.y += 2 * Math.sin(angle * 0.017453292519943295);
      return;
    }
    if (!this.shouldRemoveSelf) {
      this.bShotAlready = true;
      this.velocity.x += collided.velocity.x / 4;
      this.velocity.y += collided.velocity.y / 4;
      return;
    }
    this.killSelf();
  }

  behave() {
    super.behave();
    if (this.mode == 0) {
      this.countdown = 8 - (Date.now() - this.dropTime) / 1000;
      this.shapeRect.reshape(
        this.location.x - 60,
        this.location.y - 60,
        120,
        120
      );
      if (this.countdown <= 0) {
        this.mode = 1;
        return;
      }
      if (this.bShotAlready) {
        for (let i = 0; i < this.game.userStates.length; i++) {
          let userState = this.game.userStates[i];
          if (
            userState.isPlaying() &&
            userState.portalSprite != null &&
            WHUtil.distanceFrom(userState.portalSprite, this) < 60
          ) {
            this.game.usePowerup(
              14,
              0,
              userState.slot,
              this.game.gameSession
              //   WormholeModel.gameID
            );
            this.killSelf();
          }
        }
      }
    } else {
      this.indestructible = true;
      this.damage = Math.max(5, (40 * (1000 - this.radius)) / 1000);
      this.radius += 30;
      this.shapeRect.reshape(
        this.location.x - this.radius - 10,
        this.location.y - this.radius - 10,
        this.radius * 2 + 20,
        this.radius * 2 + 20
      );
      this.shouldRemoveSelf = this.radius > 1000;
    }
  }
}

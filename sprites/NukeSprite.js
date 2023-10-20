import { Rectangle } from "../Rectangle.js";
import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class NukeSprite extends Sprite {
  static D_RADIUS = 30;
  static MAX_RADIUS = 1000;
  static NUKE_SIZE = 40;
  static COUNTDOWN_TIME = 9;

  shotAlready;
  radius;
  countdown;
  dropTime;
  mode;

  addSelf() {
    super.addSelf();
    this.dropTime = window.performance.now();
    this.game.flashScreenColor = this.game.colors.colors[this.slot][0];
  }

  isCollision(sprite) {
    let distance = WHUtil.distanceFrom(this.x, this.y, sprite.x, sprite.y);
    return distance <= this.radius && distance > this.radius - 50;
  }

  constructor(x, y, slot, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.mode = "countdown";
    this.init("nuke", x, y, true);
    this.shapeRect = new Rectangle(x - 20, y - 20, 40, 40);
    this.spriteType = 1;
    this.slot = slot;
    this.color = this.game.colors.colors[this.slot][0];
    this.indestructible = false;
    this.setHealth(100, 0);
    this.powerupType = 14;
  }

  drawSelf(context) {
    switch (this.mode) {
      case "countdown": {
        for (let n = 0; n < 3; n++) {
          // make the nuke symbol slowly rotate
          // use radians
          let n2 = this.spriteCycle / 100 + (n * 2 * Math.PI) / 3;
          context.strokeStyle = this.color;
          context.lineWidth = 20;
          context.beginPath();
          context.arc(this.x, this.y, 30, n2, n2 + Math.PI / 3);
          context.stroke();
        }

        context.lineWidth = 1;
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, 15, 0, 2 * Math.PI);
        context.fill();

        // context.fillStyle = "black";
        context.fillStyle = "red";
        context.font = "20pt helvetica";
        context.textAlign = "center";
        if (this.countdown >= 0) {
          context.fillText(
            `${this.countdown.toLocaleString("en-US", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}`,
            this.x,
            this.y + 6
          );
        }
        break;
      }
      case "detonate": {
        for (let n3 = 0; n3 < 10; n3++) {
          context.strokeStyle = this.game.colors.colors[this.slot][n3];
          if (this.radius - n3 * 5 > 0) {
            context.lineWidth = 1;
            context.beginPath();
            context.arc(this.x, this.y, this.radius - n3 * 5, 0, 2 * Math.PI);
            context.stroke();
          }
        }
        break;
      }
    }
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (collided == this.game.user.userSprite) {
      this.game.flashScreenColor = this.game.colors.colors[this.slot][0];
      this.shouldRemoveSelf = false;
      this.mode = "detonate";
      let angle = WHUtil.findAngle(collided.x, collided.y, this.x, this.y);
      collided.vx += 2 * Math.cos(angle * 0.017453292519943295);
      collided.vy += 2 * Math.sin(angle * 0.017453292519943295);
      return;
    }
    if (!this.shouldRemoveSelf) {
      this.bShotAlready = true;
      this.vx += collided.vx / 4;
      this.vy += collided.vy / 4;
      return;
    }
    this.killSelf();
  }

  behave() {
    super.behave();
    switch (this.mode) {
      case "countdown": {
        this.countdown = 8 - (window.performance.now() - this.dropTime) / 1000;
        this.shapeRect.reshape(this.x - 60, this.y - 60, 120, 120);
        if (this.countdown <= 0) {
          this.mode = "detonate";
          return;
        }
        if (this.bShotAlready) {
          // implement shooting a nuke into another player's portal
          for (let i = 0; i < this.game.room.userIds.length; i++) {
            if (this.game.room.userIds[i] != null) {
              const user = this.game.gameNetLogic.clientUserManager.users.get(
                this.game.room.userIds[i]
              );
              if (
                user.isPlaying() &&
                user.portalSprite != null &&
                WHUtil.distanceFrom(
                  user.portalSprite.x,
                  user.portalSprite.y,
                  this.x,
                  this.y
                ) < 60
              ) {
                this.game.usePowerup(14, 0, user.userId, this.game.gameSession);
                this.killSelf();
              }
            }
          }
        }
        break;
      }
      case "detonate": {
        this.indestructible = true;
        this.damage = Math.max(5, (40 * (1000 - this.radius)) / 1000);
        this.radius += 30;
        this.shapeRect.reshape(
          this.x - this.radius - 10,
          this.y - this.radius - 10,
          this.radius * 2 + 20,
          this.radius * 2 + 20
        );
        this.shouldRemoveSelf = this.radius > 1000;
        break;
      }
    }
  }
}

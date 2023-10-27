import { Rectangle } from "../Rectangle.js";
import { RotationalPolygon } from "../RotationalPolygon.js";
import { WHUtil } from "../WHUtil.js";
import { Sprite } from "./Sprite.js";

export class GhostPudSprite extends Sprite {
  static atomRingShape = [
    [0, -10],
    [20, -9],
    [27, -6],
    [30, -3],
    [32, 0],
    [30, 3],
    [27, 6],
    [20, 9],
    [0, 10],
    [-20, 9],
    [-27, 6],
    [-30, 3],
    [-32, 0],
    [-30, -3],
    [-27, -6],
    [-20, -9],
    [0, -10],
  ];

  constructor(portalSprite, n, game) {
    super(0, 0, game);
    this.init("gp", portalSprite.x, portalSprite.y, true);
    this.shapeRect = new Rectangle(this.x - 20, this.y - 20, 40, 40);

    this.spriteType = 1;

    this.setHealth(1);
    this.damage = 1;

    this.powerupType = 18;

    this.polyAtoms = [];
    let constructPolygon = new RotationalPolygon(GhostPudSprite.atomRingShape);
    this.polyAtoms.push(constructPolygon.polygon.copyPolygon());
    constructPolygon.rotate(60);
    this.polyAtoms.push(constructPolygon.polygon.copyPolygon());
    constructPolygon.rotate(60);
    this.polyAtoms.push(constructPolygon.polygon.copyPolygon());

    this.indestructible = true;
    this.zappable = true;
    this.shotDelay = undefined;

    this.radAngle = 0;
    this.color = portalSprite.color;
    this.setDegreeAngle(portalSprite.currentDegrees + (n == 0 ? 15 : -15));
    this.vx = 14 * Math.cos(this.radAngle);
    this.vy = 14 * Math.sin(this.radAngle);
    this.directionalCycle = 0;
  }

  drawSelf(context) {
    context.translate(this.x, this.y);
    WHUtil.setColor(context, "white");

    WHUtil.drawCenteredCircle(context, 0, 0, 8);
    if (this.directionalCycle > 0) {
      context.moveTo(-3, -3);
      context.lineTo(-1, -3);

      context.moveTo(-2, -4);
      context.lineTo(-2, -2);

      context.moveTo(3, -3);
      context.lineTo(1, -3);

      context.moveTo(2, -4);
      context.lineTo(2, -2);

      context.moveTo(-2, 2);
      context.lineTo(0, 1);

      context.moveTo(0, 1);
      context.lineTo(2, 2);
      context.stroke();
    } else {
      let n = 1 - ((this.spriteCycle / 16) % 3);
      context.translate(n, 0);

      context.moveTo(-2, -3);
      context.lineTo(-2, -2);

      context.moveTo(2, -3);
      context.lineTo(2, -2);

      context.translate(-n, 0);

      context.moveTo(-1, 1);
      context.lineTo(1, 1);

      context.stroke();
    }

    WHUtil.setColor(context, this.color);

    WHUtil.drawCenteredCircle(
      context,
      WHUtil.randInt(3),
      WHUtil.randInt(3),
      11
    );
    WHUtil.drawCenteredCircle(
      context,
      WHUtil.randInt(3),
      WHUtil.randInt(3),
      11
    );
    for (let i = 0; i < this.polyAtoms.length; ++i) {
      this.polyAtoms[i].drawPolygon(context);
    }
    context.translate(-this.x, -this.y);
  }

  // TODO - the sprites drift to the upper left corner of the board
  behave() {
    super.behave();
    if (this.directionalCycle <= 0) {
      if (this.x < 40) {
        this.vx = 1;
      } else if (this.x > this.getShapeRect().width - 40) {
        this.vx = -1;
      }
      if (this.y < 40) {
        this.vy = 1;
      } else if (this.y > this.getShapeRect().height - 40) {
        this.vy = -1;
      }
      this.setVelocity(this.vx, this.vy);
    } else if (this.spriteCycle > 80) {
      this.directionalCycle--;
      this.vx *= 0.95;
      this.vy *= 0.95;
      if (Math.abs(this.vx) < 0.2) {
        this.vx = 0;
      }
      if (Math.abs(this.vy) < 0.2) {
        this.vy = 0;
      }
    }
    if (this.shotDelay > 0) {
      this.shotDelay--;
      // get the players in the room
      const room = this.game.gameNetLogic.clientRoomManager.getRoomById(
        this.game.gameNetLogic.roomId
      );
      for (let i = 0; i < room.userIds.length; i++) {
        if (room.userIds[i] != null) {
          const user = this.game.gameNetLogic.clientUserManager.users.get(
            room.userIds[i]
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
            this.game.usePowerup(18, 1, user.slot);
            this.killSelf();
          }
        }
      }
    }
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (collided != this.game.user.userSprite) {
      this.directionalCycle = 130;
      this.shotDelay = 80;
      this.setVelocity(this.vx + collided.vx / 4, this.vy + collided.vy / 4);
    }
  }
}

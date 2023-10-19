import SpriteColors from "../SpriteColors.js";
import Sprite from "./Sprite.js";
import WHUtil from "../WHUtil.js";
import Rectangle from "../Rectangle.js";
import ExplosionSprite from "./ExplosionSprite.js";
import StringSprite from "./StringSprite.js";
import ParticleSprite from "./ParticleSprite.js";

export default class PowerupSprite extends Sprite {
  static enemyRatios = [
    0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 4, 2, 1, 2, 1, 1, 1, 1, 1, 2,
  ];
  static largeConversionTypes = [
    0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
  ];
  static smallConversionTypes = [
    0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  ];
  static names = [
    "GUN UPGRADE",
    "THRUST UPGRADE",
    "RETROS",
    "INVULNERABILITY",
    "ZAP ATTACK",
    "EXTRA HEALTH",
    "HEAT SEEKER",
    "WORMHOLE TURRET",
    "WORMHOLE MINES",
    "SEND UFO",
    "SEND INFLATER",
    "SEND MINELAYER",
    "SEND GUNSHIP",
    "SEND SCARAB",
    "SEND NUKE",
    "SEND WALLCRAWLER",
    "WORMHOLE BEAM",
    "WORMHOLE EMP",
    "SEND GHOST-PUD",
    "SEND ARTILLERY",
  ];

  ctype;
  powerupType;
  x;
  y;
  game;

  constructor(x, y, powerupType, game) {
    super(x, y, game);
    this.x = x;
    this.y = y;
    this.game = game;
    this.ctype = 4;
    this.init("pup", x, y, true);
    this.spriteType = 1;
    this.shapeRect = new Rectangle(x - 17, y - 17, 34, 34);
    this.setHealth(10, 0);
    this.powerupType = powerupType;
    this.indestructible = true;
    this.colors = game.colors;

    // shortcuts for these objects
    this.gameNetLogic = this.game.gameNetLogic;
    this.clientUserManager = this.gameNetLogic.clientUserManager;
  }

  drawSelf(context) {
    context.strokeStyle = this.colors.colors[this.ctype][this.spriteCycle % 20];
    context.fillStyle = this.colors.colors[this.ctype][this.spriteCycle % 20];

    // TODO - draw a flashing circle around the sprite
    // Is this a PNG issue?
    // set background color
    // draw a flashing outline around the powerup
    // context.arc(this.x, this.y, 16, 0, 2 * Math.PI);
    WHUtil.fillCenteredCircle(context, this.x, this.y, 18);

    // TODO - set the image background color to black
    let shiftedNumber = this.powerupType - 2;
    let powerupNumber;
    if (shiftedNumber <= 0) {
      powerupNumber = 0;
    } else {
      powerupNumber = shiftedNumber;
    }
    // get the image
    let img = document.getElementById("powerupImages");
    let imgWidth = 28;
    let imgHeight = 30;

    context.drawImage(
      img,
      powerupNumber + powerupNumber * imgWidth + 1,
      1,
      imgWidth,
      imgHeight - 2,
      this.x - 14,
      this.y - 14,
      imgWidth,
      imgHeight - 2
    );
  }

  givePowerupTo(userSprite) {
    // GameBoard.playSound("snd_powerup");
    switch (this.powerupType) {
      case 0: {
        userSprite.upgradeShot();
        break;
      }
      case 1: {
        userSprite.upgradeThrust(0.1);
        break;
      }
      case 2: {
        userSprite.enableRetros();
        break;
      }
      case 3: {
        userSprite.shieldCyclesLeft = Math.max(
          450,
          userSprite.shieldCyclesLeft + 200
        );
        break;
      }
      case 4: {
        this.game.clearScreen();
        break;
      }
      case 5: {
        userSprite.changeHealth(30);

        break;
      }
      default: {
        if (userSprite.passOnPowerup(this.powerupType)) {
          this.game.addPowerup(this.powerupType);
        }
        break;
      }
    }
    // send the userState with the updated powerups
    this.game.sendState();
    // update the userbar
    this.game.refreshUserBar = true;
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      // get the user object
      const user = this.clientUserManager.users.get(this.gameNetLogic.userId);
      if (collided == user.userSprite) {
        this.givePowerupTo(user.userSprite);
        // add a string to show that the user got a powerup
        const stringSprite = new StringSprite(
          this.x,
          this.y,
          PowerupSprite.names[this.powerupType],
          this.game
        );
        stringSprite.addSelf();
        return;
      }
      const explosionSprite = new ExplosionSprite(this.x, this.y, this.game);
      explosionSprite.addSelf();

      const particleSprite = new ParticleSprite(this.x, this.y, this.game);
      particleSprite.particleInit(20, 10);
      particleSprite.addSelf();
    }
  }

  static genPowerup(x, y, game) {
    let powerupType = 0;
    const user = game.gameNetLogic.clientUserManager.users.get(
      game.gameNetLogic.userId
    );
    // check if a random number
    // is divisible by 3 (1/3 chance)
    if (WHUtil.randInt(3) == 0) {
      let i = 0;
      while (i == 0) {
        // get a number between 0-5 (inclusive)
        powerupType = WHUtil.randInt(6);
        switch (powerupType) {
          default: {
            continue;
          }
          case 0: {
            i = user.userSprite.maxShotUpgrade ? 0 : 1;
            continue;
          }
          case 1: {
            i = user.userSprite.maxThrustUpgrade ? 0 : 1;
            continue;
          }
          case 2: {
            i = user.userSprite.retros ? 0 : 1;
            continue;
          }
          case 3: {
            if (game.getTimeElapsed() > 120000) {
              powerupType = 6;
            } else if (
              game.getTimeElapsed() > 80000 &&
              WHUtil.randInt(4) != 0
            ) {
              powerupType = 14;
            }
            i = 1;
            continue;
          }
          case 4: {
            if (game.getTimeElapsed() > 120000) {
              powerupType = 7;
            }
            i = 1;
            continue;
          }
          case 5: {
            if (game.getTimeElapsed() > 60000) {
              powerupType = 14;
            }
            i = 1;
            continue;
          }
        }
      }
    } else {
      // check in the room if all powerups are allowed
      const room = game.gameNetLogic.clientRoomManager.getRoomById(
        game.gameNetLogic.roomId
      );

      let powerupRandNum = room.allPowerupsAllowed ? 14 : 11;
      powerupType = 6 + WHUtil.randInt(powerupRandNum);
      if (powerupType == 14 && WHUtil.randInt(2) == 0) {
        powerupType = 6 + WHUtil.randInt(powerupRandNum);
      }
    }
    let powerupSprite = new PowerupSprite(x, y, powerupType, game);
    powerupSprite.setVelocity(WHUtil.randInt(10), WHUtil.randInt(10));
    return powerupSprite;
  }

  behave() {
    super.behave();
    if (this.spriteCycle > 20) {
      if (this.spriteCycle > 1200) {
        this.shouldRemoveSelf = true;
      }
      this.ctype = 5;
      super.indestructible = false;
    }
  }
}

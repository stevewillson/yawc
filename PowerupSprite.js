import SpriteColors from "./SpriteColors.js";
import Sprite from "./Sprite.js";
import WHUtil from "./WHUtil.js";
import Rectangle from "./Rectangle.js";
import ExplosionSprite from "./ExplosionSprite.js";
import StringSprite from "./StringSprite.js";
import ParticleSprite from "./ParticleSprite.js";

export default class PowerupSprite extends Sprite {
  //g_enemyRatios = new int[] { 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 4, 2, 1, 2, 1, 1, 1, 1, 0, 2 };
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
  PORTAL_HEAT_SEEKER = 6;
  PORTAL_TURRET = 7;
  PORTAL_MINES = 8;
  PORTAL_UFO = 9;
  PORTAL_INFLATER = 10;
  PORTAL_MINELAYER = 11;
  PORTAL_GUNSHIP = 12;
  PORTAL_SCARAB = 13;
  PORTAL_NUKE = 14;
  PORTAL_WALLCRAWLER = 15;
  PORTAL_SWEEP_BEAM = 16;
  PORTAL_EMP = 17;
  PORTAL_GHOST_PUD = 18;
  PORTAL_ARTILLERY = 19;
  PORTAL_LOWEST_SMALL_POWERUP = 6;
  PORTAL_LOWEST_SENDABLE_POWERUP = 6;
  PORTAL_HIGHEST_SENDABLE_POWERUP = 19;
  PORTAL_HIGHEST_SENDABLE_NONSUBSCRIPTION_POWERUP = 16;
  PORTAL_NUMBER_SENDABLE_POWERUPS = 14;
  PORTAL_NUMBER_SENDABLE_NONSUBSCRIPTION_POWERUPS = 11;
  GUN_UPGRADE = 0;
  THRUST_UPGRADE = 1;
  RETROS = 2;
  INVULNERABILITY = 3;
  CLEAR_SCREEN = 4;
  EXTRA_HEALTH = 5;
  PORTAL_LOWEST_NONSENDABLE_POWERUP = 0;
  PORTAL_NUMBER_NONSENDABLE_POWERUP = 6;
  g_enemyRatios;
  g_largeConverstionTypes;
  g_smallConverstionTypes;
  g_names;
  DSHIELD_UPGRADE_VALUE = 30;
  DTHRUST_UPGRADE_VALUE = 0.1;

  constructor(location, powerupType, game) {
    super(location, game);
    this.game = game;
    this.ctype = 4;
    this.init("pup", location.x, location.y, true);
    this.spriteType = 1;
    this.shapeRect = new Rectangle(location.x - 17, location.y - 17, 34, 34);
    this.setHealth(10, 0);
    this.powerupType = powerupType;
    this.indestructible = true;
    this.colors = new SpriteColors();
  }

  drawSelf(context) {
    context.strokeStyle = this.colors.colors[this.ctype][this.spriteCycle % 20];
    context.fillStyle = this.colors.colors[this.ctype][this.spriteCycle % 20];

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
      this.location.x - 14,
      this.location.y - 14,
      imgWidth,
      imgHeight - 2
    );

    // TODO - draw a flashing circle around the sprite
    // Is this a PNG issue?
    // set background color
    // draw a flashing outline around the powerup
    context.arc(this.location.x, this.location.y, 16, 0, 2 * Math.PI);
    // WHUtil.fillCenteredCircle(context, this.location.x, this.location.y, 16);
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
  }

  setCollided(collided) {
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      if (collided == this.game.userSprite) {
        this.givePowerupTo(this.game.userSprite);
        // add a string to show that the user got a powerup
        const stringSprite = new StringSprite(
          this.location,
          PowerupSprite.names[this.powerupType],
          this.game
        );
        stringSprite.addSelf();
        return;
      }
      const explosionSprite = new ExplosionSprite(this.location, this.game);
      explosionSprite.addSelf();

      const particleSprite = new ParticleSprite(this.location, this.game);
      particleSprite.particleInit(20, 10);
      particleSprite.addSelf();
    }
  }

  static genPowerup(x, y, game) {
    let powerupType = 0;
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
            i = game.userSprite.maxShotUpgrade ? 0 : 1;
            continue;
          }
          case 1: {
            i = game.userSprite.maxThrustUpgrade ? 0 : 1;
            continue;
          }
          case 2: {
            i = game.userSprite.retros ? 0 : 1;
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
    let powerupSprite = new PowerupSprite({ x: x, y: y }, powerupType, game);
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

import RotationalPolygon from "./RotationalPolygon.js";
import ThrustSprite from "./ThrustSprite.js";
import Sprite from "./Sprite.js";
import WHUtil from "./WHUtil.js";
import Rectangle from "./Rectangle.js";
import BulletSprite from "./BulletSprite.js";
import ExplosionSprite from "./ExplosionSprite.js";

export default class PlayerSprite extends Sprite {
  static shipShapes = [
    // tank ship coordinates
    [
      { x: -3, y: -14 },
      { x: -3, y: -18 },
      { x: -5, y: -15 },
      { x: -7, y: -3 },
      { x: -19, y: -6 },
      { x: -16, y: 1 },
      { x: -9, y: 5 },
      { x: -6, y: 8 },
      { x: 6, y: 8 },
      { x: 9, y: 5 },
      { x: 16, y: 1 },
      { x: 19, y: -6 },
      { x: 7, y: -3 },
      { x: 5, y: -15 },
      { x: 3, y: -18 },
      { x: 3, y: -14 },
    ],
    [
      { x: 0, y: -18 },
      { x: -4, y: -4 },
      { x: -12, y: 5 },
      { x: -5, y: 5 },
      { x: -3, y: 9 },
      { x: 3, y: 9 },
      { x: 5, y: 5 },
      { x: 12, y: 5 },
      { x: 4, y: -4 },
      { x: 0, y: -18 },
    ],
    [
      { x: -3, y: -16 },
      { x: -6, y: 14 },
      { x: -10, y: -7 },
      { x: -12, y: -2 },
      { x: -12, y: 2 },
      { x: -5, y: 19 },
      { x: -8, y: 2 },
      { x: -3, y: 2 },
      { x: 0, y: 22 },
      { x: 0, y: 22 },
      { x: 3, y: 2 },
      { x: 8, y: 2 },
      { x: 5, y: 19 },
      { x: 12, y: 2 },
      { x: 12, y: -2 },
      { x: 10, y: -7 },
      { x: 6, y: 14 },
      { x: 3, y: -16 },
    ],
    [
      { x: -3, y: -12 },
      { x: -6, y: -3 },
      { x: -6, y: 3 },
      { x: -10, y: 5 },
      { x: -10, y: 20 },
      { x: -3, y: 20 },
      { x: -3, y: 5 },
      { x: -10, y: 5 },
      { x: -6, y: 10 },
      { x: 6, y: 10 },
      { x: 10, y: 5 },
      { x: 3, y: 5 },
      { x: 3, y: 20 },
      { x: 10, y: 20 },
      { x: 10, y: 5 },
      { x: 6, y: 3 },
      { x: 6, y: -3 },
      { x: 3, y: -12 },
    ],
    [
      { x: 0, y: -18 },
      { x: -4, y: -15 },
      { x: -4, y: -12 },
      { x: -7, y: -9 },
      { x: -13, y: -10 },
      { x: -10, y: -6 },
      { x: -10, y: 7 },
      { x: -13, y: 13 },
      { x: -7, y: 10 },
      { x: 0, y: 15 },
      { x: 0, y: 15 },
      { x: 7, y: 10 },
      { x: 13, y: 13 },
      { x: 10, y: 7 },
      { x: 10, y: -6 },
      { x: 13, y: -10 },
      { x: 7, y: -9 },
      { x: 4, y: -12 },
      { x: 4, y: -15 },
      { x: 0, y: -18 },
    ],
    [
      { x: 0, y: -15 },
      { x: -15, y: 11 },
      { x: -5, y: 5 },
      { x: -10, y: 11 },
      { x: 0, y: 7 },
      { x: 0, y: 7 },
      { x: 10, y: 11 },
      { x: 5, y: 5 },
      { x: 15, y: 11 },
      { x: 0, y: -15 },
    ],
    [
      { x: 0, y: -18 },
      { x: -7, y: 9 },
      { x: -13, y: 10 },
      { x: -10, y: 6 },
      { x: -4, y: 15 },
      { x: -4, y: 12 },
      { x: 0, y: 18 },
      { x: 0, y: 18 },
      { x: 4, y: 12 },
      { x: 4, y: 15 },
      { x: 10, y: 6 },
      { x: 13, y: 10 },
      { x: 7, y: 9 },
      { x: 0, y: -18 },
    ],
    [
      { x: 0, y: -37 },
      { x: -15, y: -37 },
      { x: -15, y: -24 },
      { x: -8, y: -24 },
      { x: -8, y: -15 },
      { x: -22, y: -15 },
      { x: -22, y: -19 },
      { x: -29, y: -19 },
      { x: -29, y: 19 },
      { x: -22, y: 19 },
      { x: -22, y: 12 },
      { x: 0, y: 12 },
      { x: 0, y: 12 },
      { x: 22, y: 12 },
      { x: 22, y: 19 },
      { x: 29, y: 19 },
      { x: 29, y: -19 },
      { x: 22, y: -19 },
      { x: 22, y: -15 },
      { x: 8, y: -15 },
      { x: 8, y: -24 },
      { x: 15, y: -24 },
      { x: 15, y: -37 },
      { x: 0, y: -37 },
    ],
    [
      { x: 0, y: -25 },
      { x: -10, y: -25 },
      { x: -10, y: -16 },
      { x: -5, y: -16 },
      { x: -5, y: -10 },
      { x: -15, y: -10 },
      { x: -15, y: -13 },
      { x: -19, y: -13 },
      { x: -19, y: 13 },
      { x: -15, y: 13 },
      { x: -15, y: 8 },
      { x: 0, y: 8 },
      { x: 0, y: 8 },
      { x: 15, y: 8 },
      { x: 15, y: 13 },
      { x: 19, y: 13 },
      { x: 19, y: -13 },
      { x: 15, y: -13 },
      { x: 15, y: -10 },
      { x: 5, y: -10 },
      { x: 5, y: -16 },
      { x: 10, y: -16 },
      { x: 10, y: -25 },
      { x: 0, y: -25 },
    ],
  ];

  static fighterData = [
    {
      // tank
      yTranslation: 3,
      shipScale: 1,
      zoomScale: 3,
      dRotate: 5,
      maxThrust: 6,
      thrust: 0.1,
      health: 280,
      shotUpgrade: 2,
      thrustUpgrade: 0,
      trackingCannons: 0,
      trackingFiringRate: 0,
      specialType: 0,
      unused: 0,
      shipPermissions: 10,
    },
    {
      yTranslation: 4,
      shipScale: 1,
      zoomScale: 3,
      dRotate: 7,
      maxThrust: 7,
      thrust: 0.25,
      health: 240,
      shotUpgrade: 1,
      thrustUpgrade: 1,
      trackingCannons: 0,
      trackingFiringRate: 0,
      specialType: 0,
      unused: 0,
      shipPermissions: 10,
    },

    {
      yTranslation: 0,
      shipScale: 1,
      zoomScale: 3,
      dRotate: 10,
      maxThrust: 10,
      thrust: 0.48,
      health: 200,
      shotUpgrade: 0,
      thrustUpgrade: 3,
      trackingCannons: 0,
      trackingFiringRate: 0,
      specialType: 0,
      unused: 0,
      shipPermissions: 10,
    },
    {
      yTranslation: -2,
      shipScale: 1,
      zoomScale: 3,
      dRotate: 12,
      maxThrust: 11,
      thrust: 0.35,
      health: 180,
      shotUpgrade: 0,
      thrustUpgrade: 2,
      trackingCannons: 1,
      trackingFiringRate: 12,
      specialType: 0,
      unused: 0,
      shipPermissions: 12,
    },
    {
      yTranslation: 0,
      shipScale: 1,
      zoomScale: 3,
      dRotate: 4.5,
      maxThrust: 5.2,
      thrust: 0.15,
      health: 250,
      shotUpgrade: 1,
      thrustUpgrade: 1,
      trackingCannons: 0,
      trackingFiringRate: 0,
      specialType: 1,
      unused: 0.0,
      shipPermissions: 12,
    },
    {
      yTranslation: 0,
      shipScale: 1,
      zoomScale: 3,
      dRotate: 1,
      maxThrust: 1,
      thrust: 0.1,
      health: 190,
      shotUpgrade: 3,
      thrustUpgrade: 3,
      trackingCannons: 0,
      trackingFiringRate: 0,
      specialType: 2,
      unused: 0,
      shipPermissions: 14,
    },
    {
      yTranslation: 0,
      shipScale: 1,
      zoomScale: 3,
      dRotate: 4.8,
      maxThrust: 7,
      thrust: 0.3,
      health: 220,
      shotUpgrade: 0,
      thrustUpgrade: 1,
      trackingCannons: 0,
      trackingFiringRate: 0,
      specialType: 3,
      unused: 0,
      shipPermissions: 12.0,
    },
    {
      yTranslation: 0,
      shipScale: 0.5,
      zoomScale: 1.5,
      dRotate: 2,
      maxThrust: 3.9,
      thrust: 0.11,
      health: 300,
      shotUpgrade: 0,
      thrustUpgrade: 2,
      trackingCannons: 2,
      trackingFiringRate: 14,
      specialType: 4,
      unused: 0,
      shipPermissions: 14,
    },
  ];

  static shotData = [
    [10, 5, 1, 20, 8],
    [14, 5, 1, 14, 6],
    [8, 5, 2, 28, 6],
    [10, 5, 2, 34, 6],
  ];

  static bulletColors = ["white", "blue", "magenta", "red"];

  constructor(location, shipSelect, game) {
    super(location, game);
    this.location = location;
    this.game = game;
    this.init("player", location.x, location.y, true);
    this.shipSelect = shipSelect;
    this.polygon = new RotationalPolygon(PlayerSprite.shipShapes[shipSelect]);
    this.shapeRect = this.getShapeRect();

    // set the ship's basic parameters
    this.setBasicParams(shipSelect);

    // set ship parameters based on the fighterData
    this.setHealth(PlayerSprite.fighterData[shipSelect].health, 1000000);

    // upgrade the ship's cannon
    this.setShot(0);
    for (let i = 0; i < PlayerSprite.fighterData[shipSelect].upgradeShot; i++) {
      this.upgradeShot();
    }

    // upgrade thrust
    if (PlayerSprite.fighterData[shipSelect].upgradeThrust >= 1) {
      this.thrustUpgradeStatus =
        PlayerSprite.fighterData[shipSelect].upgradeThrust;
      this.bRetros = true;
      this.bMaxThrustUpgrade = this.thrustUpgradeStatus >= 3;
    }

    this.trackingCannons = PlayerSprite.fighterData[shipSelect].trackingCannons;
    if (this.trackingCannons > 0) {
      this.turretLocations = [];
    }
    this.specialType = PlayerSprite.fighterData[shipSelect].specialType;
    if (this.specialType == 2) {
      this.shapeShifterFighterShape = 0;
      // this.handleShapeShift();
    }

    // ship state
    this.isUnderEMPEffect = false;

    // this.thrust = 0.45;
    this.thrustCount = 0;
    this.thrustOn = false;

    this.firePrimaryWeapon = false;
    this.fireSecondaryWeapon = false;

    this.lastShotCycle = 0;

    this.bulletDamage = 10;
    this.heatSeekerRounds = 3;

    this.killedBy = "";

    // sprite type - 1 - badGuy
    // sprite type - 2 - goodGuy
    this.spriteType = 2;
    this.shapeType = 1;

    // rotate the ship so that it is facing north
    this.rotate(0);
  }

  upgradeShot() {
    if (!this.bMaxShotUpgrade) {
      this.setShot(this.bulletType + 1);
      if (this.bulletType >= PlayerSprite.shotData.length - 1) {
        this.bMaxShotUpgrade = true;
      }
    }
  }
  setShot(bulletType) {
    this.bulletType = bulletType;
    this.bulletDamage = PlayerSprite.shotData[this.bulletType][0];
    this.bulletSize = PlayerSprite.shotData[this.bulletType][1];
    this.numShots = PlayerSprite.shotData[this.bulletType][2];
    this.maxShots = PlayerSprite.shotData[this.bulletType][3];
    this.shotDelay = PlayerSprite.shotData[this.bulletType][4];
    // Sprite.model.refreshStatus = true;
  }

  upgradeThrust(n) {
    if (!this.bMaxThrustUpgrade) {
      this.thrustUpgradeStatus++;
      this.thrust += n;
      // Sprite.model.refreshStatus = true;
      if (this.thrustUpgradeStatus >= 3) {
        this.bMaxThrustUpgrade = true;
      }
    }
  }

  setCollided(collided) {
    let health = this.health;
    super.setCollided(collided);
    if (this.shouldRemoveSelf) {
      if (collided.color != null) {
        this.killedBy = this.game.getPlayer(collided.slot);
        this.killedBySlot = collided.slot;
      }
      if (this.killedBy != null && !this.killedBy == "") {
        this.game.sendEvent(
          "killed by " + this.killedBy,
          this.game.gameSession
        );
        this.game.killedBy = this.killedBySlot;
      }
      // create some explotion sprites and shrapnel sprites
      let explosion = new ExplosionSprite(
        { x: this.location.x, y: this.location.y },
        this.game,
        this.slot
      );
      explosion.addSelf();
      // new ShrapnelSprite(super.intx, super.inty, 30, Sprite.model.color, 50).addSelf();
      let n = 0;
      for (let n = 0; n < 3; n++) {
        let n2 = this.location.x + WHUtil.randInt(10);
        let n3 = this.location.y + WHUtil.randInt(10);
        new ExplosionSprite({ x: n2, y: n3 }, this.game, this.slot).addSelf();
        // new ShrapnelSprite(n2, n3, 30, Sprite.model.color, 50).addSelf();
      }
      return;
    }
    if (health != this.health) {
      // Sprite.model.refreshStatus = true;
      this.game.strDamagedByPlayer = null;
      if (collided.color != null && collided.bSentByPlayer) {
        this.game.strDamagedByPlayer = this.game.getPlayer(collided.slot);
        this.game.damagingPowerup = collided.powerupType;
        this.lostHealth = health - this.health;
      }
      // new ShrapnelSprite(
      //   super.intx,
      //   super.inty,
      //   10,
      //   Sprite.model.color
      // ).addSelf();
    }
  }

  fireBullet() {
    if (this.numShots == 1) {
      // GameBoard.playSound("snd_fire");
      this.fireBulletAngle(this.radAngle);
    } else if (this.numShots == 2) {
      // GameBoard.playSound("snd_fire");
      this.fireBulletAngle(this.radAngle - 0.05);
      this.fireBulletAngle(this.radAngle + 0.05);
    }
  }

  fireBulletAngle(angle) {
    let bulletSprite = new BulletSprite(
      {
        x: Math.cos(angle) * 12.0 + this.location.x,
        y: Math.sin(angle) * 12.0 + this.location.y,
      },
      this.bulletDamage,
      this.bulletSize,
      PlayerSprite.bulletColors[this.bulletType],
      2,
      this.game
    );
    bulletSprite.setPlayer(this.slot);
    bulletSprite.setVelocity(
      Math.cos(angle) * 10.0 + this.velocity.x,
      Math.sin(angle) * 10.0 + this.velocity.y
    );
    bulletSprite.addSelf();
    this.lastShotCycle = this.spriteCycle + this.shotDelay;
  }

  setBasicParams(n) {
    this.dRotate = PlayerSprite.fighterData[n].dRotate;
    this.maxThrust = PlayerSprite.fighterData[n].maxThrust;
    this.thrust = PlayerSprite.fighterData[n].thrust;
    this.trackingFiringRate = PlayerSprite.fighterData[n].trackingFiringRate;
  }

  // called every cycle to draw the player's ship
  drawSelf(context) {
    if (this.bInvisible || this.shouldRemoveSelf) {
      return;
    }
    // if (this.targetSprite != null && !this.targetSprite.shouldRemoveSelf) {
    // context.strokeStyle = this.color;
    // WHUtil.drawTarget(paramGraphics, this.targetSprite.location.x,
    // this.targetSprite.location.y);
    // }

    // always draw the player at the center of the map
    // context.translate(
    //   this.game.viewportRect.width / 2,
    //   this.game.viewportRect.height / 2
    // );
    context.translate(this.location.x, this.location.y);
    // if (this.specialType == 3) {
    //   let b = 0;
    // while (true) {
    //   if (b < this.heatSeekerRounds) {
    //     paramGraphics.setColor(this.color);
    //     paramGraphics.fillRect(-18, 28 - b * 6, 5, 5);
    //   }
    //   paramGraphics.setColor(Color.gray);
    //   paramGraphics.drawRect(-18, 28 - b * 6, 5, 5);
    //   if (++b >= 3) {
    //     paramGraphics.translate(-this.location.x + this.targetX,
    //                             -this.location.y + this.targetY);
    //     paramGraphics.setColor((this.heatSeekerRounds > 0) ? this.color
    //                                                          : Color.gray);
    //     paramGraphics.drawLine(0, -10, 0, 10);
    //     paramGraphics.drawLine(-10, 0, 10, 0);
    //     paramGraphics.translate(this.location.x - this.targetX,
    //                             this.location.y - this.targetY);
    //     break;
    //   }
    // }
    // }

    // rotate the model 90 degrees?
    this.polygon.rotate(90);

    // draw the polygon
    this.polygon.getPolygon().drawPolygon(context, "white");

    // undo the rotation
    this.polygon.rotate(-90);

    // console.log(
    // `Player: x: ${parseInt(this.location.x)} y: ${parseInt(this.location.y)}`
    // );

    // paramGraphics.drawPolygon(this.drawPoly.xpoints, this.drawPoly.ypoints,
    //                           this.drawPoly.npoints);
    // if (this.isUnderEMPEffect) {
    //   paramGraphics.setColor(Color.white);
    //   byte b = 0;
    //   do {
    //     WHUtil.drawCenteredCircle(paramGraphics, WHUtil.randInt(3),
    //                               WHUtil.randInt(3), 20);
    //     WHUtil.drawCenteredCircle(paramGraphics, WHUtil.randInt(8),
    //                               WHUtil.randInt(8), 15);
    //   } while (++b < 3);
    // }
    // if (this.isFiringAttractor) {
    //   int j = 300 - this.spriteCycle % 300;
    //   byte b = 0;
    //   do {
    //     paramGraphics.setColor(
    //         Sprite.g_colors[this.slot][(this.spriteCycle + b * 4) % 20]);
    //     j = (j + 100) % 300;
    //     WHUtil.drawCenteredCircle(paramGraphics, 0.0D, 0.0D, j);
    //   } while (++b < 3);
    // }
    // if (this.trackingCannons > 0)
    //   for (byte b = 0; b < this.trackingCannons; b++) {
    //     int j;
    //     paramGraphics.setColor(this.color);
    //     WHUtil.fillCenteredCircle(paramGraphics, this.turretLocations[b][0],
    //                               this.turretLocations[b][1], 5);
    //     if (this.targetSprite == null) {
    //       j = (int)this.angle;
    //     } else {
    //       j = (int)WHUtil.findAngle(this.targetSprite.location.x,
    //                                 this.targetSprite.location.y, this.location.x,
    //                                 this.location.y);
    //     }
    //     paramGraphics.setColor(Color.black);
    //     WHUtil.fillCenteredArc(paramGraphics, this.turretLocations[b][0],
    //                            this.turretLocations[b][1], 5, -j - 20, 40);
    //   }
    // if (this.shieldCyclesLeft > 0) {
    //   Color color = Color.gray;
    //   if (this.shieldCyclesLeft > 40) {
    //     color = Color.green;
    //   } else if (this.shieldCyclesLeft > 20) {
    //     color = Color.yellow;
    //   }
    //   paramGraphics.setColor(color);
    //   if (this.fighterType == 7) {
    //     WHUtil.drawCenteredCircle(paramGraphics, 0.0D, 0.0D, 28);
    //     WHUtil.drawCenteredCircle(paramGraphics, 0.0D, 0.0D, 26);
    //   } else {
    //     WHUtil.drawCenteredCircle(paramGraphics, 0.0D, 0.0D, 20);
    //     WHUtil.drawCenteredCircle(paramGraphics, 0.0D, 0.0D, 18);
    //   }
    // }
    if (this.health < this.MAX_HEALTH / 3) {
      context.fillStyle = "red";
      context.strokeStyle = "red";
    } else if (this.health < (2 / 3) * this.MAX_HEALTH) {
      context.fillStyle = "yellow";
      context.strokeStyle = "yellow";
    } else {
      context.fillStyle = "green";
      context.strokeStyle = "green";
    }
    let i = 20 * (this.health / this.MAX_HEALTH);
    // let i = d * 20;
    context.beginPath();
    context.strokeRect(18, 18, 5, 20);
    context.fillRect(18, 38 - i, 5, i);
    context.stroke();
    // Sprite.model.drawTeamShape(paramGraphics, 25, 15);
    context.translate(-this.location.x, -this.location.y);

    // draw thrust trail
    if (this.thrustOn) {
      this.drawThrust();
      this.thrustOn = false;
    }
  }

  rotate(degrees) {
    super.rotate(degrees);
    this.polygon.rotate(degrees);
  }

  drawOneThrust(n, n2, n3, n4) {
    let thrustSprite = new ThrustSprite(
      {
        x: this.location.x - n3 * (Math.cos(n) * 12),
        y: this.location.y - n3 * (Math.sin(n) * 12),
      },
      this.game
    );
    thrustSprite.vectorx = -2 * super.vectorx;
    thrustSprite.vectory = -2 * super.vectory;
    thrustSprite.addSelf();
  }

  drawThrust() {
    if (this.thrustCount > 3) {
      let i = this.spriteCycle % 20;
      this.drawOneThrust(
        (this.angle + i) * 0.017453292519943295,
        1 + (WHUtil.randInt() % 2),
        3.0,
        0
      );
      this.drawOneThrust(
        (this.angle - i) * 0.017453292519943295,
        1 + (WHUtil.randInt() % 2),
        3.0,
        0
      );
    }
    this.drawOneThrust(this.radAngle, Math.min(this.thrustCount, 5), 2.0, 0);
  }

  handleThrust() {
    this.thrustOn = true;
    this.doMaxThrust(this.thrust);
    // GameBoard.playSound(
    // play the audio file for the thrusters
    // (AudioClip)WormholeModel.g_mediaTable.get("snd_thrust"));
    // in sound/thrust.mp3
    // }
  }

  activateEMP() {
    this.isUnderEMPEffect = true;
    this.cyclesLeftUnderEMP = 150;
    this.empType = WHUtil.randInt() % 3;
  }

  // called every cycle to execute the behavior of the player's ship
  behave() {
    if (this.shieldCyclesLeft > 0) {
      this.shieldCyclesLeft--;
      this.indestructible = true;
    } else {
      this.indestructible = false;
    }
    super.behave();
    // check keys
    // want to move the logic for key handling away from this area
    // let i = Sprite.model.left;
    // let j = Sprite.model.right;
    // let k = Sprite.model.up;
    // let m = Sprite.model.fire;
    // let n = Sprite.model.secondaryFire;
    // let i1 = Sprite.model.tertiaryFire;

    // mess everything up if under the effect of an EMP
    if (this.isUnderEMPEffect) {
      if (this.cyclesLeftUnderEMP < 1) {
        this.isUnderEMPEffect = false;
      } else {
        this.cyclesLeftUnderEMP--;
        // i = Sprite.model.right;
        // j = Sprite.model.left;
        switch (this.empType) {
          case 0:
            // m = Sprite.model.up;
            // k = Sprite.model.fire;
            break;
          case 1:
            // n = Sprite.model.fire;
            break;
          case 2:
            // m = Sprite.model.right;
            // j = Sprite.model.up;
            // k = Sprite.model.left;
            // i = Sprite.model.fire;
            break;
        }
      }
    }
    if (this.specialType == 3) {
      this.targetX = this.location.x + int(200 * Math.cos(this.radAngle));
      this.targetY = this.location.y + int(200 * Math.sin(this.radAngle));
      if (System.currentTimeMillis() > this.nextHSRegen) {
        if (this.heatSeekerRounds < 3) this.heatSeekerRounds++;
        this.nextHSRegen = Date.now() + 20000;
      }
    }
    let weaponsReady = true;
    let thrustEnabled = true;

    // patched in for now - SW 9/11/23
    let tertiaryFire = 0;

    if (tertiaryFire > 0) {
      if (this.spriteCycle > this.nextTFireCycle) {
        switch (this.specialType) {
          case 1:
            handleTurtleCannon();
            this.nextTFireCycle = this.spriteCycle + 10;
            break;
          case 2:
            handleShapeShift();
            this.nextTFireCycle = this.spriteCycle + 4;
            break;
          case 3:
            fireHeatSeeker();
            this.nextTFireCycle = this.spriteCycle + 4;
            break;
          case 4:
            firePowerupAttractor();
            this.isFiringAttractor = true;
            thrustEnabled = false;
            weaponsReady = false;
            break;
        }
      }
    } else {
      this.isFiringAttractor = false;
    }
    if (this.trackingCannons > 0 && weaponsReady) {
      // this.handleTrackingCannon();
    }

    // check if the player is rotating
    if (this.isRotating) {
      this.rotate(this.dRotate);
      this.isRotating = false;
    }

    if (this.thrustOn && thrustEnabled) {
      this.thrustCount++;
      this.handleThrust();
    } else {
      this.thrustCount = 0;
      this.thrustOn = false;
    }
    if (this.bRetros && !this.thrustOn && !this.isUnderEMPEffect) {
      this.decel(0.995);
    }
    // if (bool1) {
    //   if (n > 0 && this.lastShotCycle < this.spriteCycle) {
    //     this.firePowerup();
    //   }
    //   if (
    //     m > 0 &&
    //     this.lastShotCycle < this.spriteCycle &&
    //     BulletSprite.g_nBullets < this.maxShots
    //   )
    //     fireBullet();
    // }

    if (weaponsReady) {
      if (this.fireSecondaryWeapon && this.lastShotCycle < this.spriteCycle) {
        this.firePowerup();
      }
      if (
        this.firePrimaryWeapon &&
        this.lastShotCycle < this.spriteCycle &&
        this.game.nBullets < this.maxShots
      ) {
        this.fireBullet();
        this.firePrimaryWeapon = false;
      }
    }
  }

  // get the view box location for the player
  // this is the upper left of the viewing rectangle
  getViewportRect() {
    this.game.viewportRect = new Rectangle(
      this.location.x - this.game.viewport.width / 2,
      this.location.y - this.game.viewport.height / 2,
      this.game.viewport.width,
      this.game.viewport.height
    );
    return this.game.viewportRect;
  }

  // get a shapeRect that is centered around the current location of the object with the bounds
  getShapeRect() {
    let bounds = this.polygon.getBounds();
    bounds.setLocation(
      this.location.x - bounds.width / 2,
      this.location.y - bounds.height / 2
    );
    return bounds;
  }
}

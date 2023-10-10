import UserSprite from "./UserSprite.js";
import UserState from "./UserState.js";
import SpriteColors from "./SpriteColors.js";
import WHUtil from "./WHUtil.js";
import Rectangle from "./Rectangle.js";
import PortalSprite from "./PortalSprite.js";
import WallCrawlerSprite from "./WallCrawlerSprite.js";
import Polygon from "./Polygon.js";
import ClientRoomManager from "./ClientRoomManager.js";
import ClientRoom from "./ClientRoom.js";
import PowerupSprite from "./PowerupSprite.js";

/**
 * Game Class
 * @description implements a Game (Wormhole) that contains a board
 * world is the total renderable canvas, use this size for generating the stars
 */
export default class Game {
  canvas;
  context;

  loop;
  gameNetLogic;
  input;
  userStates;
  colors;
  mode;

  allSprites;
  badGuys;
  goodGuys;

  isDebugMode;
  currentFighterShade;

  selectedShip;
  zoomInIntro;

  powerups;

  incomingCycle;

  constructor(gameNetLogic) {
    // set a debug mode for displaying shapeRects
    this.isDebugMode = false;
    this.gameNetLogic = gameNetLogic;
    this.input = {
      right: false,
      left: false,
      up: false,
      spacebar: false,
    };

    this.soundOn = true;

    this.userHeight = 60;

    // array of UserState objects
    this.userStates = new Array(8);
    for (let i = 0; i < this.userStates.length; i++) {
      this.userStates[i] = new UserState(this);
    }

    this.userSprite = null;
    this.colors = new SpriteColors();

    this.novaInfo = [];
    this.orbitDistance = 240;

    this.borderShades = new Array(6);

    // sprite arrays
    this.allSprites = [];
    this.badGuys = [];
    this.goodGuys = [];

    // track the total number of bullets here
    this.nBullets = 0;

    this.mode = "waiting";
    this.slot = null;

    this.powerups = new Array(5);
    this.numPowerups = 0;

    this.currentFighterShade = 0;

    // default to using the shipType of 1
    this.userShipType = 1;

    this.selectedShip = 1;
    this.zoomInIntro = 0;

    this.incomingCycle = 0;

    // only use key handlers when the game is in focus?
    // key press handlers
    // TODO - may need to modify to allow for chatting while in game
    document.onkeydown = (e) => this.onkeydown(e);
    document.onkeyup = (e) => this.onkeyup(e);
  }

  onkeyup(e) {
    console.log("key up " + e.code);
    e.preventDefault();

    if (e.code === "ArrowRight") {
      this.input.right = false;
    } else if (e.code === "ArrowLeft") {
      this.input.left = false;
    } else if (e.code === "ArrowUp") {
      this.input.up = false;
    } else if (e.code === "Space") {
      this.input.spacebar = false;
    }
  }

  onkeydown(e) {
    console.log("key down " + e.code);
    e.preventDefault();

    if (e.code === "ArrowRight") {
      this.input.right = true;
    } else if (e.code === "ArrowLeft") {
      this.input.left = true;
    } else if (e.code === "ArrowUp") {
      this.input.up = true;
    } else if (e.code === "Space") {
      this.input.spacebar = true;
    } else if (e.code === "KeyF") {
      this.input.fKey = true;
    }
  }

  prepareCanvas() {
    this.canvas = document.getElementById("GameCanvas");
    this.canvas.addEventListener(
      "mousedown",
      this.processClick.bind(this),
      false
    );

    this.userStatusCanvas = document.getElementById("UserStatusCanvas");
    this.otherStatusCanvas = document.getElementById("OtherStatusCanvas");

    this.userStatusCanvas.width = 430;
    this.userStatusCanvas.height = 49;

    this.otherStatusCanvas.width = 144;
    this.otherStatusCanvas.height = 474;

    this.userStatusContext = this.userStatusCanvas.getContext("2d");
    this.otherStatusContext = this.otherStatusCanvas.getContext("2d");

    this.context = this.canvas.getContext("2d");
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update() {
    // console.log("gameloop updating");
    if (this.input.right) {
      this.userSprite.dRotate = Math.abs(this.userSprite.dRotate);
      this.userSprite.isRotating = true;
    }
    if (this.input.left) {
      this.userSprite.dRotate = -1 * Math.abs(this.userSprite.dRotate);
      this.userSprite.isRotating = true;
    }
    if (this.input.up) {
      this.userSprite.thrustOn = true;
    }
    if (this.input.spacebar) {
      this.userSprite.firePrimaryWeapon = true;
    }
    if (this.input.fKey) {
      this.userSprite.fireSecondaryWeapon = true;
    }

    // methods from doPlayCycle
    this.cycle++;
    this.doBehavior();
    this.doCollisions();
    this.checkSidebar();
  }

  render() {
    // the full canvas is drawn and then only a portion of it is displayed to the
    // viewport canvas

    // console.log("gameloop rendering");
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.draw(this.context);

    // refresh the user bar after getting a powerup

    if (this.refreshUserBar) {
      this.drawUserBar(this.userStatusContext);
      this.sendState(this.sessionId);

      this.strDamagedByUser = null;
      this.damagingPowerup = null;
    }
    if (this.refreshOtherBar) {
      this.drawOtherBar(this.otherStatusContext, this.refreshAll);
      this.refreshAll = false;
    }
  }

  // initialize the game
  // reset the wins slot and color
  // do a full reset on all the userStates
  reset() {
    this.init();
    this.wins = 0;
    super.slot = 0;
    this.color = this.colors.colors[0][0];
    this.refreshOtherBar = true;
    for (let i = 0; i < this.userStates.length; ++i) {
      this.userStates[i].fullReset();
    }
    this.mode = "resetGame";
  }

  init() {
    // should we use the clientRoomManager and the clientUserManager
    // to make sure all of the necessary people are in the room?

    this.prepareCanvas();

    // use these to track playable board size
    // world (including outside areas)
    // board center
    // set the board width to the canvas width
    // this.board = { width: 430, height: 423 };
    this.board = { width: this.canvas.width, height: this.canvas.height };

    this.viewport = { width: this.canvas.width, height: this.canvas.height };
    // this is the entire size of the virtual world for rendering stars
    this.world = {
      width: this.board.width + this.viewport.width,
      height: this.board.width + this.viewport.height,
    };
    this.worldCenter = { x: this.world.width / 2, y: this.world.height / 2 };
    this.boardCenter = { x: this.board.width / 2, y: this.board.height / 2 };
    this.viewportCenter = {
      x: this.viewport.width / 2,
      y: this.viewport.height / 2,
    };

    // this holds the upper left corner of the viewable rectangle
    this.viewportRect = new Rectangle(
      this.boardCenter.x - this.viewport.width / 2,
      this.boardCenter.y - this.viewport.height / 2,
      this.viewport.width,
      this.viewport.height
    );

    this.globalBoundingRect = new Rectangle(
      0,
      0,
      this.board.width,
      this.board.height
    );

    // set position for the welcome screen elements

    this.intro = { width: 410, height: 260 };
    this.introX = (this.board.width - this.intro.width) / 2;
    this.introY = this.board.height - this.intro.height - 10;
    this.intro_shipX = this.introX + 5;
    this.intro_shipY = this.introY + 40;

    // https://stackoverflow.com/questions/16919601/html5-canvas-camera-viewport-how-to-actually-do-it
    // want to render the game using a centered portal

    this.portalVisibility = (this.board.width / 2) * 1.45;

    this.incomingCycle = 0;
    this.incomingIconCycle = 0;
    this.incomingWhoStack = [];
    this.fromSlot = 0;
    this.currentShade = 0;
    this.incomingTypeStack = [];
    this.incomingIconIndex = 0;
    this.incomingNukeCycle = 0;

    this.numPowerups = 0;
    this.flashScreenColor = "black";

    // get the start time (in ms)
    this.startTime = Date.now();

    // reset powerups
    for (let i = 0; i < this.userStates.length; i++) {
      this.userStates[i].resetPowerups();
    }

    this.boardChanged = true;

    this.gameOver = false;
    this.refreshUserBar = true;

    // clear sprite arrays
    this.allSprites = [];
    this.badGuys = [];
    this.goodGuys = [];

    this.orbitDistance = 240;
    let n;

    // set the orbitDistance based on the number of users
    if (this.gameNetLogic.roomId != null) {
      const room = this.gameNetLogic.clientRoomManager.getRoomById(
        this.gameNetLogic.roomId
      );
      switch (room.boardSize) {
        // setting local totalOpposingPlayingUsers to change the board size
        case 1: {
          n = 2;
          this.orbitDistance = 150;
          break;
        }
        case 2:
        case 3:
          n = 3;
          this.orbitDistance = 240;
          break;

        default: {
          n = 3.6;
          this.orbitDistance = 280;
          break;
        }
      }
    }

    // for (let i = 0; i < 60; i++) {
    //   this.novaInfo[i][0] = 50;
    // }

    // generate the stars
    this.initStars(70);

    this.nBullets = 0;

    // this.vMessages.removeAllElements();

    this.initBorderShade();

    this.winningUserString = null;

    // create a new user that starts at the center of the board
    // with the specified ship type

    // move this to the joinRoom area?
    this.userSprite = new UserSprite(this.boardCenter, this.userShipType, this);
    // this.imgLogo = (Image)this.mediaTable.get("img_bg_logo");
    // if (this.imgLogo != null) {
    //   this.rectLogo.setBounds(
    //     this.boardCenter.x - this.imgLogo.getWidth(null) / 2,
    //     this.boardCenter.y - this.imgLogo.getHeight(null) / 2,
    //     this.imgLogo.getWidth(null),
    //     this.imgLogo.getHeight(null)
    //   );
    // }

    this.userSprite.addSelf();
    this.userSprite.setUser(this.slot);

    let wc1 = new WallCrawlerSprite({ x: 0, y: 0 }, this, true);
    let wc2 = new WallCrawlerSprite({ x: 0, y: 0 }, this, false);

    wc1.addSelf();
    wc2.addSelf();

    // start gameLoop
    window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  gameLoop(timeStamp) {
    // Keep requesting new frames
    window.requestAnimationFrame(this.gameLoop.bind(this));

    // insert silence audio clip here
    // GameBoard.playSound((AudioClip)g_mediaTable.get("snd_silence"));

    // state machine
    // playing -> gameOver
    // gameOver -> resetGame
    // resetGame -> waiting
    // waiting (should go to start game?), when the "Start Game" button
    // is pushed, the "startGame" packet is received,
    // which sets the mode to "playing" in handleGamePacket

    switch (this.mode) {
      case "playing": {
        // behavior, collisions, checkSidebar
        this.update();
        // handles redrawing the screen
        this.render();
        if (this.gameOver) {
          this.gameOverCycle = 0;
          this.mode = "gameOver";
          if (this.winningUserString == null) {
            this.sendGameOver(this.sessionId, this.killedBy);
            return;
          }
        }
        break;
      }

      case "resetGame": {
        // case where the game is over
        this.gameOver = true;
        this.mode = "waiting";
        // draw the bar across the top of the screen
        this.drawUserBar(this.userStatusContext);
        this.refreshOtherBar = true;
        break;
      }

      // case 2 is waiting for the game to start
      case "waiting": {
        // this is the timeout attacks function
        // checkSidebar();

        // only draw the user bar if it should be refreshed
        if (this.refreshOtherBar) {
          this.drawOtherBar(this.otherStatusContext, true);
        }

        this.draw(this.context);

        // ship selection area
        this.drawIntro(this.context);
        // get the status of the game

        const room = this.gameNetLogic.clientRoomManager.getRoomById(
          this.gameNetLogic.roomId
        );

        if (room != null) {
          // if the game is already playing, wait for the next game
          if (room.status == "playing") {
            this.drawStrings(this.context, "Waiting for", "Next Game");
          } else if (room.status == "countdown") {
            this.drawStrings(this.context, "Countdown", "" + room.countdown);
            // write a message depending on how many users there are
          } else if (room.numUsers() < 2) {
            this.drawStrings(this.context, "Waiting for", "More Users");
          } else {
            this.drawStrings(this.context, "Press Play Button", "To Start");
          }
        }
        return;
      }

      case "gameOver": {
        // behavior, collisions, checkSidebar
        this.update();

        // handles redrawing the screen
        this.render();
        if (this.gameOverCycle++ > 120 || this.winningUserString != null) {
          this.mode = "resetGame";
          return;
        }
        break;
      }
    }
  }

  playSound(paramAudioClip) {
    if (paramAudioClip != null && soundOn) paramAudioClip.play();
  }

  // add users to the room when someone joins the room
  // readJoin(paramDataInput) {
  //   this.model.readJoin(paramDataInput);
  // }

  // may not be used at this time
  // addUser(username, rank, teamId, icons, slot) {
  //   // check if the userId is equal to the user's current user id
  //   if (this.gameNetLogic.username != username) {
  //     this.setUser(username, rank, teamId, icons, slot, true, true);
  //   }
  //   // check if it is a team table
  //   const room = this.gameNetLogic.clientRoomManager.getRoomById(
  //     this.gameNetLogic.roomId
  //   );
  //   if (room.isTeamRoom) {
  //     this.refreshAll = true;
  //   }
  // }

  getUser(slot) {
    if (slot > this.userStates.length) {
      return "COMPUTER";
    }
    if (slot == this.gameNetLogic.user.slot) {
      return "YOU";
    }
    return this.userStates[this.translateSlot(slot)].clientUser.username;
  }

  removeUser(username) {
    // users is an array of UserInfo objects
    for (let i = 0; i < this.userStates.length; i++) {
      if (this.userStates[i].clientUser.username == username) {
        this.refreshOtherBar = true;
        this.userStates[i].fullReset();
      }
    }

    // get the room by the roomId
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );
    if (room.isTeamRoom) {
      this.refreshAll = true;
    }
  }

  doBehavior() {
    // loop through all the sprites and remove or do the behavior
    for (let i = 0; i < this.allSprites.length; i++) {
      let sprite = this.allSprites[i];
      if (sprite != null) {
        if (sprite.shouldRemoveSelf) {
          sprite.removeSelf();
        } else {
          sprite.behave();
        }
      }
    }
    if (this.lastCycleForMessages < this.cycle && this.vMessages.size() > 0) {
      this.vMessages.removeElementAt(0);
    }

    let gameTimeSeconds = (Date.now() - this.startTime) / 1000;
    let genEnemyProb = 500;
    if (gameTimeSeconds > 240) {
      genEnemyProb = 400;
    } else if (gameTimeSeconds > 120) {
      genEnemyProb = 450;
    } else if (gameTimeSeconds > 80) {
      genEnemyProb = 500;
    } else if (gameTimeSeconds < 40) {
      return;
    }

    // is this randomness to generate enemies from a portal?
    if (WHUtil.randInt() % genEnemyProb == 1) {
      // we are generating enemies for all users currently playing
      // but this starts at a 'random' user and generates enemies for all users
      // now, just loop through all users to generate enemies
      // let j = WHUtil.randInt() % this.users.length;
      for (let i = 0; i < this.userStates.length; i++) {
        // let userInfo = this.users[(j + b) % this.users.length];
        let userState = this.userStates[i];
        if (userState.isPlaying() && userState.portalSprite != null) {
          userState.portalSprite.genEnemy = true;
          return;
        }
      }
    }
  }

  doCollisions() {
    for (let i = 0; i < this.badGuys.length; i++) {
      let spriteA = this.badGuys[i];
      if (spriteA != null) {
        for (let j = 0; j < this.goodGuys.length; j++) {
          let spriteB = this.goodGuys[j];
          if (
            spriteB != null &&
            !spriteA.hasCollided &&
            !spriteB.hasCollided &&
            spriteA.isCollision(spriteB)
          ) {
            spriteB.setCollided(spriteA);
            spriteA.setCollided(spriteB);
          }
        }
      }
    }
  }

  checkSidebar() {
    for (let b = 0; b < this.userStates.length; b++) {
      if (this.userStates[b].timeoutAttacks()) {
        this.refreshUserBar = true;
      }
    }
  }

  setTeam(s, b) {
    if (this.gameNetLogic.username == s) {
      this.teamId = b;
    } else {
      for (let i = 0; i < this.userStates.length; ++i) {
        if (this.userStates[i].clientUser.username == s) {
          this.userStates[i].teamId = b;
        }
        this.userStates[i].refresh = true;
      }
    }
    this.refreshOtherBar = true;
  }

  setSlot(slot) {
    this.slot = slot;
    this.color = this.colors.colors[slot][0];
  }

  // remove all the zappable sprites on the screen
  clearScreen() {
    this.flashScreenColor = "white";
    for (let i = 0; i < this.badGuys.length; i++) {
      let sprite = this.badGuys[i];
      if (
        sprite != null &&
        sprite.isInDrawingRect &&
        (!sprite.indestructible || sprite.isZappable)
      ) {
        sprite.killSelf();
      }
    }
  }

  // draw the Game to the canvas
  draw(context) {
    if (this.userSprite != null) {
      // get the viewable area for the user
      let viewportRect = this.userSprite.getViewportRect();

      context.fillStyle = "black";
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.drawStars(context, "gray", this.narrowStar);
      // draw pointers to other wormholes
      this.drawPointers(context);
      context.translate(-viewportRect.x, -viewportRect.y);
      this.drawBorder(context);
      this.drawStars(context, "white", this.star);
      this.drawRing(context);

      const room = this.gameNetLogic.clientRoomManager.getRoomById(
        this.gameNetLogic.roomId
      );
      if (this.teamID != 0 && room.isTeamTable && !this.isGameOver) {
        this.drawTeamStuff(context);
      }
      // draw wormhole backgrounds?
      // if (this.imgLogo != null && viewRect.intersects(this.rectLogo)) {
      //   graphics.drawImage(
      //     this.imgLogo,
      //     this.rectLogo.x,
      //     this.rectLogo.y,
      //     null
      //   );
      // }

      if (this.incomingCycle > 0) {
        this.incomingCycle--;
        context.font = "40pt helvetica bold";
        context.strokeStyle =
          SpriteColors.colors[this.fromSlot][this.currentShade++ % 20];
        context.strokeText("I N C O M I N G", this.boardWidth / 2 - 120, 200);
        if (this.incomingNukeCycle > 0) {
          this.incomingNukeCycle--;
          context.strokeText("N U K E", this.boardWidth / 2 - 90, 240);
        }
      }

      // draw all sprites
      this.allSprites.forEach((sprite) => {
        if (sprite != null) {
          // check if the sprite is in the viewportRect
          sprite.isInDrawingRect = sprite.inViewingRect(viewportRect);
          if (sprite.isInDrawingRect) {
            sprite.drawSelf(context);

            // display shapeRects when in debug mode
            // if (this.isDebugMode) {
            //   WHUtil.drawRect(context, sprite.shapeRect);
            // }
          }
        }
      });

      context.translate(viewportRect.x, viewportRect.y);

      if (this.incomingIconCycle > 0) {
        this.incomingIconCycle--;
      } else if (this.incomingIconIndex > 0) {
        this.incomingIconIndex--;
        this.incomingIconCycle = 50;
        for (let k = 0; k < this.incomingIconIndex; k++) {
          this.incomingTypeStack[k] = this.incomingTypeStack[k + 1];
          this.incomingWhoStack[k] = this.incomingWhoStack[k + 1];
        }
      }

      // for (let l = 0; l < this.incomingIconIndex; l++) {
      // draw a powerup sprite
      //   graphics.drawImage(
      //     getImages("img_smallpowerups")[
      //       PowerupSprite.convertToSmallImage(this.incomingTypeStack[l])
      //     ],
      //     2,
      //     l * 15 + 31,
      //     null
      //   );
      //   Sprite.drawFlag(
      //     graphics,
      //     Sprite.g_colors[this.incomingWhoStack[l]][0],
      //     25,
      //     l * 15 + 31
      //   );
      // }
      // if (this.winningUserString != null) {
      //   this.drawShadowString(graphics, "GAME OVER!", 100, 100);
      //   this.drawShadowString(
      //     graphics,
      //     "WINNER: " + this.winningUserString,
      //     100,
      //     120
      //   );
      // }
      // graphics.setColor(Color.white);
      // graphics.setFont(WormholeModel.fontTwelve);
      // for (let n = 0; n < this.vMessages.size(); n++) {
      //   graphics.drawString(this.vMessages.elementAt(n), 10, 10 * (n + 1));
      // }
    }
    //   if (this.teamID != 0) {
    //     graphics.setFont(WormholeModel.fontTwelve);
    //     graphics.setColor(CFSkin.TEACOLORS[this.teamID]);
    //     graphics.drawString(CFSkin.TEANAMES[this.teamID] + " member", this.boardWidth - 135, 13);
    // }
    // graphics.setColor(Color.white);
    // graphics.drawRect(0, 0, this.boardWidth - 1, this.boardHeight - 1);
  }

  initBorderShade() {
    // initialize the border shade color
    if (this.color != null) {
      this.borderShades[0] = this.color;
      for (let i = 0; i < this.borderShades.length - 1; i++) {
        // reimplement the Java .darker() function
        let DARKER_FACTOR = 0.251;
        // get the rgb values of the color
        let curColorRGB = WHUtil.nameToRGB(this.borderShades[i]);
        // get the 3 RGB values
        let rgb = curColorRGB.replace(/[^\d,]/g, "").split(",");
        let tempColor = `rgb(${rgb[0] * DARKER_FACTOR}, ${
          rgb[1] * DARKER_FACTOR
        }, ${rgb[2] * DARKER_FACTOR})`;
        this.borderShades[i + 1] = tempColor;
      }
    }
  }

  // draw a line to point to other wormholes
  drawPointers(context) {
    for (let i = 0; i < this.userStates.length; i++) {
      if (this.userStates[i].isPlaying() && this.userSprite != null) {
        let n =
          this.userStates[i].portalSprite.location.x -
          this.userSprite.location.x;
        let n2 =
          this.userStates[i].portalSprite.location.y -
          this.userSprite.location.y;
        let hyp = Math.hypot(n, n2);
        if (hyp >= this.portalVisibility) {
          let n3 = (180 * n) / hyp;
          let n4 = (180 * n2) / hyp;
          let n5 = n3 + this.viewportCenter.x;
          let n6 = n4 + this.viewportCenter.y;

          let atan = Math.atan(n2 / n);
          let n7 = 171;
          if (n < 0) {
            n7 = -n7;
          }
          let n8 = atan + 0.04;
          let n9 = atan - 0.04;
          let n10 = n7 * Math.cos(n8) + this.viewportCenter.x;
          let n11 = n7 * Math.sin(n8) + this.viewportCenter.y;
          let n12 = n7 * Math.cos(n9) + this.viewportCenter.x;
          let n13 = n7 * Math.sin(n9) + this.viewportCenter.y;

          context.strokeStyle = this.userStates[i].color;
          context.beginPath();

          context.moveTo(n5, n6);
          context.lineTo(
            n3 * 0.9 + this.viewportCenter.x,
            n4 * 0.9 + this.viewportCenter.y
          );

          context.moveTo(n5, n6);
          context.lineTo(n10, n11);

          context.moveTo(n5, n6);
          context.lineTo(n12, n13);

          context.moveTo(n12, n13);
          context.lineTo(n10, n11);
          context.stroke();
        }
      }
    }
  }

  /**
   * drawRing
   * @param context a canvas context to draw the ring
   * @description draws a gray ring to place the portals on
   */
  drawRing(context) {
    WHUtil.drawCenteredCircle(
      context,
      this.worldCenter.x,
      this.worldCenter.y,
      this.orbitDistance,
      "gray"
    );
  }

  drawBorder(context) {
    // draw the outer border box
    for (let i = 0; i < this.borderShades.length; i++) {
      context.strokeStyle = this.borderShades[i];
      context.strokeRect(
        -i,
        -i,
        this.world.width + i * 2,
        this.world.height + i * 2
      );
    }
  }

  drawStars(context, color, loc) {
    // set the color of the stars
    context.fillStyle = color;

    for (let i = 0; i < loc.length; i++) {
      context.fillRect(loc[i].x, loc[i].y, this.starSize[i], this.starSize[i]);
    }
  }

  // generate locations for the stars
  initStars(numStars) {
    // fill out stars for the board
    // randomly space them

    this.star = [];
    this.narrowStar = [];
    this.starSize = [];
    this.numStars = numStars;

    // let n3 = this.boardCenter.x - 40;
    // let n4 = this.boardCenter.y - 40;

    for (let i = 0; i < this.numStars; i++) {
      this.star.push({
        x: WHUtil.randInt() % this.world.width,
        y: WHUtil.randInt() % this.world.height,
      });

      // if (i < 35) {
      //   // require that these stars are n3 < STARX < n3+80
      //   // and n4 < STARY < n4+80
      //   let starX = (WHUtil.randInt() % 79) + n3 + 1;
      //   let starY = (WHUtil.randInt() % 79) + n4 + 1;

      //   this.narrowStar.push({
      //     x: starX,
      //     y: starY,
      //   });
      // }
      this.narrowStar.push({
        x: WHUtil.randInt() % this.world.width,
        y: WHUtil.randInt() % this.world.height,
      });

      this.starSize.push((WHUtil.randInt() % 2) + 1);
    }
  }

  drawStrings(context, s, s2) {
    let n = this.introY - 115;
    let n2 = n + 30;
    context.fillStyle = this.color;
    context.strokeStyle = this.color;

    context.beginPath();
    context.roundRect(50, n, this.board.width - 100, 100, 30);
    context.fill();
    context.stroke();

    context.fillStyle = this.color == "blue" ? "white" : "black";
    context.strokeStyle = this.color == "blue" ? "white" : "black";
    this.drawCenteredText(context, "Yet Another Wormhole Clone", n2);
    this.drawCenteredText(context, s, n2 + 28);
    this.drawCenteredText(context, s2, n2 + 56);
  }

  drawCenteredText(context, text, y) {
    let x = this.board.width / 2;
    context.font = "20pt Helvetica";
    context.textAlign = "center";
    context.fillText(text, x, y);
  }

  drawCenteredText2(context, text, y, xOffset, elementWidth) {
    // context.drawString(s,
    // (n3 - graphics.getFontMetrics(graphics.getFont()).stringWidth(s)) / 2 + n2, n);
    // TODO make sure alignment is centered
    context.textAlign = "center";
    context.fillText(
      text,
      (elementWidth - context.measureTest(text).width) / 2 + xOffset,
      y
    );
  }

  drawTeamStuff(context) {
    let b = 3 - this.teamId;

    let s = ClientRoomManager.TEAM_NAMES[b];
    let color = ClientRoomManager.TEAM_COLORS[b];
    let color2 = ClientRoomManager.TEAM_BG_COLORS[b];
    let boardCenterX = this.boardCenterX;
    let boardCenterX2 = this.boardCenterX;
    context.strokeStyle = color;
    context.fillStyle = color;

    for (let i = 0; i < this.userStates.length; ++i) {
      let portalSprite = this.userStates[i].portalSprite;

      if (
        portalSprite != null &&
        !portalSprite.shouldRemoveSelf &&
        this.userStates[i].clientUser.teamId != this.teamId &&
        !this.userStates[i].isEmpty
      ) {
        let n = portalSprite.intx - boardCenterX;
        let n2 = portalSprite.inty - boardCenterX2;
        for (
          let n3 = int(WormholeModel.gOrbitDistance / 35.0), j = 0;
          j < n3 - 1;
          ++j
        ) {
          let n4 = boardCenterX + int((n / n3) * j);
          let n5 = boardCenterX2 + int((n2 / n3) * j);
          context.fillStyle = ClientRoomManager.TEAM_COLORS[b];
          context.strokeStyle = ClientRoomManager.TEAM_COLORS[b];
          if (b == 1) {
            context.strokeRect(n4, n5, 8, 8);
          } else {
            context.arc(n4, n5, 9, 0, 2 * Math.PI);
            context.stroke();
          }
        }
      }
    }
    if (this.player.getViewRect().intersects(this.rectCenterBox)) {
      for (let n6 = 0; n6 < 60; n6++) {
        if (this.novaInfo[n6][0] > 45.0) {
          this.novaInfo[n6][0] = Math.abs(WHUtil.randInt(45));
          this.novaInfo[n6][1] = boardCenterX - 5 + WHUtil.randInt(16);
          this.novaInfo[n6][2] = boardCenterX2 - 5 + WHUtil.randInt(16);
          this.novaInfo[n6][3] =
            (WHUtil.randInt(2) < 1 ? -1 : 1) * Math.random() * 4;
          this.novaInfo[n6][4] =
            (WHUtil.randInt(2) < 1 ? -1 : 1) * Math.random() * 4;
        }
        let array = this.novaInfo[n6];
        let n7 = 1;
        array[n7] += this.novaInfo[n6][3];
        let array2 = this.novaInfo[n6];
        let n8 = 2;
        array2[n8] += this.novaInfo[n6][4];
        context.fillStyle =
          this.colors.colors[this.teamID == 1 ? 10 : 0][
            this.novaInfo[n6][0] / 3
          ];
        context.strokeStyle =
          this.colors.colors[this.teamID == 1 ? 10 : 0][
            this.novaInfo[n6][0] / 3
          ];
        let n9 = 11 - this.novaInfo[n6][0] / 4;
        if (b == 1) {
          context.strokeRect(
            this.novaInfo[n6][1],
            this.novaInfo[n6][2],
            n9,
            n9
          );
        } else {
          context.arc(
            this.novaInfo[n6][1],
            this.novaInfo[n6][2],
            n9,
            0,
            2 * Math.PI
          );
        }
        let array3 = this.novaInfo[n6];
        let n10 = 0;
        array3[n10]++;
      }
    }
  }

  drawTeamShape(context, n, n2) {
    if (this.teamId != 0) {
      UserState.drawTeamShape(context, n, n2, this.teamId);
    }
  }

  drawFighter(context, fighterNumber, x, y) {
    context.translate(x, y);

    // draw all of the fighters
    // do not limit by permissions
    context.fillStyle = this.colors.colors[this.slot][2];
    context.strokeStyle = this.colors.colors[this.slot][2];
    if (this.selectedShip == fighterNumber) {
      context.fillStyle =
        this.colors.colors[this.slot][(this.currentFighterShade++ / 2) % 20];
      context.fillRect(-25, -24, 50, 50);
      context.fillStyle = "gray";
      context.fillRect(-20, -20, 40, 40);
      context.fillStyle = this.color;
    } else {
      context.strokeRect(-24, -24, 48, 48);
    }
    context.translate(0, UserSprite.fighterData[fighterNumber][0]);
    // get the x and y points
    let x_pts = [];
    let y_pts = [];
    for (let i = 0; i < UserSprite.shipShapes[fighterNumber].length; i++) {
      x_pts.push(UserSprite.shipShapes[fighterNumber][i].x);
      y_pts.push(UserSprite.shipShapes[fighterNumber][i].y);
    }

    const fighterPolygon = new Polygon(x_pts, y_pts, x_pts.length);
    WHUtil.drawScaledPoly(
      context,
      fighterPolygon,
      UserSprite.fighterData[fighterNumber].shipScale
    );
    context.translate(0, -UserSprite.fighterData[fighterNumber][0]);
    if (UserSprite.fighterData[fighterNumber].trackingCannons >= 1) {
      WHUtil.fillCenteredCircle(context, 0, 0, 5);
      context.fillStyle = "black";
      WHUtil.fillCenteredArc(context, 0, 0, 5, -20, 40);
    }
    context.translate(-x, -y);
  }

  processClick(event) {
    // console.log(`Clicked on x: ${event.x} y: ${event.y}`);

    // determine if the click is in the intro area
    // check if we are in the 'waiting' mode of the game
    if (this.mode == "waiting") {
      if (
        this.canvas.offsetTop + this.intro_shipY <= event.y &&
        event.y <= this.canvas.offsetTop + this.intro_shipY + this.intro.height
      ) {
        if (
          this.canvas.offsetLeft + this.intro_shipX <= event.x &&
          event.x <=
            this.canvas.offsetLeft + this.intro_shipX + this.intro.width - 10
        ) {
          // get the box that it is over
          // subtract the introX from the eventx
          let xOffset = event.x - this.canvas.offsetLeft - this.intro_shipX;
          let xSelection = Math.floor((xOffset * 8) / this.intro.width);
          this.selectedShip = xSelection;
          this.userShipType = this.selectedShip;
          this.zoomInIntro = 0;

          // TODO send over the network that the ship has changed
          const user = this.gameNetLogic.clientUserManager.users.get(
            this.gameNetLogic.userId
          );
          user.shipType = this.selectedShip;

          // change the user to the selected ship
          this.userSprite.removeSelf();

          this.userSprite = new UserSprite(
            this.boardCenter,
            this.userShipType,
            this
          );
          this.userSprite.addSelf();
          this.userSprite.setUser(this.slot);
        }
      }
    }
  }

  /**
   * draw a powerup image from the powerup graphics
   */
  drawPowerups(context) {
    // get the image
    let img = document.getElementById("smallPowerupImages");
    let imgWidth = 21;
    let imgHeight = 17;
    // the powerup array contains numbers,
    // reference the PowerupSprite smallConversionTypes array
    // get the offset of the

    for (let i = this.numPowerups - 1; i >= 0; i--) {
      let powerupNumber = this.powerups[i];
      // subtract 6 from the number, if the number is less than or equal to 0, set it to 0
      let shiftedNumber = powerupNumber - 6;
      if (shiftedNumber <= 0) {
        powerupNumber = 0;
      } else {
        powerupNumber = shiftedNumber;
      }
      context.drawImage(
        img,
        powerupNumber + powerupNumber * imgWidth + 1,
        1,
        imgWidth,
        imgHeight - 2,
        i * 23,
        0,
        imgWidth,
        imgHeight - 2
      );
    }
  }

  drawIntro(context) {
    // add a mouse listener to the canvas
    // light gray
    context.fillStyle = "#C0C0C0";
    // graphics.fill3DRect(this.introX, this.introY, 410, 260, true);
    context.fillRect(
      this.introX,
      this.introY,
      this.intro.width,
      this.intro.height
    );

    context.fillStyle = "white";
    context.font = "14px Helvetica";
    context.fillText(
      "yawc Ship Selection",
      this.introX + 100,
      this.introY + 16
    );

    context.font = "12px Helvetica";
    context.fillText(
      "Choose a ship by clicking on it.",
      this.introX + 100,
      this.introY + 28
    );

    // graphics.fillRect(this.intro_shipX, this.intro_shipY, 400, 50);
    context.fillStyle = "gray";
    context.fillRect(this.intro_shipX, this.intro_shipY, 400, 50);

    // graphics.drawRect(this.intro_shipX, this.intro_shipY, 400, 50);
    context.strokeStyle = this.color;
    context.strokeRect(this.intro_shipX, this.intro_shipY, 400, 50);

    // draw ships
    // final boolean hasPermission = this.hasShipPermission((byte)PlayerSprite.g_fighterData[this.selectedShip][13]);
    for (let i = 0; i < 8; i++) {
      //     graphics.setColor(this.color);
      //     this.drawFighter(graphics, n, this.intro_shipX + n * 50 + 25, this.intro_shipY + n / 8 * 50 + 25);
      context.strokeStyle = this.color;
      context.fillStyle = this.color;
      this.drawFighter(
        context,
        i,
        this.intro_shipX + i * 50 + 25,
        // this.intro_shipY + (i / 8) * 50 + 25
        this.intro_shipY + 25
      );
    }

    // ship descriptions
    let n2 = this.intro_shipX + (this.selectedShip % 8) * 50 + 25;
    let n3 = this.intro_shipY + 25;
    let n4 = this.intro_shipY + 50 + 10;
    let n5 = this.intro_shipX + 200;

    context.beginPath();
    context.strokeStyle = "black";

    context.arc(n2, n3, 15, 0, 2 * Math.PI);
    context.moveTo(n2, n3 + 15);
    context.lineTo(n2, n4);
    context.lineTo(n5, n4);
    context.lineTo(n5, n4 + 10);

    context.stroke();
    context.strokeRect(
      n5 - 50,
      n4 + 10,
      this.introX + 410 - (n5 - 50) - 15,
      this.introY + 260 - n4 - 15
    );

    let array = UserSprite.shipDescriptions[this.selectedShip];
    let n6 = n5 - 40;
    let n7 = n4 + 10;
    context.beginPath();
    context.fillStyle = "white";
    context.textAlign = "left";
    for (let i = 1; i < array.length; i++) {
      context.fillText(array[i], n6, n7 + i * 12);
    }

    // double zoomInIntro = PlayerSprite.g_fighterData[this.selectedShip][2];
    let zoomInIntro = UserSprite.fighterData[this.selectedShip].zoomScale;
    context.strokeStyle = this.color;
    context.fillStyle = this.color;
    // if (hasPermission) {
    //     graphics.setColor(this.color);
    // }
    // else {
    //     graphics.setColor(Color.black);
    // }

    if (this.zoomInIntro < zoomInIntro) {
      this.zoomInIntro += zoomInIntro / 50;
      zoomInIntro = this.zoomInIntro;
      //     if (hasPermission) {
      // graphics.setColor(
      //   Sprite.g_colors[super.slot][
      //     int(((zoomInIntro - this.zoomInIntro) / zoomInIntro) * 19.0)
      //   ]
      // );
      context.strokeStyle =
        this.colors.colors[this.slot][
          ((zoomInIntro - this.zoomInIntro) / zoomInIntro) * 19
        ];
      context.fillStyle =
        this.colors.colors[this.slot][
          ((zoomInIntro - this.zoomInIntro) / zoomInIntro) * 19
        ];
      //     }
    }

    context.translate(this.introX + 75, this.introY + 180);
    // //WHUtil.drawScaledPoly(graphics, PlayerSprite.g_polyShip[this.selectedShip][this.currentFighterShade / 2 % 24], zoomInIntro);
    // WHUtil.drawScaledPoly(graphics, PlayerSprite.g_polyShip[this.selectedShip][this.currentFighterShade * 10 / PlayerSprite.DROTATE % PlayerSprite.NROTATIONS], zoomInIntro);
    const polygon = WHUtil.createPolygon(
      UserSprite.shipShapes[this.selectedShip]
    );
    WHUtil.drawScaledPoly(
      context,
      polygon,
      zoomInIntro
      // UserSprite.fighterData[this.selectedShip].shipScale
    );

    // TODO - draw the rotating polygon
    // WHUtil.drawScaledPoly(
    //   context,
    //   UserSprite.g_polyShip[this.selectedShip][
    //     ((this.currentFighterShade * 10) / PlayerSprite.DROTATE) %
    //       PlayerSprite.NROTATIONS
    //   ],
    //   zoomInIntro
    // );

    context.translate(-(this.introX + 75), -(this.introY + 180));
    // context.strokeStyle = "white";
    context.fillStyle = "white";

    context.fillText(array[0], this.introX + 10, this.introY + 110);
    // TODO allow all ships to be played?
    // if (!hasPermission) {
    //     graphics.setColor(Color.red);
    //     graphics.drawString("Enable extra ships in", this.introX + 10, this.introY + 180);
    //     graphics.drawString("create table options", this.introX + 10, this.introY + 192);
    // }
  }

  // what is the purpose of this function?
  translateSlot(newSlot) {
    if (this.slot < newSlot) {
      return newSlot - 1;
    }
    return newSlot;
  }

  // add the powerup to the user's powerups
  // send a network message showing that the user got the powerup
  addPowerup(powerupType) {
    if (this.numPowerups >= 5) {
      return;
    }
    this.powerups[this.numPowerups++] = powerupType;
    this.refreshUserBar = true;
    this.sendEvent(`got the ${PowerupSprite.names[powerupType]} powerup`);
  }

  addIncomingPowerup(portalSprite, powerupType, fromSlot, b2) {
    if (portalSprite == null) {
      return;
    }
    portalSprite.genBadPowerupEffect(powerupType, fromSlot, b2);
    this.incomingCycle = 40;
    this.incomingIconCycle = 160;
    this.incomingWhoStack[this.incomingIconIndex] = fromSlot;
    this.fromSlot = fromSlot;
    this.currentShade = 0;
    this.incomingTypeStack[this.incomingIconIndex] = powerupType;
    this.incomingIconIndex = Math.min(29, this.incomingIconIndex + 1);
    if (powerupType == 14) {
      this.incomingNukeCycle = 40;
    }
  }

  usePowerup(powerupType, upgradeLevel, toSlot, sessionId, gameId) {
    // stream.writeByte(107);
    const packet = {
      type: "powerup",
      sessionId,
      powerupType,
      toSlot,
      upgradeLevel,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
    // monitorexit(super.m_logic.getNetwork())
  }

  // TODO - want to use the ClientRoomManager / ClientUserManager for this now
  setUsers(gamePacket) {
    // do this when a user joins a room, don't wait until game start

    // have the roomId from the game packet
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      gamePacket.roomId
    );

    for (let i = 0; i < room.numUsers(); i++) {
      const userId = room.userIds[i];
      const user = this.gameNetLogic.clientUserManager.users.get(userId);
      const slot = room.getSlot(userId);
      const gameOver = false;

      if (userId != this.gameNetLogic.userId) {
        // use ClientUserManager settings for this info
        this.setUser(
          user,
          user.teamId,
          // user.icons,
          // this.logic.getUser(userName).getIcons(),
          slot,
          gameOver
        );
        if (gameOver == false) {
        }
      } else {
        this.slot = slot;
        this.color = this.colors.colors[slot][0];
        this.teamId = user.teamId;
      }
    }
    this.refreshUserBar = true;
  }

  // draw the user info block
  // TODO - see about setting the clientUser of the userState
  // to a ClientUser object
  setUser(clientUser, teamId, slot, gameOver) {
    // let userState = this.userStates[this.translateSlot(slot)];
    let userState = this.userStates[slot];
    userState.reset();
    userState.resetPowerups();
    // sets the username and the slot/colors
    userState.setState(clientUser, slot);
    // done in the setState function
    // userState.clientUser = clientUser;
    // userState.rank = rank;
    // userState.icons = icons;

    userState.teamId = teamId;
    userState.nPowerups = 0;
    userState.gameOver = gameOver;
    this.refreshUserBar = true;
    this.setSlot(slot);
  }

  sendGameOver(sessionId, killedBy) {
    // send a packet showing that the game is over
    // stream.writeByte(110);
    const packet = {
      type: "gameOver",
      sessionId,
      killedBy,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
  }

  // monitorexit(super.logic.getNetwork())

  // ROUTINES FOR READING AND WRITING ON THE NETWORK
  /**
   * handles the game packet receipt
   */
  handleGamePacket(gamePacket) {
    const type = gamePacket.type;
    switch (type) {
      case "startGame":
        // packet now just has the roomId in it

        // this.gameId = gamePacket.gameId;
        // this.sessionId = gamePacket.sessionId;
        // set the ship to the player's chosen ship
        if (this.gameNetLogic.roomId != gamePacket.roomId) {
          return;
        }

        const room = this.gameNetLogic.clientRoomManager.getRoomById(
          this.gameNetLogic.roomId
        );

        // TODO - move to when a user joins a room
        this.setUsers(gamePacket);

        // go through the room's userState object to determine who is on what team
        this.totalOpposingUsers = 0;
        let shouldAddPortal = false;

        // only add the portals for opposing users
        for (let i = 0; i < this.userStates.length; i++) {
          if (
            !this.userStates[i].isEmpty &&
            this.userStates[i].clientUser.userId != this.gameNetLogic.userId
          ) {
            // don't add portals for teammates
            if (room.isTeamRoom) {
              if (this.userStates[i].teamId != this.teamId) {
                this.totalOpposingUsers++;
                shouldAddPortal = true;
              }
            } else {
              this.totalOpposingUsers++;
              shouldAddPortal = true;
            }
          }

          let n = 0;
          if (shouldAddPortal) {
            let portalSprite = new PortalSprite(
              n * (360 / this.totalOpposingUsers),
              this.userStates[i],
              this
            );
            n++;
            this.userStates[i].portalSprite = portalSprite;
            portalSprite.addSelf();
            portalSprite.setWarpingIn();
          } else {
            this.userStates[i].portalSprite = null;
          }
        }

        this.mode = "playing";
        this.refreshAll = true;
        this.refreshUserBar = true;
        this.gameOver = false;
        break;

      // add users to the client user manager
      case "updateUserInfo": {
        let sessionId = gamePacket.sessionId;
        if (sessionId != this.sessionId && !this.gameOver) {
          return;
        }
        let slot = gamePacket.slot;
        if (slot == this.slot) {
          return;
        }
        let userInfo = this.userStates[this.translateSlot(slot)];
        if (userInfo.gameOver || userInfo.isEmpty) {
          return;
        }
        userInfo.readState(gamePacket.userInfo);
        this.refreshUserBar = true;
        break;
      }

      case "userState": {
        let sessionId = gamePacket.sessionId;
        if (sessionId != this.sessionId && !this.gameOver) {
          return;
        }
        let slot = gamePacket.slot;
        if (slot == this.slot) {
          return;
        }
        let userState = this.userStates[this.translateSlot(slot)];
        if (userState.gameOver || userState.isEmpty) {
          return;
        }
        userState.readState(gamePacket);
        this.refreshUserBar = true;
        break;
      }

      case "gameOverIndividual":
        slot = gamePacket.slot;
        if (this.slot == slot) {
          this.winningUserString = "YOU WON";
          ++this.wins;
        } else {
          let translateSlot = this.translateSlot(slot);
          this.winningUserString =
            this.userStates[translateSlot].clientUser.username + " WON";
          let userInfo2 = this.userStates[translateSlot];
          userInfo2.wins++;
          this.userStates[translateSlot].isGameOver = true;
        }
        this.gameOver = true;
        this.refreshUserBar = true;
        break;

      case "gameOverTeam":
        let teamId = gamePacket.teamId;
        this.winningUserString = CFSkin.TEANAMES[teamId] + " WON";
        if (this.teamId == teamId) {
          this.wins++;
        } else {
          for (let k = 0; k < this.userStates.length; ++k) {
            if (this.userStates[k].teamId == teamId) {
              let userInfo3 = this.userStates[k];
              userInfo3.wins++;
              this.userStates[k].gameOver = true;
            }
          }
        }
        this.gameOver = true;
        this.refreshUserBar = true;
        break;

      case "killUser":
        let deceasedSlot = gamePacket.deceasedSlot;
        let killerSlot = gamePacket.killerSlot;
        if (deceasedSlot == this.slot) {
          this.gameOver = true;
          return;
        }
        // TODO need to fix this code
        let userInfo4 = this.userStates[this.translateSlot(deceasedSlot)];
        userInfo4.gameOver = true;
        userInfo4.refresh = true;
        if (userInfo4.portalSprite != null) {
          userInfo4.portalSprite.killSelf();
        }
        userInfo4.healthPercentage = 0;
        if (killerSlot == this.slot) {
          this.kills++;
          this.refreshUserBar = true;
        }
        this.refreshUserBar = true;
        break;

      case "message":
        let message = gamePacket.content;
        while (this.vMessages.size() >= 2) {
          this.vMessages.removeElementAt(0);
        }
        this.vMessages.addElement(message);
        this.lastCycleForMessages = this.cycle + 200;
        break;

      case "powerup":
        const powerupType = gamePacket.powerupType;
        const fromSlot = gamePacket.fromSlot;
        const toSlot = gamePacket.toSlot;
        const sessionId = gamePacket.sessionId;
        const byte9 = gamePacket.byte9;
        if (sessionId != this.sessionId && !this.gameOver) {
          return;
        }
        let translateSlot2 = this.translateSlot(fromSlot);
        if (fromSlot != this.slot && translateSlot2 < 0) {
          return;
        }
        if (toSlot != this.slot) {
          this.refreshUserBar = true;
          return;
        }
        if (this.gameOver) {
          return;
        }
        this.addIncomingPowerup(
          this.userStates[translateSlot2].portalSprite,
          powerupType,
          fromSlot,
          byte9
        );
        break;

      case "userWins":
        let numUsers = gamePacket.numUsers;
        for (let i = 0; i < numUsers; i++) {
          let slot = gamePacket.slot[i];
          let winCount = gamePacket.winCount[i];
          let translateSlot = this.translateSlot(slot);
          let userInfo = this.userStates[translateSlot];
          userInfo.wins = winCount;
          this.refreshUserBar = true;
        }
        break;

      case "slotTeamId":
        slot = gamePacket.slot;
        teamId = gamePacket.teamId;
        if (slot == this.slot) {
          this.teamId = teamId;
        } else {
          let translateSlot = this.translateSlot(slot);
          let userInfo = this.userStates[translateSlot];
          userInfo.teamId = teamId;
          userInfo.refresh = true;
        }
        this.refreshUserBar = true;
        break;
    }
  }

  // combination of writeState and updateState
  sendState(sessionId) {
    // stream.writeByte(106);
    let healthPercent = this.userSprite.health / this.userSprite.MAX_HEALTH;
    const packet = {
      type: "userState",
      userId: this.gameNetLogic.userId,
      healthPercent,
      sessionId,
      numPowerups: this.userSprite.numPowerups,
      powerups: this.userSprite.powerups,
      shipType: this.userShipType,
      strDamagedByUser: this.strDamagedByUser,
      damagingPowerup: this.damagingPowerup,
      lostHealth: this.userSprite.lostHealth,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
  }

  // combination of writeEvent and updateEvent
  sendEvent(eventString) {
    // sendEvent(eventString, sessionId) {
    // stream.writeByte(109);
    const packet = {
      type: "event",
      // sessionId,
      eventString: `${this.gameNetLogic.username} ${eventString}`,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
  }

  drawTeamButton(context, s, color, color2, n, n2, n3, n4) {
    // graphics.setColor(color);
    context.strokeStyle = color;
    context.fillStyle = color;
    // graphics.fillRoundRect(n + 1, n2, n4 - 2 - n, 15, n3, n3);
    context.roundRect(n + 1, n2, n4 - 2 - n, 15, n3, n3);
    context.fill();

    // graphics.setColor(color2);
    context.strokeStyle = color2;
    context.fillStyle = color2;

    graphics.drawRoundRect(n + 1, n2, n4 - 2 - n, 15, n3, n3);
    context.roundRect(n + 1, n2, n4 - 2 - n, 15, n3, n3);
    context.stroke();

    // graphics.setFont(WormholeModel.fontTwelve);
    context.font = "12px Helvetica";
    this.drawCenteredText2(context, s, n2 + 13, n, n4 - n);
  }

  // user bar on the right side of the screen
  drawOtherBar(context, b) {
    this.refreshOtherBar = false;
    if (b) {
      // get the other player's panels
      // TODO
      // graphics.setColor(this.pnlOtherPlayers.getBackground());
      context.strokeStyle = "red";
      context.fillStyle = "red";
      context.fillRect(0, 0, 144, 474);
    }

    // get the room
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );
    // check if it is a team room
    if (room != null && !room.isTeamRoom) {
      for (let i = 0; i < this.userStates.length; i++) {
        if (b || this.userStates[i].refresh) {
          let n = 49 + this.userHeight * i;
          this.userStates[i].setDrawLocation(n, this.userHeight - 1);
          context.translate(0, n);
          this.userStates[i].draw(context, 143, this.userHeight - 1);
          context.translate(0, -n);
        }
      }
      return;
    }
    if (this.teamId <= 0) {
      return;
    }
    if (b) {
      this.drawTeamButton(
        context,
        ClientRoomManager.TEAM_NAMES[this.teamId],
        ClientRoomManager.TEAM_COLORS[this.teamId],
        ClientRoomManager.TEAM_BG_COLORS[this.teamId],
        0,
        1,
        3,
        144
      );
      this.drawMyTeamPlaceholder(context, 18);
    }
    let drawTeam = this.drawTeam(context, 52, this.teamId, b);
    let b2 = 3 - this.teamId;
    if (b) {
      this.drawTeamButton(
        context,
        ClientRoomManager.TEAM_NAMES[b2],
        ClientRoomManager.TEAM_COLORS[b2],
        ClientRoomManager.TEAM_BG_COLORS[b2],
        0,
        drawTeam,
        3,
        144
      );
    }
    this.drawTeam(context, drawTeam + 18, b2, b);
  }

  /**
   * draw the status bar, change the color if the game is over
   *
   * this is the bar across the top o fthe screen with the player's
   * information and the powerups the player has
   */
  drawUserBar(context) {
    if (this.gameOver) {
      context.fillStyle = "gray";
      context.strokeStyle = "gray";
    } else {
      context.fillStyle = "black";
      context.strokeStyle = "black";
    }
    context.fillRect(0, 0, 430, 49);
    context.fillStyle = this.color;
    context.strokeStyle = this.color;
    context.strokeRect(0, 0, 429, 48);
    context.font = "12px Helvetica";
    if (this.userSprite != null) {
      context.fillStyle = "white";
      context.strokeStyle = "white";
      context.fillText(this.gameNetLogic.username, 7, 10);
      context.fillStyle = this.color;
      context.strokeStyle = this.color;

      let n = 19;
      context.roundRect(-20, n, 144, n + 50, 20, 20);
      context.stroke();
      context.textAlign = "left";
      context.fillText("Powerups", 7, n + 12);
      if (this.numPowerups > 0) {
        context.translate(5, n + 14);
        this.drawPowerups(context);
        context.translate(-5, -n - 14);
        context.fillStyle = this.color;
        context.strokeStyle = this.color;
      }
      context.translate(110, 0);
      this.userSprite.drawPermanentPowerups(context);
      context.translate(-110, 0);
    }
    let n2 = 370;
    let n3 = n2 - 10;
    context.fillStyle = this.color;
    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(n3, 0);
    context.lineTo(n3, 90);
    context.stroke();

    context.fillText("History", n2, 12);
    context.fillText(`Wins: ${this.wins}`, n2, 28);
    context.fillText(`Kills: ${this.kills}`, n2, 42);
    this.refreshUserBar = false;
  }

  getTimeElapsed() {
    return Date.now() - this.startTime;
  }
}

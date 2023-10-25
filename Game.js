import { ClientRoomManager } from "./ClientRoomManager.js";
import { ClientUser } from "./ClientUser.js";
import { Polygon } from "./Polygon.js";
import { Rectangle } from "./Rectangle.js";
import { SpriteColors } from "./SpriteColors.js";
import { WHUtil } from "./WHUtil.js";
import { PortalSprite } from "./sprites/PortalSprite.js";
import { PowerupSprite } from "./sprites/PowerupSprite.js";
import { UserSprite } from "./sprites/UserSprite.js";
import { WallCrawlerSprite } from "./sprites/WallCrawlerSprite.js";

/**
 * Game Class
 * @description implements a Game (Wormhole) that contains a board
 * world is the total renderable canvas, use this size for generating the stars
 */
export class Game {
  constructor(gameNetLogic) {
    // set a debug mode for displaying shapeRects
    this.isDebugMode = false;
    this.gameNetLogic = gameNetLogic;

    this.input = {
      right: false,
      left: false,
      up: false,
      spacebar: false,
      fKey: false,
    };

    this.soundOn = true;

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

    this.powerups = new Array(5);
    this.numPowerups = 0;

    // shortcuts for the game's room and user
    this.room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );
    this.user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );

    this.currentFighterShade = 0;

    // default to using the shipType of 1
    this.userShipType = 1;
    this.zoomInIntro = 0;

    this.incomingCycle = 0;

    // array to store the user messages in
    this.userMessages = [];

    this.canvas = undefined;
    this.context = undefined;

    this.cycle = undefined;

    // only use key handlers when the game is in focus?
    // key press handlers
    // TODO - may need to modify to allow for chatting while in game
    document.onkeydown = (e) => this.onkeydown(e);
    document.onkeyup = (e) => this.onkeyup(e);
  }

  onkeyup(e) {
    // console.log("key up " + e.code);
    e.preventDefault();

    if (e.code === "ArrowRight") {
      this.input.right = false;
    } else if (e.code === "ArrowLeft") {
      this.input.left = false;
    } else if (e.code === "ArrowUp") {
      this.input.up = false;
    } else if (e.code === "Space") {
      this.input.spacebar = false;
    } else if (e.code === "KeyF") {
      this.input.fKey = false;
      // attempt to only allow a single press for the f key
      this.singlePress = true;
    }
  }

  onkeydown(e) {
    // console.log("key down " + e.code);
    e.preventDefault();

    if (e.code === "ArrowRight") {
      this.input.right = true;
    } else if (e.code === "ArrowLeft") {
      this.input.left = true;
    } else if (e.code === "ArrowUp") {
      this.input.up = true;
    } else if (e.code === "Space") {
      this.input.spacebar = true;
    } else if (e.code === "KeyF" && this.singlePress) {
      this.input.fKey = true;
      this.singlePress = false;
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

    // set the other status bar so that it is aligned with the game screen
    this.otherStatusCanvas.style.marginTop = this.userStatusCanvas.height;

    this.userStatusContext = this.userStatusCanvas.getContext("2d");
    this.otherStatusContext = this.otherStatusCanvas.getContext("2d");

    this.context = this.canvas.getContext("2d");

    this.context.globalCompositeOperation = "source-over";

    document.body.style.margin = 0;
    document.body.style.padding = 0;

    // set the width and height of the game canvas
    this.canvas.width = window.innerWidth - 2 * this.otherStatusCanvas.width;
    this.canvas.height = window.innerHeight;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update() {
    // console.log("gameloop updating");
    const user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );

    if (this.input.right) {
      user.userSprite.dRotate = Math.abs(user.userSprite.dRotate);
      user.userSprite.isRotating = true;
    }
    if (this.input.left) {
      user.userSprite.dRotate = -1 * Math.abs(user.userSprite.dRotate);
      user.userSprite.isRotating = true;
    }
    if (this.input.up) {
      user.userSprite.thrustOn = true;
    }
    if (this.input.spacebar) {
      user.userSprite.firePrimaryWeapon = true;
    }
    if (this.input.fKey) {
      user.userSprite.fireSecondaryWeapon = true;
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

    // draw the game on the canvas
    this.draw(this.context);

    if (this.mode == "waiting") {
      // ship selection area
      this.drawIntro(this.context);

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
    }

    // refresh the user bar after getting a powerup
    if (this.refreshUserBar) {
      this.drawUserBar(this.userStatusContext);

      // TODO - find where to send the user state outside of the draw method
      // only send the state when it is updated
      // don't send every time it is redrawn
    }
    if (this.refreshOtherBar) {
      this.drawOtherBar(this.otherStatusContext, this.refreshAll);
      this.refreshAll = false;
    }
  }

  /**
   * Reset the game
   */
  reset() {
    this.init();
    // this.wins = 0;
    // this.kills = 0;
    // super.slot = 0;
    this.color = this.colors.colors[0][0];
    if (this.user.color != null) {
      this.color = this.colors.colors[this.user.slot][0];
    }
    // for (let i = 0; i < this.userStates.length; ++i) {
    // this.userStates[i].fullReset();
    // }
    this.gameOver = false;
    this.gameOverCycle = 0;

    this.mode = "waiting";
    // refresh the user and other bar
    this.refreshUserBar = true;
    this.refreshOtherBar = true;
  }

  init() {
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

    // this holds the upper left corner of the viewable rectangle
    this.viewportRect = new Rectangle(
      (this.board.width - this.viewport.width) / 2,
      (this.board.height - this.viewport.height) / 2,
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
    this.fromUserId = 0;
    this.currentShade = 0;
    this.incomingTypeStack = [];
    this.incomingIconIndex = 0;
    this.incomingNukeCycle = 0;

    this.numPowerups = 0;
    this.flashScreenColor = "black";

    // reset powerups
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );
    room.resetPowerups();

    this.gameOver = false;
    this.refreshUserBar = true;

    // clear sprite arrays
    this.allSprites = [];
    this.badGuys = [];
    this.goodGuys = [];

    this.orbitDistance = 240;
    let n;

    // get the start time (in ms)
    this.startTime = window.performance.now();
    this.msPrev = window.performance.now();
    this.fps = 60;
    this.msPerFrame = 1000 / this.fps;
    this.frames = 0;

    this.cycle = 0;

    // set the orbitDistance based on the number of users
    if (this.gameNetLogic.roomId != null) {
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

    // set user messages to an empty array
    this.userMessages = [];

    this.winningUserString = null;

    // create a new user that starts at the center of the board
    // with the specified ship type
    const user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );
    // move this to the joinRoom area?
    user.userSprite = new UserSprite(
      this.board.width / 2,
      this.board.height / 2,
      this.userShipType,
      this
    );

    user.userSprite.addSelf();
    user.userSprite.setUser(user.userId);

    this.initBorderShade(user);

    new WallCrawlerSprite(0, 0, this, true).addSelf();
    new WallCrawlerSprite(0, 0, this, false).addSelf();

    // start main game loop
    window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Main Game loop
   * checks what state the game is in (playing, waiting, gameOver)
   * gets user input
   * update the game
   * - increment the cycle
   * - do sprite behaviors
   * - check collisions
   * - check the sidebar
   * render
   * @param {number} timeStamp
   * @returns
   */
  gameLoop(timeStamp) {
    // check if the gameNetLogic's roomId is null
    if (this.gameNetLogic.roomId == null) {
      // error! this should not be null
      return;
    }

    // get the room and check if it should be removed
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );

    if (room.shouldRemove) {
      this.gameNetLogic.clientRoomManager.removeRoom(room.roomId);
      this.gameNetLogic.roomId = null;
      return;
    }

    this.msPassed = timeStamp - this.msPrev;

    if (this.msPassed > this.msPerFrame) {
      // insert silence audio clip here
      // GameBoard.playSound((AudioClip)g_mediaTable.get("snd_silence"));

      // return;

      /**
       * Game Loop state machine
       * playing -> gameOver
       * gameOver -> waiting
       * waiting (should go to "playing"), when the "Start Game" button
       * is pushed, the "startGame" packet is received,
       * which sets the mode to "playing" in handleGamePacket
       */
      switch (this.mode) {
        case "playing": {
          // get user input
          // TODO separate from update()

          // behavior, collisions, checkSidebar
          this.update();
          this.render();
          break;
        }

        /**
         * Waiting for a new game to start
         */
        case "waiting": {
          // checks if there is time left on any of the powerups in a
          // user's area
          // checkSidebar();
          this.refreshOtherBar = true;
          this.render();
          break;
        }

        /** Game over, allow the sprites to keep moving
         * display message that the game is over
         */
        case "gameOver": {
          this.render();

          // reset the game and enter the waiting state
          if (this.gameOverCycle++ > 120) {
            // if (this.gameOverCycle++ > 12000000 || this.winningUserString != null) {
            // reset the game after 120 cycles
            this.reset();
          }
          break;
        }
      }
    }

    this.excessTime = this.msPassed % this.msPerFrame;
    this.msPrev = timeStamp - this.excessTime;

    this.frames++;

    window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  playSound(paramAudioClip) {
    if (paramAudioClip != null && soundOn) paramAudioClip.play();
  }

  // add users to the room when someone joins the room
  // readJoin(paramDataInput) {
  //   this.model.readJoin(paramDataInput);
  // }

  /**
   * Does the behavior for all sprites in the sprite arrays
   * Writes user messages
   * Checks how long the game has gone on
   * @returns
   */
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

    // checks the user message queue and removes messages are past due
    if (
      this.lastCycleForMessages < this.cycle &&
      this.userMessages.length > 0
    ) {
      this.userMessages.shift();
    }

    // sets the probability that an enemy will generate
    const gameTimeSeconds = (window.performance.now() - this.startTime) / 1000;
    let genEnemyProb = 500;
    if (gameTimeSeconds > 240) {
      genEnemyProb = 400;
    } else if (gameTimeSeconds > 120) {
      genEnemyProb = 450;
    } else if (gameTimeSeconds > 80) {
      genEnemyProb = 500;
    } else if (gameTimeSeconds < 40) {
      // don't generate enemies in the first 40 seconds of the game
      // DEBUG - commented out for debugging
      return;
    }

    // DEBUG patched for generating enemies
    // genEnemyProb = 100;
    // END DEBUG

    // as the game goes up in seconds, the probability that an enemy will spawn increases
    if (WHUtil.randInt(genEnemyProb) == 1) {
      // we are generating enemies for all users currently playing
      // but this starts at a 'random' user and generates enemies for all users
      // now, just loop through all users to generate enemies
      // let j = WHUtil.randInt() % this.users.length;
      // let userInfo = this.users[(j + b) % this.users.length];

      const room = this.gameNetLogic.clientRoomManager.getRoomById(
        this.gameNetLogic.roomId
      );

      // remove this user's userId
      let userIds = room.userIds.filter(
        (userId) => userId != null && userId != this.gameNetLogic.userId
      );

      // get a random user
      const user = this.gameNetLogic.clientUserManager.users.get(
        userIds[WHUtil.randInt(userIds.length)]
      );

      // set that random user's portal to generate an enemy
      if (user.isPlaying() && user.portalSprite != null) {
        user.portalSprite.shouldGenEnemy = true;
      }
    }
  }

  // check for collisions between good/bad sprites
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

  /**
   * For the room check all users whether there
   * is time in the powerupTimeouts matrix
   * if yes, then redraw the OtherBar
   */
  checkSidebar() {
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );
    for (let i = 0; i < room.userIds.length; i++) {
      if (room.userIds[i] != null) {
        const user = this.gameNetLogic.clientUserManager.users.get(
          room.userIds[i]
        );
        if (user.timeoutAttacks()) {
          this.refreshOtherBar = true;
        }
      }
    }
  }

  setTeam(s, b) {
    if (this.gameNetLogic.username == s) {
      this.teamId = b;
    } else {
      const room = this.gameNetLogic.clientRoomManager.getRoomById(
        this.gameNetLogic.roomId
      );
      for (let i = 0; i < room.userIds.length; ++i) {
        if (room.userIds[i] != null) {
          const user = this.gameNetLogic.clientUserManager.users.get(
            room.userIds[i]
          );
          if (user.username == s) {
            user.teamId = b;
          }
          user.refresh = true;
        }
      }
    }
    this.refreshOtherBar = true;
  }

  // remove all the zappable sprites on the screen
  clearScreen() {
    this.flashScreenColor = "white";
    for (let i = 0; i < this.badGuys.length; i++) {
      let sprite = this.badGuys[i];
      if (
        sprite != null &&
        sprite.inDrawingRect &&
        (!sprite.indestructible || sprite.isZappable)
      ) {
        sprite.killSelf();
      }
    }
  }

  // draw the Game to the canvas
  draw(context) {
    // get the user object
    const user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );
    if (user.userSprite != null) {
      // get the viewable area for the user
      let viewportRect = user.userSprite.getViewportRect();

      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
      if (user.teamId != 0 && room.isTeamTable && !this.gameOver) {
        this.drawTeamStuff(context);
      }

      if (this.incomingCycle > 0) {
        this.incomingCycle--;
        context.font = "40px helvetica";

        const fromSlot = room.getSlot(this.fromUserId);
        context.textAlign = "center";
        context.strokeStyle =
          this.colors.colors[fromSlot][this.currentShade++ % 20];
        context.strokeText("I N C O M I N G", this.board.width / 2, 200);
        if (this.incomingNukeCycle > 0) {
          this.incomingNukeCycle--;
          context.strokeText("N U K E", this.board.width / 2, 240);
        }
      }

      // draw all sprites
      this.allSprites.forEach((sprite) => {
        if (sprite != null) {
          // check if the sprite is in the viewportRect
          sprite.inDrawingRect = sprite.inViewingRect(viewportRect);
          if (sprite.inDrawingRect) {
            sprite.drawSelf(context);

            // display shapeRects when in debug mode
            // if (this.isDebugMode) {
            // context.beginPath();
            // context.strokeRect(
            //   sprite.shapeRect.x,
            //   sprite.shapeRect.y,
            //   sprite.shapeRect.width,
            //   sprite.shapeRect.height
            // );
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

      // draw the incoming icons
      const img = document.getElementById("smallPowerupImages");
      const imgWidth = 21;
      const imgHeight = 17;
      for (let i = 0; i < this.incomingIconIndex; i++) {
        let shiftedNumber = this.incomingTypeStack[i] - 6;
        let powerupNumber;
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
          2,
          i * 15 + 31,
          imgWidth,
          imgHeight - 2
        );
      }

      // draw the winning user string
      if (this.winningUserString != null) {
        context.beginPath();
        context.font = "40px helvetica";
        context.textAlign = "center";
        context.fillStyle = "white";
        // put the text on the center of the board
        context.fillText("GAME OVER!", this.board.width / 2, 100);
        context.fillText(this.winningUserString, this.board.width / 2, 150);
      }

      // draw the userMessages
      context.fillStyle = "white";
      context.font = "12px helvetica";
      context.textAlign = "left";
      for (let n = 0; n < this.userMessages.length; n++) {
        context.fillText(this.userMessages[n], 10, 20 * (n + 1));
      }
    }
    if (user.teamId != 0) {
      context.font = "12px helvetica";
      context.fillStyle = ClientRoomManager.TEAM_COLORS[user.teamId];
      context.fillText(
        `${ClientRoomManager.TEAM_NAMES[user.teamId]} member`,
        this.board.width - 135,
        13
      );
    }
    context.strokeStyle = "white";
    context.strokeRect(0, 0, this.board.width - 1, this.board.height - 1);
  }

  /**
   * Initialize the border shade
   *
   * @param {Object<ClientUser>} user
   */
  initBorderShade(user) {
    // initialize the border shade color
    if (user.color != null) {
      // reimplement the Java .darker() function
      const DARKER_FACTOR = 0.251;
      this.borderShades[0] = user.color;
      for (let i = 0; i < this.borderShades.length - 1; i++) {
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
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );
    for (let i = 0; i < room.userIds.length; i++) {
      if (room.userIds[i] != null) {
        const user = this.gameNetLogic.clientUserManager.users.get(
          room.userIds[i]
        );

        if (user.isPlaying() && user.userSprite != null) {
          let n = user.portalSprite.x - user.userSprite.x;
          let n2 = user.portalSprite.y - user.userSprite.y;
          let hyp = Math.hypot(n, n2);
          if (hyp >= this.portalVisibility) {
            let n3 = (180 * n) / hyp;
            let n4 = (180 * n2) / hyp;
            let n5 = n3 + this.viewport.width / 2;
            let n6 = n4 + this.viewport.height / 2;

            let atan = Math.atan(n2 / n);
            let n7 = 171;
            if (n < 0) {
              n7 = -n7;
            }
            let n8 = atan + 0.04;
            let n9 = atan - 0.04;
            let n10 = n7 * Math.cos(n8) + this.viewport.width / 2;
            let n11 = n7 * Math.sin(n8) + this.viewport.height / 2;
            let n12 = n7 * Math.cos(n9) + this.viewport.width / 2;
            let n13 = n7 * Math.sin(n9) + this.viewport.height / 2;

            context.strokeStyle = user.color;
            context.beginPath();
            context.moveTo(n5, n6);
            context.lineTo(
              n3 * 0.9 + this.viewport.width / 2,
              n4 * 0.9 + this.viewport.height / 2
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
  }

  /**
   * drawRing
   * @param context a canvas context to draw the ring
   * @description draws a gray ring to place the portals on
   */
  drawRing(context) {
    context.strokeStyle = "gray";
    WHUtil.drawCenteredCircle(
      context,
      this.world.width / 2,
      this.world.height / 2,
      this.orbitDistance
    );
  }

  /**
   * Draws a border around the world
   * @param context a canvas context to draw the border
   */
  drawBorder(context) {
    // draw the outer border box
    context.beginPath();
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

  drawStars(context, color, starLocations) {
    // set the color of the stars
    context.fillStyle = color;
    context.beginPath();
    for (let i = 0; i < starLocations.length; i++) {
      context.fillRect(
        starLocations[i][0],
        starLocations[i][1],
        this.starSize[i],
        this.starSize[i]
      );
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

    for (let i = 0; i < this.numStars; i++) {
      this.star.push([
        WHUtil.randInt(this.world.width),
        WHUtil.randInt(this.world.height),
      ]);

      this.narrowStar.push([
        WHUtil.randInt(this.world.width),
        WHUtil.randInt(this.world.height),
      ]);

      this.starSize.push(WHUtil.randInt(2) + 1);
    }
  }

  drawStrings(context, string1, string2) {
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
    this.drawCenteredText(context, string1, n2 + 28);
    this.drawCenteredText(context, string2, n2 + 56);
  }

  drawCenteredText(context, text, y) {
    let x = this.board.width / 2;
    context.font = "20px helvetica";
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
    let boardCenterX = this.board.width / 2;
    context.strokeStyle = color;
    context.fillStyle = color;

    // get the room
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );

    for (let i = 0; i < room.userIds.length; ++i) {
      if (room.userIds[i] != null) {
        const user = this.gameNetLogic.clientUserManager.users.get(
          room.userIds[i]
        );
        let portalSprite = user.portalSprite;

        if (
          portalSprite != null &&
          !portalSprite.shouldRemoveSelf &&
          user.teamId != this.teamId
        ) {
          let n = portalSprite.x - boardCenterX;
          let n2 = portalSprite.y - boardCenterX;
          for (let n3 = this.orbitDistance / 35, j = 0; j < n3 - 1; j++) {
            let n4 = boardCenterX + (n / n3) * j;
            let n5 = boardCenterX + (n2 / n3) * j;
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
    }
    if (this.player.getViewRect().intersects(this.rectCenterBox)) {
      for (let n6 = 0; n6 < 60; n6++) {
        if (this.novaInfo[n6][0] > 45.0) {
          this.novaInfo[n6][0] = Math.abs(WHUtil.randInt(45));
          this.novaInfo[n6][1] = boardCenterX - 5 + WHUtil.randInt(16);
          this.novaInfo[n6][2] = boardCenterX - 5 + WHUtil.randInt(16);
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
      ClientUser.drawTeamShape(context, n, n2, this.teamId);
    }
  }

  drawFighter(context, fighterNumber, x, y) {
    context.translate(x, y);

    const user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );

    // draw all of the fighters
    // do not limit by permissions
    context.fillStyle = this.colors.colors[user.slot][2];
    context.strokeStyle = this.colors.colors[user.slot][2];
    if (this.userShipType == fighterNumber) {
      context.fillStyle =
        this.colors.colors[user.slot][(this.currentFighterShade++ / 2) % 20];
      context.fillRect(-25, -24, 50, 50);
      context.fillStyle = "gray";
      context.fillRect(-20, -20, 40, 40);
      context.fillStyle = user.color;
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
      context.beginPath();
      context.arc(0, 0, 5, 0, 2 * Math.PI);
      context.fill();
      context.fillStyle = "black";
      context.beginPath();
      context.arc(0, 0, 5, -Math.PI / 9, (2 * Math.PI) / 9);
      context.fill();
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
          this.userShipType = xSelection;
          this.zoomInIntro = 0;

          // TODO send over the network that the ship has changed
          const user = this.gameNetLogic.clientUserManager.users.get(
            this.gameNetLogic.userId
          );
          user.shipType = this.userShipType;

          // change the user to the selected ship
          user.userSprite.removeSelf();

          user.userSprite = new UserSprite(
            this.board.width / 2,
            this.board.height / 2,
            this.userShipType,
            this
          );
          user.userSprite.addSelf();
          user.userSprite.setUser(user.userId);

          this.sendState();
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
    const user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );
    for (let i = user.numPowerups - 1; i >= 0; i--) {
      let powerupNumber = user.powerups[i];
      // subtract 6 from the number, if the number is less than or equal to 0, set it to 0
      const shiftedNumber = powerupNumber - 6;
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
    context.fillRect(
      this.introX,
      this.introY,
      this.intro.width,
      this.intro.height
    );

    context.fillStyle = "white";
    context.font = "14px helvetica";
    context.fillText(
      "yawc Ship Selection",
      this.introX + 100,
      this.introY + 16
    );

    context.font = "12px helvetica";
    context.fillText(
      "Choose a ship by clicking on it.",
      this.introX + 100,
      this.introY + 28
    );

    context.fillStyle = "gray";
    context.fillRect(this.intro_shipX, this.intro_shipY, 400, 50);

    context.strokeStyle = this.color;
    context.strokeRect(this.intro_shipX, this.intro_shipY, 400, 50);

    // draw ships
    for (let i = 0; i < 8; i++) {
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
    let n2 = this.intro_shipX + (this.userShipType % 8) * 50 + 25;
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

    let array = UserSprite.shipDescriptions[this.userShipType];
    let n6 = n5 - 40;
    let n7 = n4 + 10;
    context.beginPath();
    context.fillStyle = "white";
    context.textAlign = "left";
    for (let i = 1; i < array.length; i++) {
      context.fillText(array[i], n6, n7 + i * 12);
    }

    const user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );

    let zoomInIntro = UserSprite.fighterData[user.shipType].zoomScale;
    context.strokeStyle = user.color;
    context.fillStyle = user.color;

    if (this.zoomInIntro < zoomInIntro) {
      this.zoomInIntro += zoomInIntro / 50;
      zoomInIntro = this.zoomInIntro;
      context.strokeStyle =
        this.colors.colors[user.slot][
          ((zoomInIntro - this.zoomInIntro) / zoomInIntro) * 19
        ];
      context.fillStyle =
        this.colors.colors[user.slot][
          ((zoomInIntro - this.zoomInIntro) / zoomInIntro) * 19
        ];
    }

    context.translate(this.introX + 75, this.introY + 180);
    const polygon = WHUtil.createPolygon(UserSprite.shipShapes[user.shipType]);
    WHUtil.drawScaledPoly(context, polygon, zoomInIntro);

    // TODO - draw the rotating polygon
    // WHUtil.drawScaledPoly(
    //   context,
    //   UserSprite.g_polyShip[this.userShipType][
    //     ((this.currentFighterShade * 10) / PlayerSprite.DROTATE) %
    //       PlayerSprite.NROTATIONS
    //   ],
    //   zoomInIntro
    // );

    context.translate(-(this.introX + 75), -(this.introY + 180));
    context.fillStyle = "white";
    context.fillText(array[0], this.introX + 10, this.introY + 110);
  }

  // add the powerup to the user's powerups
  // send a network message showing that the user got the powerup
  addPowerup(powerupType) {
    const user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );
    if (user.numPowerups >= 5) {
      return;
    }
    user.powerups[user.numPowerups++] = powerupType;
    this.refreshUserBar = true;
    this.sendEvent(`got the ${PowerupSprite.names[powerupType]} powerup`);
  }

  addIncomingPowerup(portalSprite, powerupType, fromUserId, b2) {
    if (portalSprite == null) {
      return;
    }
    portalSprite.genBadPowerupEffect(powerupType, fromUserId, b2);
    this.incomingCycle = 40;
    this.incomingIconCycle = 160;
    this.incomingWhoStack[this.incomingIconIndex] = fromUserId;
    this.fromUserId = fromUserId;
    this.currentShade = 0;
    this.incomingTypeStack[this.incomingIconIndex] = powerupType;
    this.incomingIconIndex = Math.min(29, this.incomingIconIndex + 1);
    if (powerupType == 14) {
      this.incomingNukeCycle = 40;
    }
  }

  usePowerup(powerupType, upgradeLevel, toUserId) {
    // stream.writeByte(107);
    const packet = {
      type: "sendPowerup",
      // powerupType,
      // TODO - only send nukes
      powerupType: 14,
      toUserId,
      upgradeLevel,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
    // monitorexit(super.m_logic.getNetwork())
  }

  sendUserDestroyed(killedBy) {
    // send a packet showing that the game is over
    // stream.writeByte(110);
    const packet = {
      type: "userDestroyed",
      killedBy,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
  }

  // monitorexit(super.logic.getNetwork())

  /**
   * handles the game packet receipt
   */
  handleGamePacket(gamePacket) {
    const type = gamePacket.type;
    switch (type) {
      case "startGame":
        // packet now just has the roomId in it
        if (this.gameNetLogic.roomId != gamePacket.roomId) {
          return;
        }

        const room = this.gameNetLogic.clientRoomManager.getRoomById(
          this.gameNetLogic.roomId
        );

        // go through the room's userState object to determine who is on what team
        this.totalOpposingUsers = 0;

        const thisUser = this.gameNetLogic.clientUserManager.users.get(
          this.gameNetLogic.userId
        );

        // only add the portals for opposing users
        for (let i = 0; i < room.userIds.length; i++) {
          let shouldAddPortal = false;
          if (room.userIds[i] != null) {
            const user = this.gameNetLogic.clientUserManager.users.get(
              room.userIds[i]
            );

            if (user.userId != this.gameNetLogic.userId) {
              // don't add portals for teammates
              if (room.isTeamRoom) {
                if (user.teamId != thisUser.teamId) {
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
                user,
                this
              );
              n++;
              user.portalSprite = portalSprite;
              portalSprite.addSelf();
              portalSprite.setWarpingIn();
            } else {
              user.portalSprite = null;
            }
          }
        }

        this.mode = "playing";
        this.refreshAll = true;
        this.refreshUserBar = true;
        this.gameOver = false;
        break;

      // userState communicates the health and the powerups
      // that a user has
      case "userState": {
        // don't update if it is a game over
        if (this.gameOver) {
          return;
        }

        // do not update the userState if this is the user
        if (this.gameNetLogic.userId == gamePacket.userId) {
          return;
        }

        const user = this.gameNetLogic.clientUserManager.users.get(
          gamePacket.userId
        );
        if (user.gameOver) {
          return;
        }
        user.readState(gamePacket);
        this.refreshOtherBar = true;
        break;
      }

      // userEvets are text messages that are displayed across other
      // people's screens
      case "userEvent": {
        const userMessage = gamePacket.eventString;
        while (this.userMessages.length >= 2) {
          this.userMessages.shift();
        }
        this.userMessages.push(userMessage);
        this.lastCycleForMessages = this.cycle + 200;
        break;
      }

      case "gameEnd": {
        const isTeamRoom = gamePacket.isTeamRoom;
        const winnerSlot = gamePacket.winnerSlot;

        const room = this.gameNetLogic.clientRoomManager.getRoomById(
          this.gameNetLogic.roomId
        );

        this.mode = "gameOver";
        this.gameOverCycle = 0;

        // check if it is a team room
        if (isTeamRoom) {
          // TODO - implement teams
          // set the winning team
          // get the winning team and then display the winning team's name
        } else {
          // not a team room
          // get the winning user's id
          const winningUserId = room.getUserId(winnerSlot);
          const winningUser =
            this.gameNetLogic.clientUserManager.users.get(winningUserId);
          if (this.gameNetLogic.userId === winningUser.userId) {
            this.winningUserString = "YOU WON";
          } else {
            this.winningUserString = `${winningUser.username} WON`;
          }
          winningUser.wins++;
          winningUser.gameOver = true;
          this.refreshUserBar = true;
        }
        break;
      }

      case "userDestroyed": {
        let destroyedUserId = gamePacket.destroyedUserId;
        const destroyedUser =
          this.gameNetLogic.clientUserManager.users.get(destroyedUserId);

        // now we get slots
        const killerUserSlot = gamePacket.killerSlot;
        const room = this.gameNetLogic.clientRoomManager.getRoomById(
          this.gameNetLogic.roomId
        );
        const killerUserId = room.getUser(killerUserSlot);

        destroyedUser.gameOver = true;
        if (destroyedUserId == this.gameNetLogic.userId) {
          return;
        }
        destroyedUser.refresh = true;
        if (destroyedUser.portalSprite != null) {
          destroyedUser.portalSprite.killSelf();
        }
        destroyedUser.healthPercent = 0;

        if (killerUserId == this.gameNetLogic.userId) {
          const killerUser =
            this.gameNetLogic.clientUserManager.users.get(killerUserId);
          killerUser.kills++;
        }

        this.refreshUserBar = true;
        break;
      }

      case "receivePowerup": {
        const powerupType = gamePacket.powerupType;
        const fromUserId = gamePacket.fromUserId;
        const toUserId = gamePacket.toUserId;
        // b2 is always set to 0
        const byte9 = gamePacket.b2;

        // check that the game is not over for now
        if (this.gameOver) {
          return;
        }

        // if the current user is not the destination user
        // do not generate the powerup
        if (toUserId != this.gameNetLogic.userId) {
          this.refreshOtherBar = true;
          return;
        }

        if (this.gameOver) {
          return;
        }
        // get the portalSprite for the fromUser
        const fromUser =
          this.gameNetLogic.clientUserManager.users.get(fromUserId);

        this.addIncomingPowerup(
          fromUser.portalSprite,
          powerupType,
          fromUserId,
          byte9
        );
        break;
      }
    }
  }

  // combination of writeState and updateState
  /**
   * Send the user's current information
   */
  sendState() {
    // stream.writeByte(106);
    // get the state from the clientUser
    const user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );
    const packet = user.getUserState();
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
  }

  // combination of writeEvent and updateEvent
  sendEvent(eventString) {
    // stream.writeByte(109);
    const packet = {
      type: "userEvent",
      eventString: `${this.gameNetLogic.username} ${eventString}`,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
  }

  drawTeamButton(context, s, color, color2, n, n2, n3, n4) {
    context.strokeStyle = color;
    context.fillStyle = color;
    context.roundRect(n + 1, n2, n4 - 2 - n, 15, n3, n3);
    context.fill();

    context.strokeStyle = color2;
    context.roundRect(n + 1, n2, n4 - 2 - n, 15, n3, n3);
    context.stroke();

    context.font = "12px helvetica";
    this.drawCenteredText2(context, s, n2 + 13, n, n4 - n);
  }

  /**
   * Draw the bar on the right side of the screen
   * containing the other players, their stats,
   * powerups, and health
   * @param {*} context
   * @param {Boolean} forceRefresh
   * @returns
   */
  // user bar on the right side of the screen
  drawOtherBar(context, forceRefresh) {
    this.refreshOtherBar = false;
    if (forceRefresh) {
      context.strokeStyle = "black";
      context.fillStyle = "black";
      context.fillRect(0, 0, 144, 474);
    }

    // get the room
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );
    // TODO - check that newly received packets will update the otherBar
    // check if it is a team room
    let yOffset = 0;
    let user;
    if (room != null && !room.isTeamRoom) {
      for (let i = 0; i < room.userIds.length; i++) {
        // don't draw this user's info on the right bar
        if (
          room.userIds[i] != null &&
          this.gameNetLogic.userId != room.userIds[i]
        ) {
          // get the user with the userId
          user = this.gameNetLogic.clientUserManager.users.get(room.userIds[i]);
          if (forceRefresh || user.refresh) {
            // why offset by 49?
            // let n = 49 + user.userHeight * yOffset;
            let n = user.userHeight * yOffset;
            // user.setDrawLocation(n, user.userHeight - 1);
            context.translate(0, n);
            user.draw(context, 143, user.userHeight - 1);
            context.translate(0, -n);
          }
          yOffset++;
        }
      }
      return;
    }

    user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );
    if (user.teamId <= 0) {
      return;
    }
    if (forceRefresh) {
      this.drawTeamButton(
        context,
        ClientRoomManager.TEAM_NAMES[user.teamId],
        ClientRoomManager.TEAM_COLORS[user.teamId],
        ClientRoomManager.TEAM_BG_COLORS[user.teamId],
        0,
        1,
        3,
        144
      );
      this.drawMyTeamPlaceholder(context, 18);
    }
    let drawTeam = this.drawTeam(context, 52, user.teamId, forceRefresh);
    let b2 = 3 - user.teamId;
    if (forceRefresh) {
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
    this.drawTeam(context, drawTeam + 18, b2, forceRefresh);
  }

  /**
   * Draw the top user status bar,
   * change the color if the game is over
   *
   * Bar across the top of the screen with the user's
   * information, ship upgrades,  and the powerups
   */
  drawUserBar(context) {
    this.refreshUserBar = false;

    const user = this.gameNetLogic.clientUserManager.users.get(
      this.gameNetLogic.userId
    );

    context.fillStyle = this.gameOver ? "gray" : "black";
    context.beginPath();
    context.fillRect(0, 0, 430, 49);
    context.strokeStyle = user.color;
    context.strokeRect(0, 0, 429, 48);
    context.font = "12px helvetica";
    if (user.userSprite != null) {
      context.fillStyle = "white";
      context.strokeStyle = "white";
      context.fillText(this.gameNetLogic.username, 7, 10);

      const yOffset = 19;
      context.roundRect(-20, yOffset, 144, yOffset + 50, 20, 20);
      context.stroke();
      context.textAlign = "left";
      context.fillText("Powerups", 7, yOffset + 12);
      if (user.numPowerups > 0) {
        context.translate(5, yOffset + 14);
        this.drawPowerups(context);
        context.translate(-5, -yOffset - 14);
      }
      context.translate(110, 0);
      user.userSprite.drawPermanentPowerups(context);
      context.translate(-110, 0);
    }
    let n2 = 370;
    let n3 = n2 - 10;
    context.strokeStyle = "white";
    context.beginPath();
    context.moveTo(n3, 0);
    context.lineTo(n3, 90);
    context.stroke();

    context.fillStyle = "white";
    context.fillText("History", n2, 12);
    context.fillText(`Wins: ${user.wins}`, n2, 28);
    context.fillText(`Kills: ${user.kills}`, n2, 42);
  }

  getTimeElapsed() {
    return window.performance.now() - this.startTime;
  }
}

import UserSprite from "./UserSprite.js";
// import Sprite from "./Sprite.js";
import UserState from "./UserState.js";
import SpriteColors from "./SpriteColors.js";
import WHUtil from "./WHUtil.js";
import Rectangle from "./Rectangle.js";
import PortalSprite from "./PortalSprite.js";
import WallCrawlerSprite from "./WallCrawlerSprite.js";
import Polygon from "./Polygon.js";
import ClientRoomManager from "./ClientRoomManager.js";

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
  users;
  colors;
  mode;

  allSprites;
  badGuys;
  goodGuys;

  isDebugMode;
  currentFighterShade;

  selectedShip;
  zoomInIntro;

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

    this.bPlaySound = true;
    this.tableElement;

    // state machine mode for the game
    // this.mode = 0;

    // array of UserState objects
    this.users = new Array(8);
    for (let i = 0; i < this.users.length; i++) {
      this.users[i] = new UserState();
    }

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

    this.mode = 1;
    this.slot = 0;

    this.currentFighterShade = 0;

    this.selectedShip = 1;
    this.zoomInIntro = 0;

    // only use key handlers when the game is in focus?
    // key press handlers
    // TODO - may need to modify to allow for chatting while in game
    document.onkeydown = (e) => this.onkeydown(e);
    document.onkeyup = (e) => this.onkeyup(e);
  }

  init() {
    // console.log("board initializing");
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

    // get a random user fighter type
    this.userFighterType = WHUtil.randInt() % 8;

    this.incomingIconIndex = 0;
    this.incomingCycle = 0;
    this.incomingNukeCycle = 0;
    this.numPowerups = 0;
    this.flashScreenColor = "black";

    // get the start time (in ms)
    this.startTime = Date.now();

    // reset powerups
    for (let i = 0; i < this.users.length; i++) {
      this.users[i].resetPowerups();
    }

    this.boardChanged = true;

    this.isGameOver = false;
    this.refreshStatus = true;

    // clear sprite arrays
    this.allSprites = [];
    this.badGuys = [];
    this.goodGuys = [];

    this.orbitDistance = 240;
    let n = 3;

    // set the orbitDistance based on the number of users
    //   if (super.tableElement != null) {
    //     totalOpposingPlayingUsers = this.totalOpposingPlayingUsers;
    //     switch (super.tableElement.getBoardSize()) {
    //       // setting local totalOpposingPlayingUsers to change the board size
    //         case 1: {
    //             totalOpposingPlayingUsers = 1;
    //             break;
    //         }
    //         case 2: {
    //             totalOpposingPlayingUsers = 2;
    //             break;
    //         }
    //         case 3: {
    //             totalOpposingPlayingUsers = 4;
    //             break;
    //         }
    //     }
    //     switch (totalOpposingPlayingUsers) {
    //         case 1: {
    //             n = 2.0;
    //             this.orbitDistance = 150;
    //             break;
    //         }
    //         case 2:
    //         case 3: {
    //             n = 3.0;
    //             this.orbitDistance = 240;
    //             break;
    //         }
    //         default: {
    //             n = 3.6;
    //             this.orbitDistance = 280;
    //             break;
    //         }
    //     }
    // }

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
    this.user = new UserSprite(this.boardCenter, this.userFighterType, this);
    // this.imgLogo = (Image)this.mediaTable.get("img_bg_logo");
    // if (this.imgLogo != null) {
    //   this.rectLogo.setBounds(
    //     this.boardCenter.x - this.imgLogo.getWidth(null) / 2,
    //     this.boardCenter.y - this.imgLogo.getHeight(null) / 2,
    //     this.imgLogo.getWidth(null),
    //     this.imgLogo.getHeight(null)
    //   );
    // }
    this.user.addSelf();
    this.user.setUser(this.slot);

    let wc1 = new WallCrawlerSprite({ x: 0, y: 0 }, this, true);
    let wc2 = new WallCrawlerSprite({ x: 0, y: 0 }, this, false);

    wc1.addSelf();
    wc2.addSelf();

    // start gameLoop
    window.requestAnimationFrame(this.gameLoop.bind(this));
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
    }
  }

  prepareCanvas() {
    this.canvas = document.getElementById("GameCanvas");
    this.canvas.addEventListener(
      "mousedown",
      this.processClick.bind(this),
      false
    );

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
      this.user.dRotate = Math.abs(this.user.dRotate);
      this.user.isRotating = true;
    }
    if (this.input.left) {
      this.user.dRotate = -1 * Math.abs(this.user.dRotate);
      this.user.isRotating = true;
    }
    if (this.input.up) {
      this.user.thrustOn = true;
    }
    if (this.input.spacebar) {
      this.user.firePrimaryWeapon = true;
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

    if (this.refreshStatus) {
      // drawStatusBar(this.pnlStatus.g);

      // updateState(this.sessionId, gameID);
      this.strDamagedByUser = null;
      this.damagingPowerup = -1;
    }
    if (this.shouldRefreshUserBar) {
      // drawUserBar(this.pnlOtherUsers.g, this.bRefreshAll);
      this.shouldRefreshAll = false;
    }
  }

  reset() {
    this.init();
    this.wins = 0;
    super.slot = 0;
    this.color = this.colors.colors[0][0];
    this.shouldRefreshPlayerBar = true;
    for (let i = 0; i < this.users.length; ++i) {
      this.users[i].fullReset();
    }
  }

  gameLoop(timeStamp) {
    // Keep requesting new frames
    window.requestAnimationFrame(this.gameLoop.bind(this));

    // perform updates to models
    // currently used to handle keyboard input
    // this.update();

    // render the scene
    // this.render();

    // add code from doOneCycle here
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
        if (this.isGameOver) {
          this.gameOverCycle = 0;
          this.mode = "gameOver";
          if (this.winningUserString == null) {
            this.gameOver(this.sessionId, this.killedBy);
            return;
          }
        }
        break;
      }

      case "resetGame": {
        // case where the game is over
        this.isGameOver = true;
        this.mode = "waiting";
        // draw the bar across the top of the screen
        // drawStatusBar(this.pnlStatus.g);
        this.bRefreshUserBar = true;
        break;
      }

      // case 2 is waiting for the game to start
      case "waiting": {
        // this is the timeout attacks function
        // checkSidebar();

        // only draw the user bar if it should be refreshed
        if (this.bRefreshUserBar) {
          //   drawUserBar(this.pnlOtherUsers.g, true);
        }

        this.draw(this.context);
        // ship selection area
        this.drawIntro(this.context);
        // get the status of the game

        const room = this.gameNetLogic.clientRoomManager.getRoomById(
          this.gameNetLogic.roomId
        );
        // if the game is already playing, wait for the next game
        if (
          room != null &&
          room.status == ClientRoomManager.ROOM_STATUS_PLAYING
        ) {
          this.drawStrings(this.context, "Waiting for", "Next Game");
          // this.pnlPlaying.completeRepaint();
        } else if (
          room != null &&
          room.status == ClientRoomManager.ROOM_STATUS_COUNTDOWN
        ) {
          this.drawStrings(this.context, "Countdown", "" + room.countdown);
          // write a message depending on how many users there are
        } else if (room.numUsers() < 2) {
          this.drawStrings(this.context, "Waiting for", "More Users");
        } else {
          this.drawStrings(this.context, "Press Play Button", "To Start");
        }
        // this.pnlPlaying.completeRepaint();
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
    if (paramAudioClip != null && bPlaySound) paramAudioClip.play();
  }

  setSound(paramBoolean) {
    bPlaySound = paramBoolean;
  }

  // add users to the room when someone joins the room
  // readJoin(paramDataInput) {
  //   this.model.readJoin(paramDataInput);
  // }

  addUser(username, rank, teamId, icons, slot) {
    // check if the userId is equal to the user's current user id
    if (this.gameNetLogic.username != username) {
      this.setUser(username, rank, teamId, icons, slot, true, true);
    }
    // check if it is a team table
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );
    if (room.isTeamRoom) {
      this.bRefreshAll = true;
    }
  }

  getUser(slot) {
    if (slot > this.users.length) {
      return "COMPUTER";
    }
    if (slot == this.gameNetLogic.user.slot) {
      return "YOU";
    }
    return this.users[this.translateSlot(slot)].username;
  }

  removeUser(username) {
    // users is an array of UserInfo objects
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].username == username) {
        this.bRefreshPlayerBar = true;
        this.users[i].fullReset();
      }
    }

    // get the room by the roomId
    const room = this.gameNetLogic.clientRoomManager.getRoomById(
      this.gameNetLogic.roomId
    );
    if (room.isTeamRoom) {
      this.bRefreshAll = true;
    }
  }
  setTable(paramCFTableElement) {
    // this.model.setTable(paramCFTableElement);
    this.tableElement = paramCFTableElement;
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
      for (let b = 0; b < this.users.length; b++) {
        // let userInfo = this.users[(j + b) % this.users.length];
        let userInfo = this.users[b];
        if (userInfo.isPlaying() && userInfo.portalSprite != null) {
          userInfo.portalSprite.shouldGenEnemy = true;
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
    for (let b = 0; b < this.users.length; b++) {
      if (this.users[b].timeoutAttacks()) this.bRefreshUserBar = true;
    }
  }

  setTeam(paramString, paramByte) {
    if (this.gameNetLogic.getUsername() == paramString) {
      this.teamId = paramByte;
    } else {
      for (let b = 0; b < this.users.length; b++) {
        if (this.users[b].username == paramString) {
          this.users[b].teamId = paramByte;
        }
        this.users[b].bRefresh = true;
      }
    }
    this.bRefreshUserBar = true;
  }

  setSlot(slotNum) {
    this.slot = slotNum;
    this.color = this.colors.colors[slotNum][0];
  }

  // draw the Game to the canvas
  draw(context) {
    // check if the user is defined
    // this.user is an instance of a userSprite
    if (this.user != null) {
      // get the viewable area for the user
      let viewportRect = this.user.getViewportRect();

      context.fillStyle = "black";
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.drawStars(context, "gray", this.narrowStar);
      // draw pointers to other wormholes
      this.drawPointers(context);
      context.translate(-viewportRect.x, -viewportRect.y);
      this.drawBorder(context);
      this.drawStars(context, "white", this.star);
      this.drawRing(context);

      // if (
      //   this.teamID != 0 &&
      //   super.tableElement.isTeamTable() &&
      //   !this.isGameOver
      // ) {
      //   this.drawTeamStuff(graphics);
      // }
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
          SpriteColors.colors[this.incomingSlot][this.currentShade++ % 20];
        context.strokeText("I N C O M I N G", this.boardWidth / 2 - 120, 200);
        context.stroke();
        if (this.incomingNukeCycle > 0) {
          --this.incomingNukeCycle;
          context.strokeText("N U K E", this.boardWidth / 2 - 90, 240);
          context.stroke();
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

      // if (this.incomingIconCycle > 0) {
      //   this.incomingIconCycle--;
      // } else if (this.incomingIconIndex > 0) {
      //   this.incomingIconIndex--;
      //   this.incomingIconCycle = 50;
      //   for (let k = 0; k < this.incomingIconIndex; k++) {
      //     this.incomingTypeStack[k] = this.incomingTypeStack[k + 1];
      //     this.incomingWhoStack[k] = this.incomingWhoStack[k + 1];
      //   }
      // }

      // for (let l = 0; l < this.incomingIconIndex; l++) {
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
    for (let i = 0; i < this.users.length; i++) {
      if (
        !this.users[i].bEmpty &&
        this.users[i].portalSprite != null &&
        this.user != null &&
        !this.users[i].gameOver
      ) {
        let n = this.users[i].portalSprite.location.x - this.user.location.x;
        let n2 = this.users[i].portalSprite.location.y - this.user.location.y;
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

          context.strokeStyle = this.users[i].color;
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
    // TODO - center the strings on the board
    let n = this.introY - 115;
    let n2 = n + 30;
    context.fillStyle = this.color;
    context.strokeStyle = this.color;

    // how to
    context.beginPath();
    // graphics.fillRoundRect(50, n, this.boardWidth - 100, 100, 30, 30);
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
    // TODO need to add offset for the canvas
    let x = this.board.width / 2;
    // graphics.setFont(WormholeModel.fontLarge);
    // graphics.drawString(s, n3, n);
    context.font = "20pt Helvetica";
    context.textAlign = "center";
    context.fillText(text, x, y);
  }

  drawCenteredString2(context, text, y, xOffset, elementWidth) {
    // context.drawString(s,
    // (n3 - graphics.getFontMetrics(graphics.getFont()).stringWidth(s)) / 2 + n2, n);
    // TODO make sure alignment is good
    context.textAlign = "center";
    context.fillText(
      text,
      (elementWidth - context.measureTest(text).width) / 2 + xOffset,
      y
    );
  }

  drawFighter(context, fighterNumber, x, y) {
    context.translate(x, y);
    // if (this.hasShipPermission((byte)PlayerSprite.g_fighterData[n][13])) {
    // graphics.setColor(Sprite.g_colors[super.m_slot][2]);

    context.fillStyle = this.colors.colors[this.slot][2];
    context.strokeStyle = this.colors.colors[this.slot][2];
    // }
    // else {
    // graphics.setColor(Color.black);
    // }
    if (this.selectedShip == fighterNumber) {
      // graphics.setColor(this.colors.colors[super.m_slot][this.currentFighterShade++ / 2 % 20]);
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
      // graphics.setColor(Color.black);
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
        this.intro_shipY <= event.y &&
        event.y <= this.intro_shipY + this.intro.height
      ) {
        if (
          this.canvas.offsetLeft + this.intro_shipX <= event.x &&
          event.x <=
            this.canvas.offsetLeft + this.intro_shipX + this.intro.width - 10
        ) {
          // now get the box that it is over
          // subtract the introX from the eventx
          let xOffset = event.x - this.canvas.offsetLeft - this.intro_shipX;
          let xSelection = Math.floor((xOffset * 8) / this.intro.width);
          this.selectedShip = xSelection;
          this.playerFighterType = this.selectedShip;
          this.zoomInIntro = 0;
        }
      }
    }
  }

  drawIntro(context) {
    // add a mouse listener to the canvas
    // graphics.setColor(Color.lightGray);
    // light gray
    context.fillStyle = "#C0C0C0";
    // graphics.fill3DRect(this.introX, this.introY, 410, 260, true);
    context.fillRect(
      this.introX,
      this.introY,
      this.intro.width,
      this.intro.height
    );

    // graphics.setColor(Color.white);
    context.fillStyle = "white";

    // graphics.setFont(WormholeModel.fontFourteen);
    // graphics.drawString("Wormhole NG Ship Selection", this.introX + 100, this.introY + 16);

    context.font = "14px Helvetica";
    context.fillText(
      "yawc Ship Selection",
      this.introX + 100,
      this.introY + 16
    );

    // graphics.setFont(WormholeModel.fontTwelve);
    // graphics.drawString("Choose a ship by clicking on it.", this.introX + 100, this.introY + 28);
    context.font = "12px Helvetica";
    context.fillText(
      "Choose a ship by clicking on it.",
      this.introX + 100,
      this.introY + 28
    );

    // graphics.setColor(Color.gray);
    // graphics.fillRect(this.intro_shipX, this.intro_shipY, 400, 50);
    context.fillStyle = "gray";
    context.fillRect(this.intro_shipX, this.intro_shipY, 400, 50);

    // graphics.setColor(this.color);
    // graphics.drawRect(this.intro_shipX, this.intro_shipY, 400, 50);
    context.strokeStyle = this.color;
    context.strokeRect(this.intro_shipX, this.intro_shipY, 400, 50);
    context.stroke();

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
    // let n3 = this.intro_shipY + (this.selectedShip / 8) * 50 + 25;
    let n3 = this.intro_shipY + 25;
    let n4 = this.intro_shipY + 50 + 10;
    let n5 = this.intro_shipX + 200;
    // Color black = Color.black;
    // if (hasPermission) {
    // black = Sprite.g_colors[super.slot][this.currentFighterShade / 2 % 20];
    // }
    // graphics.setColor(black);

    context.beginPath();
    context.strokeStyle = "black";
    context.fillStyle = "black";

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
    context.strokeStyle = "white";
    context.fillStyle = "white";
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

    // graphics.translate(this.introX + 75, this.introY + 180);
    context.translate(this.introX + 75, this.introY + 180);
    // //WHUtil.drawScaledPoly(graphics, PlayerSprite.g_polyShip[this.selectedShip][this.currentFighterShade / 2 % 24], zoomInIntro);
    // WHUtil.drawScaledPoly(graphics, PlayerSprite.g_polyShip[this.selectedShip][this.currentFighterShade * 10 / PlayerSprite.DROTATE % PlayerSprite.NROTATIONS], zoomInIntro);
    let x_pts = [];
    let y_pts = [];
    for (let i = 0; i < UserSprite.shipShapes[this.selectedShip].length; i++) {
      x_pts.push(UserSprite.shipShapes[this.selectedShip][i].x);
      y_pts.push(UserSprite.shipShapes[this.selectedShip][i].y);
    }

    const fighterPolygon = new Polygon(x_pts, y_pts, x_pts.length);
    WHUtil.drawScaledPoly(
      context,
      fighterPolygon,
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
    context.strokeStyle = "white";
    context.fillStyle = "white";

    context.fillText(array[0], this.introX + 10, this.introY + 110);
    // TODO allow all ships to be played?
    // if (!hasPermission) {
    //     graphics.setColor(Color.red);
    //     graphics.drawString("Enable extra ships in", this.introX + 10, this.introY + 180);
    //     graphics.drawString("create table options", this.introX + 10, this.introY + 192);
    // }
  }

  translateSlot(newSlot) {
    if (this.slot < newSlot) {
      return newSlot - 1;
    }
    return newSlot;
  }

  // previously called setTable in WormholeModel.java
  setRoom(roomId) {
    const room = this.gameNetLogic.clientRoomManager.getRoomById(roomId);

    // set the teamId of the player for the room
    if (room.isTeamRoom) {
      this.teamId = 1;
    } else {
      this.teamId = 0;
    }

    this.init();
    // check about the ship permissions
    // for yawc, allow all ships to be played
    // if (!this.hasShipPermission((byte)PlayerSprite.g_fighterData[this.playerFighterType][13])) {
    this.playerFighterType = 1;
    // }
    // TODO draw the user bar
    // this.drawUserBar(this.pnlOtherPlayers.g, true);
    // resets the game mode
    this.mode = "resetGame";
  }

  setUsers(gamePacket) {
    let totalUsers = gamePacket.roomUsers.length;
    // let totalUsers = gamePacket.totalUsers;
    for (let i = 0; i < totalUsers; i++) {
      // get the userId?
      // TODO
      // use the userId
      let userId = gamePacket.roomUsers[i].userId;
      let userSlot = gamePacket.roomUsers[i].slot;
      let isGameOver = gamePacket.roomUsers[i].isGameOver;
      let teamId = gamePacket.roomUsers[i].teamId;
      const user = this.gameNetLogic.clientUserManager.users.get(userId);

      if (userId != this.gameNetLogic.userId) {
        // use ClientUserManager settings for this info
        this.setUser(
          user.username,
          user.rank,
          teamId,
          user.icons,
          // this.logic.getUser(userName).getIcons(),
          userSlot,
          isGameOver
        );
        if (isGameOver == false) {
        }
      } else {
        this.slot = userSlot;
        this.color = this.colors.colors[this.slot][0];
        this.teamId = teamId;
      }
    }
    this.bRefreshUserBar = true;
  }

  // draw the user info block
  setUser(name, rank, teamId, icons, userSlot, isGameOver, b2) {
    let userState = this.users[this.translateSlot(userSlot)];
    userState.reset();
    userState.resetPowerups();
    // sets the username and the slot/colors
    userState.setState(name, userSlot);
    userState.gameOver = isGameOver;
    userState.nPowerups = 0;
    userState.rank = rank;
    userState.icons = icons;
    userState.teamId = teamId;
    this.bRefreshUserBar = true;
    this.setSlot(userSlot);
  }

  gameOver(sessionId, killedBy) {
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
        this.gameId = gamePacket.gameId;
        this.sessionId = gamePacket.sessionId;
        // set the ship to the player's chosen ship

        const room = this.gameNetLogic.clientRoomManager.getRoomById(
          this.gameNetLogic.roomId
        );
        this.setUsers(gamePacket);
        this.totalOpposingUsers = 0;
        for (let i = 0; i < gamePacket.roomUsers.length; i++) {
          if (
            !this.users[i].isEmpty &&
            this.users[i].userId != this.gameNetLogic.userId
          ) {
            if (room.isTeamRoom) {
              if (this.users[i].teamId != this.teamId) {
                this.totalOpposingUsers++;
              }
            } else {
              this.totalOpposingUsers++;
            }
          }
        }
        // TODO - move this to start the game for the 'waiting' mode
        // this.init();
        this.mode = "playing";
        this.bRefreshUserBar = true;
        this.bRefreshAll = true;
        this.isGameOver = false;

        // only add the portals for opposing users

        let n = 0;
        for (let i = 0; i < gamePacket.roomUsers.length; i++) {
          if (
            !this.users[i].isEmpty &&
            this.users[i].userId != this.gameNetLogic.userId
          ) {
            let shouldAddPortal = false;
            // don't add portals for teammates
            if (room.isTeamTable) {
              if (this.users[i].teamId != this.teamId) {
                shouldAddPortal = true;
              }
            } else {
              shouldAddPortal = true;
            }
            if (shouldAddPortal) {
              let portalSprite = new PortalSprite(
                n * (360 / this.totalOpposingUsers),
                this.users[i],
                this
              );
              n++;
              this.users[i].portalSprite = portalSprite;
              portalSprite.addSelf();
              portalSprite.setWarpingIn();
            } else {
              this.users[i].portalSprite = null;
            }
          }
        }
        break;

      // add users to the client user manager
      case "updateUserInfo": {
        let sessionId = gamePacket.sessionId;
        if (sessionId != this.sessionId && !this.isGameOver) {
          return;
        }
        let slot = gamePacket.slot;
        if (slot == this.slot) {
          return;
        }
        let userInfo = this.users[this.translateSlot(slot)];
        if (userInfo.gameOver || userInfo.isEmpty) {
          return;
        }
        userInfo.readState(gamePacket.userInfo);
        this.bRefreshUserBar = true;
        break;
      }

      case "userState": {
        let sessionId = gamePacket.sessionId;
        if (sessionId != this.sessionId && !this.isGameOver) {
          return;
        }
        let slot = gamePacket.slot;
        if (slot == this.slot) {
          return;
        }
        let userState = this.users[this.translateSlot(slot)];
        if (userState.gameOver || userState.isEmpty) {
          return;
        }
        userState.readState(gamePacket);
        this.bRefreshUserBar = true;
        break;
      }

      case "gameOverIndividual":
        slot = gamePacket.slot;
        if (this.slot == slot) {
          this.winningUserString = "YOU WON";
          ++this.wins;
        } else {
          let translateSlot = this.translateSlot(slot);
          this.winningUserString = this.users[translateSlot].username + " WON";
          let userInfo2 = this.users[translateSlot];
          userInfo2.wins++;
          this.users[translateSlot].gameOver = true;
        }
        this.isGameOver = true;
        this.refreshStatus = true;
        this.bRefreshUserBar = true;
        break;

      case "gameOverTeam":
        let teamId = gamePacket.teamId;
        this.winningUserString = CFSkin.TEANAMES[teamId] + " WON";
        if (this.teamId == teamId) {
          this.wins++;
        } else {
          for (let k = 0; k < this.users.length; ++k) {
            if (this.users[k].teamId == teamId) {
              let userInfo3 = this.users[k];
              userInfo3.wins++;
              this.users[k].gameOver = true;
            }
          }
        }
        this.isGameOver = true;
        this.refreshStatus = true;
        this.bRefreshUserBar = true;
        break;

      case "killUser":
        let deceasedSlot = gamePacket.deceasedSlot;
        let killerSlot = gamePacket.killerSlot;
        if (deceasedSlot == this.slot) {
          this.isGameOver = true;
          return;
        }
        let userInfo4 = this.users[this.translateSlot(deceasedSlot)];
        userInfo4.gameOver = true;
        userInfo4.bRefresh = true;
        if (userInfo4.portalSprite != null) {
          userInfo4.portalSprite.killSelf();
        }
        userInfo4.healthPercentage = 0;
        if (killerSlot == this.slot) {
          this.kills++;
          this.refreshStatus = true;
        }
        this.bRefreshUserBar = true;
        break;

      case "message":
        let message = gamePacket.content;
        while (this.vMessages.size() >= 2) {
          this.vMessages.removeElementAt(0);
        }
        this.vMessages.addElement(message);
        this.lastCycleForMessages = this.cycle + 200;
        break;

      case "sendPowerup":
        let powerupType = gamePacket.powerupType;
        let fromSlot = gamePacket.fromSlot;
        let toSlot = gamePacket.toSlot;
        sessionId = gamePacket.sessionId;
        let byte9 = gamePacket.byte9;
        if (sessionId != this.sessionId && !this.isGameOver) {
          return;
        }
        let translateSlot2 = this.translateSlot(fromSlot);
        if (fromSlot != this.slot && translateSlot2 < 0) {
          return;
        }
        if (toSlot != this.slot) {
          this.bRefreshUserBar = true;
          return;
        }
        if (this.isGameOver) {
          return;
        }
        this.addIncomingPowerup(
          this.users[translateSlot2].portalSprite,
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
          let userInfo = this.users[translateSlot];
          userInfo.wins = winCount;
          this.refreshStatus = true;
        }
        break;

      case "slotTeamId":
        slot = gamePacket.slot;
        teamId = gamePacket.teamId;
        if (slot == this.slot) {
          this.teamId = teamId;
        } else {
          let translateSlot = this.translateSlot(slot);
          let userInfo = this.users[translateSlot];
          userInfo.teamId = teamId;
          userInfo.bRefresh = true;
        }
        this.bRefreshUserBar = true;
        break;
    }
  }

  // combination of writeState and updateState
  sendState(sessionId) {
    // stream.writeByte(106);
    let healthPercent = this.user.health / this.user.MAX_HEALTH;
    const packet = {
      type: "userState",
      healthPercent,
      sessionId,
      numPowerups: this.numPowerups,
      powerups: this.powerups,
      userFighterType: this.userFighterType,
      strDamagedByUser: this.strDamagedByUser,
      damagingPowerup: this.damagingPowerup,
      lostHealth: this.user.lostHealth,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
  }

  // combination of writeEvent and updateEvent
  sendEvent(eventString, sessionId) {
    // stream.writeByte(109);
    const packet = {
      type: "event",
      sessionId,
      eventString: `${this.gameNetLogic.username} ${eventString}`,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
  }
}

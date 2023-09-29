import UserSprite from "./UserSprite.js";
// import Sprite from "./Sprite.js";
import UserInfo from "./UserInfo.js";
import SpriteColors from "./SpriteColors.js";
import WHUtil from "./WHUtil.js";
import Rectangle from "./Rectangle.js";
import PortalSprite from "./PortalSprite.js";
import WallCrawlerSprite from "./WallCrawlerSprite.js";

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

    // array of UserInfo objects
    this.users = new Array(8);
    for (let i = 0; i < this.users.length; i++) {
      this.users[i] = new UserInfo();
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

    // temporary - later get the slot from the GameNetLogic.js file
    // when jointing a table
    this.slot = 0;
    this.setSlot(this.slot);

    this.mode = 1;
  }

  init() {
    // console.log("board initializing");
    this.prepareCanvas();

    // use these to track playable board size
    // world (including outside areas)
    // board center
    this.viewport = { width: this.canvas.width, height: this.canvas.height };
    this.board = { width: 430, height: 423 };
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
      this.viewport.height,
    );

    this.globalBoundingRect = new Rectangle(
      0,
      0,
      this.board.width,
      this.board.height,
    );

    // https://stackoverflow.com/questions/16919601/html5-canvas-camera-viewport-how-to-actually-do-it
    // want to render the game using a

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

      // updateState(this.gameSession, gameID);
      this.strDamagedByUser = null;
      this.damagingPowerup = -1;
    }
    if (this.bRefreshUserBar) {
      // drawUserBar(this.pnlOtherUsers.g, this.bRefreshAll);
      this.bRefreshAll = false;
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
        this.handleDefaultModelBehavior();
        if (this.isGameOver) {
          // GameNetLogic method
          // this.logic.gameOver();
          this.gameOverCycle = 0;
          this.mode = "gameOver";
          if (this.winningUserString == null) {
            this.gameOver(this.gameSession, this.killedBy);
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

        // this.draw(this.context);
        // ship selection area
        // drawIntro(this.pnlPlaying.g);
        // if (this.tableElement.getStatus() == 4) {
        //   drawStrings(this.pnlPlaying.g, "Waiting for", "Next Game");
        //   this.pnlPlaying.completeRepaint();
        // } else if (this.tableElement.getStatus() == 3) {
        //   drawStrings(
        //     this.pnlPlaying.g,
        //     "Countdown",
        //     "" + this.tableElement.getCountdown()
        //   );
        // write a message depending on how many users there are
        // } else if (this.tableElement.getUsers() < 2) {
        //   drawStrings(this.pnlPlaying.g, "Waiting for", "More Users");
        // } else {
        //   drawStrings(this.pnlPlaying.g, "Press Play Button", "To Start");
        // }
        // this.pnlPlaying.completeRepaint();
        return;
      }

      case "gameOver": {
        this.handleDefaultModelBehavior();
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

  // readJoin(paramDataInput) {
  //   this.model.readJoin(paramDataInput);
  // }

  // addUser(paramString, paramInt1, paramByte, paramArrayOfString, paramInt2) {
  //   this.model.addUser(
  //     paramString,
  //     paramInt1,
  //     paramByte,
  //     paramArrayOfString,
  //     paramInt2
  //   );
  // }

  // removeUser(paramString) {
  //   this.model.removeUser(paramString);
  // }

  setTable(paramCFTableElement) {
    // this.model.setTable(paramCFTableElement);
    this.tableElement = paramCFTableElement;
  }

  handleDefaultModelBehavior() {
    // handles game logic and checking keyboard input
    // behavior, collisions, checkSidebar
    this.update();

    // handles redrawing the screen
    this.render();
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
            n4 * 0.9 + this.viewportCenter.y,
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
      "gray",
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
        this.world.height + i * 2,
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

  translateSlot(newSlot) {
    if (this.slot < newSlot) {
      return newSlot - 1;
    }
    return newSlot;
  }

  setUsers(gamePacket, b) {
    let totalUsers = gamePacket.totalUsers;
    for (let i = 0; i < totalUsers; i++) {
      let userName = gamePacket.users[i].name;
      let userSlot = gamePacket.users[i].slot;
      let isGameOver = gamePacket.users[i].isGameOver;
      let teamId = gamePacket.users[i].teamId;
      if (userName != this.gameNetLogic.getUsername()) {
        this.setUser(
          userName,
          this.gameNetLogic.getUserRank(userName),
          teamId,
          this.gameNetLogic.getIcons(),
          // this.logic.getUser(userName).getIcons(),
          userSlot,
          isGameOver,
          b,
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

  setUser(name, rank, teamId, icons, userSlot, isGameOver, b2) {
    let userInfo = this.users[this.translateSlot(userSlot)];
    userInfo.reset();
    userInfo.resetPowerups();
    // sets the username and the slot/colors
    userInfo.setState(name, userSlot);
    userInfo.gameOver = isGameOver;
    userInfo.nPowerups = 0;
    userInfo.rank = rank;
    userInfo.icons = icons;
    userInfo.teamId = teamId;
    this.bRefreshUserBar = true;
    this.setSlot(userSlot);
  }

  gameOver(gameSession, killedBy) {
    // send a packet showing that the game is over
    // stream.writeByte(110);
    const packet = {
      type: "gameOver",
      gameSession,
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
        this.gameSession = gamePacket.gameSession;

        this.setUsers(gamePacket, false);
        this.totalOpposingUsers = 0;
        for (let i = 0; i < gamePacket.totalUsers; i++) {
          if (!this.users[i].isEmpty) {
            // if (super.tableElement.isTeamTable()) {
            if (this.users[i].teamId != this.teamId) {
              this.totalOpposingUsers++;
            }
            // } else {
            // this.totalOpposingUsers++;
            // }
          }
        }
        this.init();
        this.mode = "playing";
        this.bRefreshUserBar = true;
        this.bRefreshAll = true;
        this.isGameOver = false;

        let n = 0;
        for (let i = 0; i < gamePacket.totalUsers; i++) {
          if (!this.users[i].isEmpty) {
            let b = false;
            // if (super.tableElement.isTeamTable()) {
            if (this.users[i].teamId != this.teamId) {
              b = true;
            }
            // } else {
            //   b = true;
            // }
            if (b) {
              let portalSprite = new PortalSprite(
                n * (360 / this.totalOpposingUsers),
                this.users[i],
                this,
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

      case "updateUserInfo":
        let gameSession = gamePacket.gameSession;
        if (gameSession != this.gameSession && !this.isGameOver) {
          return;
        }
        let slot = gamePacket.slot;
        if (slot == this.slot) {
          return;
        }
        let userInfo = this.users[this.translateSlot(slot)];
        if (userInfo.gameOver || userInfo.bEmpty) {
          return;
        }
        userInfo.readState(gamePacket.userInfo);
        this.bRefreshUserBar = true;
        break;

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
        gameSession = gamePacket.gameSession;
        let byte9 = gamePacket.byte9;
        if (gameSession != this.gameSession && !this.isGameOver) {
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
          byte9,
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
  sendState(gameSession) {
    // stream.writeByte(106);
    let healthPercent = this.user.health / this.user.MAX_HEALTH;
    const packet = {
      type: "userState",
      healthPercent,
      gameSession,
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
  sendEvent(eventString, gameSession) {
    // stream.writeByte(109);
    const packet = {
      type: "event",
      gameSession,
      eventString: `${this.gameNetLogic.username} ${eventString}`,
    };
    this.gameNetLogic.network.socket.send(JSON.stringify(packet));
  }
}

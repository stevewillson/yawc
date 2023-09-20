import PlayerSprite from "./PlayerSprite.js";
// import Sprite from "./Sprite.js";
import PlayerInfo from "./PlayerInfo.js";
import SpriteColors from "./SpriteColors.js";
import WHUtil from "./WHUtil.js";
import Rectangle from "./Rectangle.js";
import PortalSprite from "./PortalSprite.js";

/**
 * Game Class
 * @description implements a Game (Wormhole) that contains a board
 * world is the total renderable canvas, use this size for generating the stars
 */
export default class Game {
  constructor(gameNetLogic) {
    //   constructor(paramCFProps, paramGameNetLogic, paramHashtable) {
    // this.model = CFSkin.getSkin().generateModel(
    //   this,
    //   paramGameNetLogic,
    //   paramCFProps,
    //   paramHashtable
    // );
    this.canvas = null;
    this.context = null;
    this.loop = null;

    this.logic = gameNetLogic;

    this.input = {
      right: false,
      left: false,
      up: false,
      spacebar: false,
    };

    this.bPlaySound = true;
    this.tableElement;

    // state machine mode for the game
    this.mode = 0;

    // array of PlayerInfo objects
    this.players = new Array(8);
    for (let i = 0; i < this.players.length; i++) {
      this.players[i] = new PlayerInfo();
    }

    this.colors = new SpriteColors();
    this.color = null;

    this.star = [];
    this.narrowStar = [];
    this.starSize = [];
    this.numStars = 70;

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
      this.viewport.height
    );

    // translate by this amount to get the origin set at the upper left corner of the canvas
    this.worldToBoard = {
      x: (this.world.width - this.board.width) / 2,
      y: (this.world.height - this.board.height) / 2,
    };

    // https://stackoverflow.com/questions/16919601/html5-canvas-camera-viewport-how-to-actually-do-it
    // want to render the game using a

    // set up board dimensions
    // this.totalBoardW = (this.boardWidth / 1.5) * n; // divide by 1.5 because we increased viewing size from ~420 to 700, which scaled map size here
    // this.totalBoardH = (this.boardHeight / 1.5) * n;
    // this.boardCenterX = this.totalBoardW / 2;
    // this.boardCenterY = this.totalBoardH / 2;
    // this.rectCenterBox = new Rectangle(
    //   this.boardCenterX - 100,
    //   this.boardCenterY - 100,
    //   200,
    //   200
    // );

    this.portalVisibility = (this.board.width / 2) * 1.45;
    // this.offsetX = this.boardWidth / 2;
    // this.offsetY = this.boardHeight / 2;

    // specify the playerFigherType
    // this.player = new PlayerSprite(0);
    this.playerFighterType = WHUtil.randInt() % 8;

    this.incomingIconIndex = 0;
    this.incomingCycle = 0;
    this.incomingNukeCycle = 0;
    this.numPowerups = 0;
    this.flashScreenColor = "black";

    // get the start time (in ms)
    this.startTime = Date.now();
    // for (let b = 0; b < this.players.length; b++) {
    //   this.players[b].resetPowerups();
    // }
    this.boardChanged = true;

    // look for a different way to track key presses
    // this.fire = 0;
    // this.left = 0;
    // this.right = 0;
    // this.down = 0;
    // this.up = 0;
    // this.secondaryFire = 0;
    this.gameOver = false;
    this.refreshStatus = true;

    // clear sprite arrays
    this.allSprites = [];
    this.badGuys = [];
    this.goodGuys = [];

    this.orbitDistance = 240;
    let n = 3;

    // set the orbitDistance based on the number of players
    //   if (super.tableElement != null) {
    //     totalOpposingPlayingPlayers = this.totalOpposingPlayingPlayers;
    //     switch (super.tableElement.getBoardSize()) {
    //       // setting local totalOpposingPlayingPlayers to change the board size
    //         case 1: {
    //             totalOpposingPlayingPlayers = 1;
    //             break;
    //         }
    //         case 2: {
    //             totalOpposingPlayingPlayers = 2;
    //             break;
    //         }
    //         case 3: {
    //             totalOpposingPlayingPlayers = 4;
    //             break;
    //         }
    //     }
    //     switch (totalOpposingPlayingPlayers) {
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
    this.initStars();

    // Sprite.setGlobalBounds(this.totalBoardW, this.totalBoardH);
    // BulletSprite.clearClass();
    // this.vMessages.removeAllElements();

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

    this.winningPlayerString = null;

    // create a new player that starts at the center of the board
    // with the specified ship type
    this.player = new PlayerSprite(
      this.boardCenter,
      this.playerFighterType,
      this
    );
    // this.imgLogo = (Image)this.mediaTable.get("img_bg_logo");
    // if (this.imgLogo != null) {
    //   this.rectLogo.setBounds(
    //     this.boardCenter.x - this.imgLogo.getWidth(null) / 2,
    //     this.boardCenter.y - this.imgLogo.getHeight(null) / 2,
    //     this.imgLogo.getWidth(null),
    //     this.imgLogo.getHeight(null)
    //   );
    // }
    this.player.addSelf();
    this.player.setPlayer(this.slot);

    // new WallCrawlerSprite(0, 0, true).addSelf();
    // new WallCrawlerSprite(0, 0, false).addSelf();

    // start gameLoop
    window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  onkeyup(e) {
    // e.preventDefault();
    console.log("key up" + e);

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
    // e.preventDefault();
    console.log("key down" + e);

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
      this.player.dRotate = Math.abs(this.player.dRotate);
      this.player.isRotating = true;
    }
    if (this.input.left) {
      this.player.dRotate = -1 * Math.abs(this.player.dRotate);
      this.player.isRotating = true;
    }
    if (this.input.up) {
      this.player.thrustOn = true;
    }
    if (this.input.spacebar) {
      this.player.firePrimaryWeapon = true;
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
      this.strDamagedByPlayer = null;
      this.damagingPowerup = -1;
    }
    if (this.bRefreshPlayerBar) {
      // drawPlayerBar(this.pnlOtherPlayers.g, this.bRefreshAll);
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
    // there are 5 'modes'
    // 0 -> 3
    // 1 -> 2
    // 2
    // 3 -> 4
    // 4 -> 1
    switch (this.mode) {
      case 0:
        this.handleDefaultModelBehavior();
        if (this.gameOver) {
          // GameNetLogic method
          // this.logic.gameOver();
          this.mode = 3;
          if (this.winningPlayerString == null) {
            gameOver(this.gameSession, this.killedBy, this.gameID);
            return;
          }
        }
        break;
      case 1:
        // case where the game is over
        this.gameOver = true;
        this.mode = 2;
        // drawStatusBar(this.pnlStatus.g);
        // this.pnlStatus.completeRepaint();
        this.bRefreshPlayerBar = true;
        break;
      case 2:
        // checkSidebar();
        if (this.bRefreshPlayerBar) {
          //   drawPlayerBar(this.pnlOtherPlayers.g, true);
          //   this.pnlOtherPlayers.completeRepaint();
        }
        // this.draw(this.context);
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
        // } else if (this.tableElement.getPlayers() < 2) {
        //   drawStrings(this.pnlPlaying.g, "Waiting for", "More Players");
        // } else {
        //   drawStrings(this.pnlPlaying.g, "Press Play Button", "To Start");
        // }
        // this.pnlPlaying.completeRepaint();
        return;
      case 3:
        this.gameOverCycle = 0;
        this.mode = 4;
      case 4:
        this.handleDefaultModelBehavior();
        if (this.gameOverCycle++ > 120 || this.winningPlayerString != null) {
          this.mode = 1;
          return;
        }
        break;
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

  // addPlayer(paramString, paramInt1, paramByte, paramArrayOfString, paramInt2) {
  //   this.model.addPlayer(
  //     paramString,
  //     paramInt1,
  //     paramByte,
  //     paramArrayOfString,
  //     paramInt2
  //   );
  // }

  // removePlayer(paramString) {
  //   this.model.removePlayer(paramString);
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
      if (sprite != null)
        if (sprite.shouldRemoveSelf) {
          sprite.removeSelf();
        } else {
          sprite.behave();
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
      // we are generating enemies for all players currently playing
      // but this starts at a 'random' player and generates enemies for all players
      // now, just loop through all players to generate enemies
      // let j = WHUtil.randInt() % this.players.length;
      for (let b = 0; b < this.players.length; b++) {
        // let playerInfo = this.players[(j + b) % this.players.length];
        let playerInfo = this.players[b];
        if (playerInfo.isPlaying() && playerInfo.portalSprite != null) {
          playerInfo.portalSprite.shouldGenEnemy = true;
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
          let spriteB = this.goodGuys[i];
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
    for (let b = 0; b < this.players.length; b++) {
      if (this.players[b].timeoutAttacks()) this.bRefreshPlayerBar = true;
    }
  }

  setTeam(paramString, paramByte) {
    if (this.logic.getUsername() == paramString) {
      this.teamId = paramByte;
    } else {
      for (let b = 0; b < this.players.length; b++) {
        if (this.players[b].username == paramString)
          this.players[b].teamId = paramByte;
        this.players[b].bRefresh = true;
      }
    }
    this.bRefreshPlayerBar = true;
  }

  setSlot(slotNum) {
    this.slot = slotNum;
    this.color = this.colors.colors[this.slot][0];
  }

  // draw the Game to the canvas
  draw(context) {
    // check if the player is defined
    // this.player is an instance of a playerSprite
    if (this.player != null) {
      // get the viewable area for the player
      let viewportRect = this.player.getViewportRect();

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
      //   !this.gameOver
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
          this.colors.colors[this.incomingSlot][this.currentShade++ % 20];
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
      // if (this.m_winningPlayerString != null) {
      //   this.drawShadowString(graphics, "GAME OVER!", 100, 100);
      //   this.drawShadowString(
      //     graphics,
      //     "WINNER: " + this.m_winningPlayerString,
      //     100,
      //     120
      //   );
      // }
      // graphics.setColor(Color.white);
      // graphics.setFont(WormholeModel.fontTwelve);
      // for (let n = 0; n < this.m_vMessages.size(); n++) {
      //   graphics.drawString(this.m_vMessages.elementAt(n), 10, 10 * (n + 1));
      // }
    }
    //   if (this.m_teamID != 0) {
    //     graphics.setFont(WormholeModel.fontTwelve);
    //     graphics.setColor(CFSkin.TEAM_COLORS[this.m_teamID]);
    //     graphics.drawString(CFSkin.TEAM_NAMES[this.m_teamID] + " member", this.boardWidth - 135, 13);
    // }
    // graphics.setColor(Color.white);
    // graphics.drawRect(0, 0, this.boardWidth - 1, this.boardHeight - 1);
  }

  // draw a line to point to other wormholes
  drawPointers(context) {
    for (let i = 0; i < this.players.length; i++) {
      if (
        !this.players[i].bEmpty &&
        this.players[i].portalSprite != null &&
        this.player != null &&
        !this.players[i].gameOver
      ) {
        let n =
          this.players[i].portalSprite.location.x - this.player.location.x;
        let n2 =
          this.players[i].portalSprite.location.y - this.player.location.y;
        let hyp = Math.hypot(n, n2);
        if (hyp >= this.portalVisibility) {
          let n3 = (180.0 * n) / hyp;
          let n4 = (180.0 * n2) / hyp;
          let n5 = n3 + this.viewportCenter.x;
          let n6 = n4 + this.viewportCenter.y;

          let atan = Math.atan(n2 / n);
          let n7 = 171.0;
          if (n < 0.0) {
            n7 = -n7;
          }
          let n8 = atan + 0.04;
          let n9 = atan - 0.04;
          let n10 = n7 * Math.cos(n8) + this.viewportCenter.x;
          let n11 = n7 * Math.sin(n8) + this.viewportCenter.y;
          let n12 = n7 * Math.cos(n9) + this.viewportCenter.x;
          let n13 = n7 * Math.sin(n9) + this.viewportCenter.y;

          context.strokeStyle = this.players[i].color;
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
  initStars() {
    // fill out stars for the board
    // randomly space them

    let n3 = this.boardCenter.x - 40;
    let n4 = this.boardCenter.y - 40;

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

  setPlayers(gamePacket, b) {
    let totalPlayers = gamePacket.totalPlayers;
    for (let i = 0; i < totalPlayers; i++) {
      let playerName = gamePacket.players[i].name;
      let playerSlot = gamePacket.players[i].slot;
      let isGameOver = gamePacket.players[i].isGameOver;
      let teamId = gamePacket.players[i].teamId;
      if (playerName != this.logic.getUsername()) {
        this.setPlayer(
          playerName,
          this.logic.getPlayerRank(playerName),
          teamId,
          this.logic.getIcons(),
          // this.logic.getPlayer(playerName).getIcons(),
          playerSlot,
          isGameOver,
          b
        );
        if (isGameOver == false) {
        }
      } else {
        this.slot = playerSlot;
        this.color = this.colors.colors[this.slot][0];
        this.teamId = teamId;
      }
    }
    this.bRefreshPlayerBar = true;
  }

  setPlayer(name, rank, teamId, icons, playerSlot, isGameOver, b2) {
    let playerInfo = this.players[this.translateSlot(playerSlot)];
    playerInfo.reset();
    playerInfo.resetPowerups();
    // sets the username and the slot/colors
    playerInfo.setState(name, playerSlot);
    playerInfo.gameOver = isGameOver;
    playerInfo.nPowerups = 0;
    playerInfo.rank = rank;
    playerInfo.icons = icons;
    playerInfo.teamId = teamId;
    this.bRefreshPlayerBar = true;
  }

  // ROUTINES FOR READING AND WRITING ON THE NETWORK
  /**
   * handles the game packet receipt
   */
  handleGamePacket(gamePacket) {
    if (gamePacket.type == "newGame") {
      this.gameId = gamePacket.gameId;
      this.gameSession = gamePacket.gameSession;
      this.setPlayers(gamePacket, false);
      this.totalOpposingPlayers = 0;
      for (let i = 0; i < gamePacket.totalPlayers; i++) {
        if (!this.players[i].isEmpty) {
          // if (super.tableElement.isTeamTable()) {
          if (this.players[i].teamId != this.teamId) {
            this.totalOpposingPlayers++;
          }
          // } else {
          // this.totalOpposingPlayers++;
          // }
        }
      }
      this.init();
      this.mode = 0;
      this.bRefreshPlayerBar = true;
      this.bRefreshAll = true;
      this.gameOver = false;

      let n = 0;
      for (let i = 0; i < gamePacket.totalPlayers; i++) {
        if (!this.players[i].isEmpty) {
          let b = false;
          // if (super.tableElement.isTeamTable()) {
          if (this.players[i].teamId != this.teamId) {
            b = true;
          }
          // } else {
          // b = true;
          // }
          if (b) {
            let portalSprite = new PortalSprite(
              n * (360 / this.totalOpposingPlayers),
              this.players[i],
              this
            );
            n++;
            this.players[i].portalSprite = portalSprite;
            portalSprite.addSelf();
            portalSprite.setWarpingIn();
          } else {
            this.players[i].portalSprite = null;
          }
        }
      }
    }
    // switch (dataInput.readByte()) {
    //   case 106: {
    //     if (dataInput.readShort() != this.gameSession && !this.gameOver) {
    //       return;
    //     }
    //     let slot = dataInput.readByte();
    //     if (slot == super.slot) {
    //       return;
    //     }

    //     let playerInfo = this.players[this.translateSlot(slot)];
    //     if (playerInfo.gameOver || playerInfo.bEmpty) {
    //       return;
    //     }
    //     playerInfo.readState(dataInput);
    //     this.bRefreshPlayerBar = true;
    //     break;
    //   }
    //   case 111: {
    //     let slot = dataInput.readByte();
    //     if (super.slot == slot) {
    //       this.winningPlayerString = "YOU WON";
    //       ++this.wins;
    //     } else {
    //       let translateSlot = this.translateSlot(slot);
    //       this.winningPlayerString =
    //         this.players[translateSlot].username + " WON";
    //       let playerInfo2 = this.players[translateSlot];
    //       playerInfo2.wins++;
    //       this.players[translateSlot].gameOver = true;
    //     }
    //     this.gameOver = true;
    //     this.refreshStatus = true;
    //     this.bRefreshPlayerBar = true;
    //     break;
    //   }
    //   case 112: {
    //     let teamId = dataInput.readByte();
    //     this.winningPlayerString = CFSkin.TEANAMES[teamId] + " WON";
    //     if (this.teamId == teamId) {
    //       this.wins++;
    //     } else {
    //       for (let k = 0; k < this.players.length; ++k) {
    //         if (this.players[k].teamId == teamId) {
    //           let playerInfo3 = this.players[k];
    //           playerInfo3.wins++;
    //           this.players[k].gameOver = true;
    //         }
    //       }
    //     }
    //     this.gameOver = true;
    //     this.refreshStatus = true;
    //     this.bRefreshPlayerBar = true;
    //     break;
    //   }
    //   case 110: {
    //     let deceasedSlot = dataInput.readByte();
    //     let killerSlot = dataInput.readByte();
    //     if (deceasedSlot == super.slot) {
    //       this.gameOver = true;
    //       return;
    //     }
    //     let playerInfo4 = this.players[this.translateSlot(deceasedSlot)];
    //     playerInfo4.gameOver = true;
    //     playerInfo4.bRefresh = true;
    //     if (playerInfo4.portalSprite != null) {
    //       playerInfo4.portalSprite.killSelf();
    //     }
    //     playerInfo4.healthPercentage = 0;
    //     if (killerSlot == super.slot) {
    //       ++this.kills;
    //       this.refreshStatus = true;
    //     }
    //     this.bRefreshPlayerBar = true;
    //     break;
    //   }
    //   case 109: {
    //     utf = dataInput.readUTF();
    //     while (this.vMessages.size() >= 2) {
    //       this.vMessages.removeElementAt(0);
    //     }
    //     this.vMessages.addElement(utf);
    //     this.lastCycleForMessages = this.cycle + 200;
    //     break;
    //   }
    //   case 107: {
    //     let powerupType = dataInput.readByte();
    //     let fromSlot = dataInput.readByte();
    //     let toSlot = dataInput.readByte();
    //     let gameSession = dataInput.readShort();
    //     let byte9 = dataInput.readByte();
    //     if (gameSession != this.gameSession && !this.gameOver) {
    //       return;
    //     }
    //     let translateSlot2 = this.translateSlot(fromSlot);
    //     if (fromSlot != super.slot && translateSlot2 < 0) {
    //       return;
    //     }
    //     if (toSlot != super.slot) {
    //       this.bRefreshPlayerBar = true;
    //       return;
    //     }
    //     if (this.gameOver) {
    //       return;
    //     }
    //     this.addIncomingPowerup(
    //       this.players[translateSlot2].portalSprite,
    //       powerupType,
    //       fromSlot,
    //       byte9
    //     );
    //     break;
    //   }
    //   case 120: {
    //     let numPlayers = dataInput.readShort();
    //     for (let i = 0; i < numPlayers; i++) {
    //       let slot = dataInput.readByte();
    //       let winCount = dataInput.readShort();

    //       let translateSlot = this.translateSlot(slot);
    //       let playerInfo = this.players[translateSlot];
    //       playerInfo.wins = winCount;
    //       this.refreshStatus = true;
    //     }
    //     break;
    //   }
    //   case 121: {
    //     let slot = dataInput.readByte();
    //     let teamId = dataInput.readByte();
    //     if (slot == super.slot) {
    //       this.teamId = teamId;
    //     } else {
    //       let translateSlot = this.translateSlot(slot);
    //       let playerInfo = this.players[translateSlot];
    //       playerInfo.teamId = teamId;
    //       playerInfo.bRefresh = true;
    //     }
    //     this.bRefreshPlayerBar = true;
    //     break;
    //   }
    //   default: {
    //   }
    // }
  }
}

import PlayerSprite from "./PlayerSprite.js";
import Sprite from "./Sprite.js";
import PlayerInfo from "./PlayerInfo.js";
import SpriteColors from "./SpriteColors.js";
import WHUtil from "./WHUtil.js";
import Rectangle from "./Rectangle.js";

/**
 * WormholeModel Class
 * @description implements a WormholeModel that contains a board
 * world is the total renderable canvas, use this size for generating the stars
 */
export default class WormholeModel {
  constructor() {
    // state machine mode for the game
    this.mode = 0;

    // array of PlayerInfo objects
    this.players = new Array(7);
    for (let i = 0; i < this.players.length; i++) {
      this.players[i] = new PlayerInfo();
    }

    this.colors = new SpriteColors();
    this.color = null;

    this.star = [];
    this.narrowStar = [];
    this.starSize = [];
    this.numStars = 70;

    this.canvas = document.getElementById("GameCanvas");
    this.context = this.canvas.getContext("2d");

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
    // want to render the game using a viewport

    this.novaInfo = [];
    this.orbitDistance = 240;

    this.borderShades = new Array(6);

    // sprite arrays
    this.allSprites = [];
    this.badGuys = [];
    this.goodGuys = [];

    // temporary - later get the slot from the GameNetLogic.js file
    // when jointing a table
    this.slot = 0;
    this.setSlot(this.slot);
  }

  handleDefaultModelBehavior() {
    // behavior, collisions, checkSidebar
    this.doPlayCycle();

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

  doOneCycle() {
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
        this.draw(this.context);
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

  doPlayCycle() {
    this.cycle++;
    this.doBehavior();
    this.doCollisions();
    this.checkSidebar();
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

    let l = (Date.now() - this.startTime) / 1000;
    let c = "Ǵ";
    if (l > 240) {
      c = "Ɛ";
    } else if (l > 120) {
      c = "ǂ";
    } else if (l > 80) {
      c = "Ǵ";
    } else if (l < 40) {
      return;
    }

    // is this randomness to generate enemies from a portal?
    if (WHUtil.randInt() % c == 1) {
      let j = WHUtil.randInt() % this.players.length;
      for (let b = 0; b < this.players.length; b++) {
        let playerInfo = this.players[(j + b) % this.players.length];
        if (playerInfo.isPlaying() && playerInfo.portalSprite != null) {
          playerInfo.portalSprite.bGenEnemy = true;
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
    if (this.logic.getUsername().equals(paramString)) {
      this.teamID = paramByte;
    } else {
      for (let b = 0; b < this.players.length; b++) {
        if (this.players[b].username.equals(paramString))
          this.players[b].teamID = paramByte;
        this.players[b].bRefresh = true;
      }
    }
    this.bRefreshPlayerBar = true;
  }

  setSlot(slotNum) {
    this.slot = slotNum;
    this.color = this.colors.g_colors[this.slot][0];
  }

  // draw the WormholeModel to the canvas
  draw(context) {
    // check if the player is defined
    // this.player is an instance of a playerSprite
    if (this.player != null) {
      // get the viewable area for the player
      let viewportRect = this.player.getViewportRect();

      //   paramGraphics.translate(-rectangle.x, -rectangle.y);
      //   paramGraphics.setColor(this.flashScreenColor);
      this.flashScreenColor = "black";
      //   char c = 'Ĭ';
      //   paramGraphics.fillRect(
      //     -300,
      //     -300,
      //     this.totalBoardW + 600,
      //     this.totalBoardH + 600
      //   );
      context.translate(-viewportRect.x, -viewportRect.y);
      // draw the outer border box
      for (let i = 0; i < this.borderShades.length; i++) {
        context.strokeStyle = this.borderShades[i];
        //   paramGraphics.setColor(this.borderShades[b]);
        context.strokeRect(
          -i,
          -i,
          this.world.width + i * 2,
          this.world.height + i * 2
        );
      }

      this.drawGrid(context);

      context.translate(viewportRect.x, viewportRect.y);

      //   paramGraphics.translate(rectangle.x, rectangle.y);

      // display a message about 'INCOMING' or 'NUKE'
      //   if (this.incomingCycle > 0) {
      //     this.incomingCycle--;
      //     paramGraphics.setFont(fontSuperLarge);
      //     paramGraphics.setColor(
      //         Sprite.g_colors[this.incomingSlot][this.currentShade++ % 20]);
      //     paramGraphics.drawString("I N C O M I N G", this.boardWidth / 2 - 120,
      //                              200);
      //     if (this.incomingNukeCycle > 0) {
      //       this.incomingNukeCycle--;
      //       paramGraphics.drawString("N U K E", this.boardWidth / 2 - 90, 240);
      //     }
      //   }
      //   paramGraphics.translate(-rectangle.x, -rectangle.y);

      context.translate(-viewportRect.x, -viewportRect.y);
      // draw all sprites
      for (let i = 0; i < this.allSprites.length; i++) {
        let sprite = this.allSprites[i];
        if (sprite != null) {
          // sprite.bInDrawingRect = sprite.inViewingRect(rectangle);
          // for now, draw all the sprites
          sprite.bInDrawingRect = true;
          if (sprite.bInDrawingRect) {
            sprite.drawSelf(context);
          }
        }
      }
      context.translate(viewportRect.x, viewportRect.y);
      //   paramGraphics.translate(rectangle.x, rectangle.y);
      if (this.incomingIconCycle > 0) {
        this.incomingIconCycle--;
      } else if (this.incomingIconIndex > 0) {
        this.incomingIconIndex--;
        this.incomingIconCycle = 50;
        for (let b = 0; b < this.incomingIconIndex; b++) {
          this.incomingTypeStack[b] = this.incomingTypeStack[b + 1];
          this.incomingWhoStack[b] = this.incomingWhoStack[b + 1];
        }
      }
      for (let b = 0; b < this.incomingIconIndex; b++) {
        // paramGraphics.drawImage(
        //   getImages("img_smallpowerups")[
        //     PowerupSprite.convertToSmallImage(this.incomingTypeStack[b])
        //   ],
        //   2,
        //   b * 15 + 31,
        //   null
        // );
        // Sprite.drawFlag(
        //   paramGraphics,
        //   Sprite.g_colors[this.incomingWhoStack[b]][0],
        //   25,
        //   b * 15 + 31
        // );
      }
      //   if (this.winningPlayerString != null) {
      //     drawShadowString(paramGraphics, "GAME OVER!", 100, 100);
      //     drawShadowString(paramGraphics, "WINNER: " + this.winningPlayerString,
      //                      100, 120);
      //   }
      //   paramGraphics.setColor(Color.white);
      //   paramGraphics.setFont(fontEleven);
      //   for (b = 0; b < this.vMessages.size(); b++)
      // paramGraphics.drawString(
      //   this.vMessages.elementAt(b),
      //   10,
      //   10 * (b + 1)
      // );
    }
    // if (this.teamID != 0) {
    //   paramGraphics.setFont(fontEleven);
    //   paramGraphics.setColor(CFSkin.TEACOLORS[this.teamID]);
    //   paramGraphics.drawString(CFSkin.TEANAMES[this.teamID] + " member",
    //                            this.boardWidth - 135, 13);
    // }
    // paramGraphics.setColor(Color.white);
    // paramGraphics.drawRect(0, 0, this.boardWidth - 1, this.boardHeight - 1);
  }

  // routine for drawing various objects to the canvas
  drawGrid(context, orbitDistance) {
    // used to track the ship on the canvas
    let viewportRect = this.player.getViewportRect();

    context.translate(viewportRect.x, viewportRect.y);

    this.drawStars(context, "gray", this.narrowStar);

    // draw pointers to other wormholes
    // drawPointers(paramGraphics);

    context.translate(-viewportRect.x, -viewportRect.y);

    this.drawStars(context, "white", this.star);
    this.drawRing(context);

    // if (
    //   this.teamID != 0 &&
    //   this.tableElement.isTeamTable() &&
    //   !this.gameOver
    // )
    // drawTeamStuff(paramGraphics);
    // if (this.imgLogo != null && rectangle.intersects(this.rectLogo)) {
    //   paramGraphics.drawImage(
    //     this.imgLogo,
    //     this.rectLogo.x,
    //     this.rectLogo.y,
    //     null
    //   );
    // }
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

  init() {
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
    this.fire = 0;
    this.left = 0;
    this.right = 0;
    this.down = 0;
    this.up = 0;
    this.secondaryFire = 0;
    this.gameOver = false;
    this.refreshStatus = true;

    // clear sprite arrays
    this.allSprites = [];
    this.badGuys = [];
    this.goodGuys = [];

    this.orbitDistance = 240;
    let n = 3;
    //   if (super.m_tableElement != null) {
    //     totalOpposingPlayingPlayers = this.m_totalOpposingPlayingPlayers;
    //     switch (super.m_tableElement.getBoardSize()) {
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
    //             WormholeModel.gOrbitDistance = 150;
    //             break;
    //         }
    //         case 2:
    //         case 3: {
    //             n = 3.0;
    //             WormholeModel.gOrbitDistance = 240;
    //             break;
    //         }
    //         default: {
    //             n = 3.6;
    //             WormholeModel.gOrbitDistance = 280;
    //             break;
    //         }
    //     }
    // }

    // for (let i = 0; i < 60; i++) {
    //   this.m_novaInfo[i][0] = 50;
    // }

    // set up board dimensions
    this.totalBoardW = (this.boardWidth / 1.5) * n; // divide by 1.5 because we increased viewing size from ~420 to 700, which scaled map size here
    this.totalBoardH = (this.boardHeight / 1.5) * n;
    this.m_boardCenterX = this.totalBoardW / 2;
    this.m_boardCenterY = this.totalBoardH / 2;
    // this.m_rectCenterBox = new Rectangle(
    //   this.m_boardCenterX - 100,
    //   this.m_boardCenterY - 100,
    //   200,
    //   200
    // );

    this.m_portalVisibility = (this.boardWidth / 2) * 1.45;
    this.m_offsetX = this.boardWidth / 2;
    this.m_offsetY = this.boardHeight / 2;

    // generate the stars
    this.initStars();

    // Sprite.setGlobalBounds(this.totalBoardW, this.totalBoardH);
    // BulletSprite.clearClass();
    // this.m_vMessages.removeAllElements();

    // initialize the border shade color
    if (this.color != null) {
      this.borderShades[0] = this.color;
      for (let i = 0; i < this.borderShades.length - 1; i++) {
        // reimplement the Java .darker() function
        let DARKER_FACTOR = 0.251;
        // get the rgb values of the color
        let curColorRGB = this.nameToRGB(this.borderShades[i]);
        // get the 3 RGB values
        let rgb = curColorRGB.replace(/[^\d,]/g, "").split(",");
        let tempColor = `rgb(${parseInt(rgb[0] * DARKER_FACTOR)}, ${parseInt(
          rgb[1] * DARKER_FACTOR
        )}, ${parseInt(rgb[2] * DARKER_FACTOR)})`;
        this.borderShades[i + 1] = tempColor;
      }
    }

    this.m_winningPlayerString = null;

    // create a new player that starts at the center of the board
    // with the specified ship type
    this.player = new PlayerSprite(
      this.boardCenter,
      this.playerFighterType,
      // model
      this
    );
    // this.imgLogo = (Image)this.mediaTable.get("img_bg_logo");
    if (this.imgLogo != null)
      this.rectLogo.setBounds(
        this.boardCenter.x - this.imgLogo.getWidth(null) / 2,
        this.boardCenter.y - this.imgLogo.getHeight(null) / 2,
        this.imgLogo.getWidth(null),
        this.imgLogo.getHeight(null)
      );
    this.player.addSelf();
    this.player.setPlayer(this.slot);

    // new WallCrawlerSprite(0, 0, true).addSelf();
    // new WallCrawlerSprite(0, 0, false).addSelf();
  }

  // get an RGB value from a named color
  // https://css-tricks.com/converting-color-spaces-in-javascript/
  nameToRGB(name) {
    // Create fake div
    let fakeDiv = document.createElement("div");
    fakeDiv.style.color = name;
    document.body.appendChild(fakeDiv);

    // Get color of div
    let cs = window.getComputedStyle(fakeDiv),
      pv = cs.getPropertyValue("color");

    // Remove div after obtaining desired color value
    document.body.removeChild(fakeDiv);

    return pv;
  }
}

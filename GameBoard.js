import WormholeModel from "./WormholeModel.js";

export default class GameBoard {
  constructor(window) {
    //   constructor(paramCFProps, paramGameNetLogic, paramHashtable) {
    // this.m_model = CFSkin.getSkin().generateModel(
    //   this,
    //   paramGameNetLogic,
    //   paramCFProps,
    //   paramHashtable
    // );
    this.canvas = null;
    this.context = null;
    this.loop = null;

    this.input = {
      right: false,
      left: false,
      up: false,
      spacebar: false,
    };

    this.m_bPlaySound = true;
    this.m_tableElement;
  }

  onkeydown(e) {
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

  onkeyup(e) {
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

  prepareCanvas() {
    this.canvas = document.getElementById("GameCanvas");
    this.context = this.canvas.getContext("2d");
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  init() {
    // console.log("gameloop initializing");
    // create a new instance of a WormholeModel
    this.model = new WormholeModel();
    this.model.init();
  }

  update() {
    // console.log("gameloop updating");
    if (this.input.right) {
      this.model.player.dRotate = Math.abs(this.model.player.dRotate);
      this.model.player.isRotating = true;
    }
    if (this.input.left) {
      this.model.player.dRotate = -1 * Math.abs(this.model.player.dRotate);
      this.model.player.isRotating = true;
    }
    if (this.input.up) {
      this.model.player.thrustOn = true;
    }
  }

  render() {
    // the full canvas is drawn and then only a portion of it is displayed to the
    // viewport canvas

    // console.log("gameloop rendering");
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.model.doOneCycle();
  }

  start() {
    this.prepareCanvas();
    this.init();

    // Start the first frame request
    window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  gameLoop(timeStamp) {
    // Keep requesting new frames
    window.requestAnimationFrame(this.gameLoop.bind(this));

    // perform updates to models
    // currently used to handle keyboard input
    this.update();

    // render the scene
    this.render();
  }

  playSound(paramAudioClip) {
    if (paramAudioClip != null && m_bPlaySound) paramAudioClip.play();
  }

  setSound(paramBoolean) {
    m_bPlaySound = paramBoolean;
  }

  readJoin(paramDataInput) {
    this.model.readJoin(paramDataInput);
  }

  addPlayer(paramString, paramInt1, paramByte, paramArrayOfString, paramInt2) {
    this.model.addPlayer(
      paramString,
      paramInt1,
      paramByte,
      paramArrayOfString,
      paramInt2
    );
  }

  removePlayer(paramString) {
    this.model.removePlayer(paramString);
  }

  setTable(paramCFTableElement) {
    this.model.setTable(paramCFTableElement);
    this.m_tableElement = paramCFTableElement;
  }
}

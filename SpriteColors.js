export default class SpriteColors {
  constructor() {
    this.g_types = [
      [0.1667, 1],
      [0.5, 1],
      [1, 1],
      [0.3333, 1],
      [0.6944, 0.3],
      [0.1305, 1],
      [0.03, 0.67],
      [0.7777, 1],
      [0.125, 1],
      [0.8333, 1],
      [0.66677, 0.67],
    ];
    this.g_colors = new Array(11);
    // what is g_types?
    for (let i = 0; i < 11; i++) {
      for (let j = 0; j < 20; j++) {
        let f1 = this.g_types[i][0];
        let f2 = this.g_types[i][1];
        // let b1 = 0;

        let f = 1.0 - j * 0.04;
        // this.g_colors[b][b1] = Color.getHSBColor(f1, f2, f);
        if (this.g_colors[i] == undefined) {
          this.g_colors[i] = new Array(20);
        }
        this.g_colors[i][j] = "white";
        // can use the below as a way to generate colors
        // ctx.fillStyle = `rgb(${51 * i}, ${255 - 51 * i}, 255)`;
        // Color.getHSBColor(f1, f2, f);
      }
    }
  }
}

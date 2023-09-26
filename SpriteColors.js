export default class SpriteColors {
  colors;
  types = [
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

  constructor() {
    this.colors = new Array(11);
    // types specifies the hue and saturation of the colors
    for (let i = 0; i < 11; i++) {
      this.colors[i] = new Array(20);
      for (let j = 0; j < 20; j++) {
        let hue = this.types[i][0];
        let saturation = this.types[i][1];
        let lighteness = 1 - j * 0.04;
        this.colors[i][j] = `hsl(${hue}turn ${saturation * 100}% ${
          lighteness * 100
        }%)`;
      }
    }
  }
}

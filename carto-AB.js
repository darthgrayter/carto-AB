const DEBUG_MODE = true;
const ART_BLOCKS_TEST_MODE = false;
const STATIC_TOKEN_DATA = false;
const QUICK_RENDER_MODE = false;
const HIGH_RES_PRINT_MODE = true;

function genTokenData(projectNum) {
  let data = {};
  let hash = "0x";
  for (var i = 0; i < 64; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  data.hash = hash;
  data.tokenId = projectNum * 1000000 + Math.floor(Math.random() * 1000);
  return data;
}
if (!ART_BLOCKS_TEST_MODE) { var tokenData = genTokenData(99); }
if (STATIC_TOKEN_DATA) { var tokenData = 0x0057f223ce178f1e41ff1aacf1b5b40f3ac33c27bb807cebac1e7632a0883447; }
const hashPairs = [];
for (let j = 0; j < 32; j++) { hashPairs.push(tokenData.hash.slice(2 + (j * 2), 4 + (j * 2))); }
const decPairs = hashPairs.map(x => { return parseInt(x, 16); });

var perNoiseSeed = parseInt(tokenData.hash.slice(0, 16), 16);
var mapSizeX = 2400;
var mapSizeY = 2400;
var perlinArray = new Array(mapSizeX);
var frameCounter = 0;
var frequency = 5.0;

var alphaOffset = 255; //0..255
var contourSpread = 5; //distance between contours
var contourSize = 2; //

let yellow, orange, salmon, offwhite, mint, cyan, electricPink, red, c1, c2, bgColor;
// Gradient variables 
let ox, oy, dx, dy;
let chaoticGrad = false;

function setup() {
  if (DEBUG_MODE) {
    setDeterministicSeed();
  }
  if (QUICK_RENDER_MODE) {
    mapSizeX = 1000;
    mapSizeY = 1000;
  }

  setColorCodes();
  setColorsUsed();

  let min;
  if (HIGH_RES_PRINT_MODE) { min = mapSizeX; }
  else {
    // Grab the smaller of the window sizes and use that as the canvas size.
    min = windowWidth > windowHeight ? windowHeight : windowWidth;
    min = min > mapSizeX ? mapSizeX : min;
  }
  createCanvas(min, min);

  smooth();
  noiseSeed(perNoiseSeed);
  background(bgColor);

  setGradientSpine();
  setNoiseFreq();
  setContourSize();
  setContourSpread();

  if (decPairs[31] > 256) {
    chaoticGrad = true;
  }

  for (var i = 0; i < mapSizeY; i++) {
    perlinArray[i] = new Array(mapSizeY);
  }

  for (var y = 0; y < mapSizeY; y++) {
    for (var x = 0; x < mapSizeX; x++) {
      var nx = frequency * x / (mapSizeY) * 1.0,
        ny = frequency * y / (mapSizeY) * 1.0;
      perlinArray[y][x] = noise(nx, ny);
    }
  }

  for (var y = 0; y < mapSizeY; y++) {
    for (var x = 0; x < mapSizeX; x++) {
      //if (value[y][x]*100.0 % (contourSpread*3) <= contourSize) {
      //  stroke(0, 0, 255, 255.0*value[y][x] + alphaOffset);
      //} else
      // if (perlinArray[y][x] * 100.0 % (contourSpread * 2) <= contourSize) {
      //   stroke(203, 0, 0, 255.0 * perlinArray[y][x] + alphaOffset);
      if (perlinArray[y][x] * 100.0 % contourSpread <= contourSize) {
        const progressThroughGrad = project(ox, oy, dx, dy, x, y);;
        let c = lerpColor(c1, c2, progressThroughGrad);
        stroke(c);
      } else {
        continue;
      }
      point(lerp(0, width, x / mapSizeX), lerp(0, height, y / mapSizeY));
    }
  }
}

function setColorCodes() {
  black = color('#000000');
  white = color('#FFFFFF');
  yellow = color('#FFEE00');
  orange = color('#FF7900');
  salmon = color('#db8459');
  offwhite = color('#e3b29a');
  mint = color('#00FE8B');
  cyan = color('#00EAFE');
  electricPink = color('#FF0064');
  red = color(255, 0, 0);
}

function setDeterministicSeed() {
  // Set Gradient Direction
  decPairs[17] = 222;
  // Frequency
  decPairs[18] = 122;
  // Set contourSpread
  decPairs[19] = 222;
  // contourSize
  decPairs[20] = 22;
  // Color palette
  decPairs[21] = 11;
}

function setGradientSpine() {
  if (decPairs[17] > 200) {
    ox = 0;
    oy = 0.2 * mapSizeY;
    dx = mapSizeX;
    dy = mapSizeY - oy;
  }
  else if (decPairs[17] > 80) {
    ox = 0;
    oy = 0.5 * mapSizeY;
    dx = mapSizeX;
    dy = mapSizeY - oy;
  }
  else {
    ox = 0;
    oy = 0.8 * mapSizeY;
    dx = mapSizeX;
    dy = mapSizeY - oy;
  }
}

function setNoiseFreq() {
  if (decPairs[18] > 200) {
    frequency = 2.0;
  }
  else if (decPairs[18] > 80) {
    frequency = 5.0;
  }
  else {
    frequency = 7.0;
  }
}

function setContourSpread() {
  if (decPairs[19] > 200 && contourSize < 2.0) {
    contourSpread = 2.0;
  }
  else if (decPairs[19] > 80 && contourSize < 5.0) {
    contourSpread = 5.0;
  }
  else {
    contourSpread = 7.0;
  }
}

function setContourSize() {
  if (decPairs[20] > 200 && 1.2 / contourSpread > 1.0 / 3.0) {
    contourSize = 1.2;
  }
  else if (decPairs[20] > 80 && 2.0 / contourSpread > 1.0 / 3.0) {
    contourSize = 2.0;
  }
  else {
    contourSize = 3.0;
  }
}

function setColorsUsed() {
  if (decPairs[21] > 200) {
    c1 = salmon;
    c2 = salmon;
    bgColor = offwhite;
  }
  else if (decPairs[21] > 150) {
    c1 = mint;
    c2 = cyan;
    bgColor = black;
  }
  else if (decPairs[21] > 80) {
    c1 = yellow;
    c2 = orange;
    bgColor = black;
  }
  else if (decPairs[21] > 60) {
    c1 = electricPink;
    c2 = electricPink;
    bgColor = black;
  }
  else if (decPairs[21] > 40) {
    c1 = red;
    c2 = red;
    bgColor = black;
  }
  else {
    c1 = black;
    c2 = black;
    bgColor = white;
  }
}

function project(originX, originY,
  destX, destY,
  pointX, pointY) {
  // Rise and run of line.
  var odX = destX - originX;
  var odY = destY - originY;

  // Distance-squared of line.
  var odSq = odX * odX + odY * odY;

  // Rise and run of projection.
  var opX = pointX - originX;
  var opY = pointY - originY;
  var opXod = opX * odX + opY * odY;

  if (chaoticGrad) {
    opXod = random(-1.3 * opXod, 1.3 * opXod);
  }

  // Normalize and clamp range.
  return constrain(opXod / odSq, 0.0, 1.0);
}

function draw() {

}
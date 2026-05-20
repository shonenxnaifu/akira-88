import * as PIXI from 'pixi.js';

let app = null;
let videoTexture = null;
let videoSprite = null;
let videoElement = null;
let glowOuter = null;
let glowMid = null;
let glowCore = null;

const HAND_COLORS = {
  Left: 0x00E5FF,
  Right: 0xFF6B35
};

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export function initAnimation(videoEl) {
  videoElement = videoEl;

  app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1A1A2E,
    resizeTo: window
  });

  document.getElementById('animation-container').appendChild(app.view);

  glowOuter = new PIXI.Graphics();
  glowMid = new PIXI.Graphics();
  glowCore = new PIXI.Graphics();

  glowOuter.blendMode = PIXI.BLEND_MODES.ADD;
  glowMid.blendMode = PIXI.BLEND_MODES.ADD;

  app.stage.addChild(glowOuter);
  app.stage.addChild(glowMid);
  app.stage.addChild(glowCore);

  videoElement.addEventListener('loadeddata', () => {
    console.log('Video loaded, dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
  });

  videoElement.addEventListener('playing', () => {
    console.log('Video playing event fired');
    if (!videoTexture) {
      videoTexture = PIXI.Texture.from(videoElement);
      videoSprite = new PIXI.Sprite(videoTexture);

      videoSprite.anchor.set(0.5);
      videoSprite.scale.x = -1;

      app.stage.addChildAt(videoSprite, 0);
      console.log('Video sprite added to PixiJS stage');
    }

    fitVideoToScreen();
  });

  window.addEventListener('resize', handleResize);

  return app;
}

function fitVideoToScreen() {
  if (!videoElement || !videoSprite) return;
  if (!videoElement.videoWidth || !videoElement.videoHeight) return;

  const screenAspect = app.screen.width / app.screen.height;
  const videoAspect = videoElement.videoWidth / videoElement.videoHeight;

  let scale;
  if (screenAspect > videoAspect) {
    scale = app.screen.width / videoElement.videoWidth;
  } else {
    scale = app.screen.height / videoElement.videoHeight;
  }

  videoSprite.width = videoElement.videoWidth * scale;
  videoSprite.height = videoElement.videoHeight * scale;
  videoSprite.x = app.screen.width / 2;
  videoSprite.y = app.screen.height / 2;
}

function handleResize() {
  if (!app) return;
  fitVideoToScreen();
}

function landmarkToScreen(landmark) {
  const x = (1 - landmark.x) * app.screen.width;
  const y = landmark.y * app.screen.height;
  return { x, y };
}

function drawLines(graphics, points, color, width, alpha) {
  for (const [i, j] of HAND_CONNECTIONS) {
    const p1 = points[i];
    const p2 = points[j];
    if (!p1 || !p2) continue;

    graphics.lineStyle(width, color, alpha);
    graphics.moveTo(p1.x, p1.y);
    graphics.lineTo(p2.x, p2.y);
  }
}

function drawDots(graphics, points, color, radius, alpha) {
  for (const point of points) {
    if (!point) continue;
    graphics.beginFill(color, alpha);
    graphics.drawCircle(point.x, point.y, radius);
    graphics.endFill();
  }
}

function drawWrist(graphics, points, color, radius, alpha) {
  const wrist = points[0];
  if (!wrist) return;
  graphics.beginFill(color, alpha);
  graphics.drawCircle(wrist.x, wrist.y, radius);
  graphics.endFill();
}

export function drawHandLandmarks(landmarksList, handednessList) {
  if (!glowOuter || !glowMid || !glowCore) return;

  glowOuter.clear();
  glowMid.clear();
  glowCore.clear();

  if (!landmarksList || landmarksList.length === 0) return;

  landmarksList.forEach((landmarks, handIndex) => {
    const handInfo = handednessList?.[handIndex];
    const rawLabel = handInfo ? handInfo.label : 'Unknown';
    const handLabel = rawLabel === 'Left' ? 'Right' : 'Left';
    const color = HAND_COLORS[handLabel];
    const screenPoints = landmarks.map((lm) => landmarkToScreen(lm));

    drawLines(glowOuter, screenPoints, color, 8, 0.3);
    drawLines(glowMid, screenPoints, color, 4, 0.5);
    drawLines(glowCore, screenPoints, color, 1.5, 1.0);

    drawDots(glowOuter, screenPoints, color, 8, 0.2);
    drawDots(glowMid, screenPoints, color, 5, 0.5);
    drawDots(glowCore, screenPoints, color, 2, 1.0);

    drawWrist(glowOuter, screenPoints, color, 10, 0.2);
    drawWrist(glowMid, screenPoints, color, 6, 0.5);
    drawWrist(glowCore, screenPoints, color, 3, 1.0);
  });
}

export function clearHandLandmarks() {
  if (glowOuter) glowOuter.clear();
  if (glowMid) glowMid.clear();
  if (glowCore) glowCore.clear();
}

export function getApp() {
  return app;
}

export function getVideoSprite() {
  return videoSprite;
}

export function updateVideoTexture() {
  if (videoTexture) {
    videoTexture.update();
  }
}

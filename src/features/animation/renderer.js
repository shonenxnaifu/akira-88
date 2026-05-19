import * as PIXI from 'pixi.js';

let app = null;
let videoTexture = null;
let videoSprite = null;
let videoElement = null;
let landmarkGraphics = null;

const HAND_COLORS = {
  Left: 0x00E5FF,
  Right: 0xFF6B35,
  Unknown: 0xE8D5B7
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

  landmarkGraphics = new PIXI.Graphics();
  app.stage.addChild(landmarkGraphics);

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

export function drawHandLandmarks(landmarksList, handednessList) {
  if (!landmarkGraphics) return;

  landmarkGraphics.clear();

  if (!landmarksList || landmarksList.length === 0) return;

  landmarksList.forEach((landmarks, handIndex) => {
    const handInfo = handednessList?.[handIndex];
    const handLabel = handInfo ? handInfo.hand : 'Unknown';
    const color = HAND_COLORS[handLabel] || HAND_COLORS.Unknown;

    const screenPoints = landmarks.map((lm) => landmarkToScreen(lm));

    for (const [i, j] of HAND_CONNECTIONS) {
      const p1 = screenPoints[i];
      const p2 = screenPoints[j];
      if (!p1 || !p2) continue;

      landmarkGraphics.lineStyle(2, color, 0.8);
      landmarkGraphics.moveTo(p1.x, p1.y);
      landmarkGraphics.lineTo(p2.x, p2.y);
    }

    for (const point of screenPoints) {
      if (!point) continue;
      landmarkGraphics.beginFill(color, 0.9);
      landmarkGraphics.drawCircle(point.x, point.y, 4);
      landmarkGraphics.endFill();
    }

    const wrist = screenPoints[0];
    if (wrist) {
      landmarkGraphics.beginFill(color, 1);
      landmarkGraphics.drawCircle(wrist.x, wrist.y, 6);
      landmarkGraphics.endFill();
    }
  });
}

export function clearHandLandmarks() {
  if (landmarkGraphics) {
    landmarkGraphics.clear();
  }
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

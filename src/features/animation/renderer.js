import * as PIXI from 'pixi.js';

let app = null;
let videoTexture = null;
let videoSprite = null;
let videoElement = null;

export function initAnimation(videoEl) {
  videoElement = videoEl;

  app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1A1A2E,
    resizeTo: window
  });

  document.getElementById('animation-container').appendChild(app.view);

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

      app.stage.addChild(videoSprite);
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

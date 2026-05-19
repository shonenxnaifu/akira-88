import { appState } from './core/state.js';
import { BPM_MIN, BPM_MAX } from './core/constants.js';
import { clamp } from './core/utils.js';
import { initGesture, getHandLandmarks, countExtendedFingers, getHandedness, getHandCentroid, calculateHandRotation, calculateHandDistance } from './features/gesture/index.js';
import { initAnimation, updateVideoTexture, drawHandLandmarks, clearHandLandmarks } from './features/animation/renderer.js';

function init() {
  console.log('=== Techno Gesture Track - Initializing ===');

  setupEventListeners();
  startWebcam();
}

function setupEventListeners() {
  const playBtn = document.getElementById('play-btn');
  const bpmInput = document.getElementById('bpm-input');

  playBtn.addEventListener('click', handlePlayClick);
  bpmInput.addEventListener('change', handleBPMChange);
}

function handlePlayClick() {
  appState.isPlaying = !appState.isPlaying;
  const playBtn = document.getElementById('play-btn');
  playBtn.textContent = appState.isPlaying ? '⏸ Stop' : '▶ Play';
  console.log('Play state:', appState.isPlaying);
}

function handleBPMChange(e) {
  let value = parseInt(e.target.value);
  value = clamp(value, BPM_MIN, BPM_MAX);
  appState.bpm = value;
  e.target.value = value;
  console.log('BPM:', appState.bpm);
}

function startWebcam() {
  const videoElement = document.getElementById('webcam');

  console.log('[1/3] Initializing PixiJS...');
  const pixiApp = initAnimation(videoElement);

  pixiApp.ticker.add(() => {
    updateVideoTexture();
  });

  console.log('[2/3] Initializing MediaPipe gesture detection...');
  initGesture(videoElement, {
    onReady: () => {
      console.log('[3/3] ✅ System ready');
      console.log('Show your hand to the camera to test detection');
      startHandDetectionLoop();
    },
    onError: (err) => {
      console.error('❌ Webcam error:', err);
    }
  });
}

function startHandDetectionLoop() {
  let frameCount = 0;

  setInterval(() => {
    const { landmarks, handedness } = getHandLandmarks();
    frameCount++;

    if (landmarks.length === 0) {
      clearHandLandmarks();
      if (frameCount % 3 === 0) {
        console.log(`[Frame ${frameCount}] No hands detected - show your hand to camera`);
      }
      return;
    }

    drawHandLandmarks(landmarks, handedness);

    console.log(`[Frame ${frameCount}] 🖐 ${landmarks.length} hand(s) detected:`);

    landmarks.forEach((lm, i) => {
      const handInfo = handedness[i];
      const handLabel = handInfo ? handInfo.hand : '?';
      const score = handInfo ? (handInfo.score * 100).toFixed(0) : '?';
      const fingerCount = countExtendedFingers(lm);
      const centroid = getHandCentroid(lm);
      const rotation = calculateHandRotation(lm);

      console.log(`  Hand ${i} [${handLabel}, ${score}% confidence]:`);
      console.log(`    Fingers extended: ${fingerCount}/5`);
      console.log(`    Position: (${centroid.x.toFixed(2)}, ${centroid.y.toFixed(2)})`);
      console.log(`    Rotation: ${(rotation * 180 / Math.PI).toFixed(1)}°`);
    });

    if (landmarks.length === 2) {
      const dist = calculateHandDistance(landmarks[0], landmarks[1]);
      console.log(`  Distance between hands: ${dist.toFixed(3)}`);
    }
  }, 2000);
}

init();

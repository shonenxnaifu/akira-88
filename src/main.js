import { appState } from './core/state.js';
import { BPM_MIN, BPM_MAX, GESTURES } from './core/constants.js';
import { clamp } from './core/utils.js';
import { initGesture, getHandLandmarks, updatePrevState, countExtendedFingers, getHandedness, getHandCentroid, calculateHandRotation, calculateHandDistance } from './features/gesture/index.js';
import { initAnimation, updateVideoTexture } from './features/animation/renderer.js';

const GESTURE_LABELS = {
  [GESTURES.SELECT_BASS]: '🎸 Select Bass',
  [GESTURES.SELECT_SYNTH]: '🎹 Select Synth',
  [GESTURES.SELECT_DRUM]: '🥁 Select Drum',
  [GESTURES.PLAY_STOP]: '⏯ Play/Stop',
  [GESTURES.MUTE_TOGGLE]: '🔇 Mute Toggle',
  [GESTURES.VOLUME_UP]: '🔊 Volume Up',
  [GESTURES.VOLUME_DOWN]: '🔉 Volume Down',
  [GESTURES.RANDOMIZE_MODE]: '✨ Randomize Mode',
  [GESTURES.NONE]: 'No gesture detected'
};

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
  updatePrevState({ isPlaying: appState.isPlaying });
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
    onGesture: handleGestureDetected,
    onError: (err) => {
      console.error('❌ Webcam error:', err);
    }
  });
}

function handleGestureDetected(result) {
  const { gesture, params } = result;

  console.log('[handleGestureDetected] Received gesture:', gesture);
  updateGestureFeedback(gesture);

  switch (gesture) {
    case GESTURES.SELECT_BASS:
      console.log('[handleGestureDetected] Selecting bass');
      selectElement('bass');
      break;
    case GESTURES.SELECT_SYNTH:
      console.log('[handleGestureDetected] Selecting synth');
      selectElement('synth');
      break;
    case GESTURES.SELECT_DRUM:
      console.log('[handleGestureDetected] Selecting drum');
      selectElement('drum');
      break;
    case GESTURES.PLAY_STOP:
      togglePlayStop();
      break;
    case GESTURES.MUTE_TOGGLE:
      toggleMute();
      break;
    case GESTURES.VOLUME_UP:
      adjustVolume(0.1);
      break;
    case GESTURES.VOLUME_DOWN:
      adjustVolume(-0.1);
      break;
    case GESTURES.RANDOMIZE_MODE:
      if (params) {
        appState.randomizeMode = true;
        appState.parameters = params;
        updateParameterDisplay(params);
      }
      break;
    default:
      appState.randomizeMode = false;
      hideParameterDisplay();
      break;
  }

  updatePrevState({
    selectedElement: appState.selectedElement,
    isPlaying: appState.isPlaying
  });
}

function selectElement(element) {
  appState.selectedElement = element;
  appState.elements[element].active = true;
  updateElementStatus();
  console.log(`Selected element: ${element}`);
}

function togglePlayStop() {
  appState.isPlaying = !appState.isPlaying;
  const playBtn = document.getElementById('play-btn');
  playBtn.textContent = appState.isPlaying ? '⏸ Stop' : '▶ Play';
  updatePrevState({ isPlaying: appState.isPlaying });
  console.log('Play state (gesture):', appState.isPlaying);
}

function toggleMute() {
  if (appState.selectedElement) {
    appState.elements[appState.selectedElement].muted = !appState.elements[appState.selectedElement].muted;
    updateElementStatus();
    console.log(`Mute toggle for ${appState.selectedElement}:`, appState.elements[appState.selectedElement].muted);
  }
}

function adjustVolume(delta) {
  if (appState.selectedElement) {
    const el = appState.elements[appState.selectedElement];
    el.volume = clamp(el.volume + delta, 0, 1);
    updateElementStatus();
    console.log(`Volume for ${appState.selectedElement}:`, el.volume.toFixed(2));
  }
}

function updateElementStatus() {
  console.log('[updateElementStatus] Running, selectedElement:', appState.selectedElement);
  const elements = ['bass', 'synth', 'drum'];
  elements.forEach((el) => {
    const statusEl = document.getElementById(`${el}-status`);
    console.log(`[updateElementStatus] ${el}-status element found:`, !!statusEl);
    if (statusEl) {
      const state = appState.elements[el];
      const isSelected = appState.selectedElement === el;
      const statusText = state.active ? (state.muted ? 'MUTED' : 'ON') : 'OFF';
      const label = isSelected ? `▶ ${el.charAt(0).toUpperCase() + el.slice(1)}` : `${el.charAt(0).toUpperCase() + el.slice(1)}`;
      statusEl.innerHTML = `${label}: <span class="status">${statusText}</span>`;
      console.log(`[updateElementStatus] ${el}: label="${label}", status="${statusText}"`);
    }
  });
}

function updateGestureFeedback(gesture) {
  const feedbackEl = document.getElementById('gesture-feedback');
  if (feedbackEl) {
    feedbackEl.textContent = GESTURE_LABELS[gesture] || GESTURE_LABELS[GESTURES.NONE];
  }
}

function updateParameterDisplay(params) {
  const displayEl = document.getElementById('parameter-display');
  if (displayEl) {
    displayEl.classList.remove('hidden');
    document.getElementById('pitch-value').textContent = params.pitch.toFixed(2);
    document.getElementById('filter-value').textContent = params.filter.toFixed(2);
    document.getElementById('rhythm-value').textContent = params.rhythm.toFixed(2);
  }
}

function hideParameterDisplay() {
  const displayEl = document.getElementById('parameter-display');
  if (displayEl) {
    displayEl.classList.add('hidden');
  }
}

function startHandDetectionLoop() {
  let frameCount = 0;

  setInterval(() => {
    const { landmarks, handedness } = getHandLandmarks();
    frameCount++;

    if (landmarks.length === 0) {
      if (frameCount % 3 === 0) {
        console.log(`[Frame ${frameCount}] No hands detected - show your hand to camera`);
      }
      return;
    }

    console.log(`[Frame ${frameCount}] 🖐 ${landmarks.length} hand(s) detected:`);

    landmarks.forEach((lm, i) => {
      const handInfo = handedness[i];
      const rawLabel = handInfo ? handInfo.label : '?';
      const handLabel = rawLabel === 'Left' ? 'Right' : 'Left';
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

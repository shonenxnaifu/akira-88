import { appState } from './core/state.js';
import { BPM_MIN, BPM_MAX, GESTURES } from './core/constants.js';
import { clamp } from './core/utils.js';
import { initGesture, getHandLandmarks, updatePrevState, countExtendedFingers, getHandedness, getHandCentroid, calculateHandRotation, calculateHandDistance } from './features/gesture/index.js';
import { initAnimation, updateVideoTexture } from './features/animation/renderer.js';
import { initAudio, startTransport, stopTransport, setBPM, setMasterVolume, createBass, updateBassParams, setBassVolume, setBassMute, isAudioInitialized, createSequencers, startSequencers, stopSequencers, createSynth, updateSynthParams, setSynthVolume, setSynthMute, isSynthCreated, createDrum, updateDrumParams, setDrumVolume, setDrumMute, isDrumCreated } from './features/sound/index.js';

const PARAM_LABELS = {
  bass: ['Pitch', 'Filter', 'Resonance'],
  synth: ['Detune', 'Filter', 'LFO Rate'],
  drum: ['Decay', 'Velocity', 'Noise Filter']
};

const PARAM_KEYS = {
  bass: ['pitch', 'filter', 'resonance'],
  synth: ['detune', 'filter', 'lfoRate'],
  drum: ['decay', 'velocity', 'noiseFilter']
};

const GESTURE_LABELS = {
  [GESTURES.SELECT_BASS]: 'Select Bass',
  [GESTURES.SELECT_SYNTH]: 'Select Synth',
  [GESTURES.SELECT_DRUM]: 'Select Drum',
  [GESTURES.MUTE_TOGGLE]: 'Mute Toggle',
  [GESTURES.RANDOMIZE_MODE]: 'Randomize Mode',
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

  // i comment this block for testing dont change it
  // playBtn.addEventListener('click', handlePlayClick);
  
  // this block is for testing dont change it
  handlePlayClick()
  
  bpmInput.addEventListener('change', handleBPMChange);

  document.getElementById('volume-master').addEventListener('input', handleMasterVolume);
  document.getElementById('volume-bass').addEventListener('input', handleElementVolume);
  document.getElementById('volume-synth').addEventListener('input', handleElementVolume);
  document.getElementById('volume-drum').addEventListener('input', handleElementVolume);
}

function handleMasterVolume(e) {
  const value = parseInt(e.target.value);
  appState.masterVolume = value / 100;
  document.getElementById('volume-master-value').textContent = value;
  setMasterVolume(appState.masterVolume);
  console.log('Master volume:', appState.masterVolume.toFixed(2));
}

function handleElementVolume(e) {
  const el = e.target.id.replace('volume-', '');
  const value = parseInt(e.target.value);
  appState.elements[el].volume = value / 100;
  document.getElementById(`volume-${el}-value`).textContent = value;

  if (el === 'bass') setBassVolume(appState.elements.bass.volume);
  else if (el === 'synth') setSynthVolume(appState.elements.synth.volume);
  else if (el === 'drum') setDrumVolume(appState.elements.drum.volume);

  console.log(`${el} volume:`, appState.elements[el].volume.toFixed(2));
}

async function handlePlayClick() {
  if (!isAudioInitialized()) {
    await initAudio();
    createBass();
    createSynth();
    createDrum();
    createSequencers();
    appState.audioInitialized = true;
    console.log('Audio initialized, all instruments created');
  }

  appState.isPlaying = !appState.isPlaying;
  const playBtn = document.getElementById('play-btn');
  playBtn.textContent = appState.isPlaying ? '⏸ Stop' : '▶ Play';

  if (appState.isPlaying) {
    startTransport(appState.bpm);
    startSequencers();
  } else {
    stopSequencers();
    stopTransport();
  }

  updatePrevState({ isPlaying: appState.isPlaying });
  console.log('Play state:', appState.isPlaying);
}

function handleBPMChange(e) {
  let value = parseInt(e.target.value);
  value = clamp(value, BPM_MIN, BPM_MAX);
  appState.bpm = value;
  e.target.value = value;
  setBPM(value);
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
    case GESTURES.MUTE_TOGGLE:
      toggleMute();
      break;
    case GESTURES.RANDOMIZE_MODE:
      if (params) {
        appState.randomizeMode = true;
        appState.parameters = params;
        updateParameterDisplay();
        const el = appState.selectedElement;
        if (el) {
          const p = params[el];
          console.log('[Randomize]', el, Object.entries(p).map(([k, v]) => `${k}: ${v.toFixed(2)}`).join(', '));
        }
      }
      break;
    default:
      if (appState.randomizeMode) {
        appState.randomizeMode = false;
        hideParameterDisplay();
        console.log('[Randomize] Exited randomize mode');
      }
      break;
  }

  updatePrevState({
    selectedElement: appState.selectedElement,
    isPlaying: appState.isPlaying,
    handAngles: { ...appState.handAngles }
  });
}

function selectElement(element) {
  appState.selectedElement = element;
  appState.elements[element].active = true;
  updateElementStatus();
  console.log(`Selected element: ${element}`);
}

function toggleMute() {
  if (appState.selectedElement) {
    appState.elements[appState.selectedElement].muted = !appState.elements[appState.selectedElement].muted;
    updateElementStatus();

    if (appState.selectedElement === 'bass') setBassMute(appState.elements.bass.muted);
    else if (appState.selectedElement === 'synth') setSynthMute(appState.elements.synth.muted);
    else if (appState.selectedElement === 'drum') setDrumMute(appState.elements.drum.muted);

    console.log(`Mute toggle for ${appState.selectedElement}:`, appState.elements[appState.selectedElement].muted);
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

function updateParameterDisplay() {
  const displayEl = document.getElementById('parameter-display');
  if (!displayEl) return;

  const el = appState.selectedElement;
  if (!el) return;

  displayEl.classList.remove('hidden');
  const params = appState.parameters[el];
  const labels = PARAM_LABELS[el];
  const keys = PARAM_KEYS[el];

  displayEl.innerHTML = keys.map((key, i) =>
    `<div>${labels[i]}: <span id="${key}-value">${params[key].toFixed(2)}</span></div>`
  ).join('');
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

      if (handLabel === 'Left') appState.handAngles.left = rotation;
      else if (handLabel === 'Right') appState.handAngles.right = rotation;

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

  startParameterLoop();
}

function startParameterLoop() {
  function applyParams() {
    if (appState.randomizeMode && appState.selectedElement) {
      const el = appState.selectedElement;
      if (el === 'bass') {
        updateBassParams(appState.parameters.bass);
      } else if (el === 'synth') {
        updateSynthParams(appState.parameters.synth);
      } else if (el === 'drum') {
        updateDrumParams(appState.parameters.drum);
      }
    }

    requestAnimationFrame(applyParams);
  }

  requestAnimationFrame(applyParams);
}

init();

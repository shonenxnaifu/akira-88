import { initDetector } from './detector.js';
import { countExtendedFingers, countFourFingers, isFingerExtended, getHandedness, getHandCentroid, calculateHandRotation, calculateHandDistance } from './hooks.js';
import { recognizeGesture } from './gestures.js';
import { drawHandLandmarks, clearHandLandmarks } from '../animation/renderer.js';

const GESTURE_DEBOUNCE_MS = 500;

let currentLandmarks = [];
let currentHandedness = [];
let lastResults = null;
let lastGestureTime = 0;
let lastGestureType = null;
let prevState = {
  selectedElement: null,
  isPlaying: false,
  handAngles: { left: null, right: null }
};

export function initGesture(videoElement, callbacks) {
  const onResults = (results) => {
    lastResults = results;
    currentLandmarks = results.multiHandLandmarks || [];
    currentHandedness = results.multiHandedness || [];

    if (currentLandmarks.length > 0) {
      drawHandLandmarks(currentLandmarks, currentHandedness);
    } else {
      clearHandLandmarks();
    }

    const recognitionResult = recognizeGesture(results, prevState);

    const now = Date.now();
    const isDebounced = recognitionResult.gesture !== 'none' && recognitionResult.gesture === lastGestureType && (now - lastGestureTime) < GESTURE_DEBOUNCE_MS;

    console.log('[index.js] gesture:', recognitionResult.gesture, 'isDebounced:', isDebounced, 'hasCallback:', !!(callbacks && callbacks.onGesture));

    if (recognitionResult.gesture !== 'none' && !isDebounced && callbacks && callbacks.onGesture) {
      console.log('[index.js] Firing onGesture callback:', recognitionResult.gesture);
      lastGestureTime = now;
      lastGestureType = recognitionResult.gesture;
      callbacks.onGesture(recognitionResult);
    } else if (recognitionResult.gesture === 'none') {
      lastGestureType = null;
    }

    if (callbacks && callbacks.onResults) {
      callbacks.onResults(results);
    }
  };

  console.log('Creating Hands instance and starting webcam...');
  initDetector(videoElement, onResults)
    .then(() => {
      console.log('✅ MediaPipe detector initialized successfully');
      if (callbacks && callbacks.onReady) {
        callbacks.onReady();
      }
    })
    .catch((err) => {
      console.error('❌ Failed to initialize detector:', err);
      if (callbacks && callbacks.onError) {
        callbacks.onError(err);
      }
    });

  return () => {
    currentLandmarks = [];
    currentHandedness = [];
    lastResults = null;
    lastGestureTime = 0;
    lastGestureType = null;
  };
}

export function updatePrevState(newState) {
  prevState = { ...prevState, ...newState };
}

export function getHandLandmarks() {
  return {
    landmarks: currentLandmarks,
    handedness: currentHandedness
  };
}

export function getLastResults() {
  return lastResults;
}

export { countExtendedFingers, countFourFingers, isFingerExtended, getHandedness, getHandCentroid, calculateHandRotation, calculateHandDistance };
export { recognizeGesture } from './gestures.js';

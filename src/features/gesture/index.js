import { initDetector } from './detector.js';
import { countExtendedFingers, countFourFingers, isFingerExtended, getHandedness, getHandCentroid, calculateHandRotation, calculateHandDistance } from './hooks.js';
import { recognizeGesture } from './gestures.js';
import { drawHandLandmarks, clearHandLandmarks } from '../animation/renderer.js';

const GESTURE_DEBOUNCE_MS = 500;
const HOLD_DURATION_MS = 3000;

let currentLandmarks = [];
let currentHandedness = [];
let lastResults = null;
let lastGestureTime = 0;
let lastGestureType = null;
let gestureHoldStart = 0;
let currentHeldGesture = null;
let prevState = {
  selectedElement: null,
  isPlaying: false,
  handAngles: { left: null, right: null },
  editState: false
};

function isSelectionGesture(gesture) {
  return gesture === 'select_bass' || gesture === 'select_synth' || gesture === 'select_drum';
}

function getElementFromGesture(gesture) {
  return gesture.replace('select_', '');
}

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

    const rawResult = recognizeGesture(results, prevState);
    const now = Date.now();

    let gestureToFire = 'none';
    let paramsToFire = null;
    let progressInfo = null;

    if (isSelectionGesture(rawResult.gesture)) {
      if (prevState.editState) {
        const element = getElementFromGesture(rawResult.gesture);
        if (element !== prevState.selectedElement) {
          progressInfo = { gesture: rawResult.gesture, blocked: true };
          gestureToFire = 'none';
        } else {
          if (rawResult.gesture === currentHeldGesture) {
            const elapsed = now - gestureHoldStart;
            if (elapsed >= HOLD_DURATION_MS) {
              gestureToFire = 'exit_edit';
              paramsToFire = null;
              prevState.editState = false;
              gestureHoldStart = 0;
              currentHeldGesture = null;
            } else {
              progressInfo = { gesture: rawResult.gesture, elapsed, required: HOLD_DURATION_MS };
              gestureToFire = 'none';
            }
          } else {
            currentHeldGesture = rawResult.gesture;
            gestureHoldStart = now;
            progressInfo = { gesture: rawResult.gesture, elapsed: 0, required: HOLD_DURATION_MS };
            gestureToFire = 'none';
          }
        }
      } else {
        if (rawResult.gesture === currentHeldGesture) {
          const elapsed = now - gestureHoldStart;
          if (elapsed >= HOLD_DURATION_MS) {
            gestureToFire = rawResult.gesture;
            paramsToFire = rawResult.params;
            prevState.editState = true;
            gestureHoldStart = 0;
            currentHeldGesture = null;
          } else {
            progressInfo = { gesture: rawResult.gesture, elapsed, required: HOLD_DURATION_MS };
            gestureToFire = 'none';
          }
        } else {
          currentHeldGesture = rawResult.gesture;
          gestureHoldStart = now;
          progressInfo = { gesture: rawResult.gesture, elapsed: 0, required: HOLD_DURATION_MS };
          gestureToFire = 'none';
        }
      }
    } else {
      currentHeldGesture = null;
      gestureHoldStart = 0;

      if (prevState.editState) {
        if (rawResult.gesture === 'randomize_mode' || rawResult.gesture === 'mute_toggle') {
          gestureToFire = rawResult.gesture;
          paramsToFire = rawResult.params;
        } else {
          gestureToFire = 'none';
        }
      } else {
        gestureToFire = rawResult.gesture;
        paramsToFire = rawResult.params;
      }
    }

    if (progressInfo && callbacks && callbacks.onGestureProgress) {
      callbacks.onGestureProgress(progressInfo);
    }

    const isDebounced = gestureToFire !== 'none' && gestureToFire !== 'randomize_mode' && gestureToFire === lastGestureType && (now - lastGestureTime) < GESTURE_DEBOUNCE_MS;

    console.log('[index.js] gesture:', gestureToFire, 'isDebounced:', isDebounced, 'editState:', prevState.editState, 'hasCallback:', !!(callbacks && callbacks.onGesture));

    if (gestureToFire !== 'none' && !isDebounced && callbacks && callbacks.onGesture) {
      console.log('[index.js] Firing onGesture callback:', gestureToFire);
      lastGestureTime = now;
      lastGestureType = gestureToFire;
      callbacks.onGesture({ gesture: gestureToFire, params: paramsToFire, editState: prevState.editState });
    } else if (gestureToFire === 'none') {
      lastGestureType = null;
    }

    if (currentLandmarks.length === 2) {
      let leftHand = null;
      let rightHand = null;
      const handednessList = results.multiHandedness.map((h) => h.label === 'Left' ? 'Right' : 'Left');
      for (let i = 0; i < currentLandmarks.length; i++) {
        if (handednessList[i] === 'Left') leftHand = currentLandmarks[i];
        else if (handednessList[i] === 'Right') rightHand = currentLandmarks[i];
      }
      if (leftHand) prevState.handAngles.left = calculateHandRotation(leftHand);
      if (rightHand) prevState.handAngles.right = calculateHandRotation(rightHand);
    } else if (currentLandmarks.length === 1) {
      const rawLabel = currentHandedness[0]?.label;
      const actualLabel = rawLabel === 'Left' ? 'Right' : 'Left';
      const angle = calculateHandRotation(currentLandmarks[0]);
      if (actualLabel === 'Left') prevState.handAngles.left = angle;
      else prevState.handAngles.right = angle;
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
    gestureHoldStart = 0;
    currentHeldGesture = null;
    prevState.editState = false;
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

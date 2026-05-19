import { initDetector } from './detector.js';
import { countExtendedFingers, getHandedness, getHandCentroid, calculateHandRotation, calculateHandDistance } from './hooks.js';

let currentLandmarks = [];
let currentHandedness = [];
let lastResults = null;

export function initGesture(videoElement, callbacks) {
  const onResults = (results) => {
    lastResults = results;
    currentLandmarks = results.multiHandLandmarks || [];
    currentHandedness = results.multiHandedness || [];

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
  };
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

export { countExtendedFingers, getHandedness, getHandCentroid, calculateHandRotation, calculateHandDistance };

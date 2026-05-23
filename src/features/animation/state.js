import { appState } from '../../core/state.js';

let currentEffect = null;
let isPlaying = false;
let beatIntensity = 0;
let handMovementSpeed = 0;

export function updateAnimationState(params = {}) {
  if (params.currentEffect !== undefined) {
    currentEffect = params.currentEffect;
    appState.currentEffect = currentEffect;
  }
  if (params.isPlaying !== undefined) {
    isPlaying = params.isPlaying;
  }
  if (params.beatIntensity !== undefined) {
    beatIntensity = params.beatIntensity;
  }
  if (params.handMovementSpeed !== undefined) {
    handMovementSpeed = params.handMovementSpeed;
    appState.handMovementSpeed = handMovementSpeed;
  }
}

export function getAnimationIntensity() {
  const movementWeight = 0.6;
  const beatWeight = 0.4;
  const intensity = (handMovementSpeed * movementWeight) + (beatIntensity * beatWeight);
  const minIntensity = 0.5;
  const finalIntensity = Math.max(minIntensity, Math.min(1, intensity));
  appState.animationIntensity = finalIntensity;
  return finalIntensity;
}

export function getCurrentEffect() {
  return currentEffect;
}

export function getIsPlaying() {
  return isPlaying;
}

export function getBeatIntensity() {
  return beatIntensity;
}

export function getHandMovementSpeed() {
  return handMovementSpeed;
}

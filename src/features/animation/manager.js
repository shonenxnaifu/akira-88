import { appState } from '../../core/state.js';
import { getEffectsContainer } from './engine.js';
import { getCurrentEffect as getAnimationCurrentEffect, updateAnimationState, getAnimationIntensity } from './state.js';
import { getHandPositions, areBothHandsVisible, calculateHandMovementSpeed, getJointConnections } from './tracking.js';
import { createPlasmaArc, updatePlasmaEffect, clearPlasmaEffect, addPlasmaArcsToContainer } from './effects/plasma.js';

let currentEffect = null;
let isEffectActive = false;

export function showEffect(instrument) {
  if (!instrument) return;
  if (currentEffect === instrument && isEffectActive) return;

  hideEffect();

  currentEffect = instrument;
  isEffectActive = true;
  appState.currentEffect = instrument;

  updateAnimationState({ currentEffect: instrument });
}

export function hideEffect() {
  if (currentEffect === 'bass') {
    const container = getEffectsContainer();
    if (container) {
      clearPlasmaEffect(container);
    }
  }

  currentEffect = null;
  isEffectActive = false;
  appState.currentEffect = null;

  updateAnimationState({ currentEffect: null });

  console.log('[AnimationManager] Effect hidden');
}

export function updateEffect(delta) {
  if (!isEffectActive || !currentEffect) return;

  const bothHandsVisible = areBothHandsVisible();

  if (!bothHandsVisible) {
    hideEffect();
    return;
  }

  const movementSpeed = calculateHandMovementSpeed();
  updateAnimationState({ handMovementSpeed: movementSpeed });

  const intensity = getAnimationIntensity();

  if (currentEffect === 'bass') {
    const container = getEffectsContainer();
    if (!container) return;

    const connections = getJointConnections();
    if (connections.length === 0) return;

    clearPlasmaEffect(container);
    createPlasmaArc(connections, intensity);
    updatePlasmaEffect(delta, intensity);
    addPlasmaArcsToContainer(container);
  }
}

export function setEffectIntensity(intensity) {
  updateAnimationState({ beatIntensity: intensity });
}

export function getCurrentEffect() {
  return currentEffect;
}

import * as PIXI from 'pixi.js';
import { getApp } from './renderer.js';
import { ANIMATION_CONFIG } from '../../core/constants.js';

let effectsContainer = null;
let isInitialized = false;

export function initAnimationEngine() {
  if (isInitialized) return effectsContainer;

  const app = getApp();
  if (!app) {
    console.error('[AnimationEngine] PixiJS app not ready');
    return null;
  }

  effectsContainer = new PIXI.Container();
  app.stage.addChild(effectsContainer);

  isInitialized = true;
  console.log('[AnimationEngine] Effects container created at stage index 1');

  return effectsContainer;
}

export function getEffectsContainer() {
  return effectsContainer;
}

export function isEngineInitialized() {
  return isInitialized;
}

export function destroyAnimationEngine() {
  if (effectsContainer) {
    effectsContainer.destroy({ children: true });
    effectsContainer = null;
  }
  isInitialized = false;
}

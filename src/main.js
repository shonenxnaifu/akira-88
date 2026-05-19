import { appState } from './core/state.js';
import { BPM_MIN, BPM_MAX } from './core/constants.js';
import { clamp } from './core/utils.js';

function init() {
  console.log('Techno Gesture Track - Initializing...');

  setupEventListeners();
  startWebcam();

  console.log('Phase 1 complete - Ready for Phase 2');
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
  console.log('Webcam will be initialized in Phase 2');
}

init();

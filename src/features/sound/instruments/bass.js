import * as Tone from 'tone';
import { getMasterVolume } from '../engine.js';

const BASS_NOTES = [65.41, 82.41, 98.00];

let synth = null;
let filter = null;
let volume = null;
let isCreated = false;

export function createBass() {
  if (isCreated) return;

  filter = new Tone.Filter(500, 'lowpass');
  filter.Q.value = 5;

  volume = new Tone.Volume(0);

  synth = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 5,
    oscillator: { type: 'fatsine' },
    envelope: {
      attack: 3,
      decay: 0.3,
      sustain: 0.7,
      release: 3,
      attackCurve: 'bounce'
    }
  }).connect(filter);

  filter.connect(volume);
  volume.connect(getMasterVolume());

  isCreated = true;
  console.log('Bass instrument created');
}

export function updateBassParams(params) {
  if (!synth || !filter) return;

  const noteIndex = Math.round(((params.pitch + 1) / 2) * 2);
  const clampedIndex = Math.max(0, Math.min(2, noteIndex));
  synth.frequency.value = BASS_NOTES[clampedIndex];

  const freq = 200 + params.filter * (800 - 200);
  filter.frequency.value = freq;

  const q = ((params.resonance + 1) / 2) * 20;
  filter.Q.value = q;
}

export function setBassVolume(value) {
  if (!volume) return;

  const db = value > 0 ? 20 * Math.log10(value) : -Infinity;
  volume.volume.value = db;
}

export function setBassMute(muted) {
  if (!volume) return;

  volume.mute = muted;
}

export function getBassSynth() {
  return synth;
}

export function getBassFilter() {
  return filter;
}

export function isBassCreated() {
  return isCreated;
}

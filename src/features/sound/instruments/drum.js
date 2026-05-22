import * as Tone from 'tone';
import { getMasterVolume } from '../engine.js';

let kick = null;
let noise = null;
let noiseFilter = null;
let kickVolume = null;
let noiseVolume = null;
let isCreated = false;

export function createDrum() {
  if (isCreated) return;

  noiseFilter = new Tone.Filter(4000, 'highpass');

  kickVolume = new Tone.Volume(0);
  noiseVolume = new Tone.Volume(0);

  kick = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 8,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0,
      release: 0.1,
      attackCurve: 'linear'
    }
  }).connect(kickVolume);

  noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0,
      release: 0.1,
      attackCurve: 'linear'
    }
  }).connect(noiseFilter);

  noiseFilter.connect(noiseVolume);

  kickVolume.connect(getMasterVolume());
  noiseVolume.connect(getMasterVolume());

  isCreated = true;
  console.log('Drum instrument created');
}

export function updateDrumParams(params) {
  if (!kick || !noise || !noiseFilter) return;

  const decay = 0.1 + ((params.decay + 1) / 2) * (1.0 - 0.1);
  kick.envelope.decay = decay;
  noise.envelope.decay = decay;

  const freq = 1000 + ((params.noiseFilter + 1) / 2) * (8000 - 1000);
  noiseFilter.frequency.value = freq;
}

export function triggerDrum(type, time, velocity = 0.8) {
  if (!kick || !noise) return;

  const vel = Math.max(0.5, Math.min(1.0, velocity));

  if (type === 'kick') {
    kick.triggerAttackRelease('C1', '8n', time, vel);
  } else if (type === 'hihat') {
    noise.triggerAttackRelease('16n', time, vel);
  }
}

export function setDrumVolume(value) {
  if (!kickVolume || !noiseVolume) return;

  const db = value > 0 ? 20 * Math.log10(value) : -Infinity;
  kickVolume.volume.value = db;
  noiseVolume.volume.value = db;
}

export function setDrumMute(muted) {
  if (!kickVolume || !noiseVolume) return;

  kickVolume.mute = muted;
  noiseVolume.mute = muted;
}

export function getKick() {
  return kick;
}

export function getNoise() {
  return noise;
}

export function isDrumCreated() {
  return isCreated;
}

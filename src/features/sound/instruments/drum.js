import * as Tone from 'tone';
import { getMasterVolume } from '../engine.js';

let kick = null;
let noise = null;
let noiseFilter = null;
let kickVolume = null;
let noiseVolume = null;
let kickDistortion = null;
let kickSaturation = null;
let kickHighpass = null;
let kickGain = null;
let isCreated = false;

export function createDrum() {
  if (isCreated) return;

  noiseFilter = new Tone.Filter(4000, 'highpass');

  kickVolume = new Tone.Volume(3);
  noiseVolume = new Tone.Volume(0);

  kickDistortion = new Tone.Distortion(0.2);
  kickSaturation = new Tone.Chebyshev(3);
  kickHighpass = new Tone.Filter(20, 'highpass');
  kickGain = new Tone.Gain(2);

  kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.4,
      attackCurve: 'exponential'
    }
  }).connect(kickSaturation);

  kickSaturation.connect(kickDistortion);
  kickDistortion.connect(kickHighpass);
  kickHighpass.connect(kickGain);
  kickGain.connect(kickVolume);

  noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0,
      release: 0.05,
      attackCurve: 'linear'
    }
  }).connect(noiseFilter);

  noiseFilter.connect(noiseVolume);

  kickVolume.connect(getMasterVolume());
  noiseVolume.connect(getMasterVolume());

  isCreated = true;
  console.log('Drum instrument created (hard industrial kick)');
}

export function updateDrumParams(params) {
  if (!kick || !noise || !noiseFilter) return;

  const decay = 0.08 + ((params.decay + 1) / 2) * (0.4 - 0.08);
  kick.envelope.decay = decay;
  noise.envelope.decay = decay * 0.5;

  const distAmount = 0.2 + ((params.distortion + 1) / 2) * (0.8 - 0.2);
  kickDistortion.distortion = distAmount;
  kickSaturation.value = 3 + ((params.distortion + 1) / 2) * (10 - 3);

  const freq = 2000 + ((params.noiseFilter + 1) / 2) * (10000 - 2000);
  noiseFilter.frequency.value = freq;

  const hpFreq = 20 + ((params.highpass + 1) / 2) * (80 - 20);
  kickHighpass.frequency.value = hpFreq;
}

export function triggerDrum(type, time, velocity = 0.8) {
  if (!kick || !noise) {
    console.warn('Drum not initialized!');
    return;
  }

  const vel = Math.max(0.5, Math.min(1.0, velocity));

  if (type === 'kick') {
    console.log('KICK TRIGGERED at', time, 'velocity:', vel);
    kick.triggerAttackRelease('C2', '16n', time, vel);
  } else if (type === 'hihat') {
    noise.triggerAttackRelease('32n', time, vel);
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

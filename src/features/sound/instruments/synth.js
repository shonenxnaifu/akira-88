import * as Tone from 'tone';
import { getMasterVolume } from '../engine.js';

let synth = null;
let filter = null;
let lfo = null;
let chorus = null;
let reverb = null;
let volume = null;
let isCreated = false;

export function createSynth() {
  if (isCreated) return;

  // Synthwave filter - lower cutoff for darker sound
  filter = new Tone.Filter(1500, 'lowpass');

  // Slow LFO for filter sweep effect (classic synthwave)
  lfo = new Tone.LFO(0.5, 300, 3000);
  lfo.start();
  lfo.connect(filter.frequency);

  // Chorus for wide, lush synthwave sound
  chorus = new Tone.Chorus(4, 2.5, 0.5);
  chorus.start();

  // Reverb for atmospheric depth
  reverb = new Tone.Reverb({
    decay: 3,
    preDelay: 0.1,
    wet: 0.3
  });

  volume = new Tone.Volume(-8);

  // Synthwave oscillator: supersaw with detuning
  synth = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 8,
    oscillator: {
      type: 'fmsquare',
      count: 4,
      spread: 30
    },
    envelope: {
      attack: 0.1,
      decay: 0.5,
      sustain: 0.6,
      release: 2.0
    }
  }).connect(filter);

  filter.connect(chorus);
  chorus.connect(reverb);
  reverb.connect(volume);
  volume.connect(getMasterVolume());

  isCreated = true;
  console.log('Synth instrument created (synthwave style)');
}

export function updateSynthParams(params) {
  if (!synth || !filter || !lfo) return;

  const detune = params.detune * 30;
  synth.set({ detune });

  const freq = 300 + ((params.filter + 1) / 2) * (4000 - 300);
  filter.frequency.value = freq;
  lfo.min = freq - 400;
  lfo.max = freq + 400;

  const rate = 0.1 + ((params.lfoRate + 1) / 2) * (5 - 0.1);
  lfo.frequency.value = rate;
}

export function setSynthVolume(value) {
  if (!volume) return;

  const db = value > 0 ? 20 * Math.log10(value) : -Infinity;
  volume.volume.value = db;
}

export function setSynthMute(muted) {
  if (!volume) return;

  volume.mute = muted;
}

export function getSynth() {
  return synth;
}

export function getSynthFilter() {
  return filter;
}

export function isSynthCreated() {
  return isCreated;
}

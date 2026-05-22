import * as Tone from 'tone';
import { getMasterVolume } from '../engine.js';

let synth = null;
let filter = null;
let lfo = null;
let volume = null;
let isCreated = false;

export function createSynth() {
  if (isCreated) return;

  filter = new Tone.Filter(2000, 'lowpass');

  lfo = new Tone.LFO(2, 500, 5000);
  lfo.start();
  lfo.connect(filter.frequency);

  volume = new Tone.Volume(0);

  synth = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 8,
    oscillator: {
      type: 'fatsawtooth',
      count: 3,
      spread: 20
    },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.4,
      release: 1.0
    }
  }).connect(filter);

  filter.connect(volume);
  volume.connect(getMasterVolume());

  isCreated = true;
  console.log('Synth instrument created');
}

export function updateSynthParams(params) {
  if (!synth || !filter || !lfo) return;

  const detune = params.detune * 20;
  synth.set({ detune });

  const freq = 500 + params.filter * (5000 - 500);
  filter.frequency.value = freq;
  lfo.min = freq - 500;
  lfo.max = freq + 500;

  const rate = 0.1 + ((params.lfoRate + 1) / 2) * (10 - 0.1);
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

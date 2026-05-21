import * as Tone from "tone";
import { getMasterVolume } from "../engine.js";

const BASS_NOTES = [32.70, 36.71, 41.20, 49.00, 55.00, 61.74, 65.41, 73.42];
//                  C1     D1     E1     G1     A1     B1     C2     D2

let synth = null;
let filter = null;
let volume = null;
let isCreated = false;

export function createBass() {
  if (isCreated) return;

  filter = new Tone.Filter(80, "lowpass");
  filter.Q.value = 6;

  const distortion = new Tone.Distortion(0.7);
  const bitcrusher = new Tone.BitCrusher(6);
  const chebyshev = new Tone.Chebyshev(6);
  const delay = new Tone.FeedbackDelay("4n", 0.15);
  delay.wet.value = 0.15;
  const reverb = new Tone.Reverb({ decay: 1.0, wet: 0.1, preDelay: 0.01 });

  volume = new Tone.Volume(14);

  synth = new Tone.MembraneSynth({
    pitchDecay: 0.002,
    octaves: 12,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.7,
      release: 0.5,
      attackCurve: "linear",
    },
  }).connect(chebyshev);

  // Signal chain
  chebyshev.connect(distortion);
  distortion.connect(bitcrusher);
  bitcrusher.connect(filter);
  filter.connect(delay);
  delay.connect(reverb);
  reverb.connect(volume);
  volume.connect(getMasterVolume());

  isCreated = true;
  console.log("Bass instrument created");
}

export function updateBassParams(params) {
  if (!synth || !filter) return;

  const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
  const clampedIndex = Math.max(0, Math.min(7, noteIndex));
  synth.frequency.value = BASS_NOTES[clampedIndex];

  const freq = 80 + params.filter * (400 - 80);
  filter.frequency.value = freq;

  const q = ((params.resonance + 1) / 2) * 6;
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

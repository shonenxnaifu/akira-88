import * as Tone from "tone";
import { getMasterVolume } from "../engine.js";

const BASS_NOTES = [73.42, 82.41, 92.50, 98.0, 110.0, 123.47, 130.81, 146.83];
//                  D2     E2     F#2    G2    A2     B2     C3     D3

let synth = null;
let filter = null;
let volume = null;
let isCreated = false;

export function createBass() {
  if (isCreated) return;

  filter = new Tone.Filter(150, "lowpass");
  filter.Q.value = 12;

  const distortion = new Tone.Distortion(0.9);
  const bitcrusher = new Tone.BitCrusher(3);
  const chebyshev = new Tone.Chebyshev(10);
  const delay = new Tone.FeedbackDelay("4n", 0.3);
  delay.wet.value = 0.3;
  const reverb = new Tone.Reverb({ decay: 2.0, wet: 0.3, preDelay: 0.01 });

  volume = new Tone.Volume(12);

  synth = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 8,
    oscillator: { type: "square" },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.5,
      release: 0.2,
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

  const freq = 150 + params.filter * (600 - 150);
  filter.frequency.value = freq;

  const q = ((params.resonance + 1) / 2) * 12;
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

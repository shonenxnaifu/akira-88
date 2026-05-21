import * as Tone from "tone";
import { getMasterVolume } from "../engine.js";

const BASS_NOTES = [69.30, 73.42, 82.41, 87.31, 98.0, 110.0, 123.47, 130.81];
//                  C#2    D2     E2     F2     G2    A2     B2     C3

let synth = null;
let filter = null;
let volume = null;
let isCreated = false;

export function createBass() {
  if (isCreated) return;

  filter = new Tone.Filter(500, "lowpass");
  filter.Q.value = 22;
  const distortion = new Tone.Distortion(0.4);
  const chebyshev = new Tone.Chebyshev(3);
  const delay = new Tone.FeedbackDelay("8n", 0.7);
  delay.wet.value = 0.7;
  const reverb = new Tone.Reverb({
    decay: 3.0,
    wet: 0.5,
    preDelay: 0.01,
  });

  volume = new Tone.Volume(8);

  synth = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 5,
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.005,
      decay: 0.4,
      sustain: 0.9,
      release: 0.6,
      attackCurve: "linear",
    },
  }).connect(chebyshev);

  chebyshev.connect(distortion);
  distortion.connect(filter);
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

  const freq = 500 + params.filter * (1000 - 500);
  filter.frequency.value = freq;

  const q = ((params.resonance + 1) / 2) * 22;
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

import * as Tone from "tone";
import { getMasterVolume } from "../engine.js";

// const BASS_NOTES = [65.41, 73.42, 82.41, 87.31, 98.0, 110.0, 123.47, 130.81];
const BASS_NOTES = [82.41, 87.31, 92.50, 98.0, 103.83, 110.0, 116.54, 123.47];

let synth = null;
let filter = null;
let volume = null;
let isCreated = false;

export function createBass() {
  if (isCreated) return;

  filter = new Tone.Filter(350, "lowpass");
  filter.Q.value = 12;

  const distortion = new Tone.Distortion(0.7);

  const delay = new Tone.FeedbackDelay("16n", 0.4);
  delay.wet.value = 0.3;

  volume = new Tone.Volume(2);

  synth = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 5,
    oscillator: { type: "square" },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.02,
      release: 0.1,
      attackCurve: "linear",
    },
  }).connect(distortion);

  distortion.connect(filter);
  filter.connect(delay);
  delay.connect(volume);
  volume.connect(getMasterVolume());

  isCreated = true;
  console.log("Bass instrument created (Monrella-style industrial + echo)");
}

export function updateBassParams(params) {
  if (!synth || !filter) return;

  const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
  const clampedIndex = Math.max(0, Math.min(7, noteIndex));
  synth.frequency.value = BASS_NOTES[clampedIndex];

  const freq = 200 + params.filter * (350 - 200);
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

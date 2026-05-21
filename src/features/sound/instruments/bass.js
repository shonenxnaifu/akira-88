import * as Tone from "tone";
import { getMasterVolume } from "../engine.js";

const BASS_NOTES = [82.41, 87.31, 92.50, 98.0, 103.83, 110.0, 116.54, 123.47];

let synth = null;
let highpass = null;
let lowpass = null;
let volume = null;
let isCreated = false;

export function createBass() {
  if (isCreated) return;

  highpass = new Tone.Filter(65, "highpass");

  lowpass = new Tone.Filter(350, "lowpass");
  lowpass.Q.value = 12;

  const distortion = new Tone.Distortion(0.6);

  const chebyshev = new Tone.Chebyshev(4);

  const delay = new Tone.FeedbackDelay("16n", 0.4);
  delay.wet.value = 0.3;

  const reverb = new Tone.Reverb({
    decay: 1.5,
    wet: 0.2,
    preDelay: 0.01,
  });

  volume = new Tone.Volume(12);

  synth = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 6,
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.5,
      release: 0.2,
      attackCurve: "linear",
    },
  }).connect(chebyshev);

  chebyshev.connect(distortion);
  distortion.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(delay);
  delay.connect(reverb);
  reverb.connect(volume);
  volume.connect(getMasterVolume());

  isCreated = true;
  console.log("Bass instrument created (Warehouse rolling techno)");
}

export function updateBassParams(params) {
  if (!synth || !lowpass) return;

  const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
  const clampedIndex = Math.max(0, Math.min(7, noteIndex));
  synth.frequency.value = BASS_NOTES[clampedIndex];

  const freq = 200 + params.filter * (350 - 200);
  lowpass.frequency.value = freq;

  const q = ((params.resonance + 1) / 2) * 12;
  lowpass.Q.value = q;
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
  return lowpass;
}

export function isBassCreated() {
  return isCreated;
}

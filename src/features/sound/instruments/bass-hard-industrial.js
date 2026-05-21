import * as Tone from "tone";
import { getMasterVolume } from "../engine.js";

const BASS_NOTES = [32.7, 36.71, 41.2, 49.0, 55.0, 61.74, 73.42, 82.41];
//                  C1     D1     E1     G1     A1     B1     D2     E2

let synth = null;
let filter = null;
let volume = null;
let isCreated = false;
let highpass = null;

export function createBass() {
  if (isCreated) return;
  
  highpass = new Tone.Filter(65, "highpass");
  
  filter = new Tone.Filter(100, "lowpass");
  filter.Q.value = 8;
  const distortion = new Tone.Distortion(0.7);
  const bitcrusher = new Tone.BitCrusher(4);
  const chebyshev = new Tone.Chebyshev(8);
  const delay = new Tone.FeedbackDelay("4n", 0.2);
  delay.wet.value = 0.2;
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2, preDelay: 0.01 });

  volume = new Tone.Volume(12);

  synth = new Tone.MembraneSynth({
    pitchDecay: 0.005,
    octaves: 10,
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.6,
      release: 0.3,
      attackCurve: "linear",
    },
  }).connect(chebyshev);

  // Signal chain
  chebyshev.connect(distortion);
  distortion.connect(bitcrusher);
  bitcrusher.connect(filter);
  filter.connect(highpass);
  highpass.connect(delay);
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

  const q = ((params.resonance + 1) / 2) * 8;
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

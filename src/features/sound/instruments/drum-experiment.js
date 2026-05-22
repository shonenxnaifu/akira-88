import * as Tone from "tone";
import { getMasterVolume } from "../engine.js";

// 909 Dark Techno Drum Kit
// Based on Aulart tutorial: Create a 909 Dark Techno Pattern

let mainKick = null;
let rumbleKick = null;
let closedHat1 = null;
let closedHat2 = null;
let openHat = null;
let crash = null;

let mainKickVol = null;
let rumbleKickVol = null;
let closedHat1Vol = null;
let closedHat2Vol = null;
let openHatVol = null;
let crashVol = null;

let rumbleReverb = null;
let rumbleFilter = null;
let hat1Filter = null;
let hat2Filter = null;
let openHatFilter = null;
let crashFilter = null;

let isCreated = false;

export function createDrum() {
  if (isCreated) return;

  // Volume nodes for individual control
  mainKickVol = new Tone.Volume(3);
  rumbleKickVol = new Tone.Volume(6);
  closedHat1Vol = new Tone.Volume(-6);
  closedHat2Vol = new Tone.Volume(-4);
  openHatVol = new Tone.Volume(-8);
  crashVol = new Tone.Volume(-10);

  // Rumble kick processing chain (low-pass filter + reverb)
  rumbleFilter = new Tone.Filter(200, "lowpass");
  rumbleReverb = new Tone.Reverb({
    decay: 2.5,
    preDelay: 0.02,
    wet: 0.4,
  });

  // Hi-hat filters
  hat1Filter = new Tone.Filter(3000, "lowpass");
  hat2Filter = new Tone.Filter(6000, "highpass");
  openHatFilter = new Tone.Filter(8000, "highpass");
  crashFilter = new Tone.Filter(2000, "lowpass");

  // Main kick - 909 style, tuned low (-11 semitones equivalent)
  mainKick = new Tone.MembraneSynth({
    pitchDecay: 0.005,
    octaves: 3,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0,
      release: 0.4,
      attackCurve: "exponential",
    },
  }).connect(mainKickVol);

  // Rumble kick - creates the dark techno rumble with reverb
  rumbleKick = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 10,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.005,
      decay: 0.5,
      sustain: 0.2,
      release: 0.8,
      attackCurve: "exponential",
    },
  }).connect(rumbleFilter);

  rumbleFilter.connect(rumbleReverb);
  rumbleReverb.connect(rumbleKickVol);

  // Closed hi-hat 1 - darker, offbeat (low-pass filtered)
  closedHat1 = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0,
      release: 0.05,
      attackCurve: "linear",
    },
  }).connect(hat1Filter);

  hat1Filter.connect(closedHat1Vol);

  // Closed hi-hat 2 - brighter variation (high-pass filtered)
  closedHat2 = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.06,
      sustain: 0,
      release: 0.05,
      attackCurve: "linear",
    },
  }).connect(hat2Filter);

  hat2Filter.connect(closedHat2Vol);

  // Open hi-hat - shorter, thinner (high-pass filtered)
  openHat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.1,
      attackCurve: "linear",
    },
  }).connect(openHatFilter);

  openHatFilter.connect(openHatVol);

  // Crash - short release, heavily filtered
  crash = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0,
      release: 0.2,
      attackCurve: "linear",
    },
  }).connect(crashFilter);

  crashFilter.connect(crashVol);

  // Connect all to master
  mainKickVol.connect(getMasterVolume());
  rumbleKickVol.connect(getMasterVolume());
  closedHat1Vol.connect(getMasterVolume());
  closedHat2Vol.connect(getMasterVolume());
  openHatVol.connect(getMasterVolume());
  crashVol.connect(getMasterVolume());

  isCreated = true;
  console.log("Drum instrument created (909 dark techno)");
}

export function updateDrumParams(params) {
  if (!isCreated) return;

  // Main kick decay
  const mainDecay = 0.15 + ((params.decay + 1) / 2) * (0.5 - 0.15);
  mainKick.envelope.decay = mainDecay;

  // Rumble reverb amount
  const rumbleWet = 0.2 + ((params.noiseFilter + 1) / 2) * (0.6 - 0.2);
  rumbleReverb.wet.value = rumbleWet;

  // Hi-hat filter
  const hatFilterFreq = 2000 + ((params.velocity + 1) / 2) * (6000 - 2000);
  hat1Filter.frequency.value = hatFilterFreq;
}

export function triggerDrum(type, time, velocity = 0.8) {
  if (!isCreated) {
    console.warn("Drum not initialized!");
    return;
  }

  const vel = Math.max(0.4, Math.min(1.0, velocity));

  switch (type) {
    case "kick":
      mainKick.triggerAttackRelease("C1", "16n", time, vel);
      break;
    case "rumble":
      rumbleKick.triggerAttackRelease("C1", "16n", time, vel * 0.8);
      break;
    case "hihat":
      closedHat1.triggerAttackRelease("16n", time, vel * 0.7);
      break;
    case "hihat2":
      closedHat2.triggerAttackRelease("16n", time, vel * 0.7);
      break;
    case "openHat":
      openHat.triggerAttackRelease("16n", time, vel * 0.6);
      break;
    case "crash":
      crash.triggerAttackRelease("16n", time, vel * 0.5);
      break;
  }
}

export function setDrumVolume(value) {
  if (!isCreated) return;

  const db = value > 0 ? 20 * Math.log10(value) : -Infinity;
  mainKickVol.volume.value = db;
  rumbleKickVol.volume.value = db;
  closedHat1Vol.volume.value = db;
  closedHat2Vol.volume.value = db;
  openHatVol.volume.value = db;
  crashVol.volume.value = db;
}

export function setDrumMute(muted) {
  if (!isCreated) return;

  mainKickVol.mute = muted;
  rumbleKickVol.mute = muted;
  closedHat1Vol.mute = muted;
  closedHat2Vol.mute = muted;
  openHatVol.mute = muted;
  crashVol.mute = muted;
}

export function isDrumCreated() {
  return isCreated;
}

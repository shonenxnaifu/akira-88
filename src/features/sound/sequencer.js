import * as Tone from "tone";
import { getBassSynth } from "./instruments/bass-acid-psychedelic.js";
import { getSynth } from "./instruments/synth.js";
import { triggerDrum } from "./instruments/drum.js";

/* START ACID PSYCHEDELIC  */

// FIT WITH 16n
// const BASS_PATTERN = ['F2', null, 'F2', 'D2', 'F2', null, 'C3', 'F2'];

// FIT WITH 16n
// const BASS_PATTERN = ['A2', null, 'A2', null, 'A2', null, 'A2', 'B2'];

// FIT WITH 16n
// const BASS_PATTERN = ['E2', null, null, 'G2', 'E2', null, 'D2', null];

// FIT WITH 8n/16n
const BASS_PATTERN = ['D1', null, 'D1', null, 'D1', null, 'D1', 'D1'];

// FIT WITH 16n 
// const BASS_PATTERN = ['F#2', 'F#2', null, 'F#2', 'D2', null, 'F#2', 'A2'];

// FIT WITH 8n/16n
// const BASS_PATTERN = ['C1', null, 'C1', null, 'C1', null, 'C1', null];

/* END ACID PSYCHEDELIC  */

// INDUSTRIAL PUNCH --> not fit
// RAW HARDCORE --> not fit
// SUB TERROR --> not fit

const SYNTH_PATTERN = [
  ["C3", "E3", "G3"],
  null,
  ["C3", "E3"],
  null,
  ["E3", "G3"],
  null,
  ["C3", "G3"],
  null,
];


// Each array represents 16 steps (1 bar of 16th notes)

// Main kick: 4-on-the-floor (beats 1, 2, 3, 4)
const DRUMM_KICK_PATTERNS = [
  1, 0, 1, 0,  // Beat 1
  1, 0, 1, 0,  // Beat 2
  1, 0, 1, 0,  // Beat 3
  1, 0, 1, 0,  // Beat 4
];

// Rumble kick: offbeat pattern creating rolling dark bass
const DRUMM_RUMBLE_PATTERNS = [
  1, 0, 0, 0,  
  1, 0, 0, 0,  
  1, 0, 0, 0,  
  1, 0, 0, 0,  
];

const DRUMM_HIHAT_PATTERNS = [
  0, 0, 1, 0,  
  0, 0, 1, 0,  
  0, 0, 1, 0,  
  0, 0, 1, 1,  
];

const DRUMM_HIHAT2_PATTERNS = [
  0, 0, 0, 0,  
  0, 0, 0, 0,  
  0, 0, 0, 1,  
  0, 0, 1, 0,  
];

const DRUMM_OPENHAT_PATTERNS = [
  0, 0, 0, 0,  
  0, 0, 0, 0,  
  0, 1, 0, 0,  
  0, 0, 0, 0,  
  
  0, 0, 0, 0,  
  0, 0, 0, 0,  
  0, 1, 0, 0,  
  0, 0, 0, 0,  
  
  0, 0, 0, 0,  
  0, 0, 0, 0,  
  0, 1, 0, 0,  
  0, 0, 0, 0,  
  
  0, 0, 0, 0,  
  0, 0, 0, 0,  
  0, 1, 0, 0,  
  1, 0, 1, 1,  
];

const DRUMM_CRASH_PATTERNS = [
  0, 0, 0, 0,  
  0, 0, 0, 1,  
  0, 0, 0, 0,  
  0, 0, 0, 0,  
];

let bassSeq = null;
let synthSeq = null;

let drumKickSeq = null;
let drumRumbleSeq = null;
let drumHihatSeq = null;
let drumHihat2Seq = null;
let drumOpenHatSeq = null;
let drumCrashSeq = null;

let isStarted = false;

export function createSequencers() {
  if (isStarted) return;

  bassSeq = new Tone.Sequence(
    (time, note) => {
      if (note) {
        getBassSynth().triggerAttackRelease(note, "16n", time);
      }
    },
    BASS_PATTERN,
    "16n",
  );

  // bassSeq = new Tone.Sequence(
  //   (time, note) => {
  //     if (note) {
  //       getBassSynth().triggerAttackRelease(note, "8n", time);
  //     }
  //   },
  //   BASS_PATTERN,
  //   "8n",
  // );

  synthSeq = new Tone.Sequence(
    (time, chord) => {
      if (chord) {
        getSynth().triggerAttackRelease(chord, "16n", time, 0.7);
      }
    },
    SYNTH_PATTERN,
    "16n",
  );

  drumKickSeq = new Tone.Sequence(
    (time, hit) => {
      if (hit) {
        const vel = 0.8 + Math.random() * 0.15;
        triggerDrum('kick', time, vel);
      }
    },
    DRUMM_KICK_PATTERNS,
    "16n",
  );

  drumRumbleSeq = new Tone.Sequence(
    (time, hit) => {
      if (hit) {
        triggerDrum('rumble', time, 0.7);
      }
    },
    DRUMM_RUMBLE_PATTERNS,
    "16n",
  );

  drumHihatSeq = new Tone.Sequence(
    (time, hit) => {
      if (hit) {
        triggerDrum('hihat', time, 0.6);
      }
    },
    DRUMM_HIHAT_PATTERNS,
    "16n",
  );

  drumHihat2Seq = new Tone.Sequence(
    (time, hit) => {
      if (hit) {
        triggerDrum('hihat2', time, 0.5);
      }
    },
    DRUMM_HIHAT2_PATTERNS,
    "16n",
  );

  drumOpenHatSeq = new Tone.Sequence(
    (time, hit) => {
      if (hit) {
        triggerDrum('openHat', time, 0.6);
      }
    },
    DRUMM_OPENHAT_PATTERNS,
    "16n",
  );

  drumCrashSeq = new Tone.Sequence(
    (time, hit) => {
      if (hit) {
        triggerDrum('crash', time, 0.7);
      }
    },
    DRUMM_CRASH_PATTERNS,
    "16n",
  );


  isStarted = true;
  console.log("Sequencers created");
}

export function startSequencers() {
  if (!isStarted) return;

  bassSeq.start(0);
  // synthSeq.start(0);
  
  drumKickSeq.start(0);
  drumRumbleSeq.start(0);
  drumHihatSeq.start(0);
  drumHihat2Seq.start(0);
  drumOpenHatSeq.start(0);
  drumCrashSeq.start(0);
  
  console.log("All sequencers started");
}

export function stopSequencers() {
  if (!isStarted) return;

  bassSeq.stop();
  synthSeq.stop();
  
  drumKickSeq.stop();
  drumRumbleSeq.stop();
  drumHihatSeq.stop();
  drumHihat2Seq.stop();
  drumOpenHatSeq.stop();
  drumCrashSeq.stop();
  
  console.log("All sequencers stopped");
}

export function isSequencersStarted() {
  return isStarted;
}

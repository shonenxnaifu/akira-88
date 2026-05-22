import * as Tone from "tone";
import { getBassSynth } from "./instruments/bass-hard-industrial.js";
import { getSynth } from "./instruments/synth.js";
import { triggerDrum } from "./instruments/drum.js";

const BASS_PATTERN = ["D1", null, "D1", null, "D1", null, "D1", "D1"];

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

// Ryuji Takeuchi style: Four-on-the-floor with rolling 16th note energy
const DRUM_KICK_PATTERN = [1, 0, 1, 0, 1, 0, 1, 0];
// Off-beat open hi-hats with 16th note variations
const DRUM_HIHAT_PATTERN = [0, 1, 1, 1, 0, 1, 1, 1];

let bassSeq = null;
let synthSeq = null;
let drumKickSeq = null;
let drumHihatSeq = null;
let isStarted = false;

export function createSequencers() {
  if (isStarted) return;

  bassSeq = new Tone.Sequence(
    (time, note) => {
      if (note) {
        getBassSynth().triggerAttackRelease(note, "8n", time);
      }
    },
    BASS_PATTERN,
    "8n",
  );

  synthSeq = new Tone.Sequence(
    (time, chord) => {
      if (chord) {
        getSynth().triggerAttackRelease(chord, "8n", time, 0.7);
      }
    },
    SYNTH_PATTERN,
    "8n",
  );

  drumKickSeq = new Tone.Sequence(
    (time, hit) => {
      if (hit) {
        // Vary velocity for more human feel
        const vel = 0.7 + Math.random() * 0.2;
        triggerDrum('kick', time, vel);
      }
    },
    DRUM_KICK_PATTERN,
    "8n",
  );

  drumHihatSeq = new Tone.Sequence(
    (time, hit) => {
      if (hit) {
        // Off-beat hats slightly quieter
        triggerDrum('hihat', time, 0.5);
      }
    },
    DRUM_HIHAT_PATTERN,
    "8n",
  );

  isStarted = true;
  console.log("Sequencers created");
}

export function startSequencers() {
  if (!isStarted) return;

  // bassSeq.start(0);
  // synthSeq.start(0);
  drumKickSeq.start(0);
  drumHihatSeq.start(0);
  console.log("All sequencers started");
}

export function stopSequencers() {
  if (!isStarted) return;

  bassSeq.stop();
  synthSeq.stop();
  drumKickSeq.stop();
  drumHihatSeq.stop();
  console.log("All sequencers stopped");
}

export function isSequencersStarted() {
  return isStarted;
}

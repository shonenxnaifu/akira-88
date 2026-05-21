import * as Tone from "tone";
import { getBassSynth } from "./instruments/bass-hard-industrial.js";
import { warn } from "tone/build/esm/core/util/Debug.js";

// DEFAULT
/* const BASS_PATTERN = [
  null, 'G2', 'G2', 'G2',
  null, 'A2', 'G2', 'G2',
  null, 'F#2', 'G2', 'G2',
  null, 'G2', 'F#3', 'G2'
] */

// ACID TECHNO TB-303
// const BASS_PATTERN = ["A2", null, "A2", null, "A2", null, "A2", "B2"];

// ACID TECHNO - DARK
// const BASS_PATTERN = ["F2", null, "F2", "D2", "F2", null, "C3", "F2"];

// ACID TECHNO - PSYCHEDELIC
// const BASS_PATTERN = ["E2", null, null, "G2", "E2", null, "D2", null];

// HARD - INDSUTRIAL
const BASS_PATTERN = ["D1", null, "D1", null, "D1", null, "D1", "D1"];

// HARD - SUBTERROR
// const BASS_PATTERN = ['C1', null, 'C1', null, 'C1', null, 'C1', null];

// HARD - RAW HARDCORE
// const BASS_PATTERN = ["F#2", "F#2", null, "F#2", "D2", null, "F#2", "A2"];

let bassSeq = null;
let isStarted = false;

export function createSequencers() {
  if (isStarted) return;

  // DEFAULT
  /* bassSeq = new Tone.Sequence((time, note) => {
    if (note) {
      getBassSynth().triggerAttackRelease(note, '16n', time);
    }
  }, BASS_PATTERN, '16n'); */

  // ACID TECHNO TB-303
  // ACID TECHNO - DARK ACID
  // ACID TECHNO - PSYCHEDELIC
  // HARD - INDSUTRIAL
  // HARD - SUBTERROR
  // HARD - RAW HARDCORE
  bassSeq = new Tone.Sequence(
    (time, note) => {
      if (note) {
        getBassSynth().triggerAttackRelease(note, "8n", time);
      }
    },
    BASS_PATTERN,
    "8n",
  );

  isStarted = true;
  console.log("Sequencers created");
}

export function startSequencers() {
  if (!isStarted) return;

  bassSeq.start(0);
  console.log("Bass sequencer started");
}

export function stopSequencers() {
  if (!isStarted) return;

  bassSeq.stop();
  console.log("Bass sequencer stopped");
}

export function isSequencersStarted() {
  return isStarted;
}

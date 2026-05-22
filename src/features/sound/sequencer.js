import * as Tone from "tone";
import { getBassSynth } from "./instruments/bass-hard-industrial.js";
import { getSynth } from "./instruments/synth.js";

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

let bassSeq = null;
let synthSeq = null;
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

  isStarted = true;
  console.log("Sequencers created");
}

export function startSequencers() {
  if (!isStarted) return;

  bassSeq.start(0);
  synthSeq.start(0);
  console.log("Bass and synth sequencers started");
}

export function stopSequencers() {
  if (!isStarted) return;

  bassSeq.stop();
  synthSeq.stop();
  console.log("Bass and synth sequencers stopped");
}

export function isSequencersStarted() {
  return isStarted;
}

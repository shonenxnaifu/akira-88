import * as Tone from 'tone';
import { getBassSynth } from './instruments/bass.js';
import { warn } from 'tone/build/esm/core/util/Debug.js';

const BASS_PATTERN = [
  null, 'G2', 'G2', 'G2',
  null, 'A2', 'G2', 'G2',
  null, 'F#2', 'G2', 'G2',
  null, 'G2', 'F#3', 'G2'
]

let bassSeq = null;
let isStarted = false;

export function createSequencers() {
  if (isStarted) return;

  bassSeq = new Tone.Sequence((time, note) => {
    if (note) {
      getBassSynth().triggerAttackRelease(note, '16n', time);
    }
  }, BASS_PATTERN, '16n');

  isStarted = true;
  console.log('Sequencers created');
}

export function startSequencers() {
  if (!isStarted) return;

  bassSeq.start(0);
  console.log('Bass sequencer started');
}

export function stopSequencers() {
  if (!isStarted) return;

  bassSeq.stop();
  console.log('Bass sequencer stopped');
}

export function isSequencersStarted() {
  return isStarted;
}

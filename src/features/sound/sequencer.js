import * as Tone from 'tone';
import { getBassSynth } from './instruments/bass.js';

const BASS_PATTERN = ['D1', null, 'D1', null, 'D1', null, 'D1', null];

let bassSeq = null;
let isStarted = false;

export function createSequencers() {
  if (isStarted) return;

  bassSeq = new Tone.Sequence((time, note) => {
    if (note) {
      getBassSynth().triggerAttackRelease(note, '8n', time);
    }
  }, BASS_PATTERN, '8n');

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

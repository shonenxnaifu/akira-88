import { initAudio, startTransport, stopTransport, setBPM, setMasterVolume, isAudioInitialized } from './engine.js';
import { createBass, updateBassParams, setBassVolume, setBassMute, isBassCreated } from './instruments/bass-acid-psychedelic.js';
import { createSynth, updateSynthParams, setSynthVolume, setSynthMute, isSynthCreated } from './instruments/synth.js';
import { createDrum, updateDrumParams, setDrumVolume, setDrumMute, isDrumCreated } from './instruments/drum.js';
import { createSequencers, startSequencers, stopSequencers, isSequencersStarted } from './sequencer.js';

export {
  initAudio,
  startTransport,
  stopTransport,
  setBPM,
  setMasterVolume,
  isAudioInitialized,
  createBass,
  updateBassParams,
  setBassVolume,
  setBassMute,
  isBassCreated,
  createSynth,
  updateSynthParams,
  setSynthVolume,
  setSynthMute,
  isSynthCreated,
  createDrum,
  updateDrumParams,
  setDrumVolume,
  setDrumMute,
  isDrumCreated,
  createSequencers,
  startSequencers,
  stopSequencers,
  isSequencersStarted
};

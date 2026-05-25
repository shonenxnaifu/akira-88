import { initAudio, startTransport, pauseTransport, setBPM, setMasterVolume, isAudioInitialized } from './engine.js';
import { createBass, updateBassParams, setBassVolume, setBassMute, isBassCreated } from './instruments/bass.js';
import { createSynth, updateSynthParams, setSynthVolume, setSynthMute, isSynthCreated } from './instruments/synth.js';
import { createDrum, updateDrumParams, setDrumVolume, setDrumMute, isDrumCreated } from './instruments/drum.js';
import { createSequencers, startSequencers, pauseSequencers, isSequencersStarted } from './sequencer.js';

export {
  initAudio,
  startTransport,
  pauseTransport,
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
  pauseSequencers,
  isSequencersStarted
};

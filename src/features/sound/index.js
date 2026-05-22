import { initAudio, startTransport, stopTransport, setBPM, setMasterVolume, isAudioInitialized } from './engine.js';
import { createBass, updateBassParams, setBassVolume, setBassMute, isBassCreated } from './instruments/bass-hard-industrial.js';
import { createSynth, updateSynthParams, setSynthVolume, setSynthMute, isSynthCreated } from './instruments/synth.js';
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
  createSequencers,
  startSequencers,
  stopSequencers,
  isSequencersStarted
};

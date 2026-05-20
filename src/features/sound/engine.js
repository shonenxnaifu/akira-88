import * as Tone from 'tone';

let masterVolume = null;
let isInitialized = false;

export async function initAudio() {
  if (isInitialized) return;

  await Tone.start();
  console.log('Audio context unlocked');

  masterVolume = new Tone.Volume(0);
  masterVolume.toDestination();

  isInitialized = true;
  console.log('Master audio engine initialized');
}

export function startTransport(bpm = 120) {
  if (!isInitialized) return;

  Tone.Transport.bpm.value = bpm;
  Tone.Transport.start();
  console.log('Transport started at', bpm, 'BPM');
}

export function stopTransport() {
  if (!isInitialized) return;

  Tone.Transport.stop();
  console.log('Transport stopped');
}

export function setBPM(bpm) {
  if (!isInitialized) return;

  Tone.Transport.bpm.value = bpm;
}

export function setMasterVolume(value) {
  if (!masterVolume) return;

  const db = value > 0 ? 20 * Math.log10(value) : -Infinity;
  masterVolume.volume.value = db;
}

export function getMasterVolume() {
  return masterVolume;
}

export function isAudioInitialized() {
  return isInitialized;
}

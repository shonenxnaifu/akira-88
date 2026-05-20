export const appState = {
  isPlaying: false,
  selectedElement: null,
  bpm: 120,
  masterVolume: 1.0,
  elements: {
    bass: { active: false, volume: 1.0, muted: false },
    synth: { active: false, volume: 1.0, muted: false },
    drum: { active: false, volume: 1.0, muted: false }
  },
  randomizeMode: false,
  parameters: {
    pitch: 0,
    filter: 0,
    rhythm: 0
  },
  handAngles: {
    left: null,
    right: null
  }
};

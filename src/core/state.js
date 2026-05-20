export const appState = {
  isPlaying: false,
  selectedElement: null,
  bpm: 120,
  masterVolume: 1.0,
  audioInitialized: false,
  elements: {
    bass: { active: false, volume: 1.0, muted: false },
    synth: { active: false, volume: 1.0, muted: false },
    drum: { active: false, volume: 1.0, muted: false }
  },
  randomizeMode: false,
  parameters: {
    bass: { pitch: 0, filter: 0, resonance: 0 },
    synth: { detune: 0, filter: 0, lfoRate: 0 },
    drum: { decay: 0, velocity: 0, noiseFilter: 0 }
  },
  handAngles: {
    left: null,
    right: null
  }
};

export const appState = {
  isPlaying: false,
  selectedElement: null,
  bpm: 120,
  masterVolume: 1.0,
  audioInitialized: false,
  editState: false,
  elements: {
    bass: { active: false, volume: 1.0, muted: false },
    synth: { active: false, volume: 1.0, muted: false },
    drum: { active: false, volume: 1.0, muted: false }
  },
  randomizeMode: false,
  parameters: {
    bass: { delay: 0, filter: 0, resonance: 0 },
    synth: { detune: 0, filter: 0, lfoRate: 0 },
    drum: { decay: 0, velocity: 0, noiseFilter: 0 }
  },
  handAngles: {
    left: null,
    right: null
  },
  animationInitialized: false,
  currentEffect: null,
  animationIntensity: 0,
  handMovementSpeed: 0,
  lastHandPosition: {
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  },
  handPositions: {
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  }
};

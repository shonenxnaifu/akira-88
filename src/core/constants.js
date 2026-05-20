export const BPM_MIN = 60;
export const BPM_MAX = 220;
export const BPM_DEFAULT = 120;

export const ELEMENTS = ['bass', 'synth', 'drum'];

export const COLORS = {
  bass: '#FF6B35',
  synth: '#B849E8',
  drum: '#FFD700'
};

export const GESTURES = {
  SELECT_BASS: 'select_bass',
  SELECT_SYNTH: 'select_synth',
  SELECT_DRUM: 'select_drum',
  MUTE_TOGGLE: 'mute_toggle',
  RANDOMIZE_MODE: 'randomize_mode',
  NONE: 'none'
};

export const GESTURE_CONFIG = {
  DEBOUNCE_MS: 500,
  RANDOMIZE_DISTANCE_MIN: 0.1,
  RANDOMIZE_DISTANCE_MAX: 0.6
};

export const SOUND_CONFIG = {
  BASS_NOTES: [65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81],
  BASS_FILTER_MIN: 200,
  BASS_FILTER_MAX: 800,
  BASS_RESONANCE_MAX: 20,
  SYNTH_DETUNE_MAX: 20,
  SYNTH_FILTER_MIN: 500,
  SYNTH_FILTER_MAX: 5000,
  SYNTH_LFO_MIN: 0.1,
  SYNTH_LFO_MAX: 10,
  DRUM_DECAY_MIN: 0.1,
  DRUM_DECAY_MAX: 1.0,
  DRUM_VELOCITY_MIN: 0.5,
  DRUM_VELOCITY_MAX: 1.0,
  DRUM_NOISE_MIN: 1000,
  DRUM_NOISE_MAX: 8000,
  SEQUENCE_LENGTH: 8
};

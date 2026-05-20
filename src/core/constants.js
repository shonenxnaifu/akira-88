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

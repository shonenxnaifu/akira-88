import { countExtendedFingers, countFourFingers, isFingerExtended, calculateHandRotation, calculateHandDistance, isPalmFacingCamera } from './hooks.js';

const ROTATION_THRESHOLD = 0.3;
const RANDOMIZE_DISTANCE_MIN = 0.1;
const RANDOMIZE_DISTANCE_MAX = 0.6;

export function detectElementSelection(hand, handedness) {
  if (handedness !== 'Right') return null;

  const fingerCount = countFourFingers(hand);
  const indexExtended = isFingerExtended(hand, 'index');
  const middleExtended = isFingerExtended(hand, 'middle');
  const ringExtended = isFingerExtended(hand, 'ring');

  console.log(`[Gesture Debug] Right hand - FourFingers: ${fingerCount}, Index: ${indexExtended}, Middle: ${middleExtended}, Ring: ${ringExtended}`);

  if (fingerCount === 1 && indexExtended) {
    console.log('[Gesture Debug] MATCH: select_bass');
    return 'select_bass';
  }

  if (fingerCount === 2 && indexExtended && middleExtended) {
    console.log('[Gesture Debug] MATCH: select_synth');
    return 'select_synth';
  }

  if (fingerCount === 3 && indexExtended && middleExtended && ringExtended) {
    console.log('[Gesture Debug] MATCH: select_drum');
    return 'select_drum';
  }

  console.log('[Gesture Debug] No match, returning null');
  return null;
}

export function detectPlayStop(hand, handedness) {
  if (handedness !== 'Left') return null;

  const thumbExtended = isFingerExtended(hand, 'thumb');
  const indexExtended = isFingerExtended(hand, 'index');
  const middleExtended = isFingerExtended(hand, 'middle');
  const ringExtended = isFingerExtended(hand, 'ring');
  const pinkyExtended = isFingerExtended(hand, 'pinky');

  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'play_stop';
  }

  return null;
}

export function detectMuteToggle(hand, handedness) {
  if (handedness !== 'Right') return null;

  const fingerCount = countExtendedFingers(hand);

  if (fingerCount === 0) {
    return 'mute_toggle';
  }

  return null;
}

export function detectVolumeRotation(hand, handedness, prevAngle) {
  if (handedness !== 'Left') return null;

  if (prevAngle === null || prevAngle === undefined) return null;

  const currentAngle = calculateHandRotation(hand);
  const diff = currentAngle - prevAngle;

  if (diff > ROTATION_THRESHOLD) {
    return 'volume_up';
  }

  if (diff < -ROTATION_THRESHOLD) {
    return 'volume_down';
  }

  return null;
}

export function detectRandomizeMode(leftHand, rightHand) {
  if (!leftHand || !rightHand) return false;

  const leftFingers = countExtendedFingers(leftHand);
  const rightFingers = countExtendedFingers(rightHand);

  if (leftFingers >= 4 && rightFingers >= 4) {
    return true;
  }

  return false;
}

export function calculateRandomizeParams(leftHand, rightHand) {
  const leftRotation = calculateHandRotation(leftHand);
  const rightRotation = calculateHandRotation(rightHand);
  const handDistance = calculateHandDistance(leftHand, rightHand);

  const pitch = Math.max(-1, Math.min(1, leftRotation / Math.PI));
  const filter = Math.max(0, Math.min(1, (handDistance - RANDOMIZE_DISTANCE_MIN) / (RANDOMIZE_DISTANCE_MAX - RANDOMIZE_DISTANCE_MIN)));
  const rhythm = Math.max(-1, Math.min(1, rightRotation / Math.PI));

  return { pitch, filter, rhythm };
}

export function recognizeGesture(results, prevState) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return { gesture: 'none', params: null };
  }

  const landmarks = results.multiHandLandmarks;
  const handednessList = results.multiHandedness.map((h) => {
    return h.label === 'Left' ? 'Right' : 'Left';
  });

  let leftHand = null;
  let rightHand = null;

  for (let i = 0; i < landmarks.length; i++) {
    if (handednessList[i] === 'Left') {
      leftHand = landmarks[i];
    } else if (handednessList[i] === 'Right') {
      rightHand = landmarks[i];
    }
  }

  const inRandomizeMode = detectRandomizeMode(leftHand, rightHand);

  if (inRandomizeMode && prevState.selectedElement && prevState.isPlaying) {
    const params = calculateRandomizeParams(leftHand, rightHand);
    return { gesture: 'randomize_mode', params };
  }

  if (rightHand) {
    const selection = detectElementSelection(rightHand, 'Right');
    if (selection) {
      console.log('[recognizeGesture] Detected:', selection);
      return { gesture: selection, params: null };
    }

    const mute = detectMuteToggle(rightHand, 'Right');
    if (mute) return { gesture: mute, params: null };
  }

  if (leftHand) {
    const playStop = detectPlayStop(leftHand, 'Left');
    if (playStop) return { gesture: playStop, params: null };

    const prevLeftAngle = prevState.handAngles?.left ?? null;
    const volume = detectVolumeRotation(leftHand, 'Left', prevLeftAngle);
    if (volume) return { gesture: volume, params: null };
  }

  return { gesture: 'none', params: null };
}

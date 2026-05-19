# Phase 2: Gesture Detection - Implementation Plan

## Overview
- **Version**: 0.0.1
- **Duration**: 4-6 hours
- **Goal**: Implement MediaPipe Hands detection, webcam setup, and all gesture recognition logic
- **Prerequisites**: Phase 1 completed

---

## 1. MediaPipe Hands Setup (detector.js)

**`createHandsInstance(options)`** - Initialize MediaPipe with `modelComplexity: 1`, `maxNumHands: 2`, `minDetectionConfidence: 0.7`

**`startWebcam(videoElement, handsInstance)`** - Start camera stream (640x480, front-facing)

**`initDetector(videoElement, onGestureDetected)`** - Public API entry point, returns cleanup function

---

## 2. Hand Landmark Processing (hooks.js)

**`isFingerExtended(landmarks, fingerName)`** - Check if finger extended via fingertip vs PIP y-coordinate

**`countExtendedFingers(landmarks)`** - Count total extended fingers (0-5)

**`getHandedness(results)`** - Get 'Left'/'Right' from MediaPipe classification

**`calculateHandRotation(landmarks)`** - Angle using wrist → index MCP → index tip (-π to π)

**`calculateHandDistance(landmarks1, landmarks2)`** - Euclidean distance between hand centroids

**`isPalmFacingCamera(landmarks)`** - Depth comparison of wrist vs MCP joints

**`arePalmsFacingEachOther(left, right)`** - Crystal ball pose detection

**`getHandCentroid(landmarks)`** - Center point of all landmarks

---

## 3. Gesture Recognition (gestures.js)

**`detectElementSelection(hand, handedness)`** - Right hand: index→bass, thumb→synth, index+thumb→drum

**`detectPlayStop(hand, handedness)`** - Left hand: all 5 fingers + palm facing camera

**`detectMuteToggle(hand, handedness)`** - Right hand: closed fist (0 fingers)

**`detectVolumeRotation(hand, prevAngle)`** - Left hand rotation direction (>0.3 rad threshold)

**`detectRandomizeMode(left, right)`** - Both hands open (≥4 fingers), palms facing each other

**`calculateRandomizeParams(left, right)`** - Pitch (left rotation), Filter (hand distance), Rhythm (right rotation)

**`recognizeGesture(results, prevState)`** - Main entry with priority: randomize > selection > controls

---

## 4. Feature Public API (index.js)

**`initGesture(videoElement, callbacks)`** - Init detector, start webcam, returns cleanup

**`getHandLandmarks()`** - Debug access to current landmarks

---

## 5. Integration (main.js)

**`init()`** - Import and call `initGesture()`

**`handleGestureDetected(gesture)`** - Update appState based on gesture type

**`handleParamsDetected(params)`** - Update randomize parameters

**`startWebcam()`** - Replace placeholder with gesture init

---

## 6. UI Integration (feedback.js)

**`updateGestureFeedback(gestureName)`** - Update gesture feedback text

**`updateParameterDisplay(params)`** - Show/hide and update pitch/filter/rhythm values

---

## 7. State & Constants Additions

- `lastGesture` - Track previous gesture for debounce
- `gestureHistory` - Recent gestures for smoothing
- `handAngles` - Previous angles for rotation detection
- `GESTURE_DEBOUNCE_MS: 500`
- `ROTATION_THRESHOLD: 0.3` radians
- `RANDOMIZE_DISTANCE_MIN: 0.1`, `MAX: 0.6`

---

## 8. Task/Todo List

### Setup & Detection
- [ ] Install and import MediaPipe Hands dependencies
- [ ] Create `detector.js` with Hands initialization
- [ ] Implement webcam stream setup
- [ ] Test webcam permission and video feed

### Hand Processing (hooks.js)
- [ ] Implement `isFingerExtended()` for all 5 fingers
- [ ] Implement `countExtendedFingers()`
- [ ] Implement `getHandedness()` from MediaPipe results
- [ ] Implement `calculateHandRotation()` using wrist-index-tip angle
- [ ] Implement `calculateHandDistance()` between hand centroids
- [ ] Implement `isPalmFacingCamera()` using depth comparison
- [ ] Implement `arePalmsFacingEachOther()` for crystal ball pose
- [ ] Implement `getHandCentroid()` for position tracking

### Gesture Recognition (gestures.js)
- [ ] Implement `detectElementSelection()` - bass, synth, drum
- [ ] Implement `detectPlayStop()` - left hand open palm
- [ ] Implement `detectMuteToggle()` - right hand fist
- [ ] Implement `detectVolumeRotation()` - left hand rotation direction
- [ ] Implement `detectRandomizeMode()` - crystal ball pose
- [ ] Implement `calculateRandomizeParams()` - pitch, filter, rhythm
- [ ] Implement `recognizeGesture()` - main entry with priority logic

### Integration
- [ ] Update `index.js` with full public API
- [ ] Update `main.js` to import and initialize gesture feature
- [ ] Create `handleGestureDetected()` in main.js
- [ ] Create `handleParamsDetected()` in main.js
- [ ] Implement `updateGestureFeedback()` in UI feature
- [ ] Implement `updateParameterDisplay()` in UI feature
- [ ] Add gesture debouncing logic
- [ ] Add state tracking for previous angles

### Testing
- [ ] Test webcam starts correctly
- [ ] Test single hand detection
- [ ] Test two-hand detection
- [ ] Test all 9 gesture types
- [ ] Test randomize mode continuous parameters
- [ ] Test gesture priority (randomize > others)
- [ ] Test debounce behavior
- [ ] Test edge cases (no hands, hand leaving frame)

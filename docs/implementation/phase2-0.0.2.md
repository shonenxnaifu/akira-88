# Phase 2: Gesture Detection - Implementation Plan

## Overview
- **Version**: 0.0.2
- **Duration**: 4-6 hours
- **Goal**: Implement MediaPipe Hands detection, webcam setup, hand landmark processing, and real-time camera feed via PixiJS
- **Prerequisites**: Phase 1 completed
- **Status**: Partially completed (camera feed + hand detection working, gesture recognition pending)

---

## 1. MediaPipe Hands Setup (detector.js)

**`createHandsInstance(onResults)`** - Initialize MediaPipe Hands with `modelComplexity: 1`, `maxNumHands: 2`, `minDetectionConfidence: 0.5`, `minTrackingConfidence: 0.5`. Uses jsDelivr CDN for model files.

**`startWebcam(videoElement, handsInstance)`** - Start camera stream via MediaPipe Camera utility (640x480, front-facing). Sends each frame to Hands for detection.

**`initDetector(videoElement, onResults)`** - Public API entry point. Creates Hands instance and starts webcam. Returns promise.

---

## 2. Hand Landmark Processing (hooks.js)

**`isFingerExtended(landmarks, fingerName)`** - Check if finger extended. Thumb uses distance comparison (tip-to-cmp vs ip-to-cmp). Other fingers use `tip.y < pip.y` (y=0 is top of screen).

**`countExtendedFingers(landmarks)`** - Count total extended fingers (0-5) by iterating all finger names.

**`getHandedness(results)`** - Extract hand label ('Left'/'Right') and confidence score from MediaPipe results.

**`calculateHandRotation(landmarks)`** - Angle using `atan2()` from index MCP to index tip (-π to π).

**`calculateHandDistance(landmarks1, landmarks2)`** - Euclidean distance between two hand centroids using `Math.hypot()`.

**`isPalmFacingCamera(landmarks)`** - Depth comparison: `wrist.z > middleMcp.z` means palm faces camera.

**`arePalmsFacingEachOther(left, right)`** - Checks if left hand centroid x is less than right hand centroid x.

**`getHandCentroid(landmarks)`** - Average of all landmark x,y coordinates.

---

## 3. Camera Feed via PixiJS (animation/renderer.js)

**`initAnimation(videoEl)`** - Create PixiJS Application, append canvas to `#animation-container`. On video `playing` event, create mirrored sprite (`scale.x = -1`) and add to stage.

**`fitVideoToScreen()`** - Calculate scale to cover screen while maintaining aspect ratio. Centers sprite on screen.

**`handleResize()`** - Recalculate fit on window resize.

**`updateVideoTexture()`** - Called every frame via PixiJS ticker to refresh video texture.

---

## 4. Feature Public API (index.js)

**`initGesture(videoElement, callbacks)`** - Initialize detector, start webcam. Accepts `{onReady, onError, onResults}` callbacks. Returns cleanup function.

**`getHandLandmarks()`** - Returns `{landmarks, handedness}` for current frame.

**`getLastResults()`** - Returns raw MediaPipe results for debugging.

**Re-exports**: `countExtendedFingers`, `getHandedness`, `getHandCentroid`, `calculateHandRotation`, `calculateHandDistance`

---

## 5. Integration (main.js)

**`init()`** - Application bootstrap. Calls `setupEventListeners()` and `startWebcam()`.

**`startWebcam()`** - Initializes PixiJS animation with video element, sets up ticker for texture updates, initializes gesture detection with callbacks.

**`startHandDetectionLoop()`** - Debug loop (every 2s) logging hand count, confidence, finger count, position, rotation, and inter-hand distance.

---

## 6. Not Yet Implemented (Deferred)

### Gesture Recognition (gestures.js)
All functions deferred to next iteration:
- `detectElementSelection()` - bass, synth, drum
- `detectPlayStop()` - left hand open palm
- `detectMuteToggle()` - right hand fist
- `detectVolumeRotation()` - left hand rotation direction
- `detectRandomizeMode()` - crystal ball pose
- `calculateRandomizeParams()` - pitch, filter, rhythm
- `recognizeGesture()` - main entry with priority logic

### UI Integration (feedback.js)
- `updateGestureFeedback()` - not yet implemented
- `updateParameterDisplay()` - not yet implemented

### State & Constants Additions
- `lastGesture`, `gestureHistory`, `handAngles` - not yet added
- `GESTURE_DEBOUNCE_MS`, `ROTATION_THRESHOLD`, `RANDOMIZE_DISTANCE_MIN/MAX` - not yet added

---

## 7. Verification Steps

### 7.1 Webcam Test
- [x] Webcam starts on page load
- [x] Video element receives stream
- [x] No permission errors
- [x] Camera feed displays as mirrored view via PixiJS
- [x] Video fits screen with correct aspect ratio (no stretching)

### 7.2 Hand Detection Test
- [x] Show one hand → landmarks detected, console logs finger count, position, rotation
- [x] Show two hands → both detected, console logs distance between hands
- [x] No hands → "No hands detected" message

### 7.3 Gesture Tests (Deferred)
- [ ] Right hand index only → "Select Bass" feedback
- [ ] Right hand thumb only → "Select Synth" feedback
- [ ] Right hand index + thumb → "Select Drum" feedback
- [ ] Left hand open palm → "Play/Stop" feedback
- [ ] Right hand fist → "Mute Toggle" feedback
- [ ] Left hand rotation → Volume up/down feedback
- [ ] Both hands crystal ball → "Randomize Mode" feedback
- [ ] Parameter display shows values in randomize mode

### 7.4 Edge Cases (Deferred)
- [ ] No hands → "No gesture detected"
- [ ] Hand leaves frame → state persists
- [ ] Rapid gestures → debounced correctly
- [ ] Randomize mode priority over other gestures

---

## 8. Deliverables Checklist

- [x] MediaPipe Hands initialized with correct settings
- [x] Webcam stream working
- [x] Hand landmark processing functions implemented (hooks.js)
- [ ] All gesture detection functions working (deferred)
- [x] Hand rotation and distance calculations accurate
- [ ] Randomize mode with continuous parameters (deferred)
- [ ] Gesture feedback UI updating in real-time (deferred)
- [ ] Parameter display showing values during randomize (deferred)
- [ ] Gesture debouncing implemented (deferred)
- [x] Real-time camera feed via PixiJS (mirrored, aspect-ratio fitted)
- [x] All edge cases handled (detection level)

---

## 9. Task/Todo List

### Setup & Detection
- [x] Install and import MediaPipe Hands dependencies
- [x] Create `detector.js` with Hands initialization
- [x] Implement webcam stream setup
- [x] Test webcam permission and video feed

### Hand Processing (hooks.js)
- [x] Implement `isFingerExtended()` for all 5 fingers
- [x] Implement `countExtendedFingers()`
- [x] Implement `getHandedness()` from MediaPipe results
- [x] Implement `calculateHandRotation()` using wrist-index-tip angle
- [x] Implement `calculateHandDistance()` between hand centroids
- [x] Implement `isPalmFacingCamera()` using depth comparison
- [x] Implement `arePalmsFacingEachOther()` for crystal ball pose
- [x] Implement `getHandCentroid()` for position tracking

### Camera Feed (animation/renderer.js)
- [x] Initialize PixiJS Application
- [x] Create video sprite from webcam element
- [x] Mirror video display (`scale.x = -1`)
- [x] Fit video to screen with correct aspect ratio
- [x] Handle window resize
- [x] Update texture every frame via ticker

### Gesture Recognition (gestures.js) - DEFERRED
- [ ] Implement `detectElementSelection()` - bass, synth, drum
- [ ] Implement `detectPlayStop()` - left hand open palm
- [ ] Implement `detectMuteToggle()` - right hand fist
- [ ] Implement `detectVolumeRotation()` - left hand rotation direction
- [ ] Implement `detectRandomizeMode()` - crystal ball pose
- [ ] Implement `calculateRandomizeParams()` - pitch, filter, rhythm
- [ ] Implement `recognizeGesture()` - main entry with priority logic

### Integration - PARTIALLY DONE
- [x] Update `index.js` with full public API
- [x] Update `main.js` to import and initialize gesture feature
- [ ] Create `handleGestureDetected()` in main.js
- [ ] Create `handleParamsDetected()` in main.js
- [ ] Implement `updateGestureFeedback()` in UI feature
- [ ] Implement `updateParameterDisplay()` in UI feature
- [ ] Add gesture debouncing logic
- [ ] Add state tracking for previous angles

### Testing
- [x] Test webcam starts correctly
- [x] Test single hand detection
- [x] Test two-hand detection
- [ ] Test all 9 gesture types
- [ ] Test randomize mode continuous parameters
- [ ] Test gesture priority (randomize > others)
- [ ] Test debounce behavior
- [ ] Test edge cases (no hands, hand leaving frame)

---

## 10. Changelog (v0.0.1 → v0.0.2)

### Added
- **Camera feed via PixiJS**: Real-time webcam display using PixiJS sprite with mirror effect (`scale.x = -1`) and aspect-ratio-preserving screen fit
- **Video texture updates**: PixiJS ticker calls `updateVideoTexture()` every frame
- **`fitVideoToScreen()`**: Calculates proper scale to cover screen without stretching
- **`getLastResults()`**: Debug access to raw MediaPipe results
- **Enhanced debug logging**: Frame-counted console output with confidence scores, finger counts, positions, rotations, and inter-hand distance
- **Video event listeners**: `loadeddata` and `playing` events for reliable sprite creation

### Changed
- **`minDetectionConfidence`**: Lowered from 0.7 to 0.5 for easier initial detection
- **`isFingerExtended()`**: Simplified non-thumb logic to `tip.y < pip.y` (was comparing pip.y < mcp.y too)
- **`isPalmFacingCamera()`**: Reversed z-comparison from `wrist.z < middleMcp.z` to `wrist.z > middleMcp.z`
- **`arePalmsFacingEachOther()`**: Changed from depth-based to position-based (left.x < right.x)
- **Video event**: Changed from `play` to `playing` for more reliable sprite creation timing
- **Debug loop interval**: Changed from 1s to 2s with frame counter and throttled "no hands" messages

### Removed
- **`clamp` import from hooks.js**: No longer needed after simplifying finger detection logic

### Deferred to Next Iteration
- All gesture recognition logic (gestures.js)
- UI feedback integration (feedback.js)
- State additions (debounce, gesture history, hand angles)
- Constants additions (GESTURE_DEBOUNCE_MS, ROTATION_THRESHOLD, etc.)

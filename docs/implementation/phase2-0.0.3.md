# Phase 2: Gesture Detection - Implementation Plan

## Overview
- **Version**: 0.0.3
- **Duration**: 4-6 hours
- **Goal**: Implement MediaPipe Hands detection, webcam setup, hand landmark processing, real-time camera feed, and full gesture recognition with UI feedback
- **Prerequisites**: Phase 1 completed
- **Status**: Partially completed (camera feed + hand detection + landmark visualization + gesture recognition + UI feedback working, volume/randomize pending full testing)

---

## 1. MediaPipe Hands Setup (detector.js)

**`createHandsInstance(onResults)`** - Initialize MediaPipe Hands with `modelComplexity: 1`, `maxNumHands: 2`, `minDetectionConfidence: 0.5`, `minTrackingConfidence: 0.5`. Uses jsDelivr CDN for model files.

**`startWebcam(videoElement, handsInstance)`** - Start camera stream via MediaPipe Camera utility (640x480, front-facing). Sends each frame to Hands for detection.

**`initDetector(videoElement, onResults)`** - Public API entry point. Creates Hands instance and starts webcam. Returns promise.

---

## 2. Hand Landmark Processing (hooks.js)

**`isFingerExtended(landmarks, fingerName)`** - Thumb uses distance comparison (tip-to-mcp vs ip-to-mcp with 1.5x threshold). Other fingers use `tip.y < pip.y` (y=0 is top of screen).

**`countExtendedFingers(landmarks)`** - Count all 5 fingers (0-5).

**`countFourFingers(landmarks)`** - Count only index/middle/ring/pinky (excludes thumb). Used for element selection gestures.

**`getHandedness(results)`** - Extract hand label ('Left'/'Right') and confidence score from MediaPipe results.

**`calculateHandRotation(landmarks)`** - Angle using `atan2()` from index MCP to index tip (-π to π).

**`calculateHandDistance(landmarks1, landmarks2)`** - Euclidean distance between two hand centroids using `Math.hypot()`.

**`isPalmFacingCamera(landmarks)`** - Depth comparison: `wrist.z > middleMcp.z` means palm faces camera.

**`arePalmsFacingEachOther(left, right)`** - Checks if left hand centroid x is less than right hand centroid x.

**`getHandCentroid(landmarks)`** - Average of all landmark x,y coordinates.

---

## 3. Camera Feed via PixiJS (animation/renderer.js)

**`initAnimation(videoEl)`** - Create PixiJS Application, append canvas to `#animation-container`. On video `playing` event, create mirrored sprite (`scale.x = -1`) and add to stage. Create `PIXI.Graphics` overlay for landmark drawing.

**`fitVideoToScreen()`** - Calculate scale to cover screen while maintaining aspect ratio. Centers sprite on screen.

**`handleResize()`** - Recalculate fit on window resize.

**`updateVideoTexture()`** - Called every frame via PixiJS ticker to refresh video texture.

**`drawHandLandmarks(landmarks, handedness)`** - Clear graphics overlay, draw skeleton lines (purple #DB69D2) and landmark dots (black) for each detected hand. Converts normalized coordinates (0-1) to screen coordinates, accounts for mirror effect. Draws at MediaPipe native frame rate (~30fps) via onResults callback.

**`clearHandLandmarks()`** - Clear the graphics overlay when no hands detected.

---

## 4. Gesture Recognition (gestures.js)

**`detectElementSelection(hand, handedness)`** - Right hand gestures using `countFourFingers()`:
- 1 finger (index) → `select_bass`
- 2 fingers (index + middle) → `select_synth`
- 3 fingers (index + middle + ring) → `select_drum`

**`detectPlayStop(hand, handedness)`** - Left hand, thumb only extended → `play_stop`

**`detectMuteToggle(hand, handedness)`** - Right hand, fist (0 fingers) → `mute_toggle`

**`detectVolumeRotation(hand, handedness, prevAngle)`** - Left hand rotation direction. Compares current angle with previous angle. Threshold: 0.3 radians. Returns `volume_up` or `volume_down`.

**`detectRandomizeMode(leftHand, rightHand)`** - Both hands open (≥4 fingers each) → activates randomize mode.

**`calculateRandomizeParams(leftHand, rightHand)`** - Continuous parameters:
- `pitch`: Left hand rotation (mapped -1 to 1)
- `filter`: Hand distance (mapped 0 to 1, range 0.1-0.6)
- `rhythm`: Right hand rotation (mapped -1 to 1)

**`recognizeGesture(results, prevState)`** - Main entry point. Priority order:
1. Randomize mode (if element selected + playing)
2. Right hand: element selection → mute toggle
3. Left hand: play/stop → volume rotation

---

## 5. Feature Public API (index.js)

**`initGesture(videoElement, callbacks)`** - Initialize detector, start webcam. Accepts `{onReady, onError, onGesture, onResults}` callbacks. Returns cleanup function.

**`updatePrevState(newState)`** - Sync app state with gesture recognizer.

**`getHandLandmarks()`** - Returns `{landmarks, handedness}` for current frame.

**`getLastResults()`** - Returns raw MediaPipe results for debugging.

**Re-exports**: `countExtendedFingers`, `countFourFingers`, `isFingerExtended`, `getHandedness`, `getHandCentroid`, `calculateHandRotation`, `calculateHandDistance`, `recognizeGesture`

---

## 6. Integration (main.js)

**`init()`** - Application bootstrap.

**`startWebcam()`** - Initializes PixiJS animation, sets up ticker, initializes gesture detection with `onGesture` callback.

**`handleGestureDetected(result)`** - Routes recognized gestures to appropriate actions:
- `select_bass/synth/drum` → `selectElement()`
- `play_stop` → `togglePlayStop()`
- `mute_toggle` → `toggleMute()`
- `volume_up/down` → `adjustVolume()`
- `randomize_mode` → update parameters, show display

**`selectElement(element)`** - Sets selected element, marks active, updates UI.

**`togglePlayStop()`** - Toggles `appState.isPlaying`, updates play button.

**`toggleMute()`** - Toggles mute for selected element.

**`adjustVolume(delta)`** - Adjusts volume by delta (clamped 0-1).

**`updateElementStatus()`** - Updates UI panel with active/muted/selected state.

**`updateGestureFeedback(gesture)`** - Shows human-readable gesture text.

**`updateParameterDisplay(params)` / `hideParameterDisplay()`** - Shows/hides pitch/filter/rhythm values.

---

## 7. State & Constants

### Constants (core/constants.js)
- `GESTURE_CONFIG`: `{ DEBOUNCE_MS: 500, ROTATION_THRESHOLD: 0.3, RANDOMIZE_DISTANCE_MIN: 0.1, RANDOMIZE_DISTANCE_MAX: 0.6 }`

### State Tracking (index.js)
- `prevState`: `{ selectedElement, isPlaying, handAngles: { left, right } }`
- `lastGestureTime`, `lastGestureType` for debouncing
- Debounce: 500ms between same gesture triggers

---

## 8. CSS Fixes

**UI Panel z-index**: Increased from 10 to 100 to ensure visibility above PixiJS canvas.

**Animation container z-index**: Decreased from 1 to 0.

**Panel styling**: Added `box-shadow`, thicker border, increased opacity (0.95).

---

## 9. Verification Steps

### 9.1 Webcam Test
- [x] Webcam starts on page load
- [x] Video element receives stream
- [x] No permission errors
- [x] Camera feed displays as mirrored view via PixiJS
- [x] Video fits screen with correct aspect ratio (no stretching)

### 9.2 Hand Detection Test
- [x] Show one hand → landmarks detected, console logs finger count, position, rotation
- [x] Show two hands → both detected, console logs distance between hands
- [x] No hands → "No hands detected" message

### 9.3 Gesture Tests
- [x] Right hand index only → Select Bass (UI updates to "▶ Bass: ON")
- [x] Right hand index + middle → Select Synth
- [x] Right hand index + middle + ring → Select Drum
- [x] Left hand thumb only → Play/Stop toggle
- [x] Right hand fist → Mute Toggle
- [ ] Left hand rotation → Volume up/down
- [ ] Both hands crystal ball → Randomize Mode
- [ ] Parameter display shows values in randomize mode

### 9.4 Edge Cases
- [x] No hands → "No gesture detected"
- [x] Hand leaves frame → state persists
- [x] Rapid gestures → debounced correctly (500ms)
- [ ] Randomize mode priority over other gestures

---

## 10. Deliverables Checklist

- [x] MediaPipe Hands initialized with correct settings
- [x] Webcam stream working
- [x] Hand landmark processing functions implemented (hooks.js)
- [x] Element selection gestures working (bass, synth, drum)
- [x] Play/Stop gesture working (left hand thumb)
- [x] Mute toggle gesture working (right hand fist)
- [x] Hand rotation and distance calculations accurate
- [ ] Randomize mode with continuous parameters (pending testing)
- [x] Gesture feedback UI updating in real-time
- [ ] Parameter display showing values during randomize (pending testing)
- [x] Gesture debouncing implemented (500ms)
- [x] Real-time camera feed via PixiJS (mirrored, aspect-ratio fitted)
- [x] Hand landmark visualization overlay (skeleton lines + joint dots, real-time)
- [x] UI panel visible above camera feed (z-index fix)

---

## 11. Task/Todo List

### Setup & Detection
- [x] Install and import MediaPipe Hands dependencies
- [x] Create `detector.js` with Hands initialization
- [x] Implement webcam stream setup
- [x] Test webcam permission and video feed

### Hand Processing (hooks.js)
- [x] Implement `isFingerExtended()` for all 5 fingers
- [x] Implement `countExtendedFingers()`
- [x] Implement `countFourFingers()` (excludes thumb)
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
- [x] Add `PIXI.Graphics` overlay layer for landmark drawing
- [x] Implement `drawHandLandmarks()` with skeleton lines (purple #DB69D2) and joint dots (black)
- [x] Implement `clearHandLandmarks()` to clear overlay
- [x] Landmark drawing runs at MediaPipe native frame rate (~30fps) via onResults callback
- [x] Test landmark overlay aligns with mirrored video

### Gesture Recognition (gestures.js)
- [x] Implement `detectElementSelection()` - bass (1 finger), synth (2 fingers), drum (3 fingers)
- [x] Implement `detectPlayStop()` - left hand thumb only
- [x] Implement `detectMuteToggle()` - right hand fist
- [x] Implement `detectVolumeRotation()` - left hand rotation direction
- [x] Implement `detectRandomizeMode()` - crystal ball pose
- [x] Implement `calculateRandomizeParams()` - pitch, filter, rhythm
- [x] Implement `recognizeGesture()` - main entry with priority logic

### Integration
- [x] Update `index.js` with full public API including `onGesture` callback
- [x] Update `main.js` to import and initialize gesture feature
- [x] Create `handleGestureDetected()` in main.js
- [x] Implement `updateGestureFeedback()` in main.js
- [x] Implement `updateParameterDisplay()` in main.js
- [x] Implement `updateElementStatus()` in main.js
- [x] Add gesture debouncing logic (500ms)
- [x] Add state tracking for previous angles
- [x] Fix UI panel z-index for visibility
- [x] Fix handedness swap for mirrored camera

### Testing
- [x] Test webcam starts correctly
- [x] Test single hand detection
- [x] Test two-hand detection
- [x] Test element selection gestures (bass, synth, drum)
- [x] Test play/stop gesture
- [x] Test mute toggle gesture
- [ ] Test randomize mode continuous parameters
- [ ] Test gesture priority (randomize > others)
- [x] Test debounce behavior
- [x] Test edge cases (no hands, hand leaving frame)

---

## 12. Changelog (v0.0.2 → v0.0.3)

### Added
- **Full gesture recognition** (`gestures.js`): `detectElementSelection()`, `detectPlayStop()`, `detectMuteToggle()`, `detectVolumeRotation()`, `detectRandomizeMode()`, `calculateRandomizeParams()`, `recognizeGesture()`
- **Gesture handling in main.js**: `handleGestureDetected()`, `selectElement()`, `togglePlayStop()`, `toggleMute()`, `adjustVolume()`, `updateElementStatus()`, `updateGestureFeedback()`, `updateParameterDisplay()`, `hideParameterDisplay()`
- **`countFourFingers()`** in hooks.js - counts only index/middle/ring/pinky for reliable element selection
- **Gesture debouncing** (500ms) in `index.js` to prevent rapid repeated triggers
- **State tracking** (`prevState`, `lastGestureTime`, `lastGestureType`) for gesture recognition context
- **`updatePrevState()`** export for syncing app state with gesture recognizer
- **`GESTURE_CONFIG`** constants: `DEBOUNCE_MS`, `ROTATION_THRESHOLD`, `RANDOMIZE_DISTANCE_MIN/MAX`
- **Debug logging** throughout gesture chain: `[Gesture Debug]`, `[recognizeGesture]`, `[index.js]`, `[handleGestureDetected]`, `[updateElementStatus]`

### Changed
- **`isFingerExtended()` for non-thumb fingers**: Reverted to `tip.y < pip.y` (y-coordinate comparison) for reliability
- **`isFingerExtended()` for thumb**: Uses `tipDist > ipDist * 1.5` threshold for stricter detection
- **Element selection gestures**: Right hand - index only (bass), index+middle (synth), index+middle+ring (drum)
- **Play/Stop gesture**: Left hand thumb only (was: right hand index+middle+thumb)
- **`recognizeGesture()` priority**: Randomize > element selection > mute (right hand) > play/stop > volume (left hand)
- **`drawHandLandmarks()`**: Added handedness swap for mirrored camera display
- **UI panel z-index**: Increased from 10 to 100 for visibility above PixiJS canvas
- **Animation container z-index**: Decreased from 1 to 0

### Fixed
- **Handedness mismatch**: Swapped Left/Right labels in `recognizeGesture()`, `drawHandLandmarks()`, and debug output to account for mirrored front-facing camera
- **Finger counting**: Added `countFourFingers()` to exclude unreliable thumb detection from element selection
- **UI panel visibility**: Fixed z-index stacking so panel appears above camera feed
- **Debounce logic**: Fixed condition to only debounce same gesture type, not block new gestures

### Removed
- **Thumb dependency** from element selection gestures (now uses `countFourFingers()`)

### Pending Testing
- Volume up/down via left hand rotation
- Randomize mode with continuous parameter control
- Randomize mode priority over other gestures
- Parameter display during randomize mode

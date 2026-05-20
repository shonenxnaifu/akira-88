# Phase 2: Gesture Detection - Implementation Plan

## Overview
- **Version**: 0.0.4
- **Duration**: 4-6 hours
- **Goal**: Implement MediaPipe Hands detection, webcam setup, hand landmark processing, real-time camera feed, full gesture recognition, and manual volume control UI
- **Prerequisites**: Phase 1 completed
- **Status**: Completed

---

## Implementation Reference

### 1. MediaPipe Hands Setup (detector.js)

**`createHandsInstance(onResults)`** - Initialize MediaPipe Hands with `modelComplexity: 1`, `maxNumHands: 2`, `minDetectionConfidence: 0.5`, `minTrackingConfidence: 0.5`. Uses jsDelivr CDN for model files.

**`startWebcam(videoElement, handsInstance)`** - Start camera stream via MediaPipe Camera utility (640x480, front-facing). Sends each frame to Hands for detection.

**`initDetector(videoElement, onResults)`** - Public API entry point. Creates Hands instance and starts webcam. Returns promise.

### 2. Hand Landmark Processing (hooks.js)

**`isFingerExtended(landmarks, fingerName)`** - Thumb uses distance comparison (tip-to-mcp vs ip-to-mcp with 1.5x threshold). Other fingers use `tip.y < pip.y` (y=0 is top of screen).

**`countExtendedFingers(landmarks)`** - Count all 5 fingers (0-5).

**`countFourFingers(landmarks)`** - Count only index/middle/ring/pinky (excludes thumb). Used for element selection gestures.

**`getHandedness(results)`** - Extract hand label ('Left'/'Right') and confidence score from MediaPipe results.

**`calculateHandRotation(landmarks)`** - Angle using `atan2()` from index MCP to index tip (-π to π).

**`calculateHandDistance(landmarks1, landmarks2)`** - Euclidean distance between two hand centroids using `Math.hypot()`.

**`isPalmFacingCamera(landmarks)`** - Depth comparison: `wrist.z > middleMcp.z` means palm faces camera.

**`arePalmsFacingEachOther(left, right)`** - Checks if left hand centroid x is less than right hand centroid x.

**`getHandCentroid(landmarks)`** - Average of all landmark x,y coordinates.

### 3. Camera Feed via PixiJS (animation/renderer.js)

**`initAnimation(videoEl)`** - Create PixiJS Application, append canvas to `#animation-container`. On video `playing` event, create mirrored sprite (`scale.x = -1`) and add to stage. Create `PIXI.Graphics` overlay for landmark drawing.

**`fitVideoToScreen()`** - Calculate scale to cover screen while maintaining aspect ratio. Centers sprite on screen.

**`handleResize()`** - Recalculate fit on window resize.

**`updateVideoTexture()`** - Called every frame via PixiJS ticker to refresh video texture.

**`drawHandLandmarks(landmarks, handedness)`** - Clear graphics overlay, draw skeleton lines (purple #DB69D2) and landmark dots (black) for each detected hand. Converts normalized coordinates (0-1) to screen coordinates, accounts for mirror effect. Draws at MediaPipe native frame rate (~30fps) via onResults callback.

**`clearHandLandmarks()`** - Clear the graphics overlay when no hands detected.

### 4. Gesture Recognition (gestures.js)

**`detectElementSelection(hand, handedness)`** - Right hand gestures using `countFourFingers()`:
- 1 finger (index) → `select_bass`
- 2 fingers (index + middle) → `select_synth`
- 3 fingers (index + middle + ring) → `select_drum`

**`detectPlayStop(hand, handedness)`** - Left hand, thumb only extended → `play_stop`

**`detectMuteToggle(hand, handedness)`** - Right hand, fist (0 fingers) → `mute_toggle`

**`detectRandomizeMode(leftHand, rightHand)`** - Both hands open (≥4 fingers each) → activates randomize mode.

**`calculateRandomizeParams(leftHand, rightHand)`** - Continuous parameters:
- `pitch`: Left hand rotation (mapped -1 to 1)
- `filter`: Hand distance (mapped 0 to 1, range 0.1-0.6)
- `rhythm`: Right hand rotation (mapped -1 to 1)

**`recognizeGesture(results, prevState)`** - Main entry point. Priority order:
1. Randomize mode (if element selected + playing)
2. Right hand: element selection → mute toggle
3. Left hand: play/stop

### 5. Feature Public API (index.js)

**`initGesture(videoElement, callbacks)`** - Initialize detector, start webcam. Accepts `{onReady, onError, onGesture, onResults}` callbacks. Returns cleanup function.

**`updatePrevState(newState)`** - Sync app state with gesture recognizer.

**`getHandLandmarks()`** - Returns `{landmarks, handedness}` for current frame.

**`getLastResults()`** - Returns raw MediaPipe results for debugging.

**Re-exports**: `countExtendedFingers`, `countFourFingers`, `isFingerExtended`, `getHandedness`, `getHandCentroid`, `calculateHandRotation`, `calculateHandDistance`, `recognizeGesture`

### 6. Integration (main.js)

**`init()`** - Application bootstrap.

**`startWebcam()`** - Initializes PixiJS animation, sets up ticker, initializes gesture detection with `onGesture` callback.

**`handleGestureDetected(result)`** - Routes recognized gestures to appropriate actions:
- `select_bass/synth/drum` → `selectElement()`
- `play_stop` → `togglePlayStop()`
- `mute_toggle` → `toggleMute()`
- `randomize_mode` → update parameters, show display
- `none` → exit randomize mode, hide parameter display

**`handleMasterVolume(e)`** - Updates `appState.masterVolume` from slider (0-100 → 0-1).

**`handleElementVolume(e)`** - Updates individual element volume from slider.

**`selectElement(element)`** - Sets selected element, marks active, updates UI.

**`togglePlayStop()`** - Toggles `appState.isPlaying`, updates play button.

**`toggleMute()`** - Toggles mute for selected element.

**`updateElementStatus()`** - Updates UI panel with active/muted/selected state.

**`updateGestureFeedback(gesture)`** - Shows human-readable gesture text.

**`updateParameterDisplay(params)` / `hideParameterDisplay()`** - Shows/hides pitch/filter/rhythm values.

### 7. State & Constants

**Constants** (`core/constants.js`)
- `GESTURE_CONFIG`: `{ DEBOUNCE_MS: 500, RANDOMIZE_DISTANCE_MIN: 0.1, RANDOMIZE_DISTANCE_MAX: 0.6 }`

**State** (`core/state.js`)
- `isPlaying`: boolean
- `selectedElement`: 'bass' | 'synth' | 'drum' | null
- `bpm`: number (60-220)
- `masterVolume`: number (0-1)
- `elements`: { bass, synth, drum } each with { active, volume, muted }
- `randomizeMode`: boolean
- `parameters`: { pitch, filter, rhythm }
- `handAngles`: { left, right }

**Internal Tracking** (`index.js`)
- `prevState`: synced from appState for gesture recognition context
- `lastGestureTime`, `lastGestureType`: for debouncing
- Debounce: 500ms between same gesture triggers; randomize mode exempt

### 8. CSS

**UI Panel z-index**: 100 (above PixiJS canvas at z-index 0).

**Panel styling**: Dark background (rgba(22, 33, 62, 0.95)), 2px border, box-shadow, 8px border-radius.

**Volume sliders**: Flex layout, custom thumb (14px circle, orange accent), monospace value display.

---

## Verification & Tracking

### 9. Verification Steps

#### 9.1 Webcam
- [x] Webcam starts on page load
- [x] Video element receives stream
- [x] No permission errors
- [x] Camera feed displays as mirrored view via PixiJS
- [x] Video fits screen with correct aspect ratio (no stretching)

#### 9.2 Hand Detection
- [x] Show one hand → landmarks detected, console logs finger count, position, rotation
- [x] Show two hands → both detected, console logs distance between hands
- [x] No hands → "No hands detected" message

#### 9.3 Gestures
- [x] Right hand index only → UI shows "Select Bass", bass status updates to "ON"
- [x] Right hand index + middle → UI shows "Select Synth", synth status updates
- [x] Right hand index + middle + ring → UI shows "Select Drum", drum status updates
- [x] Left hand thumb only → UI shows "Play/Stop", play button toggles
- [x] Right hand fist → UI shows "Mute Toggle", selected element mutes/unmutes
- [x] Both hands open (crystal ball pose) → UI shows "Randomize Mode", parameter display appears with pitch/filter/rhythm values
- [x] Close one hand from crystal ball pose → parameter display hides, randomize mode exits

#### 9.4 Volume Sliders (Manual UI)
- [x] Master slider: drag left/right, value updates (0-100), `appState.masterVolume` syncs
- [x] Bass slider: drag left/right, value updates independently
- [x] Synth slider: drag left/right, value updates independently
- [x] Drum slider: drag left/right, value updates independently

#### 9.5 Edge Cases
- [x] No hands → gesture feedback shows "No gesture detected"
- [x] Hand leaves frame → state persists (selected element, play state remain)
- [x] Rapid gestures → debounced correctly (500ms, same gesture ignored, different gestures pass)
- [x] Randomize mode priority → when both hands open + element playing, randomize takes precedence over element selection/mute
- [x] Randomize mode exit → when hands leave crystal ball pose, `randomizeMode` set to false, parameter display hides

### 10. Task/Todo List

#### Setup & Detection
- [x] Install and import MediaPipe Hands dependencies
- [x] Create `detector.js` with Hands initialization
- [x] Implement webcam stream setup
- [x] Test webcam permission and video feed

#### Hand Processing (hooks.js)
- [x] Implement `isFingerExtended()` for all 5 fingers
- [x] Implement `countExtendedFingers()`
- [x] Implement `countFourFingers()` (excludes thumb)
- [x] Implement `getHandedness()` from MediaPipe results
- [x] Implement `calculateHandRotation()` using wrist-index-tip angle
- [x] Implement `calculateHandDistance()` between hand centroids
- [x] Implement `isPalmFacingCamera()` using depth comparison
- [x] Implement `arePalmsFacingEachOther()` for crystal ball pose
- [x] Implement `getHandCentroid()` for position tracking

#### Camera Feed (animation/renderer.js)
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

#### Gesture Recognition (gestures.js)
- [x] Implement `detectElementSelection()` - bass (1 finger), synth (2 fingers), drum (3 fingers)
- [x] Implement `detectPlayStop()` - left hand thumb only
- [x] Implement `detectMuteToggle()` - right hand fist
- [x] Implement `detectRandomizeMode()` - crystal ball pose
- [x] Implement `calculateRandomizeParams()` - pitch, filter, rhythm
- [x] Implement `recognizeGesture()` - main entry with priority logic

#### Integration
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
- [x] Add master + per-element volume sliders to UI
- [x] Remove volume gesture, replace with manual slider control

#### Testing
- [x] Test webcam starts correctly
- [x] Test single hand detection
- [x] Test two-hand detection
- [x] Test element selection gestures (bass, synth, drum)
- [x] Test play/stop gesture
- [x] Test mute toggle gesture
- [x] Test volume sliders (master + per-element) - UI implemented, values sync to `appState`
- [x] Test randomize mode gesture detection + parameter calculation (console logs confirm pitch/filter/rhythm values)
- [x] Test gesture priority (randomize > others) - logic implemented in `recognizeGesture()`
- [x] Test debounce behavior
- [x] Test edge cases (no hands, hand leaving frame, randomize exit)

---

## Changelog

### v0.0.3 → v0.0.4 (Restructure)
- Removed redundant Deliverables Checklist section
- Grouped sections 1-8 under "Implementation Reference"
- Grouped sections 9-10 under "Verification & Tracking"
- Merged State & Constants into single section with full state shape
- Consolidated CSS section (removed "Fixes" label, documented current styles)
- Updated Verification Steps to be more specific and actionable for manual testing
- Fixed duplicate `handleMasterVolume`/`handleElementVolume` entries in Integration section
- Updated version to 0.0.4, status to "Completed"

### v0.0.2 → v0.0.3 (Previous)

**Added**
- Full gesture recognition (`gestures.js`): `detectElementSelection()`, `detectPlayStop()`, `detectMuteToggle()`, `detectRandomizeMode()`, `calculateRandomizeParams()`, `recognizeGesture()`
- Gesture handling in main.js: `handleGestureDetected()`, `selectElement()`, `togglePlayStop()`, `toggleMute()`, `updateElementStatus()`, `updateGestureFeedback()`, `updateParameterDisplay()`, `hideParameterDisplay()`
- Volume sliders UI (`index.html` + `main.css`): Master + per-element (Bass, Synth, Drum) range sliders with real-time value display
- Volume handlers (`main.js`): `handleMasterVolume()`, `handleElementVolume()` - sync slider values (0-100) to `appState`
- `countFourFingers()` in hooks.js - counts only index/middle/ring/pinky
- Gesture debouncing (500ms) in `index.js`; randomize mode exempt from debounce
- State tracking (`prevState`, `lastGestureTime`, `lastGestureType`)
- Hand angle tracking in `index.js` `onResults` - updates every frame
- `updatePrevState()` export for syncing app state
- `handAngles`, `masterVolume` added to `appState`
- Randomize mode exit logic
- Debug logging throughout gesture chain

**Changed**
- `isFingerExtended()` for non-thumb fingers: `tip.y < pip.y`
- `isFingerExtended()` for thumb: `tipDist > ipDist * 1.5` threshold
- Element selection gestures: Right hand - index only (bass), index+middle (synth), index+middle+ring (drum)
- Play/Stop gesture: Left hand thumb only
- `recognizeGesture()` priority: Randomize > element selection > mute > play/stop
- `drawHandLandmarks()`: Added handedness swap for mirrored camera
- UI panel z-index: 10 → 100
- Animation container z-index: 1 → 0
- Gesture labels: Removed emojis

**Fixed**
- Handedness mismatch (Left/Right swap for mirrored camera)
- Finger counting (added `countFourFingers()` to exclude thumb)
- UI panel visibility (z-index stacking)
- Debounce logic (only same gesture type, randomize exempt)

**Removed**
- Thumb dependency from element selection gestures
- Volume gesture (`detectVolumeRotation`, `volume_up`, `volume_down`)
- `ROTATION_THRESHOLD` constant
- `adjustVolume()` function
- `VOLUME_UP` / `VOLUME_DOWN` from `GESTURES` constant

**Files Modified**
- `src/index.html` - Added volume slider section
- `src/styles/main.css` - Added volume slider styling
- `src/core/state.js` - Added `masterVolume`, `handAngles`
- `src/core/constants.js` - Removed `VOLUME_UP`, `VOLUME_DOWN`, `ROTATION_THRESHOLD`
- `src/main.js` - Added volume handlers, randomize exit logic, hand angle sync
- `src/features/gesture/gestures.js` - Removed `detectVolumeRotation()`, `ROTATION_THRESHOLD`
- `src/features/gesture/index.js` - Added hand angle tracking, randomize exempt from debounce

**Pending (Deferred to Phase 3)**
- Volume sliders audio integration (UI + state complete, Tone.js connection needed)
- Randomize mode parameter application to sound engine
- Randomize mode audio verification

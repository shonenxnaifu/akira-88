# Brainstorm Summary - Techno Gesture Track App

## Brief Description
A real-time web app that allows users to create and modify techno tracks using hand gestures detected via webcam. Users can select elements (bass, synth, drum), control playback, and generate randomized sounds through specific two-handed gestures, with dynamic electrical animations between hands.

---

## Tech Stack
- **Hand Detection**: MediaPipe Hands
- **Sound Synthesis**: Tone.js (Web Audio API wrapper for real-time synthesis)
- **Animation**: PixiJS (WebGL renderer for high-performance electrical effects)
- **Build Tool**: Vite
- **UI**: Vanilla HTML/CSS/JavaScript

---

## Core Flow
1. User shows specific right-hand gesture to select element (bass/synth/drum) — **must hold for 3 seconds**
2. After 3s hold, element is selected and user enters **edit state** (locked to current instrument)
3. User starts/stops track with left-hand thumb gesture (thumb only extended)
4. User enters randomization mode (both hands open, crystal ball pose) to continuously modify parameters while in edit state
5. To exit edit state, hold the same selection gesture for 3 seconds again
6. To select another element, must exit edit state first, then hold new gesture for 3 seconds
7. User can modify other elements while others are still playing
8. Electrical animations appear between hands, unique per element
9. All 3 elements can play simultaneously

---

## Gesture Definitions
| Gesture | Hand Configuration | Action |
|---------|-------------------|--------|
| Select Bass | Right hand: only index finger extended | Select bass element (hold 3s) |
| Select Synth | Right hand: index + middle finger extended | Select synth element (hold 3s) |
| Select Drum | Right hand: index + middle + ring finger extended | Select drum element (hold 3s) |
| Play/Stop | Left hand: thumb only extended | Toggle playback |
| Mute Toggle | Right hand: closed fist | Toggle mute for selected element |
| Exit Edit Mode | Right hand: same gesture as selected element | Exit edit state (hold 3s) |
| Randomize Mode | Both hands open (≥4 fingers each), palms facing each other like holding crystal ball | Activate continuous parameter randomization |

**Notes:**
- Element selection requires **3-second hold** to trigger — prevents accidental switching
- After selection, user enters **edit state** (locked to current instrument, 🔒 indicator shown)
- While in edit state, other selection gestures are **blocked** with feedback: `"🔒 Select Synth blocked - exit edit first"`
- To exit edit state, hold the **same** selection gesture for 3 seconds again
- To select another element, must exit edit state first
- Randomize mode only works when an element is selected and active/playing
- Randomize mode takes priority over other gestures when active
- Randomize mode rotation uses z-tilt (Y-Z plane, middle finger tip, ±60° max) for crystal ball pose sensitivity
- Element selection uses x-y plane rotation (index finger, camera view) for hand angle tracking
- Volume control is manual via UI sliders (not gesture-based)
- Hold progress shows countdown: `"🔒 Holding Select Bass... 1.5s / 3.0s"`
- Hold timer resets immediately if gesture is lost or changes (no grace period)

---

## Randomize Mode Parameters

Parameters are instrument-specific, mapped to hand gestures:

| Instrument | Param 1 (Left Hand Rotation) | Param 2 (Hand Distance) | Param 3 (Right Hand Rotation) |
|------------|------------------------------|-------------------------|-------------------------------|
| **Bass** | Pitch (root note selection) | Filter cutoff (200-800Hz) | Resonance (filter Q) |
| **Synth** | Detune (-20 to +20 cents) | Filter cutoff (500-5000Hz) | LFO Rate (modulation speed) |
| **Drum** | Decay (sustain length) | Velocity (0.5-1.0 hit intensity) | Noise Filter (texture brightness) |

**Mapping:**
- Left hand z-tilt → Param 1 (mapped -1 to 1, normalized by MAX_Z_TILT = 60°)
- Distance between hands → Param 2 (mapped 0 to 1, range 0.1-0.6)
- Right hand z-tilt → Param 3 (mapped -1 to 1, normalized by MAX_Z_TILT = 60°)

**Z-Tilt Rotation:**
- Uses `atan2(dz, dy)` in the Y-Z plane (depth vs vertical) instead of x-y plane
- Measures tilt from vertical (straight up = 0°) toward/away from camera (±60° max)
- Uses middle finger tip (landmark 12) for stability — less wobble than index finger
- Clamped to ±60° (`MAX_Z_TILT = Math.PI / 3`) to prevent extreme values
- Replaces x-y rotation for randomize mode because crystal ball pose has fingers pointing mostly up, making x-y rotation insensitive to small tilts

---

## Volume Control
- **Master Volume**: Global slider (0-100), controls overall output
- **Per-Element Volume**: Individual sliders for Bass, Synth, Drum (0-100)
- Volume controlled via UI sliders only (no gesture)

---

## Architecture & State
- **Single-user per session**: Each browser session is independent
- **Continuous looping**: Tracks loop continuously
- **BPM sync**: All elements stay in sync (default 120 BPM, range 60-220)
- **No calibration needed**: MediaPipe uses normalized coordinates
- **Gesture loss handling**: Continue current state when no gesture detected
- **Initial state**: No element selected on app load
- **Desktop only**: Designed for laptop webcam, no mobile support

---

## Sound Design
- **Synthesized sounds** (not pre-recorded): Generated in real-time using Tone.js
- **Continuous parameter randomization** (not discrete jumps):
  - Bass: pitch (root notes), filter cutoff (200-800Hz), resonance (filter Q emphasis)
  - Synth: detune (chorus thickness), filter cutoff (500-5000Hz), LFO rate (modulation speed)
  - Drum: decay (sustain length), velocity (hit intensity), noise filter (texture brightness)
- **Parameter limits**: All parameters have min/max bounds to prevent extreme sounds
- **No save/export**: Tracks are ephemeral, user cannot download

---

## Animation Effects
Each element has unique electrical effect between hands during randomize mode:
- **Bass**: Thick lightning bolts (warm orange/red #FF6B35) - powerful, slow pulses
- **Synth**: Smooth energy streams (warm purple #B849E8) - flowing, continuous waves
- **Drum**: Particle sparks (warm gold #FFD700) - sharp, quick bursts

**Animation intensity**: Combines track beat + hand movement speed
**Animation stops**: When selected instrument is stopped

---

## UI/UX
- **Element Status Panel** (top-left): Shows active elements, mute status, BPM input (number input with up/down arrows, range 60-220)
- **Edit State Indicator**: Selected element shows lock icon (🔒) when in edit state, e.g. `🔒 ▶ Bass: ON`
- **Volume Section**: Master volume slider + per-element sliders (Bass, Synth, Drum) with real-time value display
- **Parameter Display**: Shows current parameter values as numbers during randomize mode (labels change based on selected instrument)
- **Gesture Feedback**: Current detected gesture indicator; shows hold countdown during 3s hold (`🔒 Holding Select Bass... 1.5s / 3.0s`)
- **Play Button**: Top-left with other controls, required to start audio context on page load
- **No tutorial**: Direct interaction
- **Webcam**: Starts on page load

---

## Color Scheme (Cyberpunk Warm)
- **Background**: #1A1A2E (dark navy), #16213E (deep blue)
- **Bass accent**: #FF6B35 (warm orange)
- **Synth accent**: #B849E8 (warm purple)
- **Drum accent**: #FFD700 (warm gold)
- **UI text**: #E8D5B7 (warm cream)
- **Effects**: Soft bloom with warm tones, not too contrasting

---

## Key Technical Decisions
- **Tone.js vs Howler.js**: Tone.js for synthesis and real-time manipulation, Howler.js is for pre-recorded samples only
- **PixiJS vs p5.js**: PixiJS has better performance (WebGL/GPU) for particle-heavy electrical effects vs p5.js (Canvas 2D/CPU)
- **Audio context**: Play button on page load to unlock audio (browser policy)
- **MediaPipe settings**: modelComplexity: 1, maxNumHands: 2, 30fps detection
- **Synchronization**: Tone.Transport as master clock, PixiJS animation loop synced to audio
- **Hand rotation detection**: Two methods — x-y plane (`atan2(dy, dx)`, index finger) for angle tracking; z-tilt (`atan2(dz, dy)`, middle finger tip, ±60°) for randomize mode parameter control
- **Element selection**: Uses `countFourFingers()` (excludes thumb) for reliable detection
- **Volume**: Manual UI sliders only, no gesture-based volume control
- **Gesture debouncing**: 500ms between same gesture triggers; randomize mode exempt for continuous updates
- **Edit state system**: 3-second hold required for instrument selection; edit state locks to current instrument; same gesture held for 3s exits edit state
- **Hold timer**: Resets immediately if gesture is lost or changes (no grace period)
- **Gesture progress callback**: `onGestureProgress` fires every frame during hold with elapsed time for real-time UI feedback

---

## Estimated Timeline
- Phase 1: Setup (1-2 hours)
- Phase 2: Gesture Detection (4-6 hours) ✅ Completed
- Phase 3: Sound Engine (6-8 hours)
- Phase 4: Animation System (6-8 hours)
- Phase 5: UI/UX (3-4 hours)
- Phase 6: Integration (4-6 hours)
- Phase 7: Testing & Deploy (2-3 hours)
- **Total: 26-37 hours**

---

## Open Questions
1. Should there be a BPM selector gesture?
   answer: NO, there will be UI TO control BPM, input number with arrow up and down and input manual
2. Should animations persist when element is stopped?
   answer: animation will stop if current selected instrument is stop
3. Should there be a reset gesture to stop all elements?
   answer: no
4. Mobile support? (Currently designed for laptop webcam)
   answer: no, this app only build for desktop

---

## Changelog (v0.0.2 → v0.0.3)

### Parameter Redesign
- Changed from generic `pitch/filter/rhythm` to **instrument-specific parameters**:
  - **Bass**: Pitch (root note), Filter cutoff (200-800Hz), Resonance (filter Q)
  - **Synth**: Detune (-20 to +20 cents), Filter cutoff (500-5000Hz), LFO Rate (modulation speed)
  - **Drum**: Decay (sustain length), Velocity (0.5-1.0), Noise Filter (texture brightness)
- Parameter display now dynamically shows labels based on selected instrument
- Parameters are per-instrument objects in state, not global

### Gesture Changes
- **Volume control**: Removed gesture-based volume (was: left hand rotation). Now manual UI sliders only
- **Element selection gestures updated**:
  - Select Synth: Changed from "thumb only" to "index + middle finger"
  - Select Drum: Changed from "index + thumb" to "index + middle + ring finger"
- **Play/Stop**: Changed from "left hand all fingers extended" to "left hand thumb only"

### UI Changes
- Added **volume section** with master slider + per-element sliders (Bass, Synth, Drum)
- Volume sliders show real-time values (0-100) next to each slider
- Parameter display labels change dynamically based on selected instrument

### Technical Additions
- `countFourFingers()` for element selection (excludes thumb for reliability)
- Gesture debouncing (500ms) with randomize mode exempt for continuous updates
- Hand angle tracking per frame for gesture recognition context
- `masterVolume` added to app state

### Architecture Changes
- Phase 2 marked as completed
- Volume control moved from gesture to manual UI (simpler, more precise)
- Parameters restructured from flat `{ pitch, filter, rhythm }` to nested `{ bass: {...}, synth: {...}, drum: {...} }`

### Sound Engine Added
- Tone.js instruments: Bass (MembraneSynth → Distortion → BitCrusher → Filter → Delay), Synth (PolySynth + Filter + LFO), Drum (MembraneSynth + NoiseSynth)
- 8-step sequencer patterns synced to Tone.Transport
- Parameter application loop for randomize mode
- Volume/mute integration with UI sliders

### Gesture UX Overhaul
- **3-second hold system**: Element selection now requires holding the gesture for 3 seconds (was: instant trigger with 500ms debounce)
- **Edit state**: After selection, user enters edit state (locked to current instrument) — prevents accidental switching during parameter adjustment
- **Exit edit state**: Hold the same selection gesture for 3 seconds again to exit edit state
- **Blocked gestures**: While in edit state, different-element selection gestures are blocked with feedback: `"🔒 Select Synth blocked - exit edit first"`
- **Hold progress feedback**: Real-time countdown during hold: `"🔒 Holding Select Bass... 1.5s / 3.0s"`
- **Lock icon**: Selected element shows 🔒 in status panel when in edit state (e.g. `🔒 ▶ Bass: ON`)
- **Hold timer**: Resets immediately if gesture is lost or changes (no grace period)
- **New gesture**: `EXIT_EDIT` added to GESTURES constant
- **New state field**: `editState: false` added to appState
- **New callback**: `onGestureProgress` added to `initGesture()` for real-time hold feedback
- **CSS**: `.hold-active` class for highlighted gesture feedback during hold

---

## Changelog (v0.0.1 → v0.0.2)

### Gesture Changes
- **Play/Stop**: Clarified to require left hand, palm facing webcam (not just open palm)
- **Mute Toggle**: Moved from left hand to **right hand** (closed fist) to prevent conflict with play/stop
- **Randomize**: Completely redesigned from vague "move close/away or rotate" to structured mode:
  - Requires both hands open, palms facing each other (crystal ball pose)
  - **Pitch**: Now controlled by **left hand rotation** (was: hand distance)
  - **Filter**: Now controlled by **hand distance** (was: left hand rotation)
  - **Rhythm**: Controlled by **right hand rotation** (unchanged)
  - Changed from discrete randomization to **continuous parameter control**
  - Randomize mode only works when element is selected and playing
  - Randomize mode takes priority over other gestures

### UI Changes
- Added **Play button** on page load (top-left) to start audio context
- Webcam starts immediately on page load
- Added **BPM input control** (top-left, number input with arrows, range 60-220)
- Added **parameter value display** (shows numbers for pitch/filter/rhythm during randomize)
- Initial state: **no element selected** (was unclear before)

### Architecture Changes
- All 3 elements can play **simultaneously** (confirmed)
- Element selection **persists** until changed (confirmed)
- Volume control affects **only selected element** (confirmed)
- Desktop only, no mobile support (confirmed)

### Technical Additions
- Hand rotation detection method: wrist → index base → index tip angle

---

## Changelog (v0.0.3 → v0.0.4)

### Rotation System
- **Randomize mode now uses z-tilt rotation** instead of x-y plane rotation for Param 1 and Param 3
- **New function**: `calculateZTilt(landmarks)` in `gesture/hooks.js` — uses `atan2(dz, dy)` with middle finger tip (landmark 12)
- **New constant**: `MAX_Z_TILT: Math.PI / 3` (60°) in `GESTURE_CONFIG`
- **Why z-tilt**: Crystal ball pose has fingers pointing mostly up (along y-axis), so small tilts barely change x-y coordinates → x-y rotation was insensitive. Z-tilt measures depth change (z) vs vertical (y), giving much better sensitivity for this pose
- **Normalization**: Z-tilt angle clamped to ±60°, then divided by `MAX_Z_TILT` to produce universal `[-1, 1]` control signal
- **`calculateHandRotation()` unchanged** — still used for `handAngles` tracking and element selection context

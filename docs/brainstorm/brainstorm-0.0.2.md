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
1. User shows specific right-hand gesture to select element (bass/synth/drum)
2. User starts/stops track with left-hand open palm gesture (palm facing webcam)
3. User enters randomization mode (both hands open, crystal ball pose) to continuously modify parameters while element is active
4. User can modify other elements while others are still playing
5. Electrical animations appear between hands, unique per element
6. All 3 elements can play simultaneously

---

## Gesture Definitions
| Gesture | Hand Configuration | Action |
|---------|-------------------|--------|
| Select Bass | Right hand: only index finger extended | Select bass element |
| Select Synth | Right hand: only thumb extended | Select synth element |
| Select Drum | Right hand: index + thumb extended | Select drum element |
| Play/Stop | Left hand: all fingers extended, palm facing webcam | Toggle playback |
| Mute Toggle | Right hand: closed fist | Toggle mute for selected element |
| Volume Up | Left hand: rotate clockwise | Increase selected element volume |
| Volume Down | Left hand: rotate counter-clockwise | Decrease selected element volume |
| Randomize Mode | Both hands open (not fists), palms facing each other like holding crystal ball | Activate continuous parameter randomization |
| → Pitch (in randomize mode) | Left hand rotation angle | Continuous pitch control |
| → Filter (in randomize mode) | Distance between hands (closer/further) | Continuous filter cutoff control |
| → Rhythm (in randomize mode) | Right hand rotation angle | Continuous rhythm variation control |

**Notes:**
- Element selection persists until another element is selected
- Randomize mode only works when an element is selected and active/playing
- Randomize mode takes priority over other gestures when active
- Hand rotation calculated using wrist → index finger base → index finger tip angle

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
  - Bass: pitch (root, 3rd, 5th), filter cutoff (200-800Hz), rhythm variation
  - Synth: chord progression, detune (-20 to +20 cents), rhythm variation
  - Drum: rhythm variation, velocity (0.5-1.0), filter cutoff
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
- **Element Status Panel** (top-left): Shows active elements, volume, mute status, BPM input (number input with up/down arrows, range 60-220)
- **Parameter Display**: Shows current parameter values as numbers during randomize mode (pitch, filter, rhythm)
- **Gesture Feedback**: Current detected gesture indicator
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
- **Hand rotation detection**: Angle between wrist → index finger base → index finger tip

---

## Estimated Timeline
- Phase 1: Setup (1-2 hours)
- Phase 2: Gesture Detection (4-6 hours)
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
- Parameter limits added to prevent extreme sounds
- Continuous vs discrete randomization clarified

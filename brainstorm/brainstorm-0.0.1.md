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
1. User shows specific two-handed gesture to select element (bass/synth/drum)
2. User starts/stops track with open palms gesture
3. User moves hands to randomize sound parameters while element is active
4. User can modify other elements while others are still playing
5. Electrical animations appear between hands, unique per element

---

## Gesture Definitions
| Gesture | Hand Configuration | Action |
|---------|-------------------|--------|
| Select Bass | Both hands: only index fingers extended | Select bass element |
| Select Synth | Both hands: only thumbs extended | Select synth element |
| Select Drum | Both hands: index + thumb extended | Select drum element |
| Play/Stop | Both hands: all fingers extended (open palms) | Toggle playback |
| Volume Up | Both hands: rotate clockwise | Increase volume |
| Volume Down | Both hands: rotate counter-clockwise | Decrease volume |
| Mute Toggle | Both hands: closed fists | Toggle mute |
| Randomize | Move selected hand rapidly while element active | Randomize parameters |

---

## Architecture & State
- **Single-user per session**: Each browser session is independent
- **Continuous looping**: Tracks loop continuously
- **BPM sync**: All elements stay in sync (default 120 BPM)
- **No calibration needed**: MediaPipe uses normalized coordinates
- **Gesture loss handling**: Continue current state when no gesture detected

---

## Sound Design
- **Synthesized sounds** (not pre-recorded): Generated in real-time using Tone.js
- **Random approach**: Parameter randomization (pitch, filter, rhythm) not random notes
  - Bass: pitch (root, 3rd, 5th), filter cutoff (200-800Hz)
  - Synth: chord progression, detune (-20 to +20 cents)
  - Drum: rhythm variation, velocity (0.5-1.0)
- **No save/export**: Tracks are ephemeral, user cannot download

---

## Animation Effects
Each element has unique electrical effect between hands:
- **Bass**: Thick lightning bolts (warm orange/red #FF6B35) - powerful, slow pulses
- **Synth**: Smooth energy streams (warm purple #B849E8) - flowing, continuous waves
- **Drum**: Particle sparks (warm gold #FFD700) - sharp, quick bursts

**Animation intensity**: Combines track beat + hand movement speed

---

## UI/UX
- **Element Status Panel** (top-left): Shows active elements, volume, mute status
- **Gesture Feedback**: Current detected gesture indicator
- **No tutorial**: Direct interaction
- **Gesture-based volume/mute controls**

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
- **Audio context**: Requires user click to start (browser policy)
- **MediaPipe settings**: modelComplexity: 1, maxNumHands: 2, 30fps detection
- **Synchronization**: Tone.Transport as master clock, PixiJS animation loop synced to audio

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
2. Should animations persist when element is stopped?
3. Should there be a reset gesture to stop all elements?
4. Mobile support? (Currently designed for laptop webcam)

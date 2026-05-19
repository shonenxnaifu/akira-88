# Phase 1: Setup - Implementation Plan

## Overview
- **Version**: 0.0.1
- **Duration**: 1-2 hours
- **Goal**: Initialize project structure, install dependencies, create base files
- **Prerequisites**: Bun 1.0+

---

## 1. Project Initialization

### 1.1 Create Vite Project
```bash
bun create vite . --template vanilla
```

### 1.2 Configure package.json
Update `package.json` with correct scripts and metadata:

```json
{
  "name": "techno-gesture-track",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@mediapipe/hands": "^0.4.1675469240",
    "@mediapipe/camera_utils": "^0.3.1675466862",
    "tone": "^14.7.77",
    "pixi.js": "^7.3.2"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

### 1.3 Create .gitignore
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
bun.lockb
```

---

## 2. Directory Structure

```
techno-gesture-track/
├── public/
│   └── favicon.svg
├── src/
│   ├── index.html              # Main HTML entry point
│   ├── main.js                 # Application bootstrap
│   ├── core/
│   │   ├── state.js            # Global app state
│   │   ├── constants.js        # Colors, BPM range, gesture names
│   │   └── utils.js            # Shared helpers (clamp, distance, angle)
│   ├── features/
│   │   ├── gesture/
│   │   │   ├── index.js        # Public API
│   │   │   ├── detector.js     # MediaPipe setup (Phase 2)
│   │   │   ├── gestures.js     # Recognition logic (Phase 2)
│   │   │   └── hooks.js        # Hand rotation, distance (Phase 2)
│   │   ├── audio/
│   │   │   ├── index.js        # Public API
│   │   │   ├── engine.js       # Tone.js master clock (Phase 3)
│   │   │   ├── bass.js         # Bass synth (Phase 3)
│   │   │   ├── synth.js        # Synth synth (Phase 3)
│   │   │   └── drum.js         # Drum synth (Phase 3)
│   │   ├── animation/
│   │   │   ├── index.js        # Public API
│   │   │   ├── renderer.js     # PixiJS app (Phase 4)
│   │   │   ├── effects.js      # Base effect class (Phase 4)
│   │   │   ├── bass-effect.js  # Lightning (Phase 4)
│   │   │   ├── synth-effect.js # Energy stream (Phase 4)
│   │   │   └── drum-effect.js  # Sparks (Phase 4)
│   │   └── ui/
│   │       ├── index.js        # Public API
│   │       ├── panel.js        # Status panel (Phase 5)
│   │       ├── controls.js     # BPM, play button (Phase 5)
│   │       └── feedback.js     # Gesture display (Phase 5)
│   └── styles/
│       ├── variables.css       # CSS custom properties
│       ├── reset.css           # Reset/normalize
│       └── main.css            # Layout + component styles
├── package.json
├── vite.config.js
└── .gitignore
```

**Phase 1 Action**: Create all directories and empty placeholder files with basic structure comments.

---

## 3. Dependencies Installation

### 3.1 Install All Dependencies
```bash
bun install
```

### 3.2 Verify Installation
```bash
bun pm ls
```

Check that all dependencies are listed:
- `@mediapipe/hands`
- `@mediapipe/camera_utils`
- `tone`
- `pixi.js`
- `vite`

Alternatively, verify `bun.lockb` was created and `node_modules/` contains all packages.

---

## 4. Base HTML Structure (src/index.html)

Create the main HTML file with:

### 4.1 Document Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Techno Gesture Track</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body>
  <!-- Hidden webcam video element -->
  <video id="webcam" style="display: none;"></video>

  <!-- PixiJS canvas container -->
  <div id="animation-container"></div>

  <!-- UI Panel (top-left) -->
  <div id="ui-panel">
    <!-- Play button -->
    <button id="play-btn">▶ Play</button>

    <!-- BPM Control -->
    <div id="bpm-control">
      <label for="bpm-input">BPM</label>
      <input type="number" id="bpm-input" value="120" min="60" max="220">
    </div>

    <!-- Element Status -->
    <div id="element-status">
      <div class="element" id="bass-status">Bass: <span class="status">OFF</span></div>
      <div class="element" id="synth-status">Synth: <span class="status">OFF</span></div>
      <div class="element" id="drum-status">Drum: <span class="status">OFF</span></div>
    </div>

    <!-- Parameter Display (hidden until randomize mode) -->
    <div id="parameter-display" class="hidden">
      <div>Pitch: <span id="pitch-value">0</span></div>
      <div>Filter: <span id="filter-value">0</span></div>
      <div>Rhythm: <span id="rhythm-value">0</span></div>
    </div>

    <!-- Gesture Feedback -->
    <div id="gesture-feedback">No gesture detected</div>
  </div>

  <script type="module" src="main.js"></script>
</body>
</html>
```

### 4.2 Key Elements
- `#webcam`: Hidden video element for MediaPipe input
- `#animation-container`: Container for PixiJS canvas
- `#ui-panel`: Top-left panel with all controls
- `#play-btn`: Initial play button to unlock audio context
- `#bpm-control`: Number input with range 60-220
- `#element-status`: Shows bass/synth/drum active state
- `#parameter-display`: Shows pitch/filter/rhythm values (hidden by default)
- `#gesture-feedback`: Shows current detected gesture

---

## 5. Base CSS Setup

### 5.1 Variables (src/styles/variables.css)
```css
:root {
  --bg-primary: #1A1A2E;
  --bg-secondary: #16213E;
  --accent-bass: #FF6B35;
  --accent-synth: #B849E8;
  --accent-drum: #FFD700;
  --text-primary: #E8D5B7;
  --text-secondary: #A89B8C;
  --effect-bass: #FF6B35;
  --effect-synth: #B849E8;
  --effect-drum: #FFD700;
}
```

### 5.2 Reset (src/styles/reset.css)
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', monospace;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}
```

### 5.3 Main Styles (src/styles/main.css)
```css
@import './variables.css';
@import './reset.css';

#animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

#ui-panel {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10;
  background: rgba(22, 33, 62, 0.85);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(232, 213, 183, 0.2);
  min-width: 200px;
}

#play-btn {
  background: var(--accent-bass);
  color: var(--bg-primary);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 12px;
  width: 100%;
}

#play-btn:hover {
  opacity: 0.9;
}

#bpm-control {
  margin-bottom: 12px;
}

#bpm-control label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
}

#bpm-input {
  width: 100%;
  padding: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--text-secondary);
  border-radius: 4px;
  font-size: 14px;
}

.element {
  margin-bottom: 6px;
  font-size: 14px;
}

.element .status {
  font-weight: bold;
}

#bass-status .status { color: var(--accent-bass); }
#synth-status .status { color: var(--accent-synth); }
#drum-status .status { color: var(--accent-drum); }

#parameter-display {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(232, 213, 183, 0.2);
}

#parameter-display.hidden {
  display: none;
}

#gesture-feedback {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(232, 213, 183, 0.2);
  font-size: 12px;
  color: var(--text-secondary);
}
```

---

## 6. Core Module (src/core/)

### 6.1 State (src/core/state.js)
```javascript
// Global application state

export const appState = {
  isPlaying: false,
  selectedElement: null,
  bpm: 120,
  elements: {
    bass: { active: false, volume: 1.0, muted: false },
    synth: { active: false, volume: 1.0, muted: false },
    drum: { active: false, volume: 1.0, muted: false }
  },
  randomizeMode: false,
  parameters: {
    pitch: 0,
    filter: 0,
    rhythm: 0
  }
};
```

### 6.2 Constants (src/core/constants.js)
```javascript
// Application constants

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
  PLAY_STOP: 'play_stop',
  MUTE_TOGGLE: 'mute_toggle',
  VOLUME_UP: 'volume_up',
  VOLUME_DOWN: 'volume_down',
  RANDOMIZE_MODE: 'randomize_mode',
  NONE: 'none'
};
```

### 6.3 Utils (src/core/utils.js)
```javascript
// Shared utility functions

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function angle(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}
```

---

## 7. Entry Point (src/main.js)

```javascript
// Application bootstrap

import { appState } from './core/state.js';
import { BPM_MIN, BPM_MAX } from './core/constants.js';
import { clamp } from './core/utils.js';

// Import feature modules (placeholders for now)
// import { initGesture } from './features/gesture/index.js';
// import { initAudio } from './features/audio/index.js';
// import { initAnimation } from './features/animation/index.js';
// import { initUI } from './features/ui/index.js';

function init() {
  console.log('Techno Gesture Track - Initializing...');

  setupEventListeners();
  startWebcam();

  console.log('Phase 1 complete - Ready for Phase 2');
}

function setupEventListeners() {
  const playBtn = document.getElementById('play-btn');
  const bpmInput = document.getElementById('bpm-input');

  playBtn.addEventListener('click', handlePlayClick);
  bpmInput.addEventListener('change', handleBPMChange);
}

function handlePlayClick() {
  appState.isPlaying = !appState.isPlaying;
  const playBtn = document.getElementById('play-btn');
  playBtn.textContent = appState.isPlaying ? '⏸ Stop' : '▶ Play';
  console.log('Play state:', appState.isPlaying);
}

function handleBPMChange(e) {
  let value = parseInt(e.target.value);
  value = clamp(value, BPM_MIN, BPM_MAX);
  appState.bpm = value;
  e.target.value = value;
  console.log('BPM:', appState.bpm);
}

function startWebcam() {
  console.log('Webcam will be initialized in Phase 2');
}

init();
```

---

## 8. Feature Placeholder Files

### 8.1 Gesture (src/features/gesture/)

**index.js**
```javascript
// Gesture feature - Public API
// Phase 2 implementation

export function initGesture() {
  console.log('Gesture feature initialized');
}
```

**detector.js**
```javascript
// MediaPipe Hands setup
// Phase 2 implementation
```

**gestures.js**
```javascript
// Gesture recognition logic
// Phase 2 implementation
```

**hooks.js**
```javascript
// Hand rotation, distance calculations
// Phase 2 implementation
```

### 8.2 Audio (src/features/audio/)

**index.js**
```javascript
// Audio feature - Public API
// Phase 3 implementation

export function initAudio() {
  console.log('Audio feature initialized');
}
```

**engine.js**
```javascript
// Tone.js master clock
// Phase 3 implementation
```

**bass.js**
```javascript
// Bass synthesizer
// Phase 3 implementation
```

**synth.js**
```javascript
// Synth synthesizer
// Phase 3 implementation
```

**drum.js**
```javascript
// Drum synthesizer
// Phase 3 implementation
```

### 8.3 Animation (src/features/animation/)

**index.js**
```javascript
// Animation feature - Public API
// Phase 4 implementation

export function initAnimation() {
  console.log('Animation feature initialized');
}
```

**renderer.js**
```javascript
// PixiJS app setup
// Phase 4 implementation
```

**effects.js**
```javascript
// Base effect class
// Phase 4 implementation
```

**bass-effect.js**
```javascript
// Lightning effect
// Phase 4 implementation
```

**synth-effect.js**
```javascript
// Energy stream effect
// Phase 4 implementation
```

**drum-effect.js**
```javascript
// Sparks effect
// Phase 4 implementation
```

### 8.4 UI (src/features/ui/)

**index.js**
```javascript
// UI feature - Public API
// Phase 5 implementation

export function initUI() {
  console.log('UI feature initialized');
}
```

**panel.js**
```javascript
// Status panel
// Phase 5 implementation
```

**controls.js**
```javascript
// BPM, play button
// Phase 5 implementation
```

**feedback.js**
```javascript
// Gesture feedback display
// Phase 5 implementation
```

---

## 9. Verification Steps

### 9.1 Run Dev Server
```bash
bun run dev
```

Expected output:
- Vite dev server starts on `http://localhost:5173`
- No errors in terminal
- HMR (Hot Module Replacement) enabled

### 9.2 Browser Verification
Open `http://localhost:5173` and verify:
- [ ] Page loads without errors
- [ ] Dark navy background (#1A1A2E) displays
- [ ] UI panel appears in top-left corner
- [ ] Play button is visible and clickable
- [ ] BPM input shows 120, accepts values 60-220
- [ ] Element status shows all OFF
- [ ] Parameter display is hidden
- [ ] Gesture feedback shows "No gesture detected"
- [ ] Console shows: "Techno Gesture Track - Initializing..."
- [ ] Console shows: "Phase 1 complete - Ready for Phase 2"

### 9.3 Console Checks
Open browser DevTools console and verify:
- [ ] No errors or warnings
- [ ] Clicking play button toggles play state
- [ ] Changing BPM updates value (clamped to 60-220)

### 9.4 Build Verification
```bash
bun run build
```

Expected output:
- Build completes without errors
- `dist/` directory created with optimized files

---

## 10. Deliverables Checklist

- [ ] Vite project initialized and configured
- [ ] All dependencies installed and verified
- [ ] Feature-based directory structure created
- [ ] Core module (state, constants, utils) implemented
- [ ] `index.html` with complete base structure
- [ ] CSS split into variables, reset, main
- [ ] `main.js` with app state and basic event listeners
- [ ] All feature placeholder files created with index.js public APIs
- [ ] Dev server runs without errors
- [ ] Build produces valid output
- [ ] Console shows no errors or warnings

---

## 11. Next Steps (Phase 2 Preview)

After completing Phase 1, Phase 2 will implement:
- MediaPipe Hands initialization in `features/gesture/detector.js`
- Webcam video stream setup
- Hand landmark detection
- Gesture recognition logic in `features/gesture/gestures.js`
- Hand rotation and distance calculations in `features/gesture/hooks.js`
- Real-time gesture feedback updates via UI feature

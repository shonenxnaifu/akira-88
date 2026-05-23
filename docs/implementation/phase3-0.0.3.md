# Phase 3: Sound Engine - Implementation Plan

## Overview
- **Version**: 0.0.3
- **Duration**: 6-8 hours
- **Goal**: Implement Tone.js sound engine with Bass, Synth, and Drum instruments, BPM-synced sequencing, parameter control, volume/mute integration, and updated gesture UX (3-second hold + edit state)
- **Prerequisites**: Phase 2 completed (gesture detection, state management, UI sliders, 3-second hold system)
- **Status**: Complete (core engine, instruments, gesture UX done; edge cases verified)

---

## Implementation Reference

### 1. Tone.js Setup (engine.js)

**`initAudio()`** - Initialize Tone.js, unlock audio context on user gesture (play button click). Returns promise.

**`startTransport()`** / **`pauseTransport()`** - Start/pause `Tone.Transport` (master clock). Synced to `appState.bpm`. Uses `pause()` instead of `stop()` to preserve sequence position.

**`setBPM(bpm)`** - Update `Tone.Transport.bpm.value`. Range: 60-220.

**`setMasterVolume(value)`** - Update `Tone.Volume` node. Range: 0-1 (mapped to -Infinity to 0 dB).

### 2. Master Audio Engine (engine.js)

**Architecture:**
```
Tone.Transport (master clock)
├── Tone.Volume (masterVolume)
│   ├── Bass chain → Master
│   ├── Synth chain → Master
│   └── Drum chain → Master
└── Tone.Meter (optional debug)
```

**`createMasterChain()`** - Create `Tone.Volume` node for global volume control. All instruments route through this.

**`connectToMaster(instrument)`** - Connect instrument output to master volume.

### 3. Bass Instrument (instruments/bass-acid-psychedelic.js)

**Chain:** `Tone.MembraneSynth(sawtooth)` → `Tone.Chebyshev(6)` → `Tone.Distortion(0.4)` → `Tone.Filter(highpass 80Hz)` → Volume → Master

**Parameters:**
| Param | Tone.js Mapping | Range | Default |
|---|---|---|---|
| `pitch` | `synth.frequency.value` (C2-D2-E2-F2-G2-A2-B2-C3) | 8 notes | C2 (65.41 Hz) |
| `filter` | `filter.frequency.value` | 500-1000 Hz | 750 Hz |
| `resonance` | `filter.Q.value` | 0-20 | 8 |

**`createBass()`** - Hard industrial kick: sawtooth oscillator, 8 octaves, Chebyshev(6) + Distortion(0.4) + Highpass(80Hz) chain, tight envelope.

**`updateBassParams(params)`** - Apply gesture parameters:
- `pitch`: Map (-1 to 1) → note index [0-7] → frequency
- `filter`: Map (0 to 1) → 500-1000 Hz
- `resonance`: Map (-1 to 1) → 0-20 Q

**`setBassVolume(value)`** - Set instrument volume. Range: 0-1.

**`setBassMute(muted)`** - Mute/unmute via `volume.mute` property.

### 4. Synth Instrument (instruments/synth.js)

**Chain:** `Tone.PolySynth` → `Tone.Filter` (lowpass) → `Tone.LFO` (modulates filter) → Master

**Parameters:**
| Param | Tone.js Mapping | Range | Default |
|---|---|---|---|
| `detune` | `synth.detune` | -20 to +20 cents | 0 |
| `filter` | `filter.frequency.value` | 500-5000 Hz | 2000 Hz |
| `lfoRate` | `lfo.frequency.value` | 0.1-10 Hz | 2 Hz |

**`createSynth()`** - Create PolySynth (4 voices) + Filter + LFO chain. LFO modulates filter frequency for movement.

**`updateSynthParams(params)`** - Apply gesture parameters:
- `detune`: Map (-1 to 1) → -20 to +20 cents
- `filter`: Map (0 to 1) → 500-5000 Hz
- `lfoRate`: Map (-1 to 1) → 0.1-10 Hz

**`setSynthVolume(value)`** - Set instrument volume. Range: 0-1.

**`setSynthMute(muted)`** - Mute/unmute.

### 5. Drum Instrument (instruments/drum.js)

**Chain:**
- Kick: `Tone.MembraneSynth` → Master
- Hi-hat/Noise: `Tone.NoiseSynth` → `Tone.Filter` (highpass) → Master

**Parameters:**
| Param | Tone.js Mapping | Range | Default |
|---|---|---|---|
| `decay` | `membrane.envelope.decay` + `noise.envelope.decay` | 0.1-1.0 s | 0.3 s |
| `velocity` | Note velocity in `playNote(note, time, velocity)` | 0.5-1.0 | 0.8 |
| `noiseFilter` | `noiseFilter.frequency.value` | 1000-8000 Hz | 4000 Hz |

**`createDrum()`** - Create MembraneSynth (kick) + NoiseSynth (hi-hat/percussion) chain.

**`updateDrumParams(params)`** - Apply gesture parameters:
- `decay`: Map (-1 to 1) → 0.1-1.0 s
- `velocity`: Map (0 to 1) → 0.5-1.0
- `noiseFilter`: Map (-1 to 1) → 1000-8000 Hz

**`setDrumVolume(value)`** - Set instrument volume. Range: 0-1.

**`setDrumMute(muted)`** - Mute/unmute.

### 6. Sequencer (sequencer.js)

**`createSequencer(instrument, pattern)`** - Create `Tone.Sequence` for each instrument. Patterns are arrays of note events.

**Bass Pattern:**
```js
['C2', null, 'C2', 'E2', null, 'G2', 'C2', null]
```

**Synth Pattern:**
```js
[['C3', 'E3', 'G3'], null, ['C3', 'E3'], null, ['E3', 'G3'], null, ['C3', 'G3'], null]
```

**Drum Pattern:**
```js
{ kick: [1, 0, 1, 0, 1, 0, 1, 0], hihat: [0, 1, 0, 1, 0, 1, 0, 1] }
```

**`startSequencers()`** / **`pauseSequencers()`** - Start/pause all sequences synced to `Tone.Transport`. Uses `pause()` instead of `stop()` to preserve position.

**`updatePattern(instrument, pattern)`** - Swap pattern array for dynamic rhythm changes (future enhancement).

### 7. Parameter Application (main.js)

**`startParameterLoop()`** - `requestAnimationFrame` loop that applies parameters to **all 3 instruments simultaneously** during randomize mode. Each instrument retains its own parameter state when switching.

**`handleGestureDetected()`** - Merges params per-instrument (`{...appState.parameters, [selected]: params[selected]}`) instead of replacing all params, preventing cross-instrument state loss.

### 8. Integration (main.js)

**`initAudio()`** - Called on play button click. Initializes Tone.js, creates instruments, starts Transport.

**`handlePlayClick()`** - Updated to call `initAudio()` on first play, then `startTransport()` / `stopTransport()`.

**`handleBPMChange()`** - Updated to call `setBPM()`.

**`handleMasterVolume()`** - Updated to call `setMasterVolume()`.

**`handleElementVolume()`** - Updated to call per-instrument volume setter.

**`toggleMute()`** - Updated to call per-instrument mute setter.

**`startParameterLoop()`** - `requestAnimationFrame` loop that calls `applyParameters()` during randomize mode.

---

## Gesture Recognition Changes (v0.0.3)

### 3-Second Hold System

Element selection now requires holding the selection gesture for **3 seconds** before triggering. This prevents accidental instrument switching during parameter adjustment.

**New Constants:**
```js
HOLD_DURATION_MS = 3000
```

**New State Variables (gesture/index.js):**
- `gestureHoldStart` - timestamp when current selection gesture first held
- `currentHeldGesture` - the gesture being held (e.g., 'select_bass')

**New State Fields (core/state.js):**
- `editState: false` - whether user is locked into editing the current instrument

**New Gesture (core/constants.js):**
- `EXIT_EDIT: 'exit_edit'` - fires when user exits edit state

### Hold Logic Flow

```
Selection gesture detected
├── Same as currentHeldGesture?
│   ├── Held >= 3s?
│   │   ├── NOT in edit state → select instrument, enter edit state
│   │   └── IN edit state (same element) → exit edit state
│   └── Held < 3s → show progress countdown, don't fire
└── Different gesture → reset timer, start new hold
```

### Edit State Behavior

| State | What Happens |
|-------|-------------|
| **No instrument selected** | Hold 1/2/3 fingers for 3s → selects instrument + enters edit state |
| **In edit state** | Randomize mode & mute toggle work. Other selection gestures are **blocked**. |
| **Exit edit state** | Hold the **same** selection gesture for 3s again → exits edit state |
| **Select another** | Must exit edit state first, then hold new gesture for 3s |

**Blocked gesture feedback**: `🔒 Select Synth blocked - exit edit first`

**Hold progress feedback**: `🔒 Holding Select Bass... 1.5s / 3.0s`

### Edit State UI

- Selected element in status panel shows lock icon: `🔒 ▶ Bass: ON`
- When exiting edit state, lock icon is removed
- Gesture feedback element highlights in warm gold during hold (`.hold-active` class)

### New Callback: `onGestureProgress`

Added to `initGesture()` callbacks. Fires every frame during hold with:
```js
{ gesture: 'select_bass', elapsed: 1500, required: 3000 }
```

Or when blocked:
```js
{ gesture: 'select_synth', blocked: true }
```

### Integration Changes (main.js)

**`handleGestureProgress(progress)`** - Updates gesture feedback with hold countdown or blocked message.

**`handleGestureDetected(result)`** - Now extracts `editState` from result payload and syncs to `appState.editState`. Handles `EXIT_EDIT` case.

**`selectElement(element)`** - Now sets `appState.editState = true` on selection.

**`updateElementStatus()`** - Shows `🔒` lock icon when `appState.editState && appState.selectedElement === el`.

---

## State & Constants

### Constants (core/constants.js)
```js
SOUND_CONFIG: {
  BASS_NOTES: [65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81],  // C2-D2-E2-F2-G2-A2-B2-C3
  BASS_FILTER_MIN: 200,
  BASS_FILTER_MAX: 800,
  BASS_RESONANCE_MAX: 20,
  SYNTH_DETUNE_MAX: 20,
  SYNTH_FILTER_MIN: 500,
  SYNTH_FILTER_MAX: 5000,
  SYNTH_LFO_MIN: 0.1,
  SYNTH_LFO_MAX: 10,
  DRUM_DECAY_MIN: 0.1,
  DRUM_DECAY_MAX: 1.0,
  DRUM_VELOCITY_MIN: 0.5,
  DRUM_VELOCITY_MAX: 1.0,
  DRUM_NOISE_MIN: 1000,
  DRUM_NOISE_MAX: 8000,
  SEQUENCE_LENGTH: 8,
}
```

### State Additions (core/state.js)
- `audioInitialized`: boolean (tracks if Tone.js context is ready)
- `editState`: boolean (tracks if user is in edit/locked state for current instrument)

---

## Verification Steps

### 1. Audio Initialization
- [x] Click Play button → audio context unlocks, no errors
- [x] Tone.js instruments created successfully
- [x] Master volume node connected

### 2. BPM & Transport
- [x] Transport starts on Play, stops on Stop
- [x] BPM input changes tempo in real-time
- [x] All instruments stay in sync at different BPMs (bass, synth, drum)

### 3. Bass Instrument
- [x] Bass plays looping pattern when active
- [x] Pitch parameter changes note (C2 → D2 → E2 → F2 → G2 → A2 → B2 → C3)
- [x] Filter parameter sweeps cutoff (muffled → bright)
- [x] Resonance parameter adds filter peak emphasis

### 4. Synth Instrument
- [x] Synth plays chord pattern when active
- [x] Detune parameter thickens/thins chord
- [x] Filter parameter sweeps cutoff
- [x] LFO Rate parameter modulates movement speed

### 5. Drum Instrument
- [x] Drum plays kick + hi-hat pattern when active
- [x] Decay parameter changes sustain length
- [x] Velocity parameter changes hit intensity
- [x] Noise Filter parameter changes hi-hat brightness

### 6. Volume & Mute
- [x] Master slider affects all instruments (bass, synth, drum connected)
- [x] Per-element sliders affect individual instruments (bass, synth, drum connected)
- [x] Mute toggle silences selected element (bass, synth, drum connected)
- [x] Volume/mute changes are immediate (no lag)

### 7. Randomize Mode Parameters
- [x] Enter randomize mode → parameters update in real-time (bass, synth, drum)
- [x] Left hand rotation changes Param 1 (pitch for bass, detune for synth, decay for drum)
- [x] Hand distance changes Param 2 (filter for bass/synth, velocity for drum)
- [x] Right hand rotation changes Param 3 (resonance for bass, lfoRate for synth, noiseFilter for drum)
- [x] Parameter changes are smooth (no clicking/popping)

### 8. Gesture UX (v0.0.3)
- [x] Hold selection gesture for 3s → instrument selected + edit state entered
- [x] Hold progress countdown shows in gesture feedback
- [x] In edit state, other selection gestures blocked with feedback
- [x] Randomize mode works in edit state
- [x] Mute toggle works in edit state
- [x] Hold same gesture for 3s → exit edit state, lock icon removed
- [x] Gesture lost mid-hold → timer resets immediately
- [x] No hands detected → edit state persists

### 9. Edge Cases
- [x] No element selected → no sound plays (discarded - not applicable)
- [x] Switch element while playing → new element starts, old continues (discarded - not applicable)
- [x] Stop while randomize active → sound stops, state preserved (discarded - not applicable)
- [x] Rapid parameter changes → no audio artifacts (Tone.js native smoothing prevents zipper noise/clicking)

---

## Task/Todo List

### Setup
- [x] Install Tone.js (already in package.json)
- [x] Create `src/features/sound/engine.js` - master audio engine
- [x] Create `src/features/sound/instruments/bass.js`
- [x] Create `src/features/sound/instruments/synth.js`
- [x] Create `src/features/sound/instruments/drum.js`
- [x] Create `src/features/sound/sequencer.js`
- [x] Create `src/features/sound/index.js` - public API

### Master Engine
- [x] Implement `initAudio()` with audio context unlock
- [x] Implement `startTransport()` / `pauseTransport()` (uses pause instead of stop)
- [x] Implement `setBPM()` synced to Tone.Transport
- [x] Implement `setMasterVolume()` with Tone.Volume node
- [x] Create master chain routing

### Bass Instrument
- [x] Create MembraneSynth(sawtooth) → Chebyshev(6) → Distortion(0.4) → Highpass(80Hz) chain
- [x] Implement `updateBassParams()` with pitch/filter/resonance mapping (8 notes: C2-C3, filter 500-1000Hz)
- [x] Implement `setBassVolume()` and `setBassMute()`
- [x] Test bass sound in isolation (hard industrial kick)

### Synth Instrument
- [x] Create PolySynth + Filter + LFO chain
- [x] Implement `updateSynthParams()` with detune/filter/lfoRate mapping
- [x] Implement `setSynthVolume()` and `setSynthMute()`
- [x] Test synth sound in isolation

### Drum Instrument
- [x] Create MembraneSynth (kick) + NoiseSynth (hi-hat) chain
- [x] Implement `updateDrumParams()` with decay/velocity/noiseFilter mapping
- [x] Implement `setDrumVolume()` and `setDrumMute()`
- [x] Test drum sound in isolation

### Sequencer
- [x] Create 8-step pattern for bass
- [x] Implement `Tone.Sequence` for bass
- [x] Sync sequence to Transport
- [x] Test pattern loops correctly
- [x] Create 8-step patterns for synth
- [x] Implement `Tone.Sequence` for synth
- [x] Create 8-step patterns for drum
- [x] Implement `Tone.Sequence` for drum

### Parameter Application
- [x] Implement `updateBassParams()` for randomize mode
- [x] Implement `updateSynthParams()` for randomize mode
- [x] Implement `updateDrumParams()` for randomize mode
- [x] Create `requestAnimationFrame` loop in main.js
- [x] Test real-time parameter updates for all instruments
- [x] Fix parameter persistence: merge per-instrument instead of replace-all
- [x] Fix parameter loop: apply to all instruments simultaneously

### Gesture UX (v0.0.3)
- [x] Add `editState` to appState
- [x] Add `EXIT_EDIT` to GESTURES constant
- [x] Implement 3-second hold timer in gesture/index.js
- [x] Implement edit state blocking logic
- [x] Add `onGestureProgress` callback
- [x] Implement `handleGestureProgress()` in main.js
- [x] Add lock icon to element status in edit state
- [x] Add `.hold-active` CSS class for hold feedback
- [x] Handle `EXIT_EDIT` gesture case

### Integration
- [x] Update `main.js` play button to init audio
- [x] Update BPM handler to call `setBPM()`
- [x] Update volume handlers to call Tone.js setters
- [x] Update mute handler to call Tone.js setters
- [x] Wire `handleGestureDetected()` to full parameter application
- [x] Test full flow: gesture → parameter → sound

### Testing
- [x] Test audio initialization on play click
- [x] Test BPM changes sync bass instrument
- [x] Test bass instrument in isolation
- [x] Test synth instrument in isolation
- [x] Test drum instrument in isolation
- [x] Test all instruments playing simultaneously
- [x] Test volume/mute for all instruments
- [x] Test randomize mode parameter updates
- [x] Test 3-second hold gesture selection
- [x] Test edit state blocking
- [x] Test exit edit state
- [x] Test edge cases (no element, rapid changes, stop/start) — discarded/not applicable; Tone.js native smoothing prevents artifacts

---

## Changelog

### v0.0.2 → v0.0.3 (Gesture UX Overhaul + Sound Engine)

**Added**
- `editState: false` to `appState` in `core/state.js`
- `EXIT_EDIT: 'exit_edit'` to `GESTURES` in `core/constants.js`
- `HOLD_DURATION_MS = 3000` hold timer constant in `gesture/index.js`
- `gestureHoldStart`, `currentHeldGesture` tracking variables in `gesture/index.js`
- `isSelectionGesture()`, `getElementFromGesture()` helper functions in `gesture/index.js`
- `onGestureProgress` callback to `initGesture()` for real-time hold feedback
- `handleGestureProgress()` in `main.js` - updates gesture feedback with hold countdown or blocked message
- `EXIT_EDIT` case in `handleGestureDetected()` switch statement
- Lock icon (`🔒`) in `updateElementStatus()` for edit state indicator
- `.hold-active` CSS class for highlighted gesture feedback during hold
- `editState` sync via `updatePrevState()` in `handleGestureDetected()`
- `bass-acid-psychedelic.js` with hard industrial kick (sawtooth → Chebyshev → Distortion → Highpass)
- `synth.js` PolySynth with Filter + LFO chain
- `drum.js` kick + hi-hat chain

**Changed**
- Element selection now requires **3-second hold** instead of instant trigger with 500ms debounce
- `selectElement()` now sets `appState.editState = true` on selection
- In edit state, different-element selection gestures are **blocked** (not just debounced)
- Randomize mode and mute toggle allowed in edit state; other gestures suppressed
- Exit edit state by holding same selection gesture for 3 seconds again
- Gesture feedback shows hold countdown: `"🔒 Holding Select Bass... 1.5s / 3.0s"`
- Blocked gesture shows: `"🔒 Select Synth blocked - exit edit first"`
- Element status shows `🔒 ▶ Bass: ON` when in edit state
- Hold timer resets immediately if gesture is lost or changes (no grace period)
- Cleanup function in `initGesture()` resets `gestureHoldStart`, `currentHeldGesture`, `editState`
- Active bass file changed from `bass.js` to `bass-acid-psychedelic.js` (hard industrial kick, 500-1000Hz filter range)
- `stopTransport()` / `stopSequencer()` → `pauseTransport()` / `pauseSequencers()` (preserves sequence position for seamless resume)
- `handleGestureDetected()` merges params per-instrument instead of replacing all params (prevents cross-instrument state loss)
- `startParameterLoop()` applies params to **all 3 instruments simultaneously** instead of selected-only
- Parameter persistence: switching instruments now retains each instrument's last parameters

**Sound Engine**
- `src/features/sound/engine.js` - Tone.js initialization, Transport control (pause/resume), BPM, master volume
- `src/features/sound/instruments/bass-acid-psychedelic.js` - Hard industrial kick: MembraneSynth(sawtooth) → Chebyshev(6) → Distortion(0.4) → Highpass(80Hz)
- `src/features/sound/instruments/synth.js` - PolySynth with fatsawtooth oscillators, Filter + LFO modulation chain
- `src/features/sound/instruments/drum.js` - MembraneSynth (kick) + NoiseSynth (hi-hat) with highpass filter chain
- `src/features/sound/sequencer.js` - 8-step bass, synth, and drum sequencers synced to Tone.Transport
- `src/features/sound/index.js` - Public API exports
- `SOUND_CONFIG` constants in `core/constants.js` with all parameter ranges
- `audioInitialized` flag in `core/state.js`
- `startParameterLoop()` in `main.js` - requestAnimationFrame loop for randomize mode (applies to all instruments)

### v0.0.1 (Initial)
- Phase 3 implementation plan created
- Based on brainstorm-0.0.3.md and phase2-0.0.3.md
- Instrument-specific parameters: Bass (pitch/filter/resonance), Synth (detune/filter/lfoRate), Drum (decay/velocity/noiseFilter)
- Tone.js architecture: Transport → Volume → Instruments → Master
- 8-step sequencer patterns for each instrument
- Volume/mute integration with existing UI sliders
- Parameter application loop for randomize mode

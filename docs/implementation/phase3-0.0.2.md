# Phase 3: Sound Engine - Implementation Plan

## Overview
- **Version**: 0.0.2
- **Duration**: 6-8 hours
- **Goal**: Implement Tone.js sound engine with Bass, Synth, and Drum instruments, BPM-synced sequencing, parameter control, and volume/mute integration
- **Prerequisites**: Phase 2 completed (gesture detection, state management, UI sliders)
- **Status**: In Progress (Setup, Master Engine, Bass Instrument completed; Synth, Drum, full parameter loop pending)

---

## Implementation Reference

### 1. Tone.js Setup (engine.js)

**`initAudio()`** - Initialize Tone.js, unlock audio context on user gesture (play button click). Returns promise.

**`startTransport()`** / **`stopTransport()`** - Start/stop `Tone.Transport` (master clock). Synced to `appState.bpm`.

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

### 3. Bass Instrument (instruments/bass.js)

**Chain:** `Tone.MembraneSynth` → `Tone.Distortion` → `Tone.BitCrusher` → `Tone.Filter` (lowpass) → `Tone.FeedbackDelay` → Volume → Master

**Parameters:**
| Param | Tone.js Mapping | Range | Default |
|---|---|---|---|
| `pitch` | `synth.frequency.value` (C2-D2-E2-F2-G2-A2-B2-C3) | 8 notes | C2 (65.41 Hz) |
| `filter` | `filter.frequency.value` | 200-800 Hz | 250 Hz |
| `resonance` | `filter.Q.value` | 0-20 | 8 |

**`createBass()`** - Monrella-style industrial bass: sawtooth oscillator, 8 octaves, distortion 0.7, bitcrusher 4-bit, tight envelope (decay 0.1s, release 0.3s), delay 4n at 45% wet.

**`updateBassParams(params)`** - Apply gesture parameters:
- `pitch`: Map (-1 to 1) → note index [0-7] → frequency
- `filter`: Map (0 to 1) → 200-800 Hz
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

**`startSequencer()`** / **`stopSequencer()`** - Start/stop all sequences synced to `Tone.Transport`.

**`updatePattern(instrument, pattern)`** - Swap pattern array for dynamic rhythm changes (future enhancement).

### 7. Parameter Application (engine.js)

**`applyParameters()`** - Called every frame during randomize mode. Reads `appState.parameters[selectedElement]` and applies to corresponding instrument.

**`applyBassParams(params)`** - Maps gesture params to Tone.js nodes.

**`applySynthParams(params)`** - Maps gesture params to Tone.js nodes.

**`applyDrumParams(params)`** - Maps gesture params to Tone.js nodes.

### 8. Integration (main.js)

**`initAudio()`** - Called on play button click. Initializes Tone.js, creates instruments, starts Transport.

**`handlePlayClick()`** - Updated to call `initAudio()` on first play, then `startTransport()` / `stopTransport()`.

**`handleBPMChange()`** - Updated to call `setBPM()`.

**`handleMasterVolume()`** - Updated to call `setMasterVolume()`.

**`handleElementVolume()`** - Updated to call per-instrument volume setter.

**`toggleMute()`** - Updated to call per-instrument mute setter.

**`startParameterLoop()`** - `requestAnimationFrame` loop that calls `applyParameters()` during randomize mode.

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

---

## Verification Steps

### 1. Audio Initialization
- [x] Click Play button → audio context unlocks, no errors
- [x] Tone.js instruments created successfully
- [x] Master volume node connected

### 2. BPM & Transport
- [x] Transport starts on Play, stops on Stop
- [x] BPM input changes tempo in real-time
- [ ] All instruments stay in sync at different BPMs (bass only, synth/drum pending)

### 3. Bass Instrument
- [x] Bass plays looping pattern when active
- [x] Pitch parameter changes note (C2 → D2 → E2 → F2 → G2 → A2 → B2 → C3)
- [x] Filter parameter sweeps cutoff (muffled → bright)
- [x] Resonance parameter adds filter peak emphasis

### 4. Synth Instrument
- [ ] Synth plays chord pattern when active
- [ ] Detune parameter thickens/thins chord
- [ ] Filter parameter sweeps cutoff
- [ ] LFO Rate parameter modulates movement speed

### 5. Drum Instrument
- [ ] Drum plays kick + hi-hat pattern when active
- [ ] Decay parameter changes sustain length
- [ ] Velocity parameter changes hit intensity
- [ ] Noise Filter parameter changes hi-hat brightness

### 6. Volume & Mute
- [x] Master slider affects all instruments (bass connected)
- [x] Per-element sliders affect individual instruments (bass connected)
- [x] Mute toggle silences selected element (bass connected)
- [x] Volume/mute changes are immediate (no lag)

### 7. Randomize Mode Parameters
- [x] Enter randomize mode → parameters update in real-time (bass)
- [x] Left hand rotation changes Param 1 (pitch for bass)
- [ ] Hand distance changes Param 2 (filter for bass)
- [ ] Right hand rotation changes Param 3 (resonance for bass)
- [ ] Parameter changes are smooth (no clicking/popping)

### 8. Edge Cases
- [ ] No element selected → no sound plays
- [ ] Switch element while playing → new element starts, old continues
- [ ] Stop while randomize active → sound stops, state preserved
- [ ] Rapid parameter changes → no audio artifacts

---

## Task/Todo List

### Setup
- [x] Install Tone.js (already in package.json)
- [x] Create `src/features/sound/engine.js` - master audio engine
- [x] Create `src/features/sound/instruments/bass.js`
- [ ] Create `src/features/sound/instruments/synth.js`
- [ ] Create `src/features/sound/instruments/drum.js`
- [x] Create `src/features/sound/sequencer.js`
- [x] Create `src/features/sound/index.js` - public API

### Master Engine
- [x] Implement `initAudio()` with audio context unlock
- [x] Implement `startTransport()` / `stopTransport()`
- [x] Implement `setBPM()` synced to Tone.Transport
- [x] Implement `setMasterVolume()` with Tone.Volume node
- [x] Create master chain routing

### Bass Instrument
- [x] Create MembraneSynth → Distortion → BitCrusher → Filter → Delay → Volume chain
- [x] Implement `updateBassParams()` with pitch/filter/resonance mapping (8 notes: C2-C3)
- [x] Implement `setBassVolume()` and `setBassMute()`
- [x] Test bass sound in isolation (Monrella-style industrial)

### Synth Instrument
- [ ] Create PolySynth + Filter + LFO chain
- [ ] Implement `updateSynthParams()` with detune/filter/lfoRate mapping
- [ ] Implement `setSynthVolume()` and `setSynthMute()`
- [ ] Test synth sound in isolation

### Drum Instrument
- [ ] Create MembraneSynth (kick) + NoiseSynth (hi-hat) chain
- [ ] Implement `updateDrumParams()` with decay/velocity/noiseFilter mapping
- [ ] Implement `setDrumVolume()` and `setDrumMute()`
- [ ] Test drum sound in isolation

### Sequencer
- [x] Create 8-step pattern for bass
- [x] Implement `Tone.Sequence` for bass
- [x] Sync sequence to Transport
- [x] Test pattern loops correctly
- [ ] Create 8-step patterns for synth, drum
- [ ] Implement `Tone.Sequence` for synth, drum

### Parameter Application
- [x] Implement `applyBassParams()` for randomize mode
- [ ] Implement `applySynthParams()` and `applyDrumParams()`
- [x] Create `requestAnimationFrame` loop in main.js
- [ ] Test real-time parameter updates for all instruments

### Integration
- [x] Update `main.js` play button to init audio
- [x] Update BPM handler to call `setBPM()`
- [x] Update volume handlers to call Tone.js setters
- [x] Update mute handler to call Tone.js setters
- [ ] Wire `handleGestureDetected()` to full parameter application
- [ ] Test full flow: gesture → parameter → sound

### Testing
- [x] Test audio initialization on play click
- [x] Test BPM changes sync bass instrument
- [x] Test bass instrument in isolation
- [ ] Test all instruments playing simultaneously
- [x] Test volume/mute for bass instrument
- [ ] Test randomize mode parameter updates
- [ ] Test edge cases (no element, rapid changes, stop/start)

---

## Changelog

### v0.0.1 → v0.0.2 (Implementation Progress)

**Added**
- `src/features/sound/engine.js` - Tone.js initialization, Transport control, BPM, master volume
- `src/features/sound/instruments/bass.js` - Monrella-style industrial bass with Distortion(0.7), BitCrusher(4-bit), Filter(250Hz), FeedbackDelay(4n, 45% wet)
- `src/features/sound/sequencer.js` - 8-step bass sequencer synced to Tone.Transport
- `src/features/sound/index.js` - Public API exports
- `SOUND_CONFIG` constants in `core/constants.js` with all parameter ranges
- `audioInitialized` flag in `core/state.js`
- `startParameterLoop()` in `main.js` - requestAnimationFrame loop for randomize mode

**Changed**
- Bass pitch expanded from 3 notes (C2/E2/G2) to full octave (C2-D2-E2-F2-G2-A2-B2-C3)
- Bass oscillator changed from sine → sawtooth for aggressive harmonics
- Bass envelope tightened: decay 0.1s, release 0.3s, no sustain
- Bass filter lowered from 500Hz → 250Hz for sub-bass weight
- Play button now initializes audio context, creates bass + sequencer, starts Transport
- BPM input calls `setBPM()` in real-time
- Volume/mute sliders call Tone.js setters for bass

**Pending**
- Synth instrument (PolySynth + Filter + LFO)
- Drum instrument (MembraneSynth + NoiseSynth)
- Synth and drum sequencer patterns
- Full parameter application for all instruments in randomize mode
- Edge case testing

### v0.0.1 (Initial)
- Phase 3 implementation plan created
- Based on brainstorm-0.0.3.md and phase2-0.0.4.md
- Instrument-specific parameters: Bass (pitch/filter/resonance), Synth (detune/filter/lfoRate), Drum (decay/velocity/noiseFilter)
- Tone.js architecture: Transport → Volume → Instruments → Master
- 8-step sequencer patterns for each instrument
- Volume/mute integration with existing UI sliders
- Parameter application loop for randomize mode

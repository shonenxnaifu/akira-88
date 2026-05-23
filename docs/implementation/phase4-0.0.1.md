# Phase 4: Animation System - Implementation Plan

## Overview
- **Version**: 0.0.1
- **Duration**: 6-8 hours
- **Goal**: Implement PixiJS animation system with instrument-specific electrical effects synced to audio beat and hand movement
- **Prerequisites**: Phase 3 completed (sound engine, gesture UX, 3-second hold system)
- **Status**: Not Started
- **Dependency**: PixiJS library (WebGL renderer for high-performance particle effects)

---

## Animation Trigger Conditions

**Animation appears ONLY when:**
- User is in **randomize mode** (both hands open, crystal ball pose)
- Both hands are **detected on screen**
- A specific instrument is selected and **playing**

**Animation does NOT appear when:**
- Instrument selected but user NOT in randomize mode
- Only one hand visible
- No hands detected
- Instrument is stopped

---

## Architecture

```
PixiJS Application (WebGL canvas overlay, transparent, pointer-events: none)
├── Background Layer (semi-transparent dark navy #1A1A2E)
├── Effect Layer (electrical effects between hands)
│   ├── Bass: Lightning bolts (warm orange #FF6B35) + bloom
│   ├── Synth: Energy streams (warm purple #B849E8) + bloom
│   └── Drum: Particle sparks (warm gold #FFD700) + bloom
└── Hand Tracking (effect anchor points from MediaPipe positions)
```

**Note:** Canvas overlay does NOT break gesture detection. MediaPipe reads the `<video>` element directly (behind canvas). Canvas has `pointer-events: none` for click-through.

---

## Implementation Reference

### 1. PixiJS Setup (`animation/engine.js`)

**`initPixiJS(canvasElement)`** - Initialize PixiJS Application with transparent background, attach to DOM overlay canvas.

**`resizeRenderer()`** - Match canvas to window size, handle resize events.

**`destroyPixiJS()`** - Cleanup all PixiJS resources on app shutdown.

### 2. Animation State Management (`animation/state.js`)

**State tracking:**
- `currentEffect`: 'bass' | 'synth' | 'drum' | null
- `isPlaying`: boolean
- `beatIntensity`: 0-1 (normalized from Tone.Transport beat)
- `handMovementSpeed`: 0-1 (calculated from hand position deltas)
- `animationParams`: { boltCount, streamIntensity, sparkDensity }

**`updateAnimationState(params)`** - Called every frame from parameter loop or beat callback.

**`getAnimationIntensity()`** - Combines beat + hand movement speed for dynamic intensity.

### 3. Effect: Lightning Bolts (Bass - #FF6B35) + Bloom

**Visual:** Thick, jagged lightning bolts between hands. Warm orange/red color. Powerful, slow pulses synced to kick drum hits.

**Implementation:**
- Use PixiJS Graphics to draw bezier curves with jagged offsets
- Bolt path follows hand positions (start: left hand, end: right hand)
- Intensity increases on bass drum hits
- Multiple bolts (2-4) with varying thickness
- Post-processing bloom filter for glow

**`createLightningBolt(startX, startY, endX, endY, intensity)`** - Generate jagged bolt path with random offsets.

**`updateBassEffect(delta)`** - Animate bolts: fade in/out, pulse width, add branching sub-bolts on high intensity.

**Parameters:**
| Param | Range | Effect |
|---|---|---|
| `boltCount` | 1-4 | Number of simultaneous bolts |
| `boltThickness` | 2-8px | Bolt line width |
| `pulseSpeed` | 0.1-1.0 | How fast bolts flash |
| `branchProbability` | 0-0.5 | Chance of sub-bolt branching |

### 4. Effect: Energy Streams (Synth - #B849E8) + Bloom

**Visual:** Smooth, flowing energy streams between hands. Warm purple color. Continuous waves, liquid-like motion.

**Implementation:**
- Use PixiJS Graphics with multiple sine-wave curves
- Streams flow from one hand to the other in a wave pattern
- LFO modulates wave amplitude (matching synth LFO rate if possible)
- Gradient opacity from center to edges
- Post-processing bloom filter for glow

**`createEnergyStream(startX, startY, endX, endY, amplitude, frequency)`** - Generate flowing sine-wave path.

**`updateSynthEffect(delta)`** - Animate streams: flow movement, amplitude modulation, color shifting.

**Parameters:**
| Param | Range | Effect |
|---|---|---|
| `streamCount` | 2-6 | Number of parallel streams |
| `waveAmplitude` | 10-50px | Wave height |
| `flowSpeed` | 0.5-3.0 | Stream movement speed |
| `opacity` | 0.3-0.8 | Stream transparency |

### 5. Effect: Particle Sparks (Drum - #FFD700) + Bloom

**Visual:** Sharp, quick particle bursts. Warm gold color. Burst on drum hits, particles fly outward from between hands.

**Implementation:**
- Use PixiJS ParticleContainer for performance (hundreds of particles)
- Spawn particles on drum hit events
- Particles move outward from center point between hands
- Gravity, friction, and lifetime per particle
- Post-processing bloom filter for glow

**`createSparkBurst(centerX, centerY, intensity)`** - Spawn 20-100 particles with random velocities.

**`updateDrumEffect(delta)`** - Update particles: position, velocity, opacity decay, cleanup dead particles.

**Parameters:**
| Param | Range | Effect |
|---|---|---|
| `particleCount` | 20-100 per burst | Particles per drum hit |
| `burstForce` | 2-10 | Initial particle velocity |
| `gravity` | 0-0.5 | Downward pull |
| `friction` | 0.90-0.99 | Velocity decay |
| `lifetime` | 300-1000ms | Particle fade-out time |

### 6. Audio-Animation Sync (`animation/sync.js`)

**Beat Detection:**
- Subscribe to Tone.Transport callbacks for quarter notes
- `Tone.Transport.scheduleRepeat()` to trigger animation pulses every beat
- Use `Tone.Draw` for frame-accurate updates (schedules callbacks on RAF)

**`onBeat(time, beat)`** - Callback fired every quarter note. Increases animation intensity momentarily.

**`onTransportStart()`** / **`onTransportPause()`** - Start/stop animation loops.

**Intensity Mapping:**
- Bass: Bolt brightness/thickness peaks on kick hits (steps 0 and 4)
- Synth: Stream flow speed increases on snare/clap hits
- Drum: Spark burst triggers on every drum hit

### 7. Hand Position Tracking (`animation/tracking.js`)

**Hand Position Sources:**
- Read from `appState.handPosition` (updated by gesture system)
- Left hand: `appState.handPosition.left` {x, y} (normalized 0-1)
- Right hand: `appState.handPosition.right` {x, y} (normalized 0-1)

**`getHandPositions()`** - Returns screen coordinates from normalized hand positions.

**`calculateHandMovementSpeed()`** - Compare current vs previous hand positions per frame to get movement speed (0-1).

**Effect Anchor Points:**
- Effects span between left and right hand positions
- If only one hand visible, effect centers on visible hand
- If no hands visible, effect pauses or centers on screen

### 8. Effect Manager (`animation/manager.js`)

**`showEffect(instrument)`** - Activate specific instrument's effect (bass/synth/drum). Clears previous effect instantly (no fade).

**`hideEffect()`** - Clear all effects instantly.

**`updateEffect(delta)`** - Called every frame (PixiJS ticker). Updates active effect based on current state.

**`setEffectIntensity(intensity)`** - 0-1 scale, affects all effect parameters proportionally.

### 9. Integration (`main.js`)

**`initAnimation()`** - Called after audio initialization. Sets up PixiJS, attaches to DOM, starts render loop.

**`handleRandomizeStart()`** - Triggers `showEffect(appState.selectedElement)` when randomize mode activated.

**`handleRandomizeStop()`** - Triggers `hideEffect()` when randomize mode deactivated.

**`handleTransportStart()`** - Start animation sync with Tone.Transport.

**`handleTransportPause()`** - Pause animations, clear effects.

---

## Gesture Recognition Integration

### Randomize Mode Animation Trigger

When user enters randomize mode (both hands crystal ball pose):
1. `showEffect(appState.selectedElement)` activates corresponding effect
2. Effect renders between left and right hand positions
3. `handMovementSpeed` increases effect intensity
4. Beat sync adds rhythmic pulses

### Animation Behavior by State

| State | Animation |
|-------|-----------|
| **No instrument selected** | No animation |
| **Instrument selected, not in randomize mode** | No animation |
| **Randomize mode active, both hands visible, instrument playing** | Full beat-synced effect |
| **Only one hand visible** | No animation |
| **No hands detected** | No animation |
| **Instrument stopped** | Effect clears instantly |

---

## State & Constants

### Constants (`core/constants.js`)
```js
ANIMATION_CONFIG: {
  // Colors
  BASS_COLOR: 0xFF6B35,      // Warm orange
  SYNTH_COLOR: 0xB849E8,     // Warm purple
  DRUM_COLOR: 0xFFD700,      // Warm gold
  BG_COLOR: 0x1A1A2E,        // Dark navy (semi-transparent overlay)
  
  // Lightning (Bass)
  BASS_BOLT_COUNT: 3,
  BASS_BOLT_THICKNESS: 5,
  BASS_PULSE_SPEED: 0.5,
  
  // Streams (Synth)
  SYNTH_STREAM_COUNT: 4,
  SYNTH_WAVE_AMPLITUDE: 30,
  SYNTH_FLOW_SPEED: 1.5,
  
  // Sparks (Drum)
  DRUM_PARTICLE_COUNT: 50,
  DRUM_BURST_FORCE: 6,
  DRUM_GRAVITY: 0.3,
  DRUM_FRICTION: 0.95,
  DRUM_LIFETIME: 600,
  
  // Sync
  BEAT_SYNC_INTERVAL: '4n',  // Quarter note
}
```

### State Additions (`core/state.js`)
- `animationInitialized`: boolean (tracks if PixiJS is ready)
- `currentEffect`: string | null (active effect name)
- `animationIntensity`: number (0-1, combined beat + movement)
- `handMovementSpeed`: number (0-1, calculated from position deltas)
- `lastHandPosition`: { left: {x,y}, right: {x,y} } (for delta calculation)

---

## Verification Steps

### 1. PixiJS Setup
- [ ] PixiJS initializes without errors
- [ ] Canvas overlays webcam correctly (transparent background, pointer-events: none)
- [ ] Resize handler works on window resize
- [ ] Cleanup function disposes all resources
- [ ] Gesture detection still works normally (MediaPipe reads video behind canvas)

### 2. Lightning Effect (Bass)
- [ ] Bolts appear between hands when bass + randomize mode active
- [ ] Bolt color is warm orange (#FF6B35)
- [ ] Multiple bolts (2-4) render simultaneously
- [ ] Bolts pulse/thicken on kick drum hits
- [ ] Jagged path looks like real lightning
- [ ] Bloom/glow effect visible
- [ ] Effect clears instantly when randomize mode exits

### 3. Energy Stream Effect (Synth)
- [ ] Smooth streams appear between hands when synth + randomize mode active
- [ ] Stream color is warm purple (#B849E8)
- [ ] Multiple parallel streams (3-5) flow continuously
- [ ] Wave amplitude modulates with synth LFO rate
- [ ] Streams flow from one hand to the other
- [ ] Bloom/glow effect visible
- [ ] Effect clears instantly when randomize mode exits

### 4. Particle Spark Effect (Drum)
- [ ] Particles burst between hands on drum hits when drum + randomize mode active
- [ ] Particle color is warm gold (#FFD700)
- [ ] 30-80 particles spawn per hit
- [ ] Particles fly outward with gravity and friction
- [ ] Particles fade out over lifetime
- [ ] Bloom/glow effect visible
- [ ] Effect clears instantly when randomize mode exits

### 5. Audio Sync
- [ ] Animation intensity peaks on beat (quarter notes)
- [ ] Bass bolts flash on kick hits
- [ ] Drum sparks burst on snare/clap hits
- [ ] Animation pauses when transport pauses
- [ ] Animation resumes in sync when transport starts

### 6. Hand Movement Integration
- [ ] Effect position updates with hand movement (60fps)
- [ ] Faster hand movement = higher animation intensity
- [ ] Effect centers correctly when only one hand visible (or pauses)
- [ ] Effect pauses gracefully when no hands detected

### 7. Performance
- [ ] Animation runs at 60fps on laptop
- [ ] No frame drops during randomize mode
- [ ] Memory doesn't grow over time (particle cleanup)
- [ ] WebGL context doesn't crash on rapid instrument switches

### 8. Edge Cases
- [ ] Switch instrument while effect active → old effect clears, new effect appears instantly
- [ ] No hands detected → effect clears
- [ ] Rapid instrument switches → smooth transitions, no glitches
- [ ] Window resize → canvas and effects scale correctly

---

## Task/Todo List

### Setup
- [ ] Install PixiJS (`npm install pixi.js`)
- [ ] Create `src/features/animation/engine.js` - PixiJS initialization
- [ ] Create `src/features/animation/state.js` - animation state tracking
- [ ] Create `src/features/animation/manager.js` - effect lifecycle
- [ ] Create `src/features/animation/index.js` - public API

### Core Engine
- [ ] Implement `initPixiJS()` with transparent overlay canvas (`pointer-events: none`)
- [ ] Implement `resizeRenderer()` for responsive canvas
- [ ] Implement `destroyPixiJS()` cleanup
- [ ] Create PixiJS ticker loop synced to RAF

### Lightning Effect (Bass)
- [ ] Implement `createLightningBolt()` bezier path generation with jagged offsets
- [ ] Implement bolt pooling (reuse Graphics objects)
- [ ] Add branching sub-bolt logic
- [ ] Implement pulse animation (thickness/opacity)
- [ ] Add bloom/glow filter

### Energy Stream Effect (Synth)
- [ ] Implement `createEnergyStream()` sine-wave path generation
- [ ] Implement stream flow animation (phase shift over time)
- [ ] Add multiple parallel streams with offset phases
- [ ] Implement amplitude modulation (LFO sync)
- [ ] Add gradient opacity (stronger center, fade edges)
- [ ] Add bloom/glow filter

### Particle Spark Effect (Drum)
- [ ] Implement `createSparkBurst()` particle spawning
- [ ] Use PixiJS ParticleContainer for performance
- [ ] Implement particle physics (velocity, gravity, friction)
- [ ] Add opacity/lifetime decay
- [ ] Implement particle pooling (reuse Sprite objects)
- [ ] Add bloom/glow filter

### Audio Sync
- [ ] Implement `onBeat()` callback using Tone.Transport.scheduleRepeat()
- [ ] Use Tone.Draw for frame-accurate updates
- [ ] Map beat events to effect intensity spikes
- [ ] Implement intensity decay between beats

### Hand Tracking Integration
- [ ] Read hand positions from gesture system state
- [ ] Convert normalized to screen coordinates
- [ ] Implement `calculateHandMovementSpeed()` delta tracking
- [ ] Handle single-hand and no-hand cases (pause animation)

### Integration
- [ ] Update `main.js` to call `initAnimation()` after audio init
- [ ] Wire `handleRandomizeStart()` to `showEffect(instrument)`
- [ ] Wire `handleRandomizeStop()` to `hideEffect()`
- [ ] Wire transport start/pause to animation start/pause
- [ ] Add animation cleanup to app shutdown

### Testing
- [ ] Test PixiJS initialization
- [ ] Test each effect in isolation
- [ ] Test effect switching (bass → synth → drum) - instant swap
- [ ] Test audio sync with different BPMs
- [ ] Test hand movement intensity modulation
- [ ] Test performance (60fps target)
- [ ] Test edge cases (no hands, rapid switches, resize)

---

## Changelog

### v0.0.1 initial (Animation System)

**Added**
- PixiJS dependency and WebGL overlay canvas
- `animationInitialized` flag to `appState`
- `currentEffect`, `animationIntensity`, `handMovementSpeed` to `appState`
- `ANIMATION_CONFIG` constants (colors, effect parameters, sync settings)
- `src/features/animation/engine.js` - PixiJS setup and render loop
- `src/features/animation/state.js` - animation state management
- `src/features/animation/manager.js` - effect show/hide/update lifecycle
- `src/features/animation/effects/lightning.js` - bass lightning bolts
- `src/features/animation/effects/streams.js` - synth energy streams
- `src/features/animation/effects/sparks.js` - drum particle sparks
- `src/features/animation/sync.js` - Tone.Transport beat sync
- `src/features/animation/tracking.js` - hand position tracking
- `src/features/animation/index.js` - public API exports

**Integration Points**
- `main.js` calls `initAnimation()` after `initAudio()`
- `handleRandomizeStart()` triggers `showEffect(instrument)`
- `handleRandomizeStop()` triggers `hideEffect()`
- Transport start/pause controls animation ticker
- Hand position deltas update `handMovementSpeed` every frame

**Technical Notes**
- PixiJS uses transparent background to overlay webcam video
- Canvas has `pointer-events: none` to not interfere with UI or gesture detection
- Effects render between left/right hand positions (normalized → screen coords)
- ParticleContainer used for sparks (hundreds of particles, GPU-accelerated)
- Graphics used for lightning and streams (bezier curves, dynamic paths)
- Tone.Draw schedules animation updates on exact audio clock
- All effects use instant swap (no fade transitions)
- Bloom/glow filters applied to all effects for visual impact
- Animation only active during randomize mode with both hands visible

# Bass Configurations for Techno Sounds

## Current Active Configuration

### BASS_NOTES Array (Warehouse Rolling - Key of G)
```javascript
const BASS_NOTES = [82.41, 87.31, 92.50, 98.0, 103.83, 110.0, 116.54, 123.47];
//                  E2     F2     F#2    G2    G#2    A2     A#2    B2
```

### BASS_PATTERN (Warehouse Rolling Techno)
```javascript
const BASS_PATTERN = [
  null, 'G2', 'G2', 'G2',   // Beat 1
  null, 'A2', 'G2', 'G2',   // Beat 2
  null, 'F#2', 'G2', 'G2',  // Beat 3
  null, 'G2', 'F#3', 'G2'   // Beat 4
];
```
**Timing:** `'16n'` (16th notes)
**Note duration:** `'16n'`

---

## Signal Chain

### Acid Techno
```
synth → chebyshev → distortion → filter → delay → reverb → volume → master
```
**Note:** Remove bitcrusher for acid sounds to preserve harmonic richness.

### Hard Techno
```
synth → chebyshev → distortion → bitcrusher → filter → delay → reverb → volume → master
```

### Warehouse Rolling Techno (Current)
```
synth → chebyshev → distortion → highpass → lowpass → delay → reverb → volume → master
```

---

## WAREHOUSE ROLLING TECHNO Configuration

### Current Active Config
**Character:** Subby, rolling, Berghain-style, layered low-end
**Recommended Key:** G (98 Hz)
**Typical BPM:** 135-145

```javascript
// BASS_NOTES for Warehouse Rolling (Key of G, E2-B2 range)
const BASS_NOTES = [82.41, 87.31, 92.50, 98.0, 103.83, 110.0, 116.54, 123.47];
//                  E2     F2     F#2    G2    G#2    A2     A#2    B2
```

```javascript
// createBass()
highpass = new Tone.Filter(65, "highpass");

lowpass = new Tone.Filter(350, "lowpass");
lowpass.Q.value = 12;

const distortion = new Tone.Distortion(0.6);
const chebyshev = new Tone.Chebyshev(4);
const delay = new Tone.FeedbackDelay("16n", 0.4);
delay.wet.value = 0.3;
const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2, preDelay: 0.01 });
volume = new Tone.Volume(12);

synth = new Tone.MembraneSynth({
  pitchDecay: 0.01,
  octaves: 6,
  oscillator: { type: "sawtooth" },
  envelope: {
    attack: 0.001,
    decay: 0.15,
    sustain: 0.5,
    release: 0.2,
    attackCurve: "linear",
  },
}).connect(chebyshev);

// Signal chain
chebyshev.connect(distortion);
distortion.connect(highpass);
highpass.connect(lowpass);
lowpass.connect(delay);
delay.connect(reverb);
reverb.connect(volume);
volume.connect(getMasterVolume());
```

**BASS_PATTERN for Warehouse Rolling:**
```javascript
// 16-step pattern, first 16th of each beat empty (makes room for kick)
const BASS_PATTERN = [
  null, 'G2', 'G2', 'G2',   // Beat 1
  null, 'A2', 'G2', 'G2',   // Beat 2
  null, 'F#2', 'G2', 'G2',  // Beat 3
  null, 'G2', 'F#3', 'G2'   // Beat 4
];

// Sequencer setup
bassSeq = new Tone.Sequence((time, note) => {
  if (note) {
    getBassSynth().triggerAttackRelease(note, '16n', time);
  }
}, BASS_PATTERN, '16n');
```

**updateBassParams calculation:**
```javascript
const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
const clampedIndex = Math.max(0, Math.min(7, noteIndex));
synth.frequency.value = BASS_NOTES[clampedIndex];

const freq = 200 + params.filter * (350 - 200);  // Range: 200-350Hz
lowpass.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 12;  // Range: 0-12
lowpass.Q.value = q;
```

**Key characteristics:**
- 16th-note pattern with first note of each beat empty (makes room for kick)
- Highpass at 65Hz to leave room for sub-bass layer
- Lowpass at 200-350Hz for mid-bass rolling character
- Moderate distortion and chebyshev for harmonic richness
- Shorter sustain (0.5) for tight rolling feel

---

## ACID TECHNO Configurations

### Acid #1: Classic TB-303 Squelch
**Character:** Clean, resonant, hypnotic
**Recommended Key:** A (110 Hz)
**Typical BPM:** 130-140

```javascript
// BASS_NOTES for Acid #1 (Key of A, F#2-C#3 range)
const BASS_NOTES = [92.50, 98.0, 103.83, 110.0, 123.47, 130.81, 146.83, 164.81];
//                  F#2    G2    G#2    A2     B2     C3     D3     E3
```

```javascript
// createBass()
filter = new Tone.Filter(400, "lowpass");
filter.Q.value = 20;

const distortion = new Tone.Distortion(0.5);
const chebyshev = new Tone.Chebyshev(4);
const delay = new Tone.FeedbackDelay("8n", 0.5);
delay.wet.value = 0.5;
const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2, preDelay: 0.01 });
volume = new Tone.Volume(10);

synth = new Tone.MembraneSynth({
  pitchDecay: 0.01,
  octaves: 6,
  oscillator: { type: "sawtooth" },
  envelope: {
    attack: 0.001,
    decay: 0.3,
    sustain: 0.8,
    release: 0.4,
    attackCurve: "linear",
  },
}).connect(chebyshev);

// Signal chain
chebyshev.connect(distortion);
distortion.connect(filter);
filter.connect(delay);
delay.connect(reverb);
reverb.connect(volume);
volume.connect(getMasterVolume());
```

**BASS_PATTERN for Acid #1:**
```javascript
// 8-step pattern, off-beat emphasis for hypnotic feel
const BASS_PATTERN = ['A2', null, 'A2', null, 'A2', null, 'A2', 'B2'];

// Sequencer setup
bassSeq = new Tone.Sequence((time, note) => {
  if (note) {
    getBassSynth().triggerAttackRelease(note, '8n', time);
  }
}, BASS_PATTERN, '8n');
```

**updateBassParams calculation:**
```javascript
const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
const clampedIndex = Math.max(0, Math.min(7, noteIndex));
synth.frequency.value = BASS_NOTES[clampedIndex];

const freq = 400 + params.filter * (800 - 400);  // Range: 400-800Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 20;  // Range: 0-20
filter.Q.value = q;
```

---

### Acid #2: Dark Acid
**Character:** Deeper, more distorted, menacing
**Recommended Key:** F (87.31 Hz)
**Typical BPM:** 135-145

```javascript
// BASS_NOTES for Acid #2 (Key of F, D2-A2 range)
const BASS_NOTES = [73.42, 82.41, 87.31, 92.50, 98.0, 110.0, 123.47, 130.81];
//                  D2     E2     F2     F#2    G2    A2     B2     C3
```

```javascript
// createBass()
filter = new Tone.Filter(300, "lowpass");
filter.Q.value = 18;

const distortion = new Tone.Distortion(0.7);
const chebyshev = new Tone.Chebyshev(6);
const delay = new Tone.FeedbackDelay("4n", 0.6);
delay.wet.value = 0.6;
const reverb = new Tone.Reverb({ decay: 2.0, wet: 0.3, preDelay: 0.01 });
volume = new Tone.Volume(10);

synth = new Tone.MembraneSynth({
  pitchDecay: 0.005,
  octaves: 8,
  oscillator: { type: "square" },
  envelope: {
    attack: 0.001,
    decay: 0.2,
    sustain: 0.6,
    release: 0.3,
    attackCurve: "linear",
  },
}).connect(chebyshev);

// Signal chain
chebyshev.connect(distortion);
distortion.connect(filter);
filter.connect(delay);
delay.connect(reverb);
reverb.connect(volume);
volume.connect(getMasterVolume());
```

**BASS_PATTERN for Acid #2:**
```javascript
// 8-step pattern, driving with variation
const BASS_PATTERN = ['F2', null, 'F2', 'D2', 'F2', null, 'C3', 'F2'];

// Sequencer setup
bassSeq = new Tone.Sequence((time, note) => {
  if (note) {
    getBassSynth().triggerAttackRelease(note, '8n', time);
  }
}, BASS_PATTERN, '8n');
```

**updateBassParams calculation:**
```javascript
const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
const clampedIndex = Math.max(0, Math.min(7, noteIndex));
synth.frequency.value = BASS_NOTES[clampedIndex];

const freq = 300 + params.filter * (700 - 300);  // Range: 300-700Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 18;  // Range: 0-18
filter.Q.value = q;
```

---

### Acid #3: Psychedelic Acid
**Character:** Wet, spacious, trippy
**Recommended Key:** E (82.41 Hz)
**Typical BPM:** 125-135

```javascript
// BASS_NOTES for Acid #3 (Key of E, C#2-B2 range)
const BASS_NOTES = [69.30, 73.42, 82.41, 87.31, 98.0, 110.0, 123.47, 130.81];
//                  C#2    D2     E2     F2     G2    A2     B2     C3
```

```javascript
// createBass()
filter = new Tone.Filter(500, "lowpass");
filter.Q.value = 22;

const distortion = new Tone.Distortion(0.4);
const chebyshev = new Tone.Chebyshev(3);
const delay = new Tone.FeedbackDelay("8n", 0.7);
delay.wet.value = 0.7;
const reverb = new Tone.Reverb({ decay: 3.0, wet: 0.5, preDelay: 0.01 });
volume = new Tone.Volume(8);

synth = new Tone.MembraneSynth({
  pitchDecay: 0.02,
  octaves: 5,
  oscillator: { type: "sawtooth" },
  envelope: {
    attack: 0.005,
    decay: 0.4,
    sustain: 0.9,
    release: 0.6,
    attackCurve: "linear",
  },
}).connect(chebyshev);

// Signal chain
chebyshev.connect(distortion);
distortion.connect(filter);
filter.connect(delay);
delay.connect(reverb);
reverb.connect(volume);
volume.connect(getMasterVolume());
```

**BASS_PATTERN for Acid #3:**
```javascript
// 8-step pattern, sparse for spacious feel
const BASS_PATTERN = ['E2', null, null, 'G2', 'E2', null, 'D2', null];

// Sequencer setup
bassSeq = new Tone.Sequence((time, note) => {
  if (note) {
    getBassSynth().triggerAttackRelease(note, '8n', time);
  }
}, BASS_PATTERN, '8n');
```

**updateBassParams calculation:**
```javascript
const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
const clampedIndex = Math.max(0, Math.min(7, noteIndex));
synth.frequency.value = BASS_NOTES[clampedIndex];

const freq = 500 + params.filter * (1000 - 500);  // Range: 500-1000Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 22;  // Range: 0-22
filter.Q.value = q;
```

---

## HARD TECHNO Configurations

### Hard #1: Industrial Punch
**Character:** Aggressive, distorted, sub-heavy
**Recommended Key:** D (73.42 Hz)
**Typical BPM:** 140-155

```javascript
// BASS_NOTES for Hard #1 (Key of D, C1-A1 range)
const BASS_NOTES = [32.70, 36.71, 41.20, 49.00, 55.00, 61.74, 73.42, 82.41];
//                  C1     D1     E1     G1     A1     B1     D2     E2
```

```javascript
// createBass()
filter = new Tone.Filter(100, "lowpass");
filter.Q.value = 8;

const distortion = new Tone.Distortion(0.95);
const bitcrusher = new Tone.BitCrusher(4);
const chebyshev = new Tone.Chebyshev(8);
const delay = new Tone.FeedbackDelay("4n", 0.2);
delay.wet.value = 0.2;
const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2, preDelay: 0.01 });
volume = new Tone.Volume(12);

synth = new Tone.MembraneSynth({
  pitchDecay: 0.005,
  octaves: 10,
  oscillator: { type: "sawtooth" },
  envelope: {
    attack: 0.001,
    decay: 0.15,
    sustain: 0.6,
    release: 0.3,
    attackCurve: "linear",
  },
}).connect(chebyshev);

// Signal chain
chebyshev.connect(distortion);
distortion.connect(bitcrusher);
bitcrusher.connect(filter);
filter.connect(delay);
delay.connect(reverb);
reverb.connect(volume);
volume.connect(getMasterVolume());
```

**BASS_PATTERN for Hard #1:**
```javascript
// 8-step pattern, driving four-on-the-floor feel
const BASS_PATTERN = ['D1', null, 'D1', null, 'D1', null, 'D1', 'D1'];

// Sequencer setup
bassSeq = new Tone.Sequence((time, note) => {
  if (note) {
    getBassSynth().triggerAttackRelease(note, '8n', time);
  }
}, BASS_PATTERN, '8n');
```

**updateBassParams calculation:**
```javascript
const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
const clampedIndex = Math.max(0, Math.min(7, noteIndex));
synth.frequency.value = BASS_NOTES[clampedIndex];

const freq = 100 + params.filter * (500 - 100);  // Range: 100-500Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 8;  // Range: 0-8
filter.Q.value = q;
```

---

### Hard #2: Raw Hardcore
**Character:** Gritty, mid-range focused, punchy
**Recommended Key:** F# (92.50 Hz)
**Typical BPM:** 150-170

```javascript
// BASS_NOTES for Hard #2 (Key of F#, D2-C3 range)
const BASS_NOTES = [73.42, 82.41, 92.50, 98.0, 110.0, 123.47, 130.81, 146.83];
//                  D2     E2     F#2    G2    A2     B2     C3     D3
```

```javascript
// createBass()
filter = new Tone.Filter(150, "lowpass");
filter.Q.value = 12;

const distortion = new Tone.Distortion(0.9);
const bitcrusher = new Tone.BitCrusher(3);
const chebyshev = new Tone.Chebyshev(10);
const delay = new Tone.FeedbackDelay("4n", 0.3);
delay.wet.value = 0.3;
const reverb = new Tone.Reverb({ decay: 2.0, wet: 0.3, preDelay: 0.01 });
volume = new Tone.Volume(12);

synth = new Tone.MembraneSynth({
  pitchDecay: 0.01,
  octaves: 8,
  oscillator: { type: "square" },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0.5,
    release: 0.2,
    attackCurve: "linear",
  },
}).connect(chebyshev);

// Signal chain
chebyshev.connect(distortion);
distortion.connect(bitcrusher);
bitcrusher.connect(filter);
filter.connect(delay);
delay.connect(reverb);
reverb.connect(volume);
volume.connect(getMasterVolume());
```

**BASS_PATTERN for Hard #2:**
```javascript
// 8-step pattern, syncopated hardcore rhythm
const BASS_PATTERN = ['F#2', 'F#2', null, 'F#2', 'D2', null, 'F#2', 'A2'];

// Sequencer setup
bassSeq = new Tone.Sequence((time, note) => {
  if (note) {
    getBassSynth().triggerAttackRelease(note, '8n', time);
  }
}, BASS_PATTERN, '8n');
```

**updateBassParams calculation:**
```javascript
const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
const clampedIndex = Math.max(0, Math.min(7, noteIndex));
synth.frequency.value = BASS_NOTES[clampedIndex];

const freq = 150 + params.filter * (600 - 150);  // Range: 150-600Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 12;  // Range: 0-12
filter.Q.value = q;
```

---

### Hard #3: Sub Terror
**Character:** Deep, rumbling, minimal
**Recommended Key:** C (65.41 Hz)
**Typical BPM:** 130-145

```javascript
// BASS_NOTES for Hard #3 (Key of C, C1-C2 range)
const BASS_NOTES = [32.70, 36.71, 41.20, 49.00, 55.00, 61.74, 65.41, 73.42];
//                  C1     D1     E1     G1     A1     B1     C2     D2
```

```javascript
// createBass()
filter = new Tone.Filter(80, "lowpass");
filter.Q.value = 6;

const distortion = new Tone.Distortion(0.7);
const bitcrusher = new Tone.BitCrusher(6);
const chebyshev = new Tone.Chebyshev(6);
const delay = new Tone.FeedbackDelay("4n", 0.15);
delay.wet.value = 0.15;
const reverb = new Tone.Reverb({ decay: 1.0, wet: 0.1, preDelay: 0.01 });
volume = new Tone.Volume(14);

synth = new Tone.MembraneSynth({
  pitchDecay: 0.002,
  octaves: 12,
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.001,
    decay: 0.2,
    sustain: 0.7,
    release: 0.5,
    attackCurve: "linear",
  },
}).connect(chebyshev);

// Signal chain
chebyshev.connect(distortion);
distortion.connect(bitcrusher);
bitcrusher.connect(filter);
filter.connect(delay);
delay.connect(reverb);
reverb.connect(volume);
volume.connect(getMasterVolume());
```

**BASS_PATTERN for Hard #3:**
```javascript
// 8-step pattern, minimal sub-bass focus
const BASS_PATTERN = ['C1', null, 'C1', null, 'C1', null, 'C1', null];

// Sequencer setup
bassSeq = new Tone.Sequence((time, note) => {
  if (note) {
    getBassSynth().triggerAttackRelease(note, '8n', time);
  }
}, BASS_PATTERN, '8n');
```

**updateBassParams calculation:**
```javascript
const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
const clampedIndex = Math.max(0, Math.min(7, noteIndex));
synth.frequency.value = BASS_NOTES[clampedIndex];

const freq = 80 + params.filter * (400 - 80);  // Range: 80-400Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 6;  // Range: 0-6
filter.Q.value = q;
```

---

## Configuration Comparison

| Parameter | Warehouse | Acid #1 | Acid #2 | Acid #3 | Hard #1 | Hard #2 | Hard #3 |
|-----------|-----------|---------|---------|---------|---------|---------|---------|
| **Key** | G | A | F | E | D | F# | C |
| **BASS_NOTES Range** | E2-B2 | F#2-E3 | D2-C3 | C#2-C3 | C1-E2 | D2-D3 | C1-D2 |
| **Oscillator** | sawtooth | sawtooth | square | sawtooth | sawtooth | square | sine |
| **Octaves** | 6 | 6 | 8 | 5 | 10 | 8 | 12 |
| **Filter Type** | HP+LP | LP | LP | LP | LP | LP | LP |
| **Filter Freq** | 65/350Hz | 400Hz | 300Hz | 500Hz | 100Hz | 150Hz | 80Hz |
| **Filter Q** | 12 | 20 | 18 | 22 | 8 | 12 | 6 |
| **Distortion** | 0.6 | 0.5 | 0.7 | 0.4 | 0.95 | 0.9 | 0.7 |
| **Chebyshev** | 4 | 4 | 6 | 3 | 8 | 10 | 6 |
| **Bitcrusher** | - | - | - | - | 4 | 3 | 6 |
| **Delay** | 16n | 8n | 4n | 8n | 4n | 4n | 4n |
| **Delay Wet** | 0.3 | 0.5 | 0.6 | 0.7 | 0.2 | 0.3 | 0.15 |
| **Reverb Wet** | 0.2 | 0.2 | 0.3 | 0.5 | 0.2 | 0.3 | 0.1 |
| **Volume** | 12 | 10 | 10 | 8 | 12 | 12 | 14 |
| **Sustain** | 0.5 | 0.8 | 0.6 | 0.9 | 0.6 | 0.5 | 0.7 |
| **Pattern** | 16-step | 8-step | 8-step | 8-step | 8-step | 8-step | 8-step |
| **Timing** | 16n | 8n | 8n | 8n | 8n | 8n | 8n |

---

## BASS_NOTES Reference by Style

### Warehouse Rolling (Key of G)
```javascript
const BASS_NOTES = [82.41, 87.31, 92.50, 98.0, 103.83, 110.0, 116.54, 123.47];
//                  E2     F2     F#2    G2    G#2    A2     A#2    B2
```

### Acid #1: Classic TB-303 (Key of A)
```javascript
const BASS_NOTES = [92.50, 98.0, 103.83, 110.0, 123.47, 130.81, 146.83, 164.81];
//                  F#2    G2    G#2    A2     B2     C3     D3     E3
```

### Acid #2: Dark Acid (Key of F)
```javascript
const BASS_NOTES = [73.42, 82.41, 87.31, 92.50, 98.0, 110.0, 123.47, 130.81];
//                  D2     E2     F2     F#2    G2    A2     B2     C3
```

### Acid #3: Psychedelic Acid (Key of E)
```javascript
const BASS_NOTES = [69.30, 73.42, 82.41, 87.31, 98.0, 110.0, 123.47, 130.81];
//                  C#2    D2     E2     F2     G2    A2     B2     C3
```

### Hard #1: Industrial Punch (Key of D)
```javascript
const BASS_NOTES = [32.70, 36.71, 41.20, 49.00, 55.00, 61.74, 73.42, 82.41];
//                  C1     D1     E1     G1     A1     B1     D2     E2
```

### Hard #2: Raw Hardcore (Key of F#)
```javascript
const BASS_NOTES = [73.42, 82.41, 92.50, 98.0, 110.0, 123.47, 130.81, 146.83];
//                  D2     E2     F#2    G2    A2     B2     C3     D3
```

### Hard #3: Sub Terror (Key of C)
```javascript
const BASS_NOTES = [32.70, 36.71, 41.20, 49.00, 55.00, 61.74, 65.41, 73.42];
//                  C1     D1     E1     G1     A1     B1     C2     D2
```

---

## Full Note Frequency Reference

| Note | Frequency (Hz) | Note | Frequency (Hz) |
|------|----------------|------|----------------|
| C1 | 32.70 | C2 | 65.41 |
| C#1 | 34.65 | C#2 | 69.30 |
| D1 | 36.71 | D2 | 73.42 |
| D#1 | 38.89 | D#2 | 77.78 |
| E1 | 41.20 | E2 | 82.41 |
| F1 | 43.65 | F2 | 87.31 |
| F#1 | 46.25 | F#2 | 92.50 |
| G1 | 49.00 | G2 | 98.00 |
| G#1 | 51.91 | G#2 | 103.83 |
| A1 | 55.00 | A2 | 110.00 |
| A#1 | 58.27 | A#2 | 116.54 |
| B1 | 61.74 | B2 | 123.47 |
| | | C3 | 130.81 |
| | | D3 | 146.83 |
| | | E3 | 164.81 |

---

## updateBassParams Calculation Guide

### Standard Formula (All Configs)

```javascript
export function updateBassParams(params) {
  if (!synth || !filter) return;  // Change 'filter' to 'lowpass' for Warehouse config

  // 1. Pitch mapping (uses BASS_NOTES array)
  const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
  const clampedIndex = Math.max(0, Math.min(7, noteIndex));
  synth.frequency.value = BASS_NOTES[clampedIndex];

  // 2. Filter frequency mapping
  const freq = minFreq + params.filter * (maxFreq - minFreq);
  filter.frequency.value = freq;  // Change 'filter' to 'lowpass' for Warehouse config

  // 3. Q calculation
  const q = ((params.resonance + 1) / 2) * maxQ;
  filter.Q.value = q;  // Change 'filter' to 'lowpass' for Warehouse config
}
```

### Parameter Ranges Per Config

| Config | minFreq | maxFreq | maxQ | Filter Variable |
|--------|---------|---------|------|-----------------|
| Warehouse | 200 | 350 | 12 | `lowpass` |
| Acid #1 | 400 | 800 | 20 | `filter` |
| Acid #2 | 300 | 700 | 18 | `filter` |
| Acid #3 | 500 | 1000 | 22 | `filter` |
| Hard #1 | 100 | 500 | 8 | `filter` |
| Hard #2 | 150 | 600 | 12 | `filter` |
| Hard #3 | 80 | 400 | 6 | `filter` |

### How to Adjust When Switching Configs

1. **Change BASS_NOTES array:**
   - Replace with the array for your target style (see "BASS_NOTES Reference by Style" section)

2. **Change BASS_PATTERN:**
   - Replace with the pattern for your target style
   - Update timing from `'16n'` to `'8n'` (or vice versa for Warehouse)

3. **Change filter variable name:**
   - Warehouse: Use `lowpass`
   - All others: Use `filter`

4. **Update frequency range:**
   - Change `minFreq` and `maxFreq` values per config table above

5. **Update max Q:**
   - Change `maxQ` value per config table above

---

## Frequency Calculation Formula

For each configuration:

```javascript
// Pitch mapping (uses BASS_NOTES array)
const noteIndex = Math.round(((params.pitch + 1) / 2) * 7);
const clampedIndex = Math.max(0, Math.min(7, noteIndex));
synth.frequency.value = BASS_NOTES[clampedIndex];

// Filter frequency mapping
const freq = minFreq + params.filter * (maxFreq - minFreq);
filter.frequency.value = freq;

// Q calculation
const q = ((params.resonance + 1) / 2) * maxQ;
filter.Q.value = q;
```

**Where:**
- `params.pitch` = -1 to 1 (normalized)
- `params.filter` = 0 to 1 (normalized)
- `params.resonance` = -1 to 1 (normalized)
- `minFreq` = minimum filter frequency
- `maxFreq` = maximum filter frequency
- `maxQ` = maximum Q value

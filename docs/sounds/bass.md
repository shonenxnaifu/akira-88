# Bass Configurations for Techno Sounds

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

---

## ACID TECHNO Configurations

### Acid #1: Classic TB-303 Squelch
**Character:** Clean, resonant, hypnotic

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

**updateBassParams calculation:**
```javascript
const freq = 400 + params.filter * (800 - 400);  // Range: 400-800Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 20;  // Range: 0-20
filter.Q.value = q;
```

---

### Acid #2: Dark Acid
**Character:** Deeper, more distorted, menacing

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

**updateBassParams calculation:**
```javascript
const freq = 300 + params.filter * (700 - 300);  // Range: 300-700Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 18;  // Range: 0-18
filter.Q.value = q;
```

---

### Acid #3: Psychedelic Acid
**Character:** Wet, spacious, trippy

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

**updateBassParams calculation:**
```javascript
const freq = 500 + params.filter * (1000 - 500);  // Range: 500-1000Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 22;  // Range: 0-22
filter.Q.value = q;
```

---

## HARD TECHNO Configurations

### Hard #1: Industrial Punch
**Character:** Aggressive, distorted, sub-heavy

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

**updateBassParams calculation:**
```javascript
const freq = 100 + params.filter * (500 - 100);  // Range: 100-500Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 8;  // Range: 0-8
filter.Q.value = q;
```

---

### Hard #2: Raw Hardcore
**Character:** Gritty, mid-range focused, punchy

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

**updateBassParams calculation:**
```javascript
const freq = 150 + params.filter * (600 - 150);  // Range: 150-600Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 12;  // Range: 0-12
filter.Q.value = q;
```

---

### Hard #3: Sub Terror
**Character:** Deep, rumbling, minimal

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

**updateBassParams calculation:**
```javascript
const freq = 80 + params.filter * (400 - 80);  // Range: 80-400Hz
filter.frequency.value = freq;

const q = ((params.resonance + 1) / 2) * 6;  // Range: 0-6
filter.Q.value = q;
```

---

## Configuration Comparison

| Parameter | Acid #1 | Acid #2 | Acid #3 | Hard #1 | Hard #2 | Hard #3 |
|-----------|---------|---------|---------|---------|---------|---------|
| **Oscillator** | sawtooth | square | sawtooth | sawtooth | square | sine |
| **Octaves** | 6 | 8 | 5 | 10 | 8 | 12 |
| **Filter Freq** | 400Hz | 300Hz | 500Hz | 100Hz | 150Hz | 80Hz |
| **Filter Q** | 20 | 18 | 22 | 8 | 12 | 6 |
| **Distortion** | 0.5 | 0.7 | 0.4 | 0.95 | 0.9 | 0.7 |
| **Chebyshev** | 4 | 6 | 3 | 8 | 10 | 6 |
| **Bitcrusher** | - | - | - | 4 | 3 | 6 |
| **Delay Wet** | 0.5 | 0.6 | 0.7 | 0.2 | 0.3 | 0.15 |
| **Reverb Wet** | 0.2 | 0.3 | 0.5 | 0.2 | 0.3 | 0.1 |
| **Volume** | 10 | 10 | 8 | 12 | 12 | 14 |
| **Sustain** | 0.8 | 0.6 | 0.9 | 0.6 | 0.5 | 0.7 |

---

## Frequency Calculation Formula

For each configuration:

```javascript
// Initial filter frequency = X
// updateBassParams frequency range = X to maxFreq

const freq = X + params.filter * (maxFreq - X);
filter.frequency.value = freq;

// Q calculation
const q = ((params.resonance + 1) / 2) * maxQ;
filter.Q.value = q;
```

**Where:**
- `params.filter` = 0 to 1 (normalized)
- `params.resonance` = -1 to 1 (normalized)
- `X` = initial filter frequency
- `maxFreq` = maximum filter frequency (typically 2-5x initial)
- `maxQ` = maximum Q value

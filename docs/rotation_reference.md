# Hand Rotation Reference — Techno Gesture Track App

## Overview

This document explains how hand rotation is calculated in the Techno Gesture Track App, covering both the **current x-y plane rotation** and the **z-tilt rotation** for randomize mode (crystal ball pose).

---

## MediaPipe Coordinate System

### Normalized Coordinates (x, y)

MediaPipe returns **normalized coordinates** relative to the frame/image size:

| Coordinate | Range | Meaning |
|---|---|---|
| **x** | `0.0` → `1.0` | Horizontal position (0 = left edge, 1 = right edge) |
| **y** | `0.0` → `1.0` | Vertical position (0 = top edge, 1 = bottom edge) |
| **z** | Approximate | Relative depth to wrist (scale proportional to hand size) |

### What "Normalized" Means

```
Frame (640x480 pixels):
┌─────────────────────────┐ ← y=0 (top)
│                         │
│   ☝️ Hand here           │
│                         │
│                         │
└─────────────────────────┘ ← y=1 (bottom)
↑                         ↑
x=0 (left)              x=1 (right)
```

- `x=0.5` = middle of frame horizontally (320px in 640px wide frame)
- `y=0.5` = middle of frame vertically (240px in 480px tall frame)
- Works on **any resolution** — 640x480, 1920x1080, etc.

### Z-Coordinate Explained

The z-coordinate is **relative to the wrist landmark (0)**:

| z Value | Meaning | Example |
|---|---|---|
| **Negative** | Landmark is **closer** to camera than wrist | Fingertip curled toward camera |
| **≈ 0** | Landmark is at **same depth** as wrist | Wrist itself, or flat palm |
| **Positive** | Landmark is **farther** from camera than wrist | Fingertip pointing away |

**Key rule:** Compare z values directly — the smaller value is always closer to the camera.

### Every Landmark Has Its Own Coordinates

Each of the 21 landmarks is an independent point with its own `{x, y, z}`:

```js
landmarks = [
  { x: 0.5, y: 0.7, z: 0.001 },   // landmark 0 (WRIST)
  { x: 0.48, y: 0.65, z: -0.01 }, // landmark 1 (Thumb CMC)
  // ... all the way to landmark 20
]
```

---

## Why `tip.y < wrist.y` When Hand Points Up

**MediaPipe y-axis:** `0` = **TOP** of screen, `1` = **BOTTOM** of screen

```
Screen:
y=0 ───────────────────────  ← TOP
    │        ☝️              │
    │      Middle Tip        │  y=0.3 (SMALLER value)
    │        │               │
    │        │               │
    │        │               │
    │      Wrist             │  y=0.7 (LARGER value)
    │        │               │
y=1 ───────────────────────  ← BOTTOM
```

**So when hand points UP:**
- Fingertips are **higher** on screen → `y` is **smaller**
- Wrist is **lower** on screen → `y` is **larger**

```js
// This is TRUE when hand points up:
landmarks[12].y < landmarks[0].y
//     0.3    <     0.7     → TRUE ✓
```

---

## Current Rotation: X-Y Plane (Selection Mode)

### How It Works

Used during **element selection** (right hand gestures) to detect hand orientation in the camera view.

```js
// gesture/hooks.js
export function calculateHandRotation(landmarks) {
  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const indexTip = landmarks[8];
  
  return Math.atan2(indexTip.y - indexMcp.y, indexTip.x - indexMcp.x);
}
```

### The Math: `Math.atan2(Δy, Δx)`

`Math.atan2(y, x)` returns the **angle from the positive x-axis** to the point (x, y).

- **First parameter**: vertical component (Δy)
- **Second parameter**: horizontal component (Δx)
- **Returns**: angle in radians, range `-π` to `+π` (-180° to +180°)

### What This Measures

| Hand Position | Δy | Δx | atan2 Result | Degrees |
|---|---|---|---|---|
| Finger pointing **UP** | negative | ≈ 0 | ≈ -π/2 | -90° |
| Finger pointing **DOWN** | positive | ≈ 0 | ≈ π/2 | +90° |
| Finger pointing **LEFT** | ≈ 0 | negative | ≈ π | ±180° |
| Finger pointing **RIGHT** | ≈ 0 | positive | ≈ 0 | 0° |
| Finger pointing **UP-RIGHT** | negative | positive | ≈ -π/4 | -45° |
| Finger pointing **DOWN-LEFT** | positive | negative | ≈ 3π/4 | +135° |

### In Your App

The rotation is normalized to `-1` to `+1` for parameter mapping:

```js
const param = Math.max(-1, Math.min(1, rotation / Math.PI));
// Range: -1 (pointing up/left) to +1 (pointing down/right)
```

### Limitation in Crystal Ball Pose

When hands are in **crystal ball pose** (side-by-side, edge-on to camera):
- Fingers point mostly **up** (along y-axis)
- Small tilts don't change `x,y` much → rotation is **insensitive**
- You get values near **±π/2** (±90°) with little variation

---

## Z-Tilt Rotation: Crystal Ball Pose (Randomize Mode)

### When It's Used

Used during **randomize mode** when both hands are in crystal ball pose (palms facing each other, edge-on to camera).

### The Geometry

```
Camera view (side profile):
         
    ↑ Fingers pointing UP          ↑ Fingers tilted TOWARD camera
    │                                ↖ top is closer (negative z)
    │                                │
    │                              ││
    ↓ Wrist                        ↓ Wrist
    
    0° (straight up)              -30° (toward camera)
```

### The Math: `Math.atan2(Δz, Δy)`

We measure tilt in the **Vertical-Depth plane** (Y-Z plane):

```js
const wrist = landmarks[0];       // Pivot point
const middleTip = landmarks[12];  // Middle finger tip (most stable)

const dy = wrist.y - middleTip.y;  // Positive: tip is above wrist
const dz = middleTip.z - wrist.z;  // Negative: tip is closer than wrist

const angle = Math.atan2(dz, dy);  // 0° when straight up
```

### Why This Works

| Hand Position | dy | dz | atan2(dz, dy) | Degrees |
|---|---|---|---|---|
| **Straight up** | positive | ≈ 0 | `atan2(0, +dy)` | **0°** |
| **Tilt toward camera** | positive | negative | `atan2(-, +)` | **Negative** (e.g., -30°) |
| **Tilt away from camera** | positive | positive | `atan2(+, +)` | **Positive** (e.g., +30°) |

### Max Tilt Range

The angle is measured **from vertical (straight up)**:

```
        ↑ 0° (straight up)
       / \
  -60°     +60°
     ↘     ↙
      toward  away
      camera  camera
      
Max tilt range: -60° to +60°
```

For max 60° tilt:
```js
const MAX_TILT_RAD = Math.PI / 3; // 60 degrees = π/3 radians ≈ 1.047
```

### Why Middle Finger Tip (Landmark 12)?

- **More stable** than index finger (less wobble)
- **Centered** on the hand, better represents overall hand tilt
- **Less affected** by individual finger movements

### Implementation

```js
const MAX_Z_TILT = Math.PI / 3; // 60 degrees max in each direction

function calculateZTilt(landmarks) {
  const wrist = landmarks[0];
  const middleTip = landmarks[12];
  
  const dy = wrist.y - middleTip.y;  // Positive when tip is above wrist
  const dz = middleTip.z - wrist.z;  // Negative when tip is closer
  
  // Calculate raw angle
  const rawAngle = Math.atan2(dz, dy);
  
  // Clamp to max range
  return Math.max(-MAX_Z_TILT, Math.min(MAX_Z_TILT, rawAngle));
}

// Map to parameter range (-1 to 1)
const param = calculateZTilt(landmarks) / MAX_Z_TILT;
```

### Practical Example

```js
// Hand straight up:
wrist     = { y: 0.7, z: 0.001 }
middleTip = { y: 0.3, z: -0.02 }

dy = 0.7 - 0.3 = 0.4
dz = -0.02 - 0.001 = -0.021
angle = atan2(-0.021, 0.4) ≈ -0.053 rad ≈ -3°
param = -3° / 60° = -0.05

// Hand tilted toward camera (30°):
wrist     = { y: 0.7, z: 0.001 }
middleTip = { y: 0.35, z: -0.08 }

dy = 0.7 - 0.35 = 0.35
dz = -0.08 - 0.001 = -0.081
angle = atan2(-0.081, 0.35) ≈ -0.228 rad ≈ -13°
param = -13° / 60° = -0.22

// Hand tilted away from camera (30°):
wrist     = { y: 0.7, z: 0.001 }
middleTip = { y: 0.35, z: +0.06 }

dy = 0.7 - 0.35 = 0.35
dz = 0.06 - 0.001 = 0.059
angle = atan2(0.059, 0.35) ≈ 0.167 rad ≈ +10°
param = +10° / 60° = +0.17
```

---

## Summary: Rotation Methods

| Feature | Rotation Method | Plane | Angle Range | File |
|---|---|---|---|---|
| **Element Selection** | `atan2(Δy, Δx)` | X-Y (camera view) | -180° to +180° | `gesture/hooks.js` |
| **Randomize Mode** | `atan2(Δz, Δy)` | Y-Z (depth tilt) | -60° to +60° | `gesture/hooks.js` (TBD) |

---

## Calibration Notes

### Z-Tilt Sensitivity

MediaPipe z values are **estimated** from 2D images, so they may be:
- **Noisy** — small fluctuations even when hand is still
- **Inconsistent** — varies by lighting, camera quality, hand size
- **Approximate** — not true 3D depth

### Recommended Calibration Steps

1. **Test with actual hand** in crystal ball pose
2. **Record z values** at:
   - Hand straight up (should be ≈ 0)
   - Max comfortable tilt toward camera (should be negative)
   - Max comfortable tilt away from camera (should be positive)
3. **Adjust `MAX_Z_TILT`** if the range feels too sensitive or unresponsive

### Typical Z Values

| Movement | Δz Range | Notes |
|---|---|---|
| Hand still | ±0.005 | Small jitter from estimation noise |
| Slight tilt | ±0.01 to ±0.02 | Barely noticeable movement |
| Moderate tilt | ±0.02 to ±0.05 | Comfortable range for control |
| Extreme tilt | ±0.05 to ±0.1 | Hand almost horizontal |

---

## Reference: Landmark Indices for Rotation

| Landmark | Index | Role in Rotation |
|---|---|---|
| **WRIST** | 0 | Pivot point / reference |
| **INDEX_MCP** | 5 | Base for x-y rotation |
| **INDEX_TIP** | 8 | Tip for x-y rotation |
| **MIDDLE_MCP** | 9 | Base for z-tilt (alternative) |
| **MIDDLE_TIP** | 12 | Tip for z-tilt rotation |

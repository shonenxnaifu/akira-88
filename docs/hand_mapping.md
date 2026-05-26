# MediaPipe Hand Landmapping — Visual Diagram

## Hand Landmark Map (21 Points)

```
                          ┌─────────────────────────────────────────────────┐
                          │              HAND LANDMARK OVERLAY              │
                          │                                                 │
                          │                    TIP (8)                      │
                          │                    ●                            │
                          │                    │                            │
                          │              DIP (7)                            │
                          │              ●                                  │
                          │              │                                  │
                          │        PIP (6)                                  │
                          │        ●                                        │
                          │        │                                        │
                          │  MCP (5)───────MCP (9)───────MCP (13)───MCP (17)│
                          │  ●           ●           ●           ●          │
                          │  │           │           │           │          │
                          │  │     TIP (12)      TIP (16)      TIP (20)     │
                          │  │     ●           ●           ●                │
                          │  │     │           │           │                │
                          │  │     DIP (11)    DIP (15)    DIP (19)         │
                          │  │     ●           ●           ●                │
                          │  │     │           │           │                │
                          │  │     PIP (10)    PIP (14)    PIP (18)         │
                          │  │     ●           ●           ●                │
                          │  │     │           │           │                │
                          │  │     │           │           │                │
                          │  │     │           │           │                │
                          │  │     │           │           │                │
                          │  TIP (4)          │           │                │
                          │  ●                │           │                │
                          │  │                │           │                │
                          │  IP (3)           │           │                │
                          │  ●                │           │                │
                          │  │                │           │                │
                          │  MCP (2)          │           │                │
                          │  ●                │           │                │
                          │  │                │           │                │
                          │  CMC (1)          │           │                │
                          │  ●                │           │                │
                          │   \               │           │                │
                          │    \              │           │                │
                          │     \             │           │                │
                          │      WRIST (0) ───┘           │                │
                          │      ●                        │                │
                          │                               │                │
                          └─────────────────────────────────────────────────┘
```

## Finger-by-Finger Breakdown

### Thumb (4 landmarks)
```
    TIP (4)
     ●
     │
    IP (3)
     ●
     │
   MCP (2)
     ●
     │
   CMC (1)
     ●
      \
       \
     WRIST (0)
```

### Index Finger (4 landmarks)
```
    TIP (8)
     ●
     │
   DIP (7)
     ●
     │
   PIP (6)
     ●
     │
   MCP (5) ─── connected to WRIST (0)
```

### Middle Finger (4 landmarks)
```
    TIP (12)
     ●
     │
   DIP (11)
     ●
     │
   PIP (10)
     ●
     │
   MCP (9) ─── connected to MCP (5)
```

### Ring Finger (4 landmarks)
```
    TIP (16)
     ●
     │
   DIP (15)
     ●
     │
   PIP (14)
     ●
     │
   MCP (13) ─── connected to MCP (9)
```

### Pinky Finger (4 landmarks)
```
    TIP (20)
     ●
     │
   DIP (19)
     ●
     │
   PIP (18)
     ●
     │
   MCP (17) ─── connected to MCP (13) and WRIST (0)
```

---

## Connection Map (Skeleton Lines)

| Connection | From → To | Finger |
|---|---|---|
| 0→1 | WRIST → Thumb CMC | Thumb base |
| 1→2 | Thumb CMC → Thumb MCP | Thumb |
| 2→3 | Thumb MCP → Thumb IP | Thumb |
| 3→4 | Thumb IP → Thumb TIP | Thumb tip |
| 0→5 | WRIST → Index MCP | Index base |
| 5→6 | Index MCP → Index PIP | Index |
| 6→7 | Index PIP → Index DIP | Index |
| 7→8 | Index DIP → Index TIP | Index tip |
| 5→9 | Index MCP → Middle MCP | Knuckle |
| 9→10 | Middle MCP → Middle PIP | Middle |
| 10→11 | Middle PIP → Middle DIP | Middle |
| 11→12 | Middle DIP → Middle TIP | Middle tip |
| 9→13 | Middle MCP → Ring MCP | Knuckle |
| 13→14 | Ring MCP → Ring PIP | Ring |
| 14→15 | Ring PIP → Ring DIP | Ring |
| 15→16 | Ring DIP → Ring TIP | Ring tip |
| 13→17 | Ring MCP → Pinky MCP | Knuckle |
| 17→18 | Pinky MCP → Pinky PIP | Pinky |
| 18→19 | Pinky PIP → Pinky DIP | Pinky |
| 19→20 | Pinky DIP → Pinky TIP | Pinky tip |
| 0→17 | WRIST → Pinky MCP | Palm edge |

---

## Coordinate System

```
     y=0 (top)
       ↑
       │
x=0 ←──┼──→ x=1 (right)
(left) │
       │
       ↓
   y=1 (bottom)

z-axis: depth (negative = closer to camera)
```

### Normalized Values
- `x`: 0.0 (left) → 1.0 (right)
- `y`: 0.0 (top) → 1.0 (bottom)
- `z`: relative depth from wrist (wrist z ≈ 0)

---

## Landmark Index Quick Reference

| Index | Name | Finger | Joint Type |
|---|---|---|---|
| 0 | WRIST | — | Wrist joint |
| 1 | THUMB_CMC | Thumb | Carpometacarpal |
| 2 | THUMB_MCP | Thumb | Metacarpophalangeal |
| 3 | THUMB_IP | Thumb | Interphalangeal |
| 4 | THUMB_TIP | Thumb | Tip |
| 5 | INDEX_MCP | Index | Metacarpophalangeal |
| 6 | INDEX_PIP | Index | Proximal Interphalangeal |
| 7 | INDEX_DIP | Index | Distal Interphalangeal |
| 8 | INDEX_TIP | Index | Tip |
| 9 | MIDDLE_MCP | Middle | Metacarpophalangeal |
| 10 | MIDDLE_PIP | Middle | Proximal Interphalangeal |
| 11 | MIDDLE_DIP | Middle | Distal Interphalangeal |
| 12 | MIDDLE_TIP | Middle | Tip |
| 13 | RING_MCP | Ring | Metacarpophalangeal |
| 14 | RING_PIP | Ring | Proximal Interphalangeal |
| 15 | RING_DIP | Ring | Distal Interphalangeal |
| 16 | RING_TIP | Ring | Tip |
| 17 | PINKY_MCP | Pinky | Metacarpophalangeal |
| 18 | PINKY_PIP | Pinky | Proximal Interphalangeal |
| 19 | PINKY_DIP | Pinky | Distal Interphalangeal |
| 20 | PINKY_TIP | Pinky | Tip |

---

## How App Uses Landmarks

### Gesture Detection
```
Select Bass:    Index extended only          → landmarks[8].y < landmarks[6].y
Select Synth:   Index + Middle extended      → landmarks[8].y < landmarks[6].y AND landmarks[12].y < landmarks[10].y
Select Drum:    Index + Middle + Ring        → landmarks[8].y < landmarks[6].y AND landmarks[12].y < landmarks[10].y AND landmarks[16].y < landmarks[14].y
Mute Toggle:    Closed fist (0 fingers)      → all tips below their PIP joints
Play/Stop:      Left hand thumb only         → landmarks[4] extended, others folded
Randomize:      Both hands ≥4 fingers        → countExtendedFingers() >= 4 for both hands
```

### Hand Rotation
```
Angle = atan2(landmarks[8].y - landmarks[5].y, landmarks[8].x - landmarks[5].x)
         └──────────────────────────────────────────────────────────┘
                    Index tip direction from base
```

### Palm Detection
```
Palm facing camera: landmarks[0].z > landmarks[9].z
                    └────────────────────────────┘
                    Wrist closer than middle finger base
```

### Hand Distance
```
Distance = hypot(centroid1.x - centroid2.x, centroid1.y - centroid2.y)
           └──────────────────────────────────────────────────────┘
           Between average positions of all 21 landmarks per hand
```

---

## Animation Joint Subset

The animation system tracks only **6 key joints** per hand for performance:

```
JOINT_INDICES = [0, 1, 5, 9, 13, 17]
                 │  │  │  │   │   │
                 │  │  │  │   │   └─ Pinky MCP
                 │  │  │  │   └───── Ring MCP
                 │  │  │  └───────── Middle MCP
                 │  │  └──────────── Index MCP
                 │  └─────────────── Thumb CMC
                 └────────────────── Wrist
```

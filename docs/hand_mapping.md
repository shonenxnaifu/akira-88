# MediaPipe Hand Landmarks — Visual Diagram

## Quick Reference Table

| Landmark | Name | Finger | Joint |
|---|---|---|---|
| 0 | WRIST | — | Wrist |
| 1 | THUMB_CMC | Thumb | Base (palm) |
| 2 | THUMB_MCP | Thumb | Middle |
| 3 | THUMB_IP | Thumb | Upper |
| 4 | THUMB_TIP | Thumb | Tip |
| 5 | INDEX_MCP | Index | Base |
| 6 | INDEX_PIP | Index | Middle |
| 7 | INDEX_DIP | Index | Upper |
| 8 | INDEX_TIP | Index | Tip |
| 9 | MIDDLE_MCP | Middle | Base |
| 10 | MIDDLE_PIP | Middle | Middle |
| 11 | MIDDLE_DIP | Middle | Upper |
| 12 | MIDDLE_TIP | Middle | Tip |
| 13 | RING_MCP | Ring | Base |
| 14 | RING_PIP | Ring | Middle |
| 15 | RING_DIP | Ring | Upper |
| 16 | RING_TIP | Ring | Tip |
| 17 | PINKY_MCP | Pinky | Base |
| 18 | PINKY_PIP | Pinky | Middle |
| 19 | PINKY_DIP | Pinky | Upper |
| 20 | PINKY_TIP | Pinky | Tip |

---

## Finger Grid (Top-to-Bottom)

| Thumb | Index | Middle | Ring | Pinky |
|---|---|---|---|---|
| **4** tip | **8** tip | **12** tip | **16** tip | **20** tip |
| **3** upper | **7** upper | **11** upper | **15** upper | **19** upper |
| **2** middle | **6** middle | **10** middle | **14** middle | **18** middle |
| **1** base | **5** base | **9** base | **13** base | **17** base |

**Wrist: 0** (connected to index base and pinky base)

---

## Skeleton Connection Tree

```
0 (WRIST)
├── 1 → 2 → 3 → 4          [Thumb]
├── 5 → 6 → 7 → 8          [Index]
│   └── 9 → 10 → 11 → 12   [Middle]
│       └── 13 → 14 → 15 → 16  [Ring]
│           └── 17 → 18 → 19 → 20  [Pinky]
```

---

## SVG Visual Diagram

![Hand Landmarks Diagram](hand_landmarks.svg)

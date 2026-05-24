# akira-88

A real-time interactive web application that lets you create and manipulate techno music tracks using hand gestures. No controllers, no keyboards—just your hands and a webcam.

## Features

- **Hand Gesture Control** – Select instruments, toggle playback, mute tracks, and randomize parameters using intuitive hand gestures
- **Real-time Sound Synthesis** – Procedural techno audio generated live with Tone.js
- **Dynamic Visual Effects** – Electrical animations powered by PixiJS that react to your music and hand movements
- **Three Instruments**:
  - 🟠 **Bass**
  - 🟣 **Synth**
  - 🟡 **Drums**
- **Interactive Parameter Randomization** – Move and rotate your hands to morph sound parameters in real-time
- **BPM Control** – Adjustable tempo from 60 to 220 BPM
- **Individual & Master Volume** – Fine-tune each instrument or the overall mix

## Tech Stack

| Tools | Purpose |
|------------|---------|
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [MediaPipe Hands](https://mediapipe-studio.webapps.google.com/home) | Real-time hand tracking & landmark detection |
| [Tone.js](https://tonejs.github.io/) | Web Audio API synthesis & sequencing |
| [PixiJS](https://pixijs.com/) | WebGL-based animations & visual effects |
| Vanilla JS/CSS | UI & application logic |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js
- A modern web browser
- A webcam

### Installation

```bash
git clone https://github.com/pawitrawarda/akira-88.git
cd akira-88

bun install
bun run dev
```

Open `http://localhost:3173` in your browser.

### Build for Production

```bash
bun run build
```

The optimized build will be output to the `dist/` directory.

## Project Structure

```
src/
├── core/               # State, constants, utilities
├── features/
│   ├── gesture/        # MediaPipe hand detection & gesture recognition
│   ├── sound/          # Tone.js instruments, sequencers, audio engine
│   ├── animation/      # PixiJS renderer & visual effects
│   └── ui/             # UI panel, controls, feedback
├── styles/             # CSS variables, reset, main styles
├── index.html          # Entry HTML
└── main.js             # Application bootstrap
```

## Development Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Project setup & base architecture | ✅ Done |
| Phase 2 | Gesture detection (MediaPipe) | ✅ Done |
| Phase 3 | Sound engine (Tone.js) | ✅ Done |
| Phase 4 | Animation system (PixiJS) | 🚧 In Progress |
| Phase 5 | UI/UX | ⏳ Not Started |
| Phase 6 | Integration | ⏳ Not Started |
| Phase 7 | Testing & deployment | ⏳ Not Started |

## License

[MIT](LICENSE)

Development assisted by Qwen3.6 (execution) and Kimi K2.6 (planning).

import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

let camera = null;

export function createHandsInstance(onResults) {
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    modelComplexity: 1,
    maxNumHands: 2,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  hands.onResults(onResults);
  return hands;
}

export function startWebcam(videoElement, handsInstance) {
  if (camera) {
    camera.stop();
  }

  console.log('Starting webcam and MediaPipe detection...');

  camera = new Camera(videoElement, {
    onFrame: async () => {
      await handsInstance.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });

  return camera.start().then(() => {
    console.log('✅ Webcam started, MediaPipe detection loop active');
  }).catch((err) => {
    console.error('❌ Failed to start webcam:', err);
    throw err;
  });
}

export function initDetector(videoElement, onResults) {
  console.log('Creating MediaPipe Hands instance...');
  const hands = createHandsInstance(onResults);
  return startWebcam(videoElement, hands);
}

import { appState } from '../../core/state.js';
import { getApp } from './renderer.js';

const JOINT_INDICES = [0, 1, 5, 9, 13, 17];

export function updateHandPositions(landmarks, handedness) {
  if (!landmarks || landmarks.length === 0) {
    appState.handPositions.left = {};
    appState.handPositions.right = {};
    return;
  }

  const app = getApp();
  if (!app) return;

  const screenWidth = app.screen.width;
  const screenHeight = app.screen.height;

  let leftHand = {};
  let rightHand = {};

  for (let i = 0; i < landmarks.length; i++) {
    const rawLabel = handedness?.[i]?.label;
    const actualLabel = rawLabel === 'Left' ? 'Right' : 'Left';
    const handLandmarks = landmarks[i];

    const points = {};
    JOINT_INDICES.forEach((idx) => {
      const lm = handLandmarks[idx];
      points[idx] = {
        x: (1 - lm.x) * screenWidth,
        y: lm.y * screenHeight
      };
    });

    if (actualLabel === 'Left') {
      leftHand = points;
    } else if (actualLabel === 'Right') {
      rightHand = points;
    }
  }

  appState.lastHandPosition.left = { ...appState.handPositions.left };
  appState.lastHandPosition.right = { ...appState.handPositions.right };

  if (Object.keys(leftHand).length > 0) {
    appState.handPositions.left = leftHand;
  }
  if (Object.keys(rightHand).length > 0) {
    appState.handPositions.right = rightHand;
  }
}

export function calculateHandMovementSpeed() {
  const currentLeft = appState.handPositions.left;
  const currentRight = appState.handPositions.right;
  const prevLeft = appState.lastHandPosition.left;
  const prevRight = appState.lastHandPosition.right;

  let maxDelta = 0;

  JOINT_INDICES.forEach((idx) => {
    const cl = currentLeft[idx];
    const cr = currentRight[idx];
    const pl = prevLeft[idx];
    const pr = prevRight[idx];

    if (cl && pl) {
      const delta = Math.sqrt(Math.pow(cl.x - pl.x, 2) + Math.pow(cl.y - pl.y, 2));
      maxDelta = Math.max(maxDelta, delta);
    }
    if (cr && pr) {
      const delta = Math.sqrt(Math.pow(cr.x - pr.x, 2) + Math.pow(cr.y - pr.y, 2));
      maxDelta = Math.max(maxDelta, delta);
    }
  });

  const normalizedSpeed = Math.min(1, maxDelta / 200);
  appState.handMovementSpeed = normalizedSpeed;
  return normalizedSpeed;
}

export function getHandPositions() {
  return {
    left: appState.handPositions.left,
    right: appState.handPositions.right
  };
}

export function getJointConnections() {
  const left = appState.handPositions.left;
  const right = appState.handPositions.right;

  const connections = [];
  JOINT_INDICES.forEach((idx) => {
    if (left[idx] && right[idx]) {
      connections.push({
        start: left[idx],
        end: right[idx]
      });
    }
  });

  return connections;
}

export function areBothHandsVisible() {
  const left = appState.handPositions.left;
  const right = appState.handPositions.right;

  if (Object.keys(left).length === 0 || Object.keys(right).length === 0) return false;

  return JOINT_INDICES.every((idx) => left[idx] && right[idx]);
}

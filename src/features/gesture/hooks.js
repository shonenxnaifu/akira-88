const FINGER_NAMES = ['thumb', 'index', 'middle', 'ring', 'pinky'];

const LANDMARK_INDICES = {
  thumb: { tip: 4, ip: 3, mcp: 2, cmp: 1 },
  index: { tip: 8, pip: 6, mcp: 5 },
  middle: { tip: 12, pip: 10, mcp: 9 },
  ring: { tip: 16, pip: 14, mcp: 13 },
  pinky: { tip: 20, pip: 18, mcp: 17 }
};

export function isFingerExtended(landmarks, fingerName) {
  const indices = LANDMARK_INDICES[fingerName];
  if (!indices) return false;

  if (fingerName === 'thumb') {
    const tip = landmarks[indices.tip];
    const ip = landmarks[indices.ip];
    const mcp = landmarks[indices.mcp];
    const cmp = landmarks[indices.cmp];

    const tipDist = Math.hypot(tip.x - cmp.x, tip.y - cmp.y);
    const ipDist = Math.hypot(ip.x - cmp.x, ip.y - cmp.y);
    return tipDist > ipDist;
  }

  const tip = landmarks[indices.tip];
  const pip = landmarks[indices.pip];
  const mcp = landmarks[indices.mcp];

  return tip.y < pip.y;
}

export function countExtendedFingers(landmarks) {
  let count = 0;
  for (const finger of FINGER_NAMES) {
    if (isFingerExtended(landmarks, finger)) {
      count++;
    }
  }
  return count;
}

export function getHandedness(results) {
  if (!results.multiHandedness || !results.multiHandLandmarks) return [];

  return results.multiHandedness.map((h, i) => ({
    hand: h.label,
    score: h.score,
    landmarks: results.multiHandLandmarks[i]
  }));
}

export function calculateHandRotation(landmarks) {
  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const indexTip = landmarks[8];
  return Math.atan2(indexTip.y - indexMcp.y, indexTip.x - indexMcp.x);
}

export function calculateHandDistance(landmarks1, landmarks2) {
  const centroid1 = getHandCentroid(landmarks1);
  const centroid2 = getHandCentroid(landmarks2);
  return Math.hypot(centroid1.x - centroid2.x, centroid1.y - centroid2.y);
}

export function isPalmFacingCamera(landmarks) {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  return wrist.z > middleMcp.z;
}

export function arePalmsFacingEachOther(leftLandmarks, rightLandmarks) {
  const leftCentroid = getHandCentroid(leftLandmarks);
  const rightCentroid = getHandCentroid(rightLandmarks);
  return leftCentroid.x < rightCentroid.x;
}

export function getHandCentroid(landmarks) {
  let x = 0, y = 0;
  for (const landmark of landmarks) {
    x += landmark.x;
    y += landmark.y;
  }
  return { x: x / landmarks.length, y: y / landmarks.length };
}

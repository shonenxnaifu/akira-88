export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function angle(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

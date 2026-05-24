import * as PIXI from 'pixi.js';
import { ANIMATION_CONFIG } from '../../../core/constants.js';

const SEGMENT_COUNT = 20;
const FLICKER_INTERVAL_MS = 70;

let arcPool = [];
let activeArcs = [];
let lastFlickerTime = 0;

function createArcGraphics() {
  const core = new PIXI.Graphics();
  const glow = new PIXI.Graphics();
  core.blendMode = PIXI.BLEND_MODES.ADD;
  glow.blendMode = PIXI.BLEND_MODES.ADD;
  return { core, glow, active: false, thunderPath: [], branchPoints: [] };
}

function getArcFromPool() {
  if (arcPool.length === 0) {
    arcPool.push(createArcGraphics());
  }
  const arc = arcPool.pop();
  arc.active = true;
  return arc;
}

function returnArcToPool(arc) {
  arc.active = false;
  arc.core.clear();
  arc.glow.clear();
  arc.thunderPath = [];
  arc.branchPoints = [];
  arcPool.push(arc);
}

function generateThunderPath(startX, startY, endX, endY, jitterAmount) {
  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1) {
    return [{ x: startX, y: startY }, { x: endX, y: endY }];
  }

  const perpX = -dy / dist;
  const perpY = dx / dist;

  const path = [{ x: startX, y: startY }];

  for (let i = 1; i < SEGMENT_COUNT; i++) {
    const t = i / SEGMENT_COUNT;
    const baseX = startX + dx * t;
    const baseY = startY + dy * t;

    const offset = (Math.random() - 0.5) * jitterAmount * 2;

    path.push({
      x: baseX + perpX * offset,
      y: baseY + perpY * offset
    });
  }

  path.push({ x: endX, y: endY });

  return path;
}

function drawThunderPath(graphics, path, color, thickness, alpha) {
  if (path.length < 2) return;

  graphics.lineStyle(thickness, color, alpha);
  graphics.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    graphics.lineTo(path[i].x, path[i].y);
  }
}

function drawBranches(graphics, path, depth, maxDepth, baseColor, thickness, alpha, jitterAmount) {
  if (depth >= maxDepth) return;

  const CRIMSON = 0xDC143C;
  const branchAlpha = alpha * 0.9;
  
  const crimsonMix = depth / maxDepth;
  const branchColor = depth === 0 ? CRIMSON : Math.round(CRIMSON * (1 - crimsonMix) + baseColor * crimsonMix);

  for (let i = 1; i < path.length - 1; i++) {
    if (Math.random() > 0.3) continue;

    const p = path[i];
    const branchLength = 20 + Math.random() * 30;
    const angle = Math.random() * Math.PI * 2;
    const endX = p.x + Math.cos(angle) * branchLength;
    const endY = p.y + Math.sin(angle) * branchLength;

    const branchPoints = [
      p,
      {
        x: p.x + (Math.random() - 0.5) * jitterAmount,
        y: p.y + (Math.random() - 0.5) * jitterAmount
      },
      { x: endX, y: endY }
    ];

    graphics.lineStyle(thickness, branchColor, branchAlpha);
    graphics.moveTo(branchPoints[0].x, branchPoints[0].y);
    graphics.quadraticCurveTo(branchPoints[1].x, branchPoints[1].y, branchPoints[2].x, branchPoints[2].y);

    drawBranches(graphics, branchPoints, depth + 1, maxDepth, baseColor, thickness, branchAlpha, jitterAmount);
  }
}

export function createPlasmaArc(connections, intensity) {
  const jitterAmount = 40 * intensity;

  connections.forEach((conn) => {
    const arc = getArcFromPool();
    arc.thunderPath = generateThunderPath(conn.start.x, conn.start.y, conn.end.x, conn.end.y, jitterAmount);
    activeArcs.push(arc);
  });
}

export function updatePlasmaEffect(delta, intensity) {
  const now = performance.now();
  const shouldFlicker = now - lastFlickerTime >= FLICKER_INTERVAL_MS;

  if (shouldFlicker) {
    lastFlickerTime = now;

    activeArcs.forEach((arc) => {
      if (!arc.active) return;
      const jitterAmount = 40 * intensity;
      const startX = arc.thunderPath[0].x;
      const startY = arc.thunderPath[0].y;
      const endX = arc.thunderPath[arc.thunderPath.length - 1].x;
      const endY = arc.thunderPath[arc.thunderPath.length - 1].y;
      arc.thunderPath = generateThunderPath(startX, startY, endX, endY, jitterAmount);
    });
  }

  const baseThickness = 4;
  const baseAlpha = 0.7;

  activeArcs.forEach((arc) => {
    if (!arc.active) return;

    const pulseAlpha = baseAlpha + 0.3 * Math.sin(now * 0.01 + Math.random());
    const finalAlpha = Math.max(0.4, pulseAlpha * intensity);

    arc.core.clear();
    arc.glow.clear();

    const coreThickness = Math.max(2, baseThickness * intensity);
    const glowThickness = Math.max(4, baseThickness * 2 * intensity);

    drawThunderPath(arc.core, arc.thunderPath, ANIMATION_CONFIG.BASS_CORE_COLOR, coreThickness, finalAlpha);
    drawThunderPath(arc.glow, arc.thunderPath, ANIMATION_CONFIG.BASS_GLOW_COLOR, glowThickness, finalAlpha * 0.6);

    drawBranches(arc.glow, arc.thunderPath, 0, ANIMATION_CONFIG.BASS_BRANCH_DEPTH, ANIMATION_CONFIG.BASS_GLOW_COLOR, coreThickness, finalAlpha * 0.9, 15);
  });

  return activeArcs.length;
}

export function clearPlasmaEffect(container) {
  activeArcs.forEach((arc) => {
    arc.core.clear();
    arc.glow.clear();
    container.removeChild(arc.core);
    container.removeChild(arc.glow);
    returnArcToPool(arc);
  });
  activeArcs = [];
}

export function addPlasmaArcsToContainer(container) {
  activeArcs.forEach((arc) => {
    if (!container.children.includes(arc.core)) {
      container.addChild(arc.core);
      container.addChild(arc.glow);
    }
  });
}

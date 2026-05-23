import * as PIXI from 'pixi.js';
import { ANIMATION_CONFIG } from '../../../core/constants.js';

const MAX_ARCS = 5;
const MIN_ARCS = 2;

let arcPool = [];
let activeArcs = [];
let time = 0;

function createArcGraphics() {
  const core = new PIXI.Graphics();
  const glow = new PIXI.Graphics();
  core.blendMode = PIXI.BLEND_MODES.ADD;
  glow.blendMode = PIXI.BLEND_MODES.ADD;
  return { core, glow, active: false, controlPoints: [], branchPoints: [] };
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
  arc.controlPoints = [];
  arc.branchPoints = [];
  arcPool.push(arc);
}

function generateControlPoints(startX, startY, endX, endY, jitterAmount) {
  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1) {
    return [
      { x: startX, y: startY },
      { x: startX, y: startY - 50 },
      { x: endX, y: endY + 50 },
      { x: endX, y: endY }
    ];
  }

  const perpX = -dy / dist;
  const perpY = dx / dist;

  const offset = (Math.random() - 0.5) * jitterAmount * 2;

  const cp1 = {
    x: startX + dx * 0.3 + perpX * offset * 0.5,
    y: startY + dy * 0.3 + perpY * offset * 0.5
  };

  const cp2 = {
    x: startX + dx * 0.7 + perpX * offset * 0.7,
    y: startY + dy * 0.7 + perpY * offset * 0.7
  };

  return [
    { x: startX, y: startY },
    cp1,
    cp2,
    { x: endX, y: endY }
  ];
}

function jitterPoints(points, amount) {
  return points.map((p, i) => {
    if (i === 0 || i === points.length - 1) return p;
    return {
      x: p.x + (Math.random() - 0.5) * amount,
      y: p.y + (Math.random() - 0.5) * amount
    };
  });
}

function drawArcPath(graphics, points, color, thickness, alpha) {
  if (points.length < 2) return;

  graphics.lineStyle(thickness, color, alpha);
  graphics.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2 + (Math.random() - 0.5) * 5;
    const cpy = (prev.y + curr.y) / 2 + (Math.random() - 0.5) * 5;
    graphics.quadraticCurveTo(cpx, cpy, curr.x, curr.y);
  }
}

function drawBranches(graphics, points, depth, maxDepth, color, thickness, alpha, jitterAmount) {
  if (depth >= maxDepth) return;

  const branchAlpha = alpha * (0.5 - depth * 0.1);
  const branchThickness = Math.max(0.5, thickness - depth * 0.5);

  for (let i = 1; i < points.length - 1; i++) {
    if (Math.random() > 0.3) continue;

    const p = points[i];
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

    drawArcPath(graphics, branchPoints, color, branchThickness, branchAlpha);
    drawBranches(graphics, branchPoints, depth + 1, maxDepth, color, branchThickness, branchAlpha, jitterAmount);
  }
}

export function createPlasmaArc(connections, intensity) {
  const jitterAmount = 40 * intensity;

  connections.forEach((conn) => {
    const arc = getArcFromPool();
    arc.controlPoints = generateControlPoints(conn.start.x, conn.start.y, conn.end.x, conn.end.y, jitterAmount);
    activeArcs.push(arc);
  });
}

export function updatePlasmaEffect(delta, intensity) {
  time += delta * ANIMATION_CONFIG.BASS_PULSE_SPEED;

  const baseThickness = 4;
  const baseJitter = 40;
  const baseAlpha = 0.7;

  activeArcs.forEach((arc) => {
    if (!arc.active) return;

    const jitteredPoints = jitterPoints(arc.controlPoints, baseJitter * intensity);
    const pulseAlpha = baseAlpha + 0.3 * Math.sin(time * Math.PI * 2 + Math.random());
    const finalAlpha = Math.max(0.4, pulseAlpha * intensity);

    arc.core.clear();
    arc.glow.clear();

    const coreThickness = Math.max(2, baseThickness * intensity);
    const glowThickness = Math.max(4, baseThickness * 2 * intensity);

    drawArcPath(arc.core, jitteredPoints, ANIMATION_CONFIG.BASS_CORE_COLOR, coreThickness, finalAlpha);
    drawArcPath(arc.glow, jitteredPoints, ANIMATION_CONFIG.BASS_GLOW_COLOR, glowThickness, finalAlpha * 0.6);

    drawBranches(arc.glow, jitteredPoints, 0, ANIMATION_CONFIG.BASS_BRANCH_DEPTH, ANIMATION_CONFIG.BASS_GLOW_COLOR, coreThickness, finalAlpha * 0.4, baseJitter * 0.3);
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

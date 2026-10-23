/**
 * DEPTH-BASED PLANET GRAVITY LOGIC
 * 
 * Computes gravitational pull based on the astronaut's descent depth.
 * The closer the astronaut falls to the planet, the harder it pulls!
 * 
 * Pure JavaScript - completely independent of Phaser.
 */

import { CONFIG } from './config.js';

/**
 * Calculates current gravity acceleration (in pixels / sec^2) based on descent depth.
 * 
 * Formula:
 *   depthRatio = clamp((currentY - startY) / (exitY - startY), 0, 1)
 *   g = baseG + (maxG - baseG) * (depthRatio ^ exponent)
 * 
 * @param {number} currentY - Current vertical position of astronaut
 * @param {number} startY - Vertical start position
 * @param {number} exitY - Vertical exit landing pad position
 * @param {object} [config] - Optional override for gravity settings
 * @returns {{ g: number, ratio: number, gRating: number }}
 *   - g: Current gravitational acceleration (px/sec^2)
 *   - ratio: Depth progress from 0.0 (top) to 1.0 (landing pad)
 *   - gRating: Scaled G-force rating (e.g. 1.0G at top up to ~3.8G at planet surface)
 */
export function calculateGravity(currentY, startY, exitY, config = CONFIG.gravity) {
  const totalDescent = Math.max(1, exitY - startY);
  const currentDepth = Math.max(0, currentY - startY);
  const ratio = Math.min(1.0, Math.max(0.0, currentDepth / totalDescent));

  const { baseG, maxG, exponent = 2.0 } = config;
  const ramp = Math.pow(ratio, exponent);
  const g = baseG + (maxG - baseG) * ramp;

  // G-force rating for HUD telemetry: 1.0G at baseG, proportional at maxG
  const gRating = g / Math.max(1, baseG);

  return {
    g,
    ratio,
    gRating,
  };
}

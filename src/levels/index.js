/**
 * LEVELS REGISTRY
 * 
 * Central registry for all game levels.
 */

import level1 from './level1.json';

export const LEVELS = [
  level1,
];

/**
 * Gets a level by 1-based level index.
 * @param {number} num 
 * @returns {object|null}
 */
export function getLevel(num = 1) {
  const index = num - 1;
  return LEVELS[index] || LEVELS[0];
}

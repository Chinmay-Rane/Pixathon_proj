/**
 * LEVELS REGISTRY
 * 
 * Central registry for all game levels.
 */

import level1 from './level1.json';
import level2 from './level2.json';
import level3 from './level3.json';

export const LEVELS = [
  level1,
  level2,
  level3,
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

/**
 * Returns total number of registered levels.
 * @returns {number}
 */
export function getTotalLevels() {
  return LEVELS.length;
}

/**
 * SEEDED RANDOM NUMBER GENERATOR
 * 
 * Provides deterministic pseudo-random numbers based on Mulberry32.
 * This guarantees that given the same seed (e.g. today's date for daily challenge),
 * the exact same random sequence is generated across all machines and browsers.
 * Never use Math.random for gameplay logic!
 */

/**
 * Creates a 32-bit hash from a string seed.
 * @param {string} str 
 * @returns {number}
 */
export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Seeded Mulberry32 random number generator.
 */
export class SeededRNG {
  /**
   * @param {number|string} seed - A numeric seed or string (e.g. '2026-10-23')
   */
  constructor(seed = 123456789) {
    this.setSeed(seed);
  }

  /**
   * Sets or resets the seed for the generator.
   * @param {number|string} seed 
   */
  setSeed(seed) {
    if (typeof seed === 'string') {
      this.state = hashString(seed);
    } else {
      this.state = (seed >>> 0) || 1;
    }
  }

  /**
   * Generates a pseudo-random floating point number in [0, 1).
   * @returns {number}
   */
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a float between min (inclusive) and max (exclusive).
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  range(min, max) {
    return min + this.next() * (max - min);
  }

  /**
   * Generates an integer between min (inclusive) and max (inclusive).
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  rangeInt(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Picks a random item from an array.
   * @param {Array} array 
   * @returns {*}
   */
  choice(array) {
    if (!array || array.length === 0) return null;
    return array[this.rangeInt(0, array.length - 1)];
  }

  /**
   * Shuffles an array in place using the Fisher-Yates algorithm.
   * @param {Array} array 
   * @returns {Array}
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.rangeInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// Default global seeded instance (can be reseeded anytime)
export const rng = new SeededRNG(42);

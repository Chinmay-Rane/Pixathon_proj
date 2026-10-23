/**
 * GAME STATE ENGINE
 * 
 * Manages descent timer, oxygen consumption, brake capacitor charge/recharge,
 * depth progress, and win/loss state transitions.
 * Pure JavaScript - independent of Phaser.
 */

import { CONFIG } from './config.js';
import { calculateGravity } from './gravity.js';

export const GAME_STATUS = {
  START: 'START',
  PLAYING: 'PLAYING',
  WON: 'WON',
  LOST: 'LOST',
};

export class GameState {
  constructor() {
    this.status = GAME_STATUS.PLAYING;
    this.oxygen = CONFIG.oxygen.max;
    this.brakeCharge = CONFIG.maze.brakeMaxCharge;
    this.isBraking = false;
    this.elapsedTime = 0;
    this.depthProgress = 0;
    this.currentGravity = CONFIG.gravity.baseG;
    this.gRating = 1.0;

    // Listeners for UI and Scene events
    this.listeners = {
      oxygenChange: [],
      brakeChange: [],
      gravityChange: [],
      gameOver: [],
      win: [],
    };
  }

  /**
   * Registers callback for game events.
   * @param {string} event 
   * @param {Function} callback 
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Steps the state simulation for one frame.
   * 
   * @param {number} deltaSec - Elapsed seconds
   * @param {number} currentY - Current astronaut Y
   * @param {number} startY - Start Y
   * @param {number} exitY - Landing pad Y
   * @param {boolean} brakeInputHeld - Is player holding Spacebar brake?
   */
  update(deltaSec, currentY, startY, exitY, brakeInputHeld = false) {
    if (this.status !== GAME_STATUS.PLAYING) return;

    this.elapsedTime += deltaSec;

    // 1. Calculate depth-based planet gravity
    const grav = calculateGravity(currentY, startY, exitY);
    this.currentGravity = grav.g;
    this.depthProgress = grav.ratio;
    this.gRating = grav.gRating;

    this.listeners.gravityChange.forEach(fn => fn(this.currentGravity, this.gRating, this.depthProgress));

    // 2. Oxygen consumption
    const o2Drain = CONFIG.oxygen.drainRatePerSecond * deltaSec;
    this.oxygen = Math.max(0, this.oxygen - o2Drain);
    this.listeners.oxygenChange.forEach(fn => fn(this.oxygen, CONFIG.oxygen.max));

    if (this.oxygen <= 0) {
      this.triggerGameOver('Life support exhausted! Ran out of oxygen in the shaft.');
      return;
    }

    // 3. Brake capacitor recharge / discharge
    const mazeCfg = CONFIG.maze;
    if (brakeInputHeld && this.brakeCharge > 0) {
      this.isBraking = true;
      const drain = mazeCfg.brakeDrainRate * deltaSec;
      this.brakeCharge = Math.max(0, this.brakeCharge - drain);
    } else {
      this.isBraking = false;
      const recharge = mazeCfg.brakeRechargeRate * deltaSec;
      this.brakeCharge = Math.min(mazeCfg.brakeMaxCharge, this.brakeCharge + recharge);
    }

    this.listeners.brakeChange.forEach(fn => fn(this.brakeCharge, mazeCfg.brakeMaxCharge, this.isBraking));
  }

  /**
   * Restores oxygen (Phase 2 collectible).
   * @param {number} amount 
   */
  refillOxygen(amount = CONFIG.oxygen.tankRestoreAmount) {
    this.oxygen = Math.min(CONFIG.oxygen.max, this.oxygen + amount);
    this.listeners.oxygenChange.forEach(fn => fn(this.oxygen, CONFIG.oxygen.max));
  }

  restoreOxygen(amount = CONFIG.oxygen.tankRestoreAmount) {
    this.refillOxygen(amount);
  }

  /**
   * Drains oxygen from hazard damage (e.g. fire jets).
   * @param {number} amount 
   */
  drainOxygen(amount) {
    this.oxygen = Math.max(0, this.oxygen - amount);
    this.listeners.oxygenChange.forEach(fn => fn(this.oxygen, CONFIG.oxygen.max));
    if (this.oxygen <= 0) {
      this.triggerGameOver('Life support breached! Severe suit damage caused total O2 loss.');
    }
  }

  /**
   * Triggers landing pad victory.
   * @param {object} stats 
   */
  triggerWin(stats = {}) {
    if (this.status !== GAME_STATUS.PLAYING) return;
    this.status = GAME_STATUS.WON;
    this.listeners.win.forEach(fn => fn({
      elapsedTime: this.elapsedTime,
      remainingOxygen: this.oxygen,
      depthProgress: 1.0,
      ...stats,
    }));
  }

  /**
   * Triggers mission failure (oxygen loss, deep space ejection, etc.).
   * @param {string|object} reason 
   */
  triggerGameOver(reason = 'Mission aborted.') {
    if (this.status !== GAME_STATUS.PLAYING) return;
    this.status = GAME_STATUS.LOST;
    const reasonStr = typeof reason === 'object' && reason.reason ? reason.reason : (typeof reason === 'string' ? reason : 'Mission aborted.');
    this.listeners.gameOver.forEach(fn => fn({
      reason: reasonStr,
      elapsedTime: this.elapsedTime,
      depthProgress: this.depthProgress,
    }));
  }

  /**
   * Resets state for a new descent.
   */
  reset() {
    this.status = GAME_STATUS.PLAYING;
    this.oxygen = CONFIG.oxygen.max;
    this.brakeCharge = CONFIG.maze.brakeMaxCharge;
    this.isBraking = false;
    this.elapsedTime = 0;
    this.depthProgress = 0;
    this.currentGravity = CONFIG.gravity.baseG;
    this.gRating = 1.0;

    this.listeners.oxygenChange.forEach(fn => fn(this.oxygen, CONFIG.oxygen.max));
    this.listeners.brakeChange.forEach(fn => fn(this.brakeCharge, CONFIG.maze.brakeMaxCharge, false));
    this.listeners.gravityChange.forEach(fn => fn(this.currentGravity, this.gRating, 0));
  }
}

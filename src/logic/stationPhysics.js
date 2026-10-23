/**
 * STATION & INERTIAL REFERENCE FRAME PHYSICS
 * 
 * DESIGN CHOICE & EXPLANATION:
 * ----------------------------
 * We simulate the station and floater using a Non-Inertial Reference Frame (the Station's Frame):
 * 1. The station walls are static geometry in the local station coordinate system.
 *    This ensures Matter.js collision detection is 100% rock-solid, crisp, and never
 *    suffers from tunneling, rotational seam glitches, or compound body lag.
 * 2. When the station accelerates or rotates in space (driven by the Pilot's thrusters),
 *    we calculate the exact fictitious (inertial) forces that an observer inside the station
 *    experiences according to Newtonian mechanics:
 *    - D'Alembert linear inertial force: -m * a_station (flings floater opposite to thruster firing)
 *    - Centrifugal force: m * omega^2 * r (flings floater outward when the station spins)
 *    - Coriolis force: 2 * m * omega x v (curves the floater's path while drifting inside spinning station)
 *    - Euler force: -m * alpha x r (inertial kick when station starts/stops spinning)
 * 3. When the station is drifting at constant speed with no thrusters firing, the acceleration
 *    is zero, so no fictitious force acts on the floater. The floater drifts smoothly with its
 *    own momentum, exactly as Galileo's principle of relativity dictates!
 * 
 * This module is 100% pure JavaScript with no Phaser dependency.
 */

import { CONFIG } from './config.js';

export class StationPhysics {
  /**
   * @param {object} options
   * @param {number} options.widthPx - Total width of the station maze
   * @param {number} options.heightPx - Total height of the station maze
   */
  constructor({ widthPx, heightPx }) {
    // Center of mass / rotation center of the station in local pixels
    this.centerOfMass = {
      x: widthPx / 2,
      y: heightPx / 2,
    };

    // Station world state
    this.worldPosition = { x: 0, y: 0 };
    this.worldVelocity = { x: 0, y: 0 };
    this.angle = 0;              // Current rotation angle in radians
    this.angularVelocity = 0;   // Current angular velocity in rad/s

    // Acceleration recorded during the last frame (used for inertial kick)
    this.localLinearAcceleration = { x: 0, y: 0 };
    this.angularAcceleration = 0;

    // Thruster state flags (controlled by Pilot)
    this.thrusters = {
      up: false,       // Thrust Fore
      down: false,     // Thrust Aft
      left: false,     // Thrust Port
      right: false,    // Thrust Starboard
      rotateCCW: false,// Spin counter-clockwise (Q)
      rotateCW: false, // Spin clockwise (E)
      braking: false,  // Active retro-thruster brake (Space)
    };
  }

  /**
   * Updates thruster inputs from Pilot controls.
   * @param {object} inputs 
   */
  setInputs(inputs) {
    if (inputs.up !== undefined) this.thrusters.up = inputs.up;
    if (inputs.down !== undefined) this.thrusters.down = inputs.down;
    if (inputs.left !== undefined) this.thrusters.left = inputs.left;
    if (inputs.right !== undefined) this.thrusters.right = inputs.right;
    if (inputs.rotateCCW !== undefined) this.thrusters.rotateCCW = inputs.rotateCCW;
    if (inputs.rotateCW !== undefined) this.thrusters.rotateCW = inputs.rotateCW;
    if (inputs.braking !== undefined) this.thrusters.braking = inputs.braking;
  }

  /**
   * Resets all thruster inputs (e.g. on pause or role switch if desired).
   */
  clearInputs() {
    this.thrusters.up = false;
    this.thrusters.down = false;
    this.thrusters.left = false;
    this.thrusters.right = false;
    this.thrusters.rotateCCW = false;
    this.thrusters.rotateCW = false;
    this.thrusters.braking = false;
  }

  /**
   * Steps the station physics simulation.
   * @param {number} deltaSeconds - Elapsed time since last frame in seconds
   */
  update(deltaSeconds) {
    if (deltaSeconds <= 0 || deltaSeconds > 0.1) {
      // Clamp delta time to avoid large jumps if window loses focus
      deltaSeconds = 1 / 60;
    }

    const cfg = CONFIG.station;

    // 1. Calculate local linear thrust acceleration
    let localAx = 0;
    let localAy = 0;

    if (this.thrusters.left) localAx -= cfg.linearThrust;
    if (this.thrusters.right) localAx += cfg.linearThrust;
    if (this.thrusters.up) localAy -= cfg.linearThrust;
    if (this.thrusters.down) localAy += cfg.linearThrust;

    // Normalize diagonal linear thrust so diagonal movement is not faster
    if (localAx !== 0 && localAy !== 0) {
      const invLen = 1 / Math.SQRT2;
      localAx *= invLen;
      localAy *= invLen;
    }

    // 2. Calculate angular thrust acceleration
    let alpha = 0;
    if (this.thrusters.rotateCCW) alpha -= cfg.angularThrust;
    if (this.thrusters.rotateCW) alpha += cfg.angularThrust;

    // Save instantaneous accelerations for inertial calculations
    this.localLinearAcceleration.x = localAx;
    this.localLinearAcceleration.y = localAy;
    this.angularAcceleration = alpha;

    // 3. Convert local acceleration to world acceleration
    const cosAngle = Math.cos(this.angle);
    const sinAngle = Math.sin(this.angle);
    const worldAx = localAx * cosAngle - localAy * sinAngle;
    const worldAy = localAx * sinAngle + localAy * cosAngle;

    // 4. Update station world velocity
    this.worldVelocity.x += worldAx * deltaSeconds;
    this.worldVelocity.y += worldAy * deltaSeconds;
    this.angularVelocity += alpha * deltaSeconds;

    // 5. Apply braking or natural vacuum drift damping
    const timeScale = deltaSeconds * 60;
    if (this.thrusters.braking) {
      // Active retro-braking drops velocity quickly
      this.worldVelocity.x *= Math.pow(cfg.brakeDamping, timeScale);
      this.worldVelocity.y *= Math.pow(cfg.brakeDamping, timeScale);
      this.angularVelocity *= Math.pow(cfg.brakeAngularDamping, timeScale);

      // Snap to absolute zero if nearly stopped
      if (Math.hypot(this.worldVelocity.x, this.worldVelocity.y) < 1.0) {
        this.worldVelocity.x = 0;
        this.worldVelocity.y = 0;
      }
      if (Math.abs(this.angularVelocity) < 0.005) {
        this.angularVelocity = 0;
      }
    } else {
      // Natural vacuum drift: very tiny drag
      this.worldVelocity.x *= Math.pow(1 - cfg.linearDrag, timeScale);
      this.worldVelocity.y *= Math.pow(1 - cfg.linearDrag, timeScale);
      this.angularVelocity *= Math.pow(1 - cfg.angularDrag, timeScale);
    }

    // 6. Clamp to maximum speeds
    const currentSpeed = Math.hypot(this.worldVelocity.x, this.worldVelocity.y);
    if (currentSpeed > cfg.maxLinearSpeed) {
      const ratio = cfg.maxLinearSpeed / currentSpeed;
      this.worldVelocity.x *= ratio;
      this.worldVelocity.y *= ratio;
    }

    this.angularVelocity = Math.max(
      -cfg.maxAngularSpeed,
      Math.min(cfg.maxAngularSpeed, this.angularVelocity)
    );

    // 7. Integrate position and rotation
    this.worldPosition.x += this.worldVelocity.x * deltaSeconds;
    this.worldPosition.y += this.worldVelocity.y * deltaSeconds;
    this.angle += this.angularVelocity * deltaSeconds;

    // Keep angle normalized between -PI and +PI
    while (this.angle > Math.PI) this.angle -= Math.PI * 2;
    while (this.angle < -Math.PI) this.angle += Math.PI * 2;
  }

  /**
   * Calculates the fictitious inertial acceleration acting on the Floater
   * inside the station's non-inertial reference frame.
   * 
   * @param {number} floaterLocalX - Floater X in station pixels
   * @param {number} floaterLocalY - Floater Y in station pixels
   * @param {number} floaterLocalVx - Floater local velocity X (pixels/sec)
   * @param {number} floaterLocalVy - Floater local velocity Y (pixels/sec)
   * @returns {{ax: number, ay: number}} Resulting acceleration in pixels/sec^2
   */
  getInertialAccelerationForFloater(floaterLocalX, floaterLocalY, floaterLocalVx = 0, floaterLocalVy = 0) {
    const floaterCfg = CONFIG.floater;

    // 1. D'Alembert linear inertial acceleration: opposite to station's thrust acceleration
    // If the station accelerates forward (-Y), the floater is pushed backward (+Y)!
    const dAlembertX = -this.localLinearAcceleration.x * floaterCfg.inertialMultiplier;
    const dAlembertY = -this.localLinearAcceleration.y * floaterCfg.inertialMultiplier;

    // 2. Position vector relative to station center of mass
    const rx = floaterLocalX - this.centerOfMass.x;
    const ry = floaterLocalY - this.centerOfMass.y;

    // 3. Centrifugal acceleration: omega^2 * r (pushes radially outward)
    const omega = this.angularVelocity;
    const omegaSq = omega * omega;
    const centrifugalX = omegaSq * rx * floaterCfg.centrifugalMultiplier;
    const centrifugalY = omegaSq * ry * floaterCfg.centrifugalMultiplier;

    // 4. Coriolis acceleration: 2 * omega * (-vy, vx)
    // Curvature felt when moving through a rotating frame
    const coriolisX = 2 * omega * (-floaterLocalVy) * floaterCfg.coriolisMultiplier;
    const coriolisY = 2 * omega * (floaterLocalVx) * floaterCfg.coriolisMultiplier;

    // 5. Euler acceleration: -alpha x r (kick felt when station rotational speed changes)
    const alpha = this.angularAcceleration;
    const eulerX = -alpha * (-ry) * floaterCfg.centrifugalMultiplier;
    const eulerY = -alpha * (rx) * floaterCfg.centrifugalMultiplier;

    return {
      ax: dAlembertX + centrifugalX + coriolisX + eulerX,
      ay: dAlembertY + centrifugalY + coriolisY + eulerY,
    };
  }

  /**
   * Returns current telemetry for UI display.
   */
  getTelemetry() {
    return {
      speed: Math.hypot(this.worldVelocity.x, this.worldVelocity.y),
      angularSpeedDeg: (this.angularVelocity * 180) / Math.PI,
      angleDeg: (this.angle * 180) / Math.PI,
      isBraking: this.thrusters.braking,
      activeThrusters: { ...this.thrusters },
    };
  }
}

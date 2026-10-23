/**
 * GAME SCENE - VERTICAL SPACESHIP SHAFT SIMULATION
 * 
 * Phase 1 Execution:
 * - Continuous 360° Station Rotation (A / D latches continuous spin until counter-key or Space is pressed)
 * - Persistent Astronaut EVA Booster Drift (Arrow keys latch continuous drift direction until counter-key or Space)
 * - Ultra-slow peaceful microgravity descent
 * - 76px enlarged maze shaft with authentic metallic spaceship bulkheads & active RCS pods
 * - Authentic 76px astronaut with warm glow aura & fading motion trail
 * - Layered radial gradient planet with glowing atmosphere
 * - Cartoon diamond stars wall-hit stun preserved
 */

import Phaser from 'phaser';
import { CONFIG } from '../logic/config.js';
import { parseLevel } from '../logic/levelLoader.js';
import { getLevel } from '../levels/index.js';
import { GameState, GAME_STATUS } from '../logic/gameState.js';
import { HUD } from '../ui/hud.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelNumber = data.levelNumber || 1;
    this.rawLevelData = getLevel(this.levelNumber);
    this.level = parseLevel(this.rawLevelData, CONFIG.visuals.tileSize);

    this.gameState = new GameState();

    // 360° Continuous Station Rotation state
    this.stationAngle = 0;              // Current camera / station angle in radians
    this.stationCurrentSpin = 0;        // Current interpolated angular velocity
    this.stationSpinTarget = 0;         // Target angular velocity (-spinRate, 0, +spinRate)

    // Persistent Astronaut EVA Booster Drift (persists until counter-key is pressed)
    this.driftVx = 0;                   // Persistent horizontal cruise velocity
    this.driftVy = 0;                   // Persistent vertical cruise velocity

    // Visual horizontal sway
    this.currentSwayX = 0;
    this.targetSwayX = 0;

    // Cartoon wall-hit stun state
    this.isStunned = false;
    this.stunRemainingMs = 0;
    this.lastStunTime = 0;
    this.haloOrbitAngle = 0;

    // Motion trail history
    this.trailPositions = [];
  }

  create() {
    const { width, height } = this.scale;

    // Center the 1064px vertical shaft horizontally in the 1280px world
    this.shaftOriginX = Math.max(0, (width - this.level.pixelWidth) / 2);
    this.shaftOriginY = 60;

    // Total world height for descent
    const totalWorldHeight = this.shaftOriginY + this.level.pixelHeight + 240;

    // Padded camera bounds to allow smooth 360° rotation without clamp artifacts
    this.cameras.main.setBounds(-400, -400, width + 800, totalWorldHeight + 800);

    // 1. Dynamic Streaming Starfield (in deep space void behind station)
    this.createStreamingStarfield(width, totalWorldHeight);

    // 2. Spaceship Hull Architecture (Shaft Interior Conduit + Exterior Armor + RCS Pods)
    this.renderSpaceshipArchitecture(width, totalWorldHeight);

    // 3. Build Solid Matter.js Bulkhead Colliders with Metallic Plating & Hazard Stripes
    this.buildPhysicsBulkheads(width, totalWorldHeight);

    // 4. Layered Radial Gradient Planet with Glowing Atmosphere
    this.createLayeredPlanet(width);

    // 5. Landing Pad at Exit tile ('E')
    this.spawnLandingPad();

    // 6. Astronaut with Soft Glow Aura & Fading Motion Trail
    this.spawnAstronaut();

    // 7. Cartoon Diamond Stars for Wall-Hit Stun
    this.createCartoonDiamondStars();

    // 8. Smooth Centered Camera Follow (centers directly on astronaut through all 360° rotations)
    this.cameras.main.startFollow(this.astronaut, true, 0.08, 0.08, 0, 0);

    // 9. Particle Systems for Lateral Steering RCS Thrusters & Retro-Brakes
    this.createThrusterEmitters();

    // 10. Bind Controls (Continuous 360° Station Rotation & Persistent EVA Drift)
    this.bindControls();

    // 11. Bind GameState Events (Win / Lose)
    this.bindGameState();

    // 12. Mount DOM HUD Telemetry Overlay
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
      hudContainer.innerHTML = '';
      this.hud = new HUD(hudContainer, {
        onRestartLevel: () => this.restartLevel(),
      });
      this.hud.setLevelName(this.level.name);
      this.hud.updateOxygen(this.gameState.oxygen, CONFIG.oxygen.max);
    }
  }

  /**
   * Creates a dynamic streaming starfield visible in the deep space void.
   */
  createStreamingStarfield(worldWidth, worldHeight) {
    this.starfieldGraphics = this.add.graphics();
    this.starfieldGraphics.setDepth(0);

    this.stars = [];
    const count = CONFIG.stars.count;

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, worldWidth),
        y: Phaser.Math.Between(0, worldHeight),
        baseSize: Phaser.Math.FloatBetween(0.9, 2.4),
        alpha: Phaser.Math.FloatBetween(0.25, 0.95),
        speedFactor: Phaser.Math.FloatBetween(0.6, 1.4),
      });
    }
  }

  /**
   * Renders the authentic spaceship architecture:
   * - Pressurized shaft interior conduit background with structural ribs and conduits
   * - Exterior titanium hull plating on the sides with girder framework
   * - External RCS attitude thruster pods mounted along the hull
   */
  renderSpaceshipArchitecture(worldWidth, worldHeight) {
    const ox = this.shaftOriginX;
    const oy = this.shaftOriginY;
    const pw = this.level.pixelWidth;
    const ph = this.level.pixelHeight;
    const ts = CONFIG.visuals.tileSize;

    this.shipGraphics = this.add.graphics();
    this.shipGraphics.setDepth(2);

    // 1. Shaft Interior Conduit Background (pressurized dark metallic atmosphere)
    this.shipGraphics.fillStyle(0x08101a, 0.96);
    this.shipGraphics.fillRect(ox, oy, pw, ph);

    // Vertical structural conduit ribs inside the shaft
    this.shipGraphics.lineStyle(1.5, 0x122236, 0.7);
    for (let x = ox + ts; x < ox + pw; x += ts) {
      this.shipGraphics.moveTo(x, oy);
      this.shipGraphics.lineTo(x, oy + ph);
    }
    this.shipGraphics.strokePath();

    // Horizontal bulkhead section rings every 3 tiles
    for (let y = oy; y <= oy + ph; y += ts * 3) {
      this.shipGraphics.fillStyle(0x0e1b2c, 0.6);
      this.shipGraphics.fillRect(ox, y - 4, pw, 8);

      this.shipGraphics.lineStyle(1, 0x1b3452, 0.8);
      this.shipGraphics.moveTo(ox, y);
      this.shipGraphics.lineTo(ox + pw, y);
      this.shipGraphics.strokePath();
    }

    // 2. Exterior Spaceship Hull Armor Plating (Left & Right margins)
    // Left Hull
    this.shipGraphics.fillStyle(0x101a28, 1);
    this.shipGraphics.fillRect(ox - 88, oy, 88, ph);

    // Left Hull Bevel & Structural Girder Trusses
    this.shipGraphics.lineStyle(2, 0x24364c, 1);
    this.shipGraphics.strokeRect(ox - 88, oy, 88, ph);

    this.shipGraphics.lineStyle(1.5, 0x344c68, 0.6);
    for (let y = oy; y < oy + ph; y += ts * 2) {
      this.shipGraphics.strokeRect(ox - 80, y, 72, ts * 2 - 8);
      // Cross truss
      this.shipGraphics.moveTo(ox - 80, y);
      this.shipGraphics.lineTo(ox - 8, y + ts * 2 - 8);
      this.shipGraphics.moveTo(ox - 8, y);
      this.shipGraphics.lineTo(ox - 80, y + ts * 2 - 8);
    }
    this.shipGraphics.strokePath();

    // Right Hull
    this.shipGraphics.fillStyle(0x101a28, 1);
    this.shipGraphics.fillRect(ox + pw, oy, 88, ph);

    // Right Hull Bevel & Structural Girder Trusses
    this.shipGraphics.lineStyle(2, 0x24364c, 1);
    this.shipGraphics.strokeRect(ox + pw, oy, 88, ph);

    this.shipGraphics.lineStyle(1.5, 0x344c68, 0.6);
    for (let y = oy; y < oy + ph; y += ts * 2) {
      this.shipGraphics.strokeRect(ox + pw + 8, y, 72, ts * 2 - 8);
      // Cross truss
      this.shipGraphics.moveTo(ox + pw + 8, y);
      this.shipGraphics.lineTo(ox + pw + 80, y + ts * 2 - 8);
      this.shipGraphics.moveTo(ox + pw + 80, y);
      this.shipGraphics.lineTo(ox + pw + 8, y + ts * 2 - 8);
    }
    this.shipGraphics.strokePath();

    // 3. Mount Exterior RCS Attitude Thruster Pods along hull flanks
    this.rcsPodsLeft = [];
    this.rcsPodsRight = [];

    for (let y = oy + ts * 2; y < oy + ph; y += ts * 6) {
      // Left hull RCS pod (pointing left into space)
      const podL = this.add.image(ox - 14, y, 'rcs_pod');
      podL.setDepth(4);
      podL.setFlipX(true);
      this.rcsPodsLeft.push(podL);

      // Right hull RCS pod (pointing right into space)
      const podR = this.add.image(ox + pw + 14, y, 'rcs_pod');
      podR.setDepth(4);
      this.rcsPodsRight.push(podR);
    }
  }

  /**
   * Builds solid Matter.js static colliders with authentic metallic bulkhead styling:
   * 3D bevels, brushed titanium surfaces, rivet studs, and industrial hazard stripes.
   */
  buildPhysicsBulkheads(worldWidth, worldHeight) {
    const ox = this.shaftOriginX;
    const oy = this.shaftOriginY;
    const pw = this.level.pixelWidth;
    const ph = this.level.pixelHeight;

    this.bulkheadGraphics = this.add.graphics();
    this.bulkheadGraphics.setDepth(3);
    this.wallBodies = [];

    // Render Interior Bulkheads
    for (const wall of this.level.mergedWalls) {
      const worldX = ox + wall.x;
      const worldY = oy + wall.y;
      const left = worldX - wall.width / 2;
      const top = worldY - wall.height / 2;

      // 1. Soft Ambient Drop Shadow under the bulkhead
      this.bulkheadGraphics.fillStyle(0x000000, 0.55);
      this.bulkheadGraphics.fillRect(left + 4, top + 6, wall.width, wall.height);

      // 2. Metallic Titanium Bulkhead Surface
      this.bulkheadGraphics.fillStyle(0x162434, 1);
      this.bulkheadGraphics.fillRect(left, top, wall.width, wall.height);

      // 3. 3D Bevel Highlights & Shadows
      // Top specular highlight
      this.bulkheadGraphics.fillStyle(0x486686, 1);
      this.bulkheadGraphics.fillRect(left, top, wall.width, 3);

      // Left specular highlight
      this.bulkheadGraphics.fillStyle(0x385270, 1);
      this.bulkheadGraphics.fillRect(left, top, 3, wall.height);

      // Bottom ambient shadow
      this.bulkheadGraphics.fillStyle(0x080e16, 1);
      this.bulkheadGraphics.fillRect(left, top + wall.height - 3, wall.width, 3);

      // Right ambient shadow
      this.bulkheadGraphics.fillStyle(0x0a121c, 1);
      this.bulkheadGraphics.fillRect(left + wall.width - 3, top, 3, wall.height);

      // 4. Recessed Inner Plate Border
      if (wall.width > 24 && wall.height > 24) {
        this.bulkheadGraphics.lineStyle(1.5, 0x0c141e, 0.9);
        this.bulkheadGraphics.strokeRect(left + 6, top + 6, wall.width - 12, wall.height - 12);

        this.bulkheadGraphics.lineStyle(1, 0x2c425c, 0.6);
        this.bulkheadGraphics.strokeRect(left + 7, top + 7, wall.width - 14, wall.height - 14);

        // Rivet studs in corners of this bulkhead section
        const drawRivet = (rx, ry) => {
          this.bulkheadGraphics.fillStyle(0x080e16, 1);
          this.bulkheadGraphics.fillCircle(rx, ry, 2.5);
          this.bulkheadGraphics.fillStyle(0x5a7e9e, 1);
          this.bulkheadGraphics.fillCircle(rx - 0.5, ry - 0.5, 1.2);
        };
        drawRivet(left + 12, top + 12);
        drawRivet(left + wall.width - 12, top + 12);
        drawRivet(left + 12, top + wall.height - 12);
        drawRivet(left + wall.width - 12, top + wall.height - 12);
      }

      // 5. Industrial Hazard Warning Stripes on exposed ledges
      if (wall.width >= 48) {
        const stripeY = top;
        const stripeH = 8;
        const numStripes = Math.floor(wall.width / 16);

        for (let i = 0; i < numStripes; i++) {
          const sx = left + i * 16;
          this.bulkheadGraphics.fillStyle(0xffaa00, 0.85);
          this.bulkheadGraphics.beginPath();
          this.bulkheadGraphics.moveTo(sx, stripeY + stripeH);
          this.bulkheadGraphics.lineTo(sx + 8, stripeY + stripeH);
          this.bulkheadGraphics.lineTo(sx + 14, stripeY);
          this.bulkheadGraphics.lineTo(sx + 6, stripeY);
          this.bulkheadGraphics.closePath();
          this.bulkheadGraphics.fill();
        }
      }

      // Matter.js static physics body
      const body = this.matter.add.rectangle(worldX, worldY, wall.width, wall.height, {
        isStatic: true,
        restitution: CONFIG.astronaut.restitution,
        friction: CONFIG.astronaut.friction,
        label: 'wall',
      });

      this.wallBodies.push(body);
    }

    // Heavy Outer Containment Bulkheads (160px thick)
    const thickness = 160;

    // Left outer barrier
    this.matter.add.rectangle(ox - thickness / 2, oy + ph / 2, thickness, ph + 300, {
      isStatic: true,
      restitution: CONFIG.astronaut.restitution,
      friction: CONFIG.astronaut.friction,
      label: 'wall',
    });

    // Right outer barrier
    this.matter.add.rectangle(ox + pw + thickness / 2, oy + ph / 2, thickness, ph + 300, {
      isStatic: true,
      restitution: CONFIG.astronaut.restitution,
      friction: CONFIG.astronaut.friction,
      label: 'wall',
    });

    // Ceiling barrier
    this.matter.add.rectangle(ox + pw / 2, oy - thickness / 2, pw + 300, thickness, {
      isStatic: true,
      restitution: CONFIG.astronaut.restitution,
      friction: CONFIG.astronaut.friction,
      label: 'wall',
    });

    // Floor barrier
    this.matter.add.rectangle(ox + pw / 2, oy + ph + thickness / 2 + 10, pw + 300, thickness, {
      isStatic: true,
      restitution: CONFIG.astronaut.restitution,
      friction: CONFIG.astronaut.friction,
      label: 'wall',
    });
  }

  /**
   * Sets up the layered planet body and additive atmospheric corona.
   * Dynamic scaling, brightening, and elevation are updated in updatePlanetVisuals().
   */
  createLayeredPlanet(worldWidth) {
    this.exitY = this.shaftOriginY + this.level.exit.y;
    const initialPlanetY = this.exitY + CONFIG.planet.startDistanceBelowExit;

    // 1. Additive Atmospheric Corona Haze
    this.planetCorona = this.add.image(worldWidth / 2, initialPlanetY - 70, 'planet_corona_haze');
    this.planetCorona.setDepth(1);
    this.planetCorona.setBlendMode(Phaser.BlendModes.ADD);
    this.planetCorona.setAlpha(CONFIG.planet.atmosphereGlowBaseAlpha);

    // 2. High-Resolution Layered Planet Sphere Body
    this.planetBody = this.add.image(worldWidth / 2, initialPlanetY, 'planet_layered_body');
    this.planetBody.setDepth(1);
    this.planetBody.setAlpha(CONFIG.planet.baseAlpha);
    this.planetBody.setScale(CONFIG.planet.baseScale);
  }

  /**
   * Updates Planet size, brightness, and altitude based on descent depth progress.
   */
  updatePlanetVisuals(depthRatio) {
    const pCfg = CONFIG.planet;
    const clampRatio = Math.max(0, Math.min(1, depthRatio));

    // 1. Planet Scale Growth (expands toward player)
    const currentScale = Phaser.Math.Linear(pCfg.baseScale, pCfg.maxScale, clampRatio);
    this.planetBody.setScale(currentScale);
    this.planetCorona.setScale(currentScale * 1.15);

    // 2. Brightness / Opacity Escalation
    const currentAlpha = Phaser.Math.Linear(pCfg.baseAlpha, pCfg.maxAlpha, clampRatio);
    this.planetBody.setAlpha(currentAlpha);

    const currentCoronaAlpha = Phaser.Math.Linear(
      pCfg.atmosphereGlowBaseAlpha,
      pCfg.atmosphereGlowMaxAlpha,
      clampRatio
    );
    this.planetCorona.setAlpha(currentCoronaAlpha);

    // 3. Planet Elevation (rises closer to the landing pad as depth increases)
    const currentDistBelowExit = Phaser.Math.Linear(
      pCfg.startDistanceBelowExit,
      pCfg.endDistanceBelowExit,
      clampRatio
    );
    const planetTargetY = this.exitY + currentDistBelowExit;

    this.planetBody.setY(planetTargetY);
    this.planetCorona.setY(planetTargetY - 70 * currentScale);
  }

  /**
   * Spawns high-visibility landing pad beacon at Exit tile ('E').
   */
  spawnLandingPad() {
    const exitPos = this.level.exit;
    const exitX = this.shaftOriginX + exitPos.x;
    const exitY = this.shaftOriginY + exitPos.y;

    this.landingPad = this.matter.add.image(exitX, exitY, 'landing_pad', null, {
      isStatic: true,
      isSensor: true,
      label: 'landing_pad',
    });
    this.landingPad.setDepth(5);

    this.tweens.add({
      targets: this.landingPad,
      alpha: { from: 0.8, to: 1.0 },
      scale: { from: 0.96, to: 1.04 },
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Spawns the authentic Astronaut with soft warm glow and fading motion trail.
   */
  spawnAstronaut() {
    const startPos = this.level.start;
    this.startY = this.shaftOriginY + startPos.y;
    this.exitY = this.shaftOriginY + this.level.exit.y;

    const startX = this.shaftOriginX + startPos.x;

    // Fading Motion Trail Ghosts (queue of 6 ghosts trailing behind)
    this.motionTrailGhosts = [];
    const trailLen = CONFIG.astronaut.trailLength;
    for (let i = 0; i < trailLen; i++) {
      const ghost = this.add.image(startX, this.startY, 'astronaut');
      ghost.setDepth(8);
      ghost.setAlpha(0);
      this.motionTrailGhosts.push(ghost);
    }

    // Physical Astronaut Matter.js body
    this.astronaut = this.matter.add.image(startX, this.startY, 'astronaut', null, {
      shape: {
        type: 'circle',
        radius: CONFIG.astronaut.radius,
      },
      mass: CONFIG.astronaut.mass,
      restitution: CONFIG.astronaut.restitution,
      friction: CONFIG.astronaut.friction,
      frictionAir: CONFIG.astronaut.frictionAir,
      label: 'astronaut',
    });

    this.astronaut.setDepth(10);
    this.astronaut.setFixedRotation();
  }

  /**
   * Creates cartoon diamond stars for the dizzy stun animation.
   */
  createCartoonDiamondStars() {
    this.diamondStars = [];
    const count = CONFIG.astronaut.diamondStarCount;

    for (let i = 0; i < count; i++) {
      const star = this.add.image(0, 0, 'diamond_star');
      star.setDepth(12);
      star.setVisible(false);
      star.setAlpha(0);

      this.diamondStars.push({
        sprite: star,
        phaseOffset: (i * Math.PI * 2) / count,
        scaleOffset: Phaser.Math.FloatBetween(0.85, 1.15),
      });
    }
  }

  /**
   * Creates particle emitters for lateral steering thrusters & retro-brakes.
   */
  createThrusterEmitters() {
    this.thrusterParticles = this.add.particles(0, 0, 'thruster_particle', {
      speed: { min: 30, max: 95 },
      scale: { start: 0.75, end: 0 },
      alpha: { start: 0.85, end: 0 },
      lifespan: 180,
      emitting: false,
    });
    this.thrusterParticles.setDepth(15);

    this.brakeParticles = this.add.particles(0, 0, 'brake_particle', {
      speed: { min: 45, max: 130 },
      angle: { min: 75, max: 105 },
      scale: { start: 0.90, end: 0 },
      alpha: { start: 0.92, end: 0 },
      lifespan: 190,
      emitting: false,
    });
    this.brakeParticles.setDepth(12);
  }

  /**
   * Sets up keyboard controls:
   * - A / D: Continuous 360° station rotation (latches spin until opposite key or Space)
   * - Arrow Keys: Persistent Astronaut EVA drift (latches drift until opposite arrow or Space)
   * - Space: Retro-Brake (stops both station spin and astronaut drift)
   * - R: Instant restart
   */
  bindControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 1. Station 360° Continuous Rotation Keys (A and D only)
    this.input.keyboard.on('keydown-A', () => {
      // Rotate station Counter-Clockwise (CCW) continuously
      this.stationSpinTarget = -CONFIG.maze.stationSpinRate;
    });

    this.input.keyboard.on('keydown-D', () => {
      // Rotate station Clockwise (CW) continuously
      this.stationSpinTarget = CONFIG.maze.stationSpinRate;
    });

    // 2. Astronaut Persistent EVA Thrusters (Arrow keys)
    const boosterSpeed = CONFIG.astronaut.boosterSpeed;

    this.input.keyboard.on('keydown-UP', () => {
      // Continuous upward drift until Down or Space is pressed
      this.driftVy = -boosterSpeed;
      this.thrusterParticles.emitParticleAt(this.astronaut.x, this.astronaut.y + 20, 3);
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      // Continuous downward drift until Up or Space is pressed
      this.driftVy = boosterSpeed;
      this.thrusterParticles.emitParticleAt(this.astronaut.x, this.astronaut.y - 20, 3);
    });

    this.input.keyboard.on('keydown-LEFT', () => {
      // Continuous leftward drift until Right or Space is pressed
      this.driftVx = -boosterSpeed;
      this.thrusterParticles.emitParticleAt(this.astronaut.x + 20, this.astronaut.y, 3);
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      // Continuous rightward drift until Left or Space is pressed
      this.driftVx = boosterSpeed;
      this.thrusterParticles.emitParticleAt(this.astronaut.x - 20, this.astronaut.y, 3);
    });

    // 3. Retro-Brake Counter-Arrest (Spacebar)
    // Stops both station spin and astronaut drift
    this.input.keyboard.on('keydown-SPACE', () => {
      this.stationSpinTarget = 0;
      this.driftVx = 0;
      this.driftVy = 0;
    });

    // 4. Quick Restart Key
    this.input.keyboard.on('keydown-R', () => {
      this.restartLevel();
    });

    // Touch controls support
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y > this.scale.height * 0.75) {
        this.touchBraking = true;
        this.stationSpinTarget = 0;
        this.driftVx = 0;
        this.driftVy = 0;
      }
    });

    this.input.on('pointerup', () => {
      this.touchBraking = false;
    });

    // Collision events
    this.matter.world.on('collisionstart', (event) => {
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (labels.includes('astronaut') && labels.includes('landing_pad')) {
          this.gameState.triggerWin();
        } else if (labels.includes('astronaut') && labels.includes('wall')) {
          this.handleWallCollision();
        }
      }
    });
  }

  /**
   * Handles collision with a wall bulkhead:
   * Triggers the cartoon dizzy stun with orbiting diamond stars.
   */
  handleWallCollision() {
    const vx = this.astronaut.body.velocity.x;
    const vy = this.astronaut.body.velocity.y;
    const impactSpeed = Math.hypot(vx, vy);

    const now = Date.now();
    const canStun = (now - this.lastStunTime > CONFIG.astronaut.stunCooldownMs);

    if (impactSpeed >= CONFIG.astronaut.stunImpactThreshold && canStun) {
      this.isStunned = true;
      this.stunRemainingMs = CONFIG.astronaut.stunDurationMs;
      this.lastStunTime = now;

      // Soften momentum upon impact and gently rebound
      this.matter.body.setVelocity(this.astronaut.body, {
        x: vx * 0.30,
        y: vy * 0.30,
      });

      // Show diamond stars
      this.diamondStars.forEach(s => {
        s.sprite.setVisible(true);
        s.sprite.setAlpha(1);
      });

      // Gentle cartoon bonk micro-shake & sparks
      this.cameras.main.shake(50, 0.002);
      this.thrusterParticles.emitParticleAt(this.astronaut.x, this.astronaut.y, 4);
    }
  }

  /**
   * Binds GameState callbacks to UI and scene transitions.
   */
  bindGameState() {
    this.gameState.on('oxygenChange', (current, max) => {
      if (this.hud) this.hud.updateOxygen(current, max);
    });

    this.gameState.on('brakeChange', (charge, max, isBraking) => {
      if (this.hud) this.hud.updateBrake(charge, max, isBraking);
    });

    this.gameState.on('gravityChange', (g, gRating, depthRatio) => {
      if (this.hud) this.hud.updateGravity(g, gRating, depthRatio);
    });

    this.gameState.on('win', (stats) => {
      this.scene.pause('GameScene');
      this.scene.launch('WinScene', {
        elapsedTime: stats.elapsedTime,
        remainingOxygen: stats.remainingOxygen,
        levelNumber: this.levelNumber,
      });
    });

    this.gameState.on('gameOver', (info) => {
      this.scene.pause('GameScene');
      this.scene.launch('LoseScene', {
        reason: info.reason,
        elapsedTime: info.elapsedTime,
        depthProgress: info.depthProgress,
        levelNumber: this.levelNumber,
      });
    });
  }

  restartLevel() {
    this.scene.restart({ levelNumber: this.levelNumber });
  }

  /**
   * Main game frame update loop.
   */
  update(time, delta) {
    if (this.gameState.status !== GAME_STATUS.PLAYING) return;

    const deltaSec = delta / 1000;

    // 1. Process Retro-Brake Hold
    const brakeHeld = this.keySpace.isDown || Boolean(this.touchBraking);
    if (brakeHeld) {
      this.stationSpinTarget = 0;
      this.driftVx = 0;
      this.driftVy = 0;
    }

    // 2. Continuous 360° Station Rotation (smooth interpolation)
    this.update360StationRotation(deltaSec);

    // 3. Update GameState (computes depth gravity & manages brake charge)
    this.gameState.update(deltaSec, this.astronaut.y, this.startY, this.exitY, brakeHeld);

    // 4. Update Layered Planet (grows, brightens, and rises closer)
    this.updatePlanetVisuals(this.gameState.depthProgress);

    // 5. Planet Gravity: Ultra-slow, peaceful downward drift
    let currentVx = this.astronaut.body.velocity.x;
    let currentVy = this.astronaut.body.velocity.y;

    const gravityDelta = this.gameState.currentGravity * deltaSec;
    currentVy += gravityDelta;

    // 6. Persistent EVA Thrusters (smoothly steer towards persistent drift vector)
    currentVx = Phaser.Math.Linear(currentVx, this.driftVx, 0.15);
    currentVy = Phaser.Math.Linear(currentVy, this.driftVy + gravityDelta, 0.15);

    // 7. Retro-Brake Pulse (softly arrests drift and rotation)
    if (this.gameState.isBraking) {
      const brakePower = CONFIG.maze.brakeStrength * deltaSec;
      currentVy = Math.max(-10, currentVy - brakePower);
      currentVx *= 0.85;

      this.brakeParticles.emitParticleAt(this.astronaut.x, this.astronaut.y + 14, 1);
      this.cameras.main.shake(20, 0.0008);
    }

    // 8. Strict Velocity Clamps for Ultra-Slow Peaceful Descent
    const maxVy = CONFIG.astronaut.maxTerminalVelocity;
    const maxVx = CONFIG.astronaut.maxLateralVelocity;
    currentVy = Math.min(maxVy, currentVy);
    currentVx = Math.max(-maxVx, Math.min(maxVx, currentVx));

    // Apply velocities to Matter body
    this.matter.body.setVelocity(this.astronaut.body, {
      x: currentVx,
      y: currentVy,
    });

    // 9. Hard Physical Boundary Containment
    this.enforceShaftBoundaries();

    // 10. Update Fading Motion Trail
    this.updateMotionTrail();

    // 11. Update Cartoon Stun Animation & Orbiting Diamond Stars
    this.updateCartoonStunAnimation(time, delta);

    // 12. Update Astronaut Visual Rotation (if not currently stunned)
    if (!this.isStunned) {
      this.updateAstronautVisuals(currentVx, currentVy);
    }

    // 13. Update Streaming Starfield
    this.updateStreamingStarfield(currentVy, deltaSec);

    // 14. Update HUD Timer
    if (this.hud) {
      this.hud.updateTimer(this.gameState.elapsedTime);
    }
  }

  /**
   * Updates continuous 360° station rotation and active RCS thruster particle plumes.
   */
  update360StationRotation(deltaSec) {
    const mazeCfg = CONFIG.maze;

    // Smoothly interpolate current spin rate towards target spin
    this.stationCurrentSpin = Phaser.Math.Linear(
      this.stationCurrentSpin,
      this.stationSpinTarget,
      mazeCfg.spinLerp
    );

    // Integrate angle (full 360-degree rotation)
    this.stationAngle += this.stationCurrentSpin * deltaSec;
    this.stationAngle = Phaser.Math.Angle.Wrap(this.stationAngle);

    // Apply 360-degree rotation to camera view
    this.cameras.main.setRotation(this.stationAngle);

    // Fire visible RCS thruster plumes on the station hull while spinning
    if (this.stationCurrentSpin < -0.15) {
      // Spinning CCW -> Starboard thruster pods fire into space
      this.thrusterParticles.emitParticleAt(
        this.shaftOriginX + this.level.pixelWidth + 14,
        this.astronaut.y,
        1
      );
    } else if (this.stationCurrentSpin > 0.15) {
      // Spinning CW -> Port thruster pods fire into space
      this.thrusterParticles.emitParticleAt(
        this.shaftOriginX - 14,
        this.astronaut.y,
        1
      );
    }
  }

  /**
   * Updates the fading motion trail ghosts behind the floating astronaut.
   */
  updateMotionTrail() {
    this.trailPositions.unshift({
      x: this.astronaut.x,
      y: this.astronaut.y,
      rotation: this.astronaut.rotation,
    });

    const maxPoints = CONFIG.astronaut.trailLength * 3;
    if (this.trailPositions.length > maxPoints) {
      this.trailPositions.pop();
    }

    const baseAlpha = CONFIG.astronaut.trailAlpha;
    for (let i = 0; i < this.motionTrailGhosts.length; i++) {
      const ghost = this.motionTrailGhosts[i];
      const posIdx = (i + 1) * 2;

      if (posIdx < this.trailPositions.length) {
        const p = this.trailPositions[posIdx];
        ghost.setPosition(p.x, p.y);
        ghost.setRotation(p.rotation);
        const alpha = baseAlpha * Math.pow(0.65, i + 1);
        ghost.setAlpha(alpha);
      } else {
        ghost.setAlpha(0);
      }
    }
  }

  /**
   * Updates cartoon wall-hit stun animation.
   */
  updateCartoonStunAnimation(time, delta) {
    if (!this.isStunned) {
      for (const item of this.diamondStars) {
        if (item.sprite.visible) {
          item.sprite.setVisible(false);
        }
      }
      return;
    }

    const deltaSec = delta / 1000;
    this.stunRemainingMs -= delta;

    this.haloOrbitAngle += CONFIG.astronaut.haloOrbitSpeed * deltaSec;

    const headX = this.astronaut.x;
    const headY = this.astronaut.y - 10;
    const rx = CONFIG.astronaut.haloRadiusX;
    const ry = CONFIG.astronaut.haloRadiusY;

    for (const item of this.diamondStars) {
      const theta = this.haloOrbitAngle + item.phaseOffset;

      const sx = headX + Math.cos(theta) * rx;
      const sy = headY + Math.sin(theta) * ry;

      item.sprite.setPosition(sx, sy);

      if (Math.sin(theta) < 0) {
        item.sprite.setDepth(9);
      } else {
        item.sprite.setDepth(11);
      }

      const twinkle = 0.85 + 0.3 * Math.sin(theta * 2);
      item.sprite.setScale(item.scaleOffset * twinkle);
      item.sprite.rotation += 0.08;

      if (this.stunRemainingMs < 250) {
        item.sprite.setAlpha(this.stunRemainingMs / 250);
      } else {
        item.sprite.setAlpha(1);
      }
    }

    this.astronaut.rotation = Math.sin(time * 0.014) * 0.40;

    if (this.stunRemainingMs <= 0) {
      this.isStunned = false;
      for (const item of this.diamondStars) {
        item.sprite.setVisible(false);
      }
    }
  }

  /**
   * Hard safety boundary check:
   * Keeps astronaut strictly inside the corridor under all circumstances.
   */
  enforceShaftBoundaries() {
    const minSafeX = this.shaftOriginX + CONFIG.visuals.tileSize * 0.75;
    const maxSafeX = this.shaftOriginX + this.level.pixelWidth - CONFIG.visuals.tileSize * 0.75;

    if (this.astronaut.x < minSafeX) {
      this.matter.body.setPosition(this.astronaut.body, {
        x: minSafeX,
        y: this.astronaut.y,
      });
      if (this.astronaut.body.velocity.x < 0) {
        this.matter.body.setVelocity(this.astronaut.body, {
          x: Math.abs(this.astronaut.body.velocity.x) * 0.20,
          y: this.astronaut.body.velocity.y,
        });
      }
      this.driftVx = Math.max(0, this.driftVx);
    } else if (this.astronaut.x > maxSafeX) {
      this.matter.body.setPosition(this.astronaut.body, {
        x: maxSafeX,
        y: this.astronaut.y,
      });
      if (this.astronaut.body.velocity.x > 0) {
        this.matter.body.setVelocity(this.astronaut.body, {
          x: -Math.abs(this.astronaut.body.velocity.x) * 0.20,
          y: this.astronaut.body.velocity.y,
        });
      }
      this.driftVx = Math.min(0, this.driftVx);
    }
  }

  /**
   * Faces the astronaut towards their drift vector with gentle zero-g banking.
   */
  updateAstronautVisuals(vx, vy) {
    const lateralBanking = (vx / CONFIG.astronaut.maxLateralVelocity) * 0.35;
    this.astronaut.rotation = Phaser.Math.Linear(this.astronaut.rotation, lateralBanking, 0.10);
  }

  /**
   * Updates streaming starfield in the exterior space void.
   */
  updateStreamingStarfield(fallingSpeed, deltaSec) {
    const { width } = this.scale;
    const totalHeight = this.shaftOriginY + this.level.pixelHeight + 240;
    const starCfg = CONFIG.stars;

    this.starfieldGraphics.clear();

    this.starfieldGraphics.fillStyle(0x030812, 1);
    this.starfieldGraphics.fillRect(0, 0, width, totalHeight);

    const effectiveSpeed = starCfg.streamSpeed + Math.max(0, fallingSpeed) * starCfg.streamVelocityMultiplier;
    const streakLength = Math.max(1, Math.min(10, (effectiveSpeed - 20) * 0.05));

    for (const star of this.stars) {
      star.y -= effectiveSpeed * star.speedFactor * deltaSec;

      if (star.y < 0) {
        star.y += totalHeight;
        star.x = Phaser.Math.Between(0, width);
      } else if (star.y > totalHeight) {
        star.y -= totalHeight;
        star.x = Phaser.Math.Between(0, width);
      }
      if (star.x < 0) star.x += width;
      if (star.x > width) star.x -= width;

      this.starfieldGraphics.lineStyle(star.baseSize, 0x88ccff, star.alpha);
      this.starfieldGraphics.strokeLineShape(
        new Phaser.Geom.Line(star.x, star.y, star.x, star.y + streakLength * star.speedFactor)
      );
    }
  }
}

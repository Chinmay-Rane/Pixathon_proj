/**
 * BOOT SCENE - PROCEDURAL ASSET GENERATOR
 * 
 * Procedurally generates high-definition vector textures:
 * - High-Definition Astronaut (Bright white EVA suit, gold/cyan reflective visor, chest DCM console,
 *   flexible joint gaskets, mission patches, zero-g floating boots & gloves, backpack PLSS tanks)
 * - Authentic Metallic Spaceship Bulkhead Plates (bevels, rivets, brushed titanium grain)
 * - Diagonal Caution Hazard Stripes (industrial spaceship airlock markings)
 * - Exterior RCS Thruster Pod Housings
 * - Layered Radial Gradient Planet Body & Additive Corona Haze
 * - High-Visibility 76px Landing Pad Beacon
 * - Cartoon Diamond-Shaped Sparkling Stars for Wall-Hit Dizziness
 * - Cyan Steering Thruster & Fiery Retro-Brake Particle Exhausts
 * 
 * 100% offline, zero external image loading lag.
 */

import Phaser from 'phaser';
import { CONFIG } from '../logic/config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.createAstronautTexture();
    this.createBulkheadTexture();
    this.createHazardStripeTexture();
    this.createRcsPodTexture();
    this.createDiamondStarTexture();
    this.createLandingPadTexture();
    this.createThrusterParticleTexture();
    this.createBrakeParticleTexture();
    this.createPlanetTexture();
    this.createPlanetCoronaTexture();

    // Proceed to StartScene
    this.scene.start('StartScene');
  }

  /**
   * Generates a 76x76 high-definition, authentic Astronaut sprite:
   * Features bright white EVA suit fabric, gold/cyan curved reflective bubble visor,
   * chest DCM console with status indicators, microgravity floating posture (gloves, boots),
   * life-support backpack with dual oxygen tanks, and soft warm ambient aura.
   */
  createAstronautTexture() {
    const size = CONFIG.astronaut.spriteSize; // 76x76
    const canvas = this.textures.createCanvas('astronaut', size, size);
    const ctx = canvas.context;
    const cx = size / 2;
    const cy = size / 2;

    ctx.clearRect(0, 0, size, size);

    // 1. Soft Warm Ambient Glow Aura
    const glowGrad = ctx.createRadialGradient(cx, cy, 14, cx, cy, 36);
    glowGrad.addColorStop(0, 'rgba(255, 240, 200, 0.40)');
    glowGrad.addColorStop(0.5, 'rgba(0, 213, 255, 0.18)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, Math.PI * 2);
    ctx.fill();

    // 2. Heavy Life-Support Backpack (PLSS)
    // Mounted behind astronaut (towards the top/rear of suit)
    ctx.fillStyle = '#141e2c';
    ctx.strokeStyle = '#2c3e54';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy - 26, 32, 28, 4);
    ctx.fill();
    ctx.stroke();

    // Dual High-Pressure Oxygen Tanks
    const drawTank = (tx) => {
      const tankGrad = ctx.createLinearGradient(tx - 6, cy - 24, tx + 6, cy - 24);
      tankGrad.addColorStop(0, '#a8bccc');
      tankGrad.addColorStop(0.4, '#ffffff');
      tankGrad.addColorStop(1, '#8ca0b2');

      ctx.fillStyle = tankGrad;
      ctx.strokeStyle = '#00d5ff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(tx - 6, cy - 24, 12, 20, 3);
      ctx.fill();
      ctx.stroke();

      // Tank telemetry band
      ctx.fillStyle = '#00d5ff';
      ctx.fillRect(tx - 6, cy - 16, 12, 3);
    };
    drawTank(cx - 10);
    drawTank(cx + 10);

    // Backpack Status Telemetry LED
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy - 20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Micro Attitude Thruster Nozzles on Backpack Corners
    ctx.fillStyle = '#486078';
    ctx.fillRect(cx - 17, cy - 24, 3, 4);
    ctx.fillRect(cx + 14, cy - 24, 3, 4);

    // 3. Zero-G Floating Legs & Boots
    const drawLeg = (lx, isLeft) => {
      // Upper leg & knee
      const legGrad = ctx.createLinearGradient(lx - 6, cy + 6, lx + 6, cy + 6);
      legGrad.addColorStop(0, '#ccddee');
      legGrad.addColorStop(0.5, '#ffffff');
      legGrad.addColorStop(1, '#a8c0d6');

      ctx.fillStyle = legGrad;
      ctx.strokeStyle = '#182434';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(lx - 5, cy + 6, 10, 16, 3);
      ctx.fill();
      ctx.stroke();

      // Accordion knee flex joint
      ctx.strokeStyle = '#1a2432';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx - 5, cy + 14);
      ctx.lineTo(lx + 5, cy + 14);
      ctx.stroke();

      // Heavy EVA Lunar Boot
      const bootGrad = ctx.createLinearGradient(lx - 7, cy + 22, lx + 7, cy + 22);
      bootGrad.addColorStop(0, '#1c2838');
      bootGrad.addColorStop(0.7, '#2a3a50');
      bootGrad.addColorStop(1, '#182230');

      ctx.fillStyle = bootGrad;
      ctx.beginPath();
      ctx.roundRect(lx - (isLeft ? 7 : 5), cy + 22, 12, 8, 2);
      ctx.fill();
      ctx.stroke();

      // Boot sole grip & cyan heel latch
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(lx - (isLeft ? 7 : 5), cy + 28, 12, 2);
    };
    drawLeg(cx - 8, true);
    drawLeg(cx + 8, false);

    // 4. Zero-G Floating Arms & Gloves
    const drawArm = (armX, isLeft) => {
      // Sleeve
      const armGrad = ctx.createLinearGradient(armX - 6, cy - 8, armX + 6, cy - 8);
      armGrad.addColorStop(0, '#ccddee');
      armGrad.addColorStop(0.5, '#ffffff');
      armGrad.addColorStop(1, '#a8c0d6');

      ctx.fillStyle = armGrad;
      ctx.strokeStyle = '#182434';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(armX - 5, cy - 6, 10, 16, 3);
      ctx.fill();
      ctx.stroke();

      // Accordion elbow flex joint
      ctx.strokeStyle = '#1a2432';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(armX - 5, cy + 2);
      ctx.lineTo(armX + 5, cy + 2);
      ctx.stroke();

      // Pressurized EVA Thermal Glove
      ctx.fillStyle = '#1e2c3c';
      ctx.strokeStyle = '#0e1824';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(armX, cy + 12, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glove grip palm
      ctx.fillStyle = '#00d5ff';
      ctx.fillRect(armX - 2, cy + 11, 4, 2);
    };
    drawArm(cx - 20, true);
    drawArm(cx + 20, false);

    // 5. Pressurized Spacesuit Torso (Bright White EVA Fabric)
    const suitGrad = ctx.createRadialGradient(cx - 4, cy, 4, cx, cy + 2, 22);
    suitGrad.addColorStop(0, '#ffffff');
    suitGrad.addColorStop(0.65, '#f0f5fa');
    suitGrad.addColorStop(1, '#c0d4e6');

    ctx.fillStyle = suitGrad;
    ctx.strokeStyle = '#162232';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy - 10, 32, 24, 6);
    ctx.fill();
    ctx.stroke();

    // Shoulder Mission Patches
    // Left: Blue planetary globe patch
    ctx.fillStyle = '#0077dd';
    ctx.beginPath();
    ctx.arc(cx - 15, cy - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 16, cy - 5, 2, 2);

    // Right: Gold mission commander chevron
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(cx + 13, cy - 6);
    ctx.lineTo(cx + 17, cy - 3);
    ctx.lineTo(cx + 13, cy);
    ctx.closePath();
    ctx.fill();

    // 6. Chest Display & Control Module (DCM)
    // The iconic Apollo/ISS chest control unit with valves, buttons, and telemetry
    const dcmGrad = ctx.createLinearGradient(cx - 9, cy - 4, cx + 9, cy + 8);
    dcmGrad.addColorStop(0, '#253548');
    dcmGrad.addColorStop(1, '#141d28');

    ctx.fillStyle = dcmGrad;
    ctx.strokeStyle = '#3c526d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 9, cy - 4, 18, 12, 2);
    ctx.fill();
    ctx.stroke();

    // DCM Digital Telemetry Lines
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(cx - 7, cy - 2, 8, 1.5);
    ctx.fillStyle = '#00d5ff';
    ctx.fillRect(cx - 7, cy + 1, 6, 1.5);

    // DCM Color-Coded Valves (Red emergency purge + Blue main O2 dial)
    ctx.fillStyle = '#ff3344';
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00b4d8';
    ctx.beginPath();
    ctx.arc(cx + 4, cy + 4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 7. Thick Rubber Neck Collar Ring
    ctx.fillStyle = '#1c2838';
    ctx.strokeStyle = '#2c3e52';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 12, cy - 15, 24, 6, 3);
    ctx.fill();
    ctx.stroke();

    // 8. Large Spherical Bubble Helmet Dome
    const helmetGrad = ctx.createRadialGradient(cx - 4, cy - 22, 3, cx, cy - 20, 18);
    helmetGrad.addColorStop(0, '#ffffff');
    helmetGrad.addColorStop(0.75, '#e4edf6');
    helmetGrad.addColorStop(1, '#9cb8d2');

    ctx.fillStyle = helmetGrad;
    ctx.strokeStyle = '#182436';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy - 18, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet Side Spotlight Pods
    ctx.fillStyle = '#223042';
    ctx.fillRect(cx - 17, cy - 20, 3, 5);
    ctx.fillRect(cx + 14, cy - 20, 3, 5);

    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.fillRect(cx - 17, cy - 19, 1.5, 3);
    ctx.fillRect(cx + 15.5, cy - 19, 1.5, 3);
    ctx.shadowBlur = 0;

    // 9. RADIANT CURVED REFLECTIVE VISOR (Gold / Cyan Metallic Specular Sheen)
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;

    const visorGrad = ctx.createLinearGradient(cx - 11, cy - 25, cx + 11, cy - 13);
    visorGrad.addColorStop(0, '#003355');
    visorGrad.addColorStop(0.35, '#00c8ff');
    visorGrad.addColorStop(0.75, '#ffaa00');
    visorGrad.addColorStop(1, '#ffee55');

    ctx.fillStyle = visorGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 19, 11, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Visor Dark Pressure Gasket Seal
    ctx.strokeStyle = '#081422';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Curved Specular Glint Reflection Arc (Glossy Glass Highlight)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 22, 4.5, 2, -0.25, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  /**
   * Generates authentic metallic spaceship bulkhead plate texture (76x76).
   * Features beveled edges, rivet studs, brushed titanium gradient, and panel seams.
   */
  createBulkheadTexture() {
    const size = CONFIG.visuals.tileSize; // 76x76
    const canvas = this.textures.createCanvas('bulkhead_plate', size, size);
    const ctx = canvas.context;

    ctx.clearRect(0, 0, size, size);

    // Metallic Titanium Base Gradient
    const baseGrad = ctx.createLinearGradient(0, 0, 0, size);
    baseGrad.addColorStop(0, '#223246');
    baseGrad.addColorStop(0.5, '#162232');
    baseGrad.addColorStop(1, '#0e1622');

    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    // Beveled Highlights & Shadows (3D metallic depth)
    // Top highlight
    ctx.fillStyle = '#486584';
    ctx.fillRect(0, 0, size, 2);
    // Left highlight
    ctx.fillRect(0, 0, 2, size);
    // Bottom shadow
    ctx.fillStyle = '#060a10';
    ctx.fillRect(0, size - 2, size, 2);
    // Right shadow
    ctx.fillRect(size - 2, 0, 2, size);

    // Recessed Inner Panel Border
    ctx.strokeStyle = '#0a1018';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, size - 12, size - 12);

    ctx.strokeStyle = '#324a64';
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 7, size - 14, size - 14);

    // Hex Rivet Studs in 4 Corners
    const drawRivet = (rx, ry) => {
      ctx.fillStyle = '#080e16';
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6084a8';
      ctx.beginPath();
      ctx.arc(rx - 0.5, ry - 0.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    };
    drawRivet(11, 11);
    drawRivet(size - 11, 11);
    drawRivet(11, size - 11);
    drawRivet(size - 11, size - 11);

    // Subtle Horizontal Structural Seam
    ctx.strokeStyle = '#0b121b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, size / 2);
    ctx.lineTo(size - 8, size / 2);
    ctx.stroke();

    ctx.strokeStyle = '#2a3e56';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, size / 2 + 1);
    ctx.lineTo(size - 8, size / 2 + 1);
    ctx.stroke();

    canvas.refresh();
  }

  /**
   * Generates diagonal yellow/dark caution hazard stripes for bulkhead corners and ledges.
   */
  createHazardStripeTexture() {
    const w = 76;
    const h = 18;
    const canvas = this.textures.createCanvas('hazard_stripe', w, h);
    const ctx = canvas.context;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#121820';
    ctx.fillRect(0, 0, w, h);

    const stripeW = 12;
    ctx.fillStyle = '#ffaa00';

    for (let x = -h; x < w + h; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.lineTo(x + stripeW, h);
      ctx.lineTo(x + stripeW + h, 0);
      ctx.lineTo(x + h, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Top and bottom protective bevel
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(0, 0, w, 1.5);
    ctx.fillStyle = '#080c10';
    ctx.fillRect(0, h - 1.5, w, 1.5);

    canvas.refresh();
  }

  /**
   * Generates exterior RCS attitude thruster pod texture.
   */
  createRcsPodTexture() {
    const w = 28;
    const h = 48;
    const canvas = this.textures.createCanvas('rcs_pod', w, h);
    const ctx = canvas.context;

    ctx.clearRect(0, 0, w, h);

    // Pod Titanium Housing
    const podGrad = ctx.createLinearGradient(0, 0, w, 0);
    podGrad.addColorStop(0, '#1c2838');
    podGrad.addColorStop(0.5, '#2c3e56');
    podGrad.addColorStop(1, '#162232');

    ctx.fillStyle = podGrad;
    ctx.strokeStyle = '#486584';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(4, 8, w - 8, h - 16, 4);
    ctx.fill();
    ctx.stroke();

    // Dual Rocket Nozzle Bells
    const drawNozzle = (ny) => {
      ctx.fillStyle = '#0e1622';
      ctx.strokeStyle = '#00d5ff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(w - 6, ny - 4);
      ctx.lineTo(w, ny - 6);
      ctx.lineTo(w, ny + 6);
      ctx.lineTo(w - 6, ny + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    drawNozzle(16);
    drawNozzle(32);

    canvas.refresh();
  }

  /**
   * Generates a cartoon diamond-shaped star for the dizzy stun effect.
   */
  createDiamondStarTexture() {
    const size = 28; // Scaled up to match 76px astronaut
    const canvas = this.textures.createCanvas('diamond_star', size, size);
    const ctx = canvas.context;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);

    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 10;

    ctx.fillStyle = '#ffdd00';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(center, 2);
    ctx.quadraticCurveTo(center + 3.5, center - 3.5, size - 2, center);
    ctx.quadraticCurveTo(center + 3.5, center + 3.5, center, size - 2);
    ctx.quadraticCurveTo(center - 3.5, center + 3.5, 2, center);
    ctx.quadraticCurveTo(center - 3.5, center - 3.5, center, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Glowing white sparkle core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(center, center, 3.5, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  /**
   * Generates 76px landing pad beacon texture.
   */
  createLandingPadTexture() {
    const size = CONFIG.visuals.tileSize; // 76px
    const canvas = this.textures.createCanvas('landing_pad', size, size);
    const ctx = canvas.context;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);

    // Foundation plate with metallic hatch lines
    ctx.fillStyle = '#061a14';
    ctx.fillRect(2, 2, size - 4, size - 4);

    // Perimeter warning border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(3, 3, size - 6, size - 6);

    // Concentric guidance rings
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.24, 0, Math.PI * 2);
    ctx.stroke();

    // Central landing beacon
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(center, center, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Corner alignment chevrons
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, 20); ctx.lineTo(10, 10); ctx.lineTo(20, 10);
    ctx.moveTo(size - 20, 10); ctx.lineTo(size - 10, 10); ctx.lineTo(size - 10, 20);
    ctx.moveTo(10, size - 20); ctx.lineTo(10, size - 10); ctx.lineTo(20, size - 10);
    ctx.moveTo(size - 20, size - 10); ctx.lineTo(size - 10, size - 10); ctx.lineTo(size - 10, size - 20);
    ctx.stroke();

    canvas.refresh();
  }

  /**
   * Generates cyan lateral thruster exhaust particle texture.
   */
  createThrusterParticleTexture() {
    const size = 24;
    const canvas = this.textures.createCanvas('thruster_particle', size, size);
    const ctx = canvas.context;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);

    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#00e5ff');
    grad.addColorStop(0.7, 'rgba(0, 150, 255, 0.55)');
    grad.addColorStop(1, 'rgba(0, 100, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  /**
   * Generates fiery amber/orange retro-brake particle texture.
   */
  createBrakeParticleTexture() {
    const size = 28;
    const canvas = this.textures.createCanvas('brake_particle', size, size);
    const ctx = canvas.context;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);

    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ffaa00');
    grad.addColorStop(0.65, '#ff3300');
    grad.addColorStop(1, 'rgba(255, 50, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  /**
   * Layered radial gradient planet texture (wide format).
   */
  createPlanetTexture() {
    const w = CONFIG.planet.textureWidth;
    const h = CONFIG.planet.textureHeight;
    const pColors = CONFIG.planet.colors;

    const canvas = this.textures.createCanvas('planet_layered_body', w, h);
    const ctx = canvas.context;
    const cx = w / 2;
    const cy = h + 420;
    const radius = h + 400;

    ctx.clearRect(0, 0, w, h);

    const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.72, cx, cy, radius * 1.05);
    atmoGrad.addColorStop(0, pColors.deepCore);
    atmoGrad.addColorStop(0.40, pColors.crustMantle);
    atmoGrad.addColorStop(0.70, pColors.upperMantle);
    atmoGrad.addColorStop(0.88, pColors.moltenHorizon);
    atmoGrad.addColorStop(0.97, pColors.ionosphereLimb);
    atmoGrad.addColorStop(1.0, 'rgba(255, 120, 40, 0)');

    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      const bandR = radius * (0.80 + i * 0.04);
      const bandAlpha = 0.08 + i * 0.03;
      ctx.strokeStyle = `rgba(255, 170, 70, ${bandAlpha})`;
      ctx.beginPath();
      ctx.arc(cx, cy, bandR, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    }

    ctx.shadowColor = pColors.ionosphereLimb;
    ctx.shadowBlur = 24;
    ctx.strokeStyle = '#ffeecc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.985, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.shadowBlur = 0;

    canvas.refresh();
  }

  /**
   * Layered radial corona haze texture.
   */
  createPlanetCoronaTexture() {
    const w = 1800;
    const h = 550;
    const canvas = this.textures.createCanvas('planet_corona_haze', w, h);
    const ctx = canvas.context;
    const cx = w / 2;
    const cy = h + 180;
    const r = h + 160;

    ctx.clearRect(0, 0, w, h);

    const coronaGrad = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
    coronaGrad.addColorStop(0, 'rgba(255, 120, 30, 0.55)');
    coronaGrad.addColorStop(0.4, 'rgba(255, 80, 15, 0.30)');
    coronaGrad.addColorStop(0.75, 'rgba(200, 40, 5, 0.12)');
    coronaGrad.addColorStop(1, 'rgba(150, 20, 0, 0)');

    ctx.fillStyle = coronaGrad;
    ctx.fillRect(0, 0, w, h);

    canvas.refresh();
  }
}

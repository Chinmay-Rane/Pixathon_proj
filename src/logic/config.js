/**
 * CONFIGURATION & TUNING PARAMETERS
 * 
 * Central tuning file for all game physics, gravity curve, controls,
 * 360° station rotation, astronaut EVA boosters, floating physics items,
 * and environmental hazards (decompression breaches and fire conduits).
 */

export const CONFIG = {
  // --- Spaceship 360° Continuous Rotation & Gyros ---
  maze: {
    // Continuous 360° station spin rate (radians per second) when A or D is engaged
    stationSpinRate: 0.48, // ~27.5 degrees per second (calm, precise alignment)

    // Smooth rotational interpolation speed (lerp)
    spinLerp: 0.10,

    // Visual horizontal sway offset of the spaceship shaft on screen (pixels)
    swayMaxPx: 20,

    // Gentle horizontal sway lerp
    swayLerp: 0.08,

    // Strength of retro-brake counter-arrest (stops both station spin and astronaut drift)
    brakeStrength: 8.0,

    // Rate at which brake charge drains per second while Spacebar is held
    brakeDrainRate: 20,

    // Rate at which brake charge recovers per second when Spacebar is released
    brakeRechargeRate: 25,

    // Maximum brake energy capacity
    brakeMaxCharge: 100,
  },

  // --- Depth-Based Planet Gravity (Ultra-Slow Peaceful Descent) ---
  gravity: {
    // Base gravity at top of shaft: ultra-slow, peaceful, weightless downward drift
    baseG: 0.8,

    // Maximum gravity near planet surface at bottom of shaft
    maxG: 2.2,

    // Gravity curve exponent: g = baseG + (maxG - baseG) * (depth / levelDepth)^exponent
    exponent: 1.6,
  },

  // --- Astronaut EVA Thrusters & Persistent Newtonian Drift ---
  astronaut: {
    // Physical mass
    mass: 1.0,

    // Hitbox collision circle radius
    radius: 26,

    // Visual sprite dimensions (76x76px high-definition canvas)
    spriteSize: 76,

    // Persistent EVA booster cruise speed (px / step in Matter.js, approx 75-80 px/sec)
    boosterSpeed: 1.35,

    // Warm glow aura radius in pixels
    glowRadius: 42,

    // Soft warm glow intensity (alpha)
    glowAlpha: 0.35,

    // Length of the fading motion trail (number of trail ghost points)
    trailLength: 6,

    // Initial opacity of the motion trail ghosts
    trailAlpha: 0.38,

    // Restitution: soft cushioned bounce off bulkheads
    restitution: 0.20,

    // Surface friction against walls
    friction: 0.12,

    // Cabin air drag: near zero for true Newtonian persistent zero-g coasting
    frictionAir: 0.005,

    // Ultra-slow terminal falling velocity ceiling (px / step)
    maxTerminalVelocity: 1.8,

    // Maximum horizontal drift speed (px / step)
    maxLateralVelocity: 1.6,

    // --- Cartoon Wall-Hit Stun Parameters ---
    stunDurationMs: 850,
    stunCooldownMs: 1400,
    stunImpactThreshold: 1.65,
    diamondStarCount: 4,
    haloRadiusX: 42,
    haloRadiusY: 16,
    haloOrbitSpeed: 5.0,
  },

  // --- Floating Interactive Physics Items (Phase 2) ---
  items: {
    // Cargo containers
    crateMass: 2.5,
    crateFriction: 0.20,
    crateRestitution: 0.15,
    crateSize: 58,

    // Keycard collection radius
    keyPickupRadius: 52,

    // Blast door unlock interaction distance
    doorUnlockDistance: 135,

    // Decompression breach suction parameters
    breachSuctionRadius: 180,
    breachSuctionForce: 45,
    breachEjectionRadius: 26,

    // Fire conduit timing (seconds)
    fireWarningDuration: 1.5,
    fireActiveDuration: 1.6,
    fireCooldownDuration: 2.4,
    fireDamagePerSecond: 25,
  },

  // --- Planet Visuals ---
  planet: {
    baseScale: 1.0,
    maxScale: 1.95,
    baseAlpha: 0.65,
    maxAlpha: 1.0,
    startDistanceBelowExit: 560,
    endDistanceBelowExit: 280,
    atmosphereGlowBaseAlpha: 0.35,
    atmosphereGlowMaxAlpha: 0.92,
    textureWidth: 1800,
    textureHeight: 650,
    colors: {
      deepCore: '#100301',
      crustMantle: '#5c1705',
      upperMantle: '#b83b0a',
      moltenHorizon: '#ff5e1a',
      ionosphereLimb: '#ff9436',
      coronaGlow: 'rgba(255, 90, 20, 0.45)',
      outerSpaceVoid: 'rgba(255, 60, 10, 0)',
    },
  },

  // --- Starfield & Space Motion ---
  stars: {
    count: 180,
    streamSpeed: 16,
    streamVelocityMultiplier: 0.30,
    lateralParallax: 0.22,
  },

  // --- Oxygen & Life Support System ---
  oxygen: {
    max: 100,
    drainRatePerSecond: 0.85,
    warningThreshold: 25,
    tankRestoreAmount: 30,
  },

  // --- Visuals & Color Roles Palette ---
  visuals: {
    tileSize: 76,

    palette: {
      hullDark: '#0e1520',
      hullMid: '#162232',
      hullLight: '#24344a',
      hullHighlight: '#486584',
      hullShadow: '#070b10',
      hazardYellow: '#ffaa00',
      hazardDark: '#121922',

      astronautSuit: '#ffffff',
      astronautSuitShade: '#d2e0ec',
      astronautJoints: '#1c2838',
      astronautVisorCyan: '#00d5ff',
      astronautVisorGold: '#ffcc00',
      astronautWarmGlow: 'rgba(255, 235, 190, 0.35)',

      crateBody: '#3a4a5e',
      crateStripe: '#ffaa00',
      keyGold: '#ffdd00',
      doorLocked: '#ff3344',
      doorUnlocked: '#00ff88',
      fireFlame: '#ff5500',
      breachVoid: '#000000',

      danger: '#ff3344',
      dangerGlow: '#ff6622',
      oxygen: '#00ff88',
      oxygenGlow: '#33ffaa',
      spaceVoid: '#030812',
      starColor: '#aadcff',
    },

    colors: {
      background: '#030812',
      gridLines: '#0a2244',
      wallFill: '#162232',
      wallStroke: '#00d5ff',
      wallInterior: '#0d1622',
      astronautSuit: '#ffffff',
      astronautVisor: '#00f0ff',
      landingPad: '#00ff88',
      landingGlow: '#00ffaa',
      thrusterPlume: '#00e5ff',
      brakePlume: '#ffaa00',
      planetAtmosphere: '#ff5522',
      diamondStar: '#ffdd22',
      diamondStarGlow: '#ffee66',
    },
  },
};

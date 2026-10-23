/**
 * HUD & FLIGHT TELEMETRY INSTRUMENTS
 * 
 * Provides crisp CAD/blueprint aerospace instruments:
 * - Mission timer & level sector
 * - Descent Depth gauge (progress from top of shaft to planet surface)
 * - Planet Gravity Telemetry (surface pull in G-force and px/s² acceleration)
 * - Security Keycard Status indicator (Locked / Acquired)
 * - Retro-Brake capacitor meter (charge drain & recharge status)
 * - Oxygen status gauge with low-O2 warning pulses
 * - Tactical holographic announcements (Access Granted, Hull Breach, etc.)
 * - Quick controls reference & instant restart button [R]
 */

import { CONFIG } from '../logic/config.js';

export class HUD {
  /**
   * @param {HTMLElement} container 
   * @param {object} callbacks
   * @param {Function} callbacks.onRestartLevel
   */
  constructor(container, { onRestartLevel } = {}) {
    this.container = container;
    this.onRestartLevel = onRestartLevel;

    this.root = document.createElement('div');
    this.root.className = 'blueprint-hud';
    this.container.appendChild(this.root);

    this.buildMarkup();
    this.bindEvents();
  }

  buildMarkup() {
    this.root.innerHTML = `
      <!-- Top Flight Telemetry Header (Clean, Non-Overlapping) -->
      <header class="hud-header">
        <!-- Sector & Mission Timer -->
        <div class="hud-section hud-left">
          <div class="hud-title-block">
            <span class="hud-tag">VERTICAL SHAFT DESCENT // ZERO-G MAZE</span>
            <h1 class="hud-title" id="hud-level-name">SECTOR 01: PRIMARY AIRLOCK</h1>
          </div>
          <div class="hud-timer-block">
            <span class="hud-label">DESCENT TIME</span>
            <span class="hud-val" id="hud-timer">00:00.0</span>
          </div>
        </div>

        <!-- Center: Descent Progress & Security Keycard Status -->
        <div class="hud-section hud-center">
          <!-- Altitude Progress Bar -->
          <div class="telemetry-module altitude-module">
            <div class="module-label-row">
              <span class="module-title">DESCENT PROGRESS</span>
              <span class="module-val" id="hud-depth-percent">0%</span>
            </div>
            <div class="module-track">
              <div class="module-bar alt-bar" id="hud-depth-bar" style="width: 0%;"></div>
            </div>
          </div>

          <!-- Security Keycard Status -->
          <div class="telemetry-module keycard-module">
            <div class="module-label-row">
              <span class="module-title">
                <span class="panel-dot key-dot" id="hud-key-dot"></span> SECURITY KEY
              </span>
              <span class="module-val key-val" id="hud-key-status">REQUIRED</span>
            </div>
            <div class="key-sub-row">
              <span class="hud-mini-label" id="hud-key-detail">DOORS LOCKED</span>
            </div>
          </div>

          <!-- Planet Gravity Pull Readout -->
          <div class="telemetry-module gravity-module">
            <div class="module-label-row">
              <span class="module-title gravity-title">
                <span class="panel-dot gravity-dot"></span> GRAVITY
              </span>
              <span class="module-val gravity-val" id="hud-gravity-g">1.00 G</span>
            </div>
            <div class="gravity-accel-row">
              <span class="hud-mini-label">SURFACE PULL:</span>
              <span class="hud-mini-val" id="hud-gravity-val">4 px/s²</span>
            </div>
          </div>
        </div>

        <!-- Right: Retro-Brake & Oxygen & Restart Button -->
        <div class="hud-section hud-right">
          <!-- Retro-Brake Capacitor -->
          <div class="telemetry-module brake-module">
            <div class="module-label-row">
              <span class="module-title">
                <span class="panel-dot brake-dot"></span> BRAKE [SPACE]
              </span>
              <span class="module-val brake-val" id="hud-brake-status">READY</span>
            </div>
            <div class="module-track">
              <div class="module-bar brake-bar" id="hud-brake-bar" style="width: 100%;"></div>
            </div>
          </div>

          <!-- Oxygen Bar -->
          <div class="telemetry-module oxygen-module">
            <div class="module-label-row">
              <span class="module-title">O₂ SUPPORT</span>
              <span class="module-val oxygen-percent" id="hud-o2-text">100%</span>
            </div>
            <div class="module-track">
              <div class="module-bar oxygen-bar" id="hud-o2-bar" style="width: 100%;"></div>
            </div>
          </div>

          <!-- Restart Level [R] -->
          <button type="button" class="hud-btn-restart" id="hud-restart-btn" title="Restart level [R]">
            ↺ RESTART [R]
          </button>
        </div>
      </header>

      <!-- Central Holographic Banner for Announcements -->
      <div class="hud-announcement-container" id="hud-announcement" style="display: none;">
        <div class="hud-announcement-card" id="hud-announcement-card">
          <span class="hud-announcement-text" id="hud-announcement-text">STAGE ACCESS GRANTED</span>
        </div>
      </div>

      <!-- Bottom Floating Controls Guide (Unobtrusive) -->
      <footer class="hud-footer">
        <div class="controls-legend">
          <span class="legend-tag">[ZERO-G FLIGHT]</span>
          <span class="legend-key">A / D</span>: 360° Station Spin &nbsp;|&nbsp; 
          <span class="legend-key">Arrows</span>: Persistent EVA Drift &nbsp;|&nbsp; 
          <span class="legend-key">Space</span>: Retro-Brake &nbsp;|&nbsp; 
          <span class="legend-key">R</span>: Restart
        </div>
      </footer>
    `;

    // Cache element references
    this.el = {
      levelName: this.root.querySelector('#hud-level-name'),
      timer: this.root.querySelector('#hud-timer'),
      depthBar: this.root.querySelector('#hud-depth-bar'),
      depthPercent: this.root.querySelector('#hud-depth-percent'),
      keyDot: this.root.querySelector('#hud-key-dot'),
      keyStatus: this.root.querySelector('#hud-key-status'),
      keyDetail: this.root.querySelector('#hud-key-detail'),
      gravityG: this.root.querySelector('#hud-gravity-g'),
      gravityVal: this.root.querySelector('#hud-gravity-val'),
      brakeBar: this.root.querySelector('#hud-brake-bar'),
      brakeStatus: this.root.querySelector('#hud-brake-status'),
      o2Bar: this.root.querySelector('#hud-o2-bar'),
      o2Text: this.root.querySelector('#hud-o2-text'),
      restartBtn: this.root.querySelector('#hud-restart-btn'),
      announcement: this.root.querySelector('#hud-announcement'),
      announcementCard: this.root.querySelector('#hud-announcement-card'),
      announcementText: this.root.querySelector('#hud-announcement-text'),
    };
  }

  bindEvents() {
    this.el.restartBtn.addEventListener('click', () => {
      if (this.onRestartLevel) this.onRestartLevel();
    });
  }

  setLevelName(name) {
    if (this.el.levelName) {
      this.el.levelName.textContent = name.toUpperCase();
    }
  }

  updateKeyParts(collected, total) {
    if (!this.el.keyStatus) return;

    if (total <= 0) {
      this.el.keyDot.classList.add('key-acquired');
      this.el.keyStatus.textContent = 'NO LOCK';
      this.el.keyStatus.style.color = '#00ff88';
      this.el.keyDetail.textContent = 'SECTOR OPEN';
      this.el.keyDetail.style.color = '#33ffaa';
      return;
    }

    if (collected >= total) {
      this.el.keyDot.classList.add('key-acquired');
      this.el.keyStatus.textContent = `${collected}/${total} READY`;
      this.el.keyStatus.style.color = '#00ff88';
      this.el.keyDetail.textContent = 'ALL CIPHERS ASSEMBLED';
      this.el.keyDetail.style.color = '#33ffaa';
    } else {
      this.el.keyDot.classList.remove('key-acquired');
      this.el.keyStatus.textContent = `${collected}/${total} CIPHERS`;
      this.el.keyStatus.style.color = collected > 0 ? '#00e5ff' : '#ffaa00';
      const remaining = total - collected;
      this.el.keyDetail.textContent = `${remaining} MORE TO UNLOCK`;
      this.el.keyDetail.style.color = '#7da0c5';
    }
  }

  updateKeycardStatus(hasKey) {
    if (typeof hasKey === 'boolean') {
      this.updateKeyParts(hasKey ? 1 : 0, 1);
    }
  }

  showAnnouncement(message, isWarning = false) {
    if (!this.el.announcement) return;

    this.el.announcementText.textContent = message.toUpperCase();
    if (isWarning) {
      this.el.announcementCard.classList.add('banner-warning');
    } else {
      this.el.announcementCard.classList.remove('banner-warning');
    }

    this.el.announcement.style.display = 'flex';
    clearTimeout(this.announcementTimeout);
    this.announcementTimeout = setTimeout(() => {
      if (this.el.announcement) {
        this.el.announcement.style.display = 'none';
      }
    }, 2800);
  }

  updateTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    const pad = (n) => n.toString().padStart(2, '0');
    this.el.timer.textContent = `${pad(mins)}:${pad(secs)}.${tenths}`;
  }

  updateOxygen(current, max = 100) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    this.el.o2Bar.style.width = `${pct}%`;
    this.el.o2Text.textContent = `${Math.ceil(pct)}%`;

    if (pct < CONFIG.oxygen.warningThreshold) {
      this.el.o2Bar.classList.add('o2-critical');
      this.el.o2Text.classList.add('o2-text-critical');
    } else if (pct < 50) {
      this.el.o2Bar.classList.add('o2-warning');
      this.el.o2Bar.classList.remove('o2-critical');
      this.el.o2Text.classList.remove('o2-text-critical');
    } else {
      this.el.o2Bar.classList.remove('o2-warning', 'o2-critical');
      this.el.o2Text.classList.remove('o2-text-critical');
    }
  }

  updateBrake(charge, max = 100, isBraking = false) {
    const pct = Math.max(0, Math.min(100, (charge / max) * 100));
    this.el.brakeBar.style.width = `${pct}%`;

    if (isBraking) {
      this.el.brakeBar.classList.add('active');
      this.el.brakeStatus.textContent = 'ACTIVE';
      this.el.brakeStatus.style.color = '#ffaa00';
    } else {
      this.el.brakeBar.classList.remove('active');
      if (pct >= 99) {
        this.el.brakeStatus.textContent = 'READY';
        this.el.brakeStatus.style.color = '#00ff88';
      } else {
        this.el.brakeStatus.textContent = `${Math.round(pct)}%`;
        this.el.brakeStatus.style.color = '#7da0c5';
      }
    }
  }

  updateGravity(gravityPx, gRating, depthRatio) {
    this.el.gravityG.textContent = `${gRating.toFixed(2)} G`;
    this.el.gravityVal.textContent = `${Math.round(gravityPx)} px/s²`;

    const depthPct = Math.round(depthRatio * 100);
    this.el.depthPercent.textContent = `${depthPct}%`;
    this.el.depthBar.style.width = `${depthPct}%`;
  }
}

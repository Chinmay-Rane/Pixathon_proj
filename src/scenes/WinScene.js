/**
 * WIN SCENE
 * 
 * Displays mission completion statistics upon touching the landing pad,
 * with seamless progression to next sectors (Level 1 -> Level 2 -> Level 3).
 */

import Phaser from 'phaser';
import { getTotalLevels } from '../levels/index.js';

export class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  init(data) {
    this.elapsedTime = data.elapsedTime || 0;
    this.remainingOxygen = data.remainingOxygen || 0;
    this.levelNumber = data.levelNumber || 1;
    this.totalLevels = getTotalLevels();
    this.hasNextLevel = this.levelNumber < this.totalLevels;
  }

  create() {
    const { width, height } = this.scale;

    // Semi-transparent backdrop pinned to viewport
    const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030a14, 0.88);
    backdrop.setScrollFactor(0);

    const cardW = Math.min(560, width - 40);
    const cardH = 370;
    const cardX = width / 2;
    const cardY = height / 2;

    const box = this.add.graphics();
    box.setScrollFactor(0);
    box.fillStyle(0x06182a, 0.96);
    box.lineStyle(2, 0x00ff88, 1);
    box.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);
    box.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);

    // Header badge
    const headerTitle = this.hasNextLevel 
      ? `◆ SECTOR 0${this.levelNumber} SECURED ◆`
      : '★ ALL SECTORS CLEARED ★';

    this.add.text(cardX, cardY - 130, headerTitle, {
      fontFamily: 'Courier New, monospace',
      fontSize: '13px',
      color: '#00ff88',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5).setScrollFactor(0);

    const mainTitle = this.hasNextLevel
      ? 'DOCKING SUCCESSFUL'
      : 'MISSION ACCOMPLISHED';

    this.add.text(cardX, cardY - 90, mainTitle, {
      fontFamily: 'Chakra Petch, Arial, sans-serif',
      fontSize: '30px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0);

    // Stats Grid
    const mins = Math.floor(this.elapsedTime / 60);
    const secs = (this.elapsedTime % 60).toFixed(1);
    const timeFormatted = `${mins > 0 ? mins + 'm ' : ''}${secs}s`;

    this.add.text(cardX - 110, cardY - 25, 'DESCENT TIME:', {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#7da0c5',
    }).setOrigin(1, 0.5).setScrollFactor(0);

    this.add.text(cardX - 90, cardY - 25, timeFormatted, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setScrollFactor(0);

    this.add.text(cardX - 110, cardY + 15, 'O₂ REMAINING:', {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#7da0c5',
    }).setOrigin(1, 0.5).setScrollFactor(0);

    this.add.text(cardX - 90, cardY + 15, `${Math.ceil(this.remainingOxygen)}%`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '18px',
      color: '#00ff88',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setScrollFactor(0);

    // Action Button
    const btnLabel = this.hasNextLevel
      ? `ADVANCE TO SECTOR 0${this.levelNumber + 1} [SPACE]`
      : 'PLAY AGAIN FROM SECTOR 01 [SPACE]';

    const btn = this.add.container(cardX, cardY + 95);
    btn.setScrollFactor(0);
    const btnBg = this.add.rectangle(0, 0, 320, 46, 0x00ff88)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(0, 0, btnLabel, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      color: '#030812',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.add([btnBg, btnText]);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x33ffaa));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x00ff88));
    btnBg.on('pointerdown', () => this.advanceGame());

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-R', () => this.advanceGame());
    this.input.keyboard.on('keydown-SPACE', () => this.advanceGame());
    this.input.keyboard.on('keydown-ENTER', () => this.advanceGame());
  }

  advanceGame() {
    this.scene.stop('WinScene');
    if (this.hasNextLevel) {
      this.scene.start('GameScene', { levelNumber: this.levelNumber + 1 });
    } else {
      this.scene.start('GameScene', { levelNumber: 1 });
    }
  }
}

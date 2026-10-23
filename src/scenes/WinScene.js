/**
 * WIN SCENE
 * 
 * Displays mission completion statistics upon touching the landing pad.
 */

import Phaser from 'phaser';

export class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  init(data) {
    this.elapsedTime = data.elapsedTime || 0;
    this.remainingOxygen = data.remainingOxygen || 0;
    this.levelNumber = data.levelNumber || 1;
  }

  create() {
    const { width, height } = this.scale;

    // Semi-transparent backdrop (scrollFactor 0 to pin to screen viewport)
    const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030a14, 0.88);
    backdrop.setScrollFactor(0);

    const cardW = Math.min(520, width - 40);
    const cardH = 340;
    const cardX = width / 2;
    const cardY = height / 2;

    const box = this.add.graphics();
    box.setScrollFactor(0);
    box.fillStyle(0x06182a, 0.96);
    box.lineStyle(2, 0x00ff88, 1);
    box.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);
    box.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);

    // Header badge
    this.add.text(cardX, cardY - 120, '◆ ORBITAL DESCENT COMPLETED ◆', {
      fontFamily: 'Courier New, monospace',
      fontSize: '13px',
      color: '#00ff88',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(cardX, cardY - 80, 'LANDING SUCCESSFUL', {
      fontFamily: 'Chakra Petch, Arial, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0);

    // Stats Grid
    const mins = Math.floor(this.elapsedTime / 60);
    const secs = (this.elapsedTime % 60).toFixed(1);
    const timeFormatted = `${mins > 0 ? mins + 'm ' : ''}${secs}s`;

    this.add.text(cardX - 100, cardY - 15, 'DESCENT TIME:', {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#7da0c5',
    }).setOrigin(1, 0.5).setScrollFactor(0);

    this.add.text(cardX - 80, cardY - 15, timeFormatted, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setScrollFactor(0);

    this.add.text(cardX - 100, cardY + 25, 'O₂ REMAINING:', {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#7da0c5',
    }).setOrigin(1, 0.5).setScrollFactor(0);

    this.add.text(cardX - 80, cardY + 25, `${Math.ceil(this.remainingOxygen)}%`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '18px',
      color: '#00ff88',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setScrollFactor(0);

    // Play Again Button
    const btn = this.add.container(cardX, cardY + 95);
    btn.setScrollFactor(0);
    const btnBg = this.add.rectangle(0, 0, 240, 44, 0x00ff88)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(0, 0, 'PLAY AGAIN [SPACE/R]', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#030812',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.add([btnBg, btnText]);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x33ffaa));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x00ff88));
    btnBg.on('pointerdown', () => this.restartGame());

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-R', () => this.restartGame());
    this.input.keyboard.on('keydown-SPACE', () => this.restartGame());
    this.input.keyboard.on('keydown-ENTER', () => this.restartGame());
  }

  restartGame() {
    this.scene.stop('WinScene');
    this.scene.start('GameScene', { levelNumber: this.levelNumber });
  }
}

/**
 * LOSE SCENE
 * 
 * Displays mission failure when oxygen runs out in the shaft.
 */

import Phaser from 'phaser';

export class LoseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoseScene' });
  }

  init(data) {
    this.reason = data.reason || 'Life support compromised.';
    this.elapsedTime = data.elapsedTime || 0;
    this.depthProgress = data.depthProgress || 0;
    this.levelNumber = data.levelNumber || 1;
  }

  create() {
    const { width, height } = this.scale;

    // Emergency red backdrop (scrollFactor 0 to pin to screen viewport)
    const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x160408, 0.9);
    backdrop.setScrollFactor(0);

    const cardW = Math.min(520, width - 40);
    const cardH = 340;
    const cardX = width / 2;
    const cardY = height / 2;

    const box = this.add.graphics();
    box.setScrollFactor(0);
    box.fillStyle(0x240910, 0.96);
    box.lineStyle(2, 0xff3366, 1);
    box.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);
    box.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 8);

    // Warning Tag
    this.add.text(cardX, cardY - 120, '▲ CRITICAL LIFE SUPPORT FAILURE ▲', {
      fontFamily: 'Courier New, monospace',
      fontSize: '13px',
      color: '#ff3366',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(cardX, cardY - 80, 'OXYGEN DEPLETED', {
      fontFamily: 'Chakra Petch, Arial, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(cardX, cardY - 30, this.reason, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      color: '#ff99aa',
    }).setOrigin(0.5).setScrollFactor(0);

    const depthPct = Math.round(this.depthProgress * 100);
    this.add.text(cardX, cardY + 15, `Descent Depth Achieved: ${depthPct}%`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '15px',
      color: '#e2f1ff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0);

    // Retry Button
    const btn = this.add.container(cardX, cardY + 95);
    btn.setScrollFactor(0);
    const btnBg = this.add.rectangle(0, 0, 240, 44, 0xff3366)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(0, 0, 'RESTART DESCENT [SPACE/R]', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.add([btnBg, btnText]);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0xff5588));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0xff3366));
    btnBg.on('pointerdown', () => this.restartGame());

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-R', () => this.restartGame());
    this.input.keyboard.on('keydown-SPACE', () => this.restartGame());
    this.input.keyboard.on('keydown-ENTER', () => this.restartGame());
  }

  restartGame() {
    this.scene.stop('LoseScene');
    this.scene.start('GameScene', { levelNumber: this.levelNumber });
  }
}

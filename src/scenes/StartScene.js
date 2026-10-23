/**
 * START SCENE
 * 
 * Introduces the Pixathon concept and the core twist:
 * "A maze where you steer the maze, not the marble. The closer you fall to the planet, the harder it pulls."
 */

import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Clear any HUD overlay during the Start Screen
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
      hudContainer.innerHTML = '';
    }

    // Deep space backdrop
    const bg = this.add.graphics();
    bg.fillStyle(0x030812, 1);
    bg.fillRect(0, 0, width, height);

    // Distant stars
    for (let i = 0; i < 75; i++) {
      const sx = Phaser.Math.Between(0, width);
      const sy = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(1, 2.5);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
      bg.fillStyle(0x88ccff, alpha);
      bg.fillCircle(sx, sy, size);
    }

    const cardW = Math.min(720, width - 40);
    const cardH = 490;
    const cx = width / 2;
    const cy = height / 2;

    // Blueprint frame
    const frame = this.add.graphics();
    frame.fillStyle(0x061426, 0.94);
    frame.lineStyle(2, 0x00e5ff, 0.8);
    frame.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
    frame.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);

    // Blueprint corner registration marks
    frame.lineStyle(2, 0x00e5ff, 1);
    const m = 16;
    frame.strokeLineShape(new Phaser.Geom.Line(cx - cardW / 2 + 6, cy - cardH / 2 + 6, cx - cardW / 2 + 6 + m, cy - cardH / 2 + 6));
    frame.strokeLineShape(new Phaser.Geom.Line(cx - cardW / 2 + 6, cy - cardH / 2 + 6, cx - cardW / 2 + 6, cy - cardH / 2 + 6 + m));
    frame.strokeLineShape(new Phaser.Geom.Line(cx + cardW / 2 - 6, cy - cardH / 2 + 6, cx + cardW / 2 - 6 - m, cy - cardH / 2 + 6));
    frame.strokeLineShape(new Phaser.Geom.Line(cx + cardW / 2 - 6, cy - cardH / 2 + 6, cx + cardW / 2 - 6, cy - cardH / 2 + 6 + m));

    // Subtitle Tag
    this.add.text(cx, cy - 185, 'PIXATHON HACKATHON ENTRY // ZERO-G MAZE', {
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      color: '#00e5ff',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Game Title
    this.add.text(cx, cy - 145, 'SIRTET', {
      fontFamily: 'Chakra Petch, Arial, sans-serif',
      fontSize: '46px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // THE MANDATORY TWIST QUOTE (prominently highlighted)
    const quoteBox = this.add.graphics();
    quoteBox.fillStyle(0x0a2644, 0.75);
    quoteBox.lineStyle(1, 0x00e5ff, 0.45);
    quoteBox.strokeRoundedRect(cx - (cardW - 60) / 2, cy - 85, cardW - 60, 72, 6);
    quoteBox.fillRoundedRect(cx - (cardW - 60) / 2, cy - 85, cardW - 60, 72, 6);

    this.add.text(cx, cy - 60, '"A maze where you steer the maze, not the marble.\nThe closer you fall to the planet, the harder it pulls."', {
      fontFamily: 'JetBrains Mono, Courier New, monospace',
      fontSize: '14px',
      color: '#ffdd55',
      align: 'center',
      lineSpacing: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Controls Brief
    this.add.text(cx, cy + 22, 'ZERO-G FLIGHT CONTROLS', {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#7da0c5',
      letterSpacing: 1.5,
    }).setOrigin(0.5);

    const controlsText = [
      '• A / D: Continuous 360° station spin (latches spin until counter-key)',
      '• Arrow Keys (↑, ↓, ←, →): Persistent astronaut EVA drift',
      '• Space: Emergency retro-brake (halts station spin & astronaut drift)',
      '• Wall impact: Cartoon dizzy stun with diamond stars! | R: Quick restart',
    ].join('\n');

    this.add.text(cx, cy + 74, controlsText, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12.5px',
      color: '#d0e4ff',
      align: 'left',
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Play Button (Direct rectangle + text, guaranteed hit area)
    const btnW = 260;
    const btnH = 46;
    const btnX = cx;
    const btnY = cy + 175;

    this.btnBg = this.add.rectangle(btnX, btnY, btnW, btnH, 0x00e5ff)
      .setInteractive({ useHandCursor: true });

    this.btnText = this.add.text(btnX, btnY, 'LAUNCH DESCENT [SPACE]', {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: '15px',
      color: '#030812',
      fontStyle: 'bold',
      letterSpacing: 1,
    }).setOrigin(0.5);

    this.btnBg.on('pointerover', () => this.btnBg.setFillStyle(0x33eeff));
    this.btnBg.on('pointerout', () => this.btnBg.setFillStyle(0x00e5ff));
    this.btnBg.on('pointerdown', () => this.startGame());

    // Global pointer click fallback on the button bounds
    this.input.on('pointerdown', (pointer) => {
      const left = btnX - btnW / 2;
      const right = btnX + btnW / 2;
      const top = btnY - btnH / 2;
      const bottom = btnY + btnH / 2;
      if (pointer.x >= left && pointer.x <= right && pointer.y >= top && pointer.y <= bottom) {
        this.startGame();
      }
    });

    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
  }

  startGame() {
    this.scene.start('GameScene', { levelNumber: 1 });
  }
}

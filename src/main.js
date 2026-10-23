/**
 * MAIN ENTRY POINT
 * 
 * Configures Phaser 3 with high-precision Matter.js physics in zero-gravity.
 */

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { StartScene } from './scenes/StartScene.js';
import { GameScene } from './scenes/GameScene.js';
import { WinScene } from './scenes/WinScene.js';
import { LoseScene } from './scenes/LoseScene.js';

const width = 1280;
const height = 800;

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width,
  height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#030812',
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0 }, // Depth-based planet gravity is dynamically applied in GameScene
      positionIterations: 12,  // Extra collision solver iterations to prevent tunneling
      velocityIterations: 10,
      debug: false,
    },
  },
  scene: [BootScene, StartScene, GameScene, WinScene, LoseScene],
};

export const game = new Phaser.Game(config);

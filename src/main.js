import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GamePlayScene from './scenes/GamePlayScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import LevelCompleteScene from './scenes/LevelCompleteScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false
        }
    },
    scene: [BootScene, MainMenuScene, LevelSelectScene, GamePlayScene, LevelCompleteScene]
};

const game = new Phaser.Game(config);

import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GamePlayScene from './scenes/GamePlayScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import LevelCompleteScene from './scenes/LevelCompleteScene.js';
import MultiplayerLobbyScene from './scenes/MultiplayerLobbyScene.js';
import MultiplayerGameScene from './scenes/MultiplayerGameScene.js';
import P2PMultiplayerScene from './scenes/P2PMultiplayerScene.js';
import P2PGameScene from './scenes/P2PGameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MainMenuScene,
        LevelSelectScene,
        GamePlayScene,
        LevelCompleteScene,
        MultiplayerLobbyScene,
        MultiplayerGameScene,
        P2PMultiplayerScene,
        P2PGameScene
    ]
};

const game = new Phaser.Game(config);
window.game = game;

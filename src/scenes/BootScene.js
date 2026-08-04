export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Preload any basic assets if needed
    }

    create() {
        this.scene.start('MainMenu');
    }
}

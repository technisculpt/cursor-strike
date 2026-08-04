import { ScrollworkRenderer } from '../ui/ScrollworkRenderer.js';
// Try to import audioManager if it exists, otherwise we'll fall back to this.sound
// import { audioManager } from '../managers/audioManager.js';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;

        // Deep green gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1B4332, 0x1B4332, 0x081C15, 0x081C15, 1);
        bg.fillRect(0, 0, width, height);

        // Ornate frame around title
        const titleGraphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(titleGraphics, width / 2 - 350, 80, 700, 150, {
            color: 0xC9A84C,
            lineWidth: 4,
            padding: 15,
            bgColor: 0x081C15,
            bgAlpha: 0.95
        });

        // Title
        this.add.text(width / 2, 140, 'CURSORSTRIKE', {
            fontFamily: '"Cinzel", serif',
            fontSize: '64px',
            color: '#C9A84C',
            letterSpacing: 8,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, 210, 'A Game of Precision & Physics', {
            fontFamily: '"Cinzel", serif',
            fontSize: '24px',
            color: '#FFFFF0',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Divider below subtitle
        const divGraphics = this.add.graphics();
        ScrollworkRenderer.drawDivider(divGraphics, width / 2 - 150, 240, 300);

        // Buttons
        this.createButton(width / 2, 380, 'PLAY', () => {
            this.scene.start('GamePlay', { levelIndex: 0 });
        });

        this.createButton(width / 2, 480, 'LEVEL SELECT', () => {
            this.scene.start('LevelSelect');
        });

        // Corner flourishes
        const cornerGraphics = this.add.graphics();
        const cornerSize = 100;
        cornerGraphics.lineStyle(3, 0xC9A84C, 1);
        ScrollworkRenderer.drawCornerFlourish(cornerGraphics, 30, 30, cornerSize, 0); // TL
        ScrollworkRenderer.drawCornerFlourish(cornerGraphics, width - 30, 30, cornerSize, Math.PI / 2); // TR
        ScrollworkRenderer.drawCornerFlourish(cornerGraphics, width - 30, height - 30, cornerSize, Math.PI); // BR
        ScrollworkRenderer.drawCornerFlourish(cornerGraphics, 30, height - 30, cornerSize, -Math.PI / 2); // BL
    }

    createButton(x, y, text, callback) {
        const width = 300;
        const height = 70;
        const btnContainer = this.add.container(x, y);
        btnContainer.setSize(width, height);
        btnContainer.setInteractive({ useHandCursor: true });

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
            color: 0xC9A84C,
            lineWidth: 2,
            padding: 8,
            bgColor: 0x5C4033,
            bgAlpha: 1
        });

        const btnText = this.add.text(0, 0, text, {
            fontFamily: '"Cinzel", serif',
            fontSize: '28px',
            color: '#FFFFF0',
            letterSpacing: 2
        }).setOrigin(0.5);

        btnContainer.add([graphics, btnText]);

        btnContainer.on('pointerover', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 150 });
            btnText.setTint(0xC9A84C);
            // Play hover sound if possible
            if (this.sound.get('hover')) this.sound.play('hover');
        });

        btnContainer.on('pointerout', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 150 });
            btnText.clearTint();
        });

        btnContainer.on('pointerup', () => {
            // Play click sound if possible
            if (this.sound.get('click')) this.sound.play('click');
            callback();
        });
    }
}

import { ScrollworkRenderer } from '../ui/ScrollworkRenderer.js';
import { audioManager } from '../audio/AudioManager.js';

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
        this.createButton(width / 2, 310, 'PLAY CAMPAIGN', () => {
            this.scene.start('GamePlay', { levelIndex: 0 });
        });

        this.createButton(width / 2, 395, 'MULTIPLAYER (P2P)', () => {
            this.scene.start('P2PMultiplayer');
        });

        // MULTIPLAYER (LAN) button — hidden by default, shown only if local server detected
        this.lanBtnContainer = this.createButton(width / 2, 480, 'MULTIPLAYER (LAN)', () => {
            this.scene.start('MultiplayerLobby');
        });
        this.lanBtnContainer.setVisible(false);

        this.createButton(width / 2, 565, 'LEVEL SELECT', () => {
            this.scene.start('LevelSelect');
        });

        // Smart LAN Server Probe
        this.probeLanServer();

        // Corner flourishes
        const cornerGraphics = this.add.graphics();
        const cornerSize = 100;
        cornerGraphics.lineStyle(3, 0xC9A84C, 1);
        ScrollworkRenderer.drawCornerFlourish(cornerGraphics, 30, 30, cornerSize, 0); // TL
        ScrollworkRenderer.drawCornerFlourish(cornerGraphics, width - 30, 30, cornerSize, Math.PI / 2); // TR
        ScrollworkRenderer.drawCornerFlourish(cornerGraphics, width - 30, height - 30, cornerSize, Math.PI); // BR
        ScrollworkRenderer.drawCornerFlourish(cornerGraphics, 30, height - 30, cornerSize, -Math.PI / 2); // BL
    }

    probeLanServer() {
        const savedHost = localStorage.getItem('cursorstrike_lan_host');
        let targetHost = savedHost || window.location.host;
        if (!targetHost || targetHost.includes('github.io')) {
            targetHost = 'localhost:3000';
        }
        const wsUrl = targetHost.startsWith('ws://') || targetHost.startsWith('wss://') ? targetHost : `ws://${targetHost}`;

        try {
            const ws = new WebSocket(wsUrl);
            const timer = setTimeout(() => {
                try { ws.close(); } catch(e) {}
            }, 800);

            ws.onopen = () => {
                clearTimeout(timer);
                try { ws.close(); } catch(e) {}
                if (this.lanBtnContainer) {
                    this.lanBtnContainer.setVisible(true);
                }
            };

            ws.onerror = () => {
                clearTimeout(timer);
            };
        } catch(e) {}
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
            fontSize: '24px',
            color: '#FFFFF0',
            letterSpacing: 2
        }).setOrigin(0.5);

        btnContainer.add([graphics, btnText]);

        btnContainer.on('pointerover', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 150 });
            btnText.setTint(0xC9A84C);
            audioManager.playUIHover();
        });

        btnContainer.on('pointerout', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 150 });
            btnText.clearTint();
        });

        btnContainer.on('pointerup', () => {
            audioManager.playUIClick();
            callback();
        });

        return btnContainer;
    }
}

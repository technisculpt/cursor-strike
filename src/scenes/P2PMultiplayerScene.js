import { ScrollworkRenderer } from '../ui/ScrollworkRenderer.js';
import { audioManager } from '../audio/AudioManager.js';

export default class P2PMultiplayerScene extends Phaser.Scene {
    constructor() {
        super('P2PMultiplayer');
    }

    create() {
        const { width, height } = this.scale;

        // Dark Victorian background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1B4332, 0x1B4332, 0x081C15, 0x081C15, 1);
        bg.fillRect(0, 0, width, height);

        // Header Title
        const titleText = this.add.text(width / 2, 50, 'INTERNET P2P MULTIPLAYER', {
            fontFamily: '"Cinzel", serif',
            fontSize: '32px',
            color: '#C9A84C'
        }).setOrigin(0.5);

        // Ornate Title Frame
        const titleFrame = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(titleFrame, width / 2 - 260, 20, 520, 60, {
            color: 0xC9A84C,
            lineWidth: 2,
            bgColor: 0x081C15,
            bgAlpha: 0.7
        });

        // Mode Settings (Host options)
        this.mode = 'firstToX'; // 'firstToX' | 'timed'
        this.target = 3;
        this.mapId = 1; // 1: Classic, 2: Bumpers, 3: Pillars

        // Container Panels
        this.createHostPanel(width);
        this.createJoinPanel(width);

        // Back Button
        this.createNavButton(120, height - 50, '◀ MAIN MENU', () => {
            if (this.peer) this.peer.destroy();
            this.scene.start('MainMenu');
        });

        // Initialize PeerJS
        this.initPeerJS();
    }

    createHostPanel(width) {
        const panel = this.add.container(width / 4 + 20, 280);

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, -250, -180, 500, 360, {
            color: 0xC9A84C,
            lineWidth: 3,
            padding: 8,
            bgColor: 0x081C15,
            bgAlpha: 0.9
        });

        const title = this.add.text(0, -145, 'HOST A GAME', {
            fontFamily: '"Cinzel", serif',
            fontSize: '22px',
            color: '#FFD700'
        }).setOrigin(0.5);

        this.myCodeText = this.add.text(0, -95, 'GENERATING CODE...', {
            fontFamily: '"Cinzel", serif',
            fontSize: '18px',
            color: '#00FF00'
        }).setOrigin(0.5);

        const copyBtn = this.createOptionButton(panel, 0, -50, 'COPY CODE TO CLIPBOARD', false, () => {
            if (this.myPeerId) {
                navigator.clipboard.writeText(this.myPeerId);
                this.statusText.setText('CODE COPIED TO CLIPBOARD!');
                audioManager.playUIClick();
            }
        });

        // Match Mode Controls
        const modeLabel = this.add.text(0, 0, 'MATCH MODE:', {
            fontFamily: '"Cinzel", serif',
            fontSize: '15px',
            color: '#C9A84C'
        }).setOrigin(0.5);

        this.btnFirstTo3 = this.createOptionButton(panel, -100, 40, 'FIRST TO 3', true, () => {
            this.mode = 'firstToX';
            this.target = 3;
            this.updateModeButtons();
        });

        this.btnTimed30 = this.createOptionButton(panel, 100, 40, '30s TIMED', false, () => {
            this.mode = 'timed';
            this.target = 30;
            this.updateModeButtons();
        });

        // Map Selector Controls
        const mapLabel = this.add.text(0, 85, 'SELECT ARENA MAP:', {
            fontFamily: '"Cinzel", serif',
            fontSize: '15px',
            color: '#C9A84C'
        }).setOrigin(0.5);

        this.btnMap1 = this.createSmallMapButton(panel, -145, 125, '1. CLASSIC', true, () => {
            this.mapId = 1;
            this.updateMapButtons();
        });

        this.btnMap2 = this.createSmallMapButton(panel, 0, 125, '2. BUMPERS', false, () => {
            this.mapId = 2;
            this.updateMapButtons();
        });

        this.btnMap3 = this.createSmallMapButton(panel, 145, 125, '3. PILLARS', false, () => {
            this.mapId = 3;
            this.updateMapButtons();
        });

        panel.add([graphics, title, this.myCodeText, modeLabel, mapLabel]);
    }

    updateMapButtons() {
        this.redrawSmallMapButton(this.btnMap1, '1. CLASSIC', this.mapId === 1);
        this.redrawSmallMapButton(this.btnMap2, '2. BUMPERS', this.mapId === 2);
        this.redrawSmallMapButton(this.btnMap3, '3. PILLARS', this.mapId === 3);
    }

    createSmallMapButton(parent, x, y, text, isSelected, callback) {
        const width = 130;
        const height = 35;
        const btnContainer = this.add.container(x, y);
        btnContainer.setSize(width, height);
        btnContainer.setInteractive({ useHandCursor: true });

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
            color: isSelected ? 0x00FF00 : 0xC9A84C,
            lineWidth: isSelected ? 3 : 2,
            padding: 3,
            bgColor: isSelected ? 0x1B4332 : 0x081C15,
            bgAlpha: 0.9
        });

        const btnText = this.add.text(0, 0, text, {
            fontFamily: '"Cinzel", serif',
            fontSize: '12px',
            color: isSelected ? '#00FF00' : '#FFFFF0'
        }).setOrigin(0.5);

        btnContainer.add([graphics, btnText]);

        btnContainer.on('pointerover', () => {
            audioManager.playUIHover();
            this.tweens.add({ targets: btnContainer, scaleX: 1.04, scaleY: 1.04, duration: 100 });
        });

        btnContainer.on('pointerout', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 100 });
        });

        btnContainer.on('pointerup', () => {
            audioManager.playUIClick();
            callback();
        });

        parent.add(btnContainer);
        return btnContainer;
    }

    redrawSmallMapButton(btnContainer, text, isSelected) {
        if (!btnContainer || !btnContainer.list) return;
        const graphics = btnContainer.list[0];
        const btnText = btnContainer.list[1];
        if (graphics && btnText) {
            graphics.clear();
            const width = 130;
            const height = 35;
            ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
                color: isSelected ? 0x00FF00 : 0xC9A84C,
                lineWidth: isSelected ? 3 : 2,
                padding: 3,
                bgColor: isSelected ? 0x1B4332 : 0x081C15,
                bgAlpha: 0.95
            });
            btnText.setColor(isSelected ? '#00FF00' : '#FFFFF0');
        }
    }

    updateModeButtons() {
        const isFirst = this.mode === 'firstToX';
        this.redrawOptionButton(this.btnFirstTo3, 'FIRST TO 3', isFirst);
        this.redrawOptionButton(this.btnTimed30, '30s TIMED', !isFirst);
    }

    redrawOptionButton(btnContainer, text, isSelected) {
        if (!btnContainer || !btnContainer.list) return;
        const graphics = btnContainer.list[0];
        const btnText = btnContainer.list[1];
        if (graphics && btnText) {
            graphics.clear();
            const width = 180;
            const height = 40;
            ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
                color: isSelected ? 0x00FF00 : 0xC9A84C,
                lineWidth: isSelected ? 3 : 2,
                padding: 4,
                bgColor: isSelected ? 0x1B4332 : 0x081C15,
                bgAlpha: 0.95
            });
            btnText.setColor(isSelected ? '#00FF00' : '#FFFFF0');
        }
    }

    createJoinPanel(width) {
        const panel = this.add.container((3 * width) / 4 - 20, 280);

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, -250, -180, 500, 360, {
            color: 0xC9A84C,
            lineWidth: 3,
            padding: 8,
            bgColor: 0x081C15,
            bgAlpha: 0.9
        });

        const title = this.add.text(0, -140, "JOIN FRIEND'S GAME", {
            fontFamily: '"Cinzel", serif',
            fontSize: '22px',
            color: '#3388FF'
        }).setOrigin(0.5);

        const promptText = this.add.text(0, -80, "ENTER FRIEND'S PEER CODE:", {
            fontFamily: '"Cinzel", serif',
            fontSize: '16px',
            color: '#FFFFF0'
        }).setOrigin(0.5);

        this.targetCode = '';
        this.codeDisplay = this.add.text(0, -30, 'CODE: [ CLICK TO ENTER ]', {
            fontFamily: '"Cinzel", serif',
            fontSize: '18px',
            color: '#FFD700'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.codeDisplay.on('pointerup', () => {
            const input = prompt("Enter Friend's Peer Code:");
            if (input && input.trim().length > 0) {
                this.targetCode = input.trim();
                this.codeDisplay.setText(`CODE: ${this.targetCode}`);
            }
        });

        this.createActionButton(panel, 0, 60, 'CONNECT TO FRIEND', () => {
            if (this.targetCode.length > 0) {
                this.connectToPeer(this.targetCode);
            } else {
                alert("Please click 'CODE: [ CLICK TO ENTER ]' to set your friend's code first!");
            }
        });

        this.statusText = this.add.text(0, 130, 'WAITING FOR PEER NETWORK...', {
            fontFamily: '"Cinzel", serif',
            fontSize: '14px',
            color: '#C9A84C'
        }).setOrigin(0.5);

        panel.add([graphics, title, promptText, this.codeDisplay, this.statusText]);
    }

    initPeerJS() {
        if (typeof window.Peer === 'undefined') {
            this.statusText.setText('ERROR: PeerJS CDN not loaded!');
            return;
        }

        // Generate short 5-char peer ID
        const shortId = 'cs-' + Math.random().toString(36).substring(2, 7);

        try {
            this.peer = new window.Peer(shortId);

            this.peer.on('open', (id) => {
                this.myPeerId = id;
                this.myCodeText.setText(`YOUR CODE:\n${id}`);
                this.statusText.setText('READY TO CONNECT OR HOST');
            });

            this.peer.on('connection', (conn) => {
                this.conn = conn;
                this.statusText.setText('FRIEND CONNECTED! STARTING...');

                this.conn.on('open', () => {
                    // Send game config to Joiner
                    this.conn.send({
                        type: 'GAME_START',
                        role: 'P2',
                        mode: this.mode,
                        target: this.target,
                        mapId: this.mapId || 1
                    });

                    // Start Game Scene as P1 (Host)
                    this.time.delayedCall(300, () => {
                        this.scene.start('P2PGame', {
                            peer: this.peer,
                            conn: this.conn,
                            role: 'P1',
                            mode: this.mode,
                            target: this.target,
                            mapId: this.mapId || 1
                        });
                    });
                });
            });

            this.peer.on('error', (err) => {
                console.error('PeerJS error:', err);
                this.statusText.setText(`ERROR: ${err.type || 'Connection failed'}`);
            });
        } catch (e) {
            console.error('PeerJS init failed:', e);
            this.statusText.setText('FAILED TO INIT PEERJS');
        }
    }

    connectToPeer(targetId) {
        if (!this.peer) return;

        this.statusText.setText(`CONNECTING TO ${targetId}...`);
        try {
            const conn = this.peer.connect(targetId);
            this.conn = conn;

            conn.on('open', () => {
                this.statusText.setText('CONNECTED! WAITING FOR HOST...');
            });

            conn.on('data', (data) => {
                if (data.type === 'GAME_START') {
                    this.scene.start('P2PGame', {
                        peer: this.peer,
                        conn: this.conn,
                        role: 'P2',
                        mode: data.mode,
                        target: data.target
                    });
                }
            });

            conn.on('error', (err) => {
                this.statusText.setText(`FAILED: ${err}`);
            });
        } catch (e) {
            this.statusText.setText(`CONNECT ERROR: ${e.message}`);
        }
    }

    createOptionButton(parent, x, y, text, isSelected, callback) {
        const width = 180;
        const height = 40;
        const btnContainer = this.add.container(x, y);
        btnContainer.setSize(width, height);
        btnContainer.setInteractive({ useHandCursor: true });

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
            color: isSelected ? 0x00FF00 : 0xC9A84C,
            lineWidth: isSelected ? 3 : 2,
            padding: 4,
            bgColor: isSelected ? 0x1B4332 : 0x081C15,
            bgAlpha: 0.9
        });

        const btnText = this.add.text(0, 0, text, {
            fontFamily: '"Cinzel", serif',
            fontSize: '13px',
            color: isSelected ? '#00FF00' : '#FFFFF0'
        }).setOrigin(0.5);

        btnContainer.add([graphics, btnText]);

        btnContainer.on('pointerover', () => {
            audioManager.playUIHover();
            this.tweens.add({ targets: btnContainer, scaleX: 1.04, scaleY: 1.04, duration: 100 });
        });

        btnContainer.on('pointerout', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 100 });
        });

        btnContainer.on('pointerdown', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 0.95, scaleY: 0.95, duration: 80 });
        });

        btnContainer.on('pointerup', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 1.04, scaleY: 1.04, duration: 80 });
            audioManager.playUIClick();
            callback();
        });

        if (parent && typeof parent.add === 'function') {
            parent.add(btnContainer);
        } else {
            this.add.existing(btnContainer);
        }
        return btnContainer;
    }

    createActionButton(parent, x, y, text, callback) {
        const width = 220;
        const height = 55;
        const btnContainer = this.add.container(x, y);
        btnContainer.setSize(width, height);
        btnContainer.setInteractive({ useHandCursor: true });

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
            color: 0xC9A84C,
            lineWidth: 2,
            padding: 6,
            bgColor: 0x081C15,
            bgAlpha: 0.9
        });

        const btnText = this.add.text(0, 0, text, {
            fontFamily: '"Cinzel", serif',
            fontSize: '16px',
            color: '#FFFFF0'
        }).setOrigin(0.5);

        btnContainer.add([graphics, btnText]);

        btnContainer.on('pointerover', () => {
            audioManager.playUIHover();
            btnText.setColor('#00FF00');
            this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        btnContainer.on('pointerout', () => {
            btnText.setColor('#FFFFF0');
            this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 100 });
        });

        btnContainer.on('pointerdown', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 0.95, scaleY: 0.95, duration: 80 });
        });

        btnContainer.on('pointerup', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 80 });
            audioManager.playUIClick();
            callback();
        });

        parent.add(btnContainer);
    }

    createNavButton(x, y, text, callback) {
        const btnContainer = this.add.container(x, y);
        btnContainer.setSize(180, 50);
        btnContainer.setInteractive({ useHandCursor: true });

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, -90, -25, 180, 50, {
            color: 0xC9A84C,
            lineWidth: 2,
            padding: 4,
            bgColor: 0x5C4033,
            bgAlpha: 0.9
        });

        const btnText = this.add.text(0, 0, text, {
            fontFamily: '"Cinzel", serif',
            fontSize: '16px',
            color: '#FFFFF0'
        }).setOrigin(0.5);

        btnContainer.add([graphics, btnText]);

        btnContainer.on('pointerover', () => {
            audioManager.playUIHover();
            btnText.setColor('#00FF00');
            this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        btnContainer.on('pointerout', () => {
            btnText.setColor('#FFFFF0');
            this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 100 });
        });

        btnContainer.on('pointerdown', () => {
            this.tweens.add({ targets: btnContainer, scaleX: 0.95, scaleY: 0.95, duration: 80 });
        });

        btnContainer.on('pointerup', () => {
            audioManager.playUIClick();
            callback();
        });
    }
}

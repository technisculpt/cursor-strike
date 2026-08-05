import { ScrollworkRenderer } from '../ui/ScrollworkRenderer.js';
import { audioManager } from '../audio/AudioManager.js';

export default class MultiplayerLobbyScene extends Phaser.Scene {
    constructor() {
        super('MultiplayerLobby');
    }

    create() {
        const { width, height } = this.scale;

        // Background gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1B4332, 0x1B4332, 0x081C15, 0x081C15, 1);
        bg.fillRect(0, 0, width, height);

        // Header
        const headerGraphics = this.add.graphics();
        ScrollworkRenderer.drawCartouche(headerGraphics, width / 2 - 260, 30, 520, 70);
        
        this.add.text(width / 2, 65, 'CROSS-LAN MULTIPLAYER', {
            fontFamily: '"Cinzel", serif',
            fontSize: '32px',
            color: '#C9A84C'
        }).setOrigin(0.5);

        // WebSocket Connection setup
        this.statusText = this.add.text(width / 2, 115, 'CONNECTING TO LAN SERVER...', {
            fontFamily: '"Cinzel", serif',
            fontSize: '18px',
            color: '#FFFFF0'
        }).setOrigin(0.5);

        this.selectedMode = 'firstToX'; // 'firstToX' | 'timed'
        this.selectedTarget = 3; // 3 goals or 30 seconds

        this.connectWebSocket();

        // Host Game Panel (Left Side)
        this.createHostPanel(100, 150, 500, 480);

        // Join Game Panel (Right Side)
        this.createJoinPanel(680, 150, 500, 480);

        // Back Button in top left header
        this.createBackButton(100, 65);

        // Status & Change LAN IP button
        this.createIpConfigUI(width);
    }

    createIpConfigUI(width) {
        const savedHost = localStorage.getItem('cursorstrike_lan_host') || '';
        const defaultHost = savedHost || (window.location.host.includes('github.io') ? '192.168.1.111:3000' : window.location.host);

        // Change Server IP button
        this.createOptionButton(this, width - 150, 65, 'CHANGE SERVER IP', false, () => {
            const newHost = prompt('Enter LAN Server IP & Port (e.g. 192.168.1.111:3000 or laptop:3000):', defaultHost);
            if (newHost && newHost.trim().length > 0) {
                localStorage.setItem('cursorstrike_lan_host', newHost.trim());
                if (this.ws) this.ws.close();
                this.connectWebSocket(newHost.trim());
            }
        });
    }

    connectWebSocket(overrideHost) {
        if (this.ws) {
            try { this.ws.close(); } catch(e) {}
        }

        const savedHost = localStorage.getItem('cursorstrike_lan_host');
        let targetHost = overrideHost || savedHost || window.location.host;

        if (!targetHost || targetHost.includes('github.io')) {
            targetHost = '192.168.1.111:3000';
        }

        const isHttps = window.location.protocol === 'https:' && !targetHost.includes('192.168.') && !targetHost.includes('localhost') && !targetHost.includes('127.0.0.1');
        const protocol = isHttps ? 'wss:' : 'ws:';
        const wsUrl = targetHost.startsWith('ws://') || targetHost.startsWith('wss://') ? targetHost : `${protocol}//${targetHost}`;

        this.statusText.setText(`CONNECTING TO ${targetHost}...`);
        this.statusText.setColor('#FFFFF0');

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.statusText.setText(`CONNECTED TO LAN SERVER (${targetHost})`);
                this.statusText.setColor('#00FF00');
                this.ws.send(JSON.stringify({ type: 'ENTER_LOBBY' }));
            };

            this.ws.onerror = () => {
                this.statusText.setText(`LAN CONNECTION ERROR (${targetHost}) — CLICK 'CHANGE SERVER IP'`);
                this.statusText.setColor('#FF3333');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleServerMessage(data);
                } catch (e) {
                    console.error('Lobby WS error:', e);
                }
            };
        } catch (e) {
            this.statusText.setText(`CONNECTION FAILED (${targetHost}) — CLICK 'CHANGE SERVER IP'`);
            this.statusText.setColor('#FF3333');
        }
    }

    handleServerMessage(data) {
        switch (data.type) {
            case 'ROOM_LIST': {
                this.updateRoomList(data.rooms || []);
                break;
            }
            case 'ROOM_CREATED': {
                this.statusText.setText(`WAITING FOR OPPONENT TO JOIN (ROOM: ${data.roomId})...`);
                this.statusText.setColor('#FFD700');
                break;
            }
            case 'ROOM_JOINED': {
                this.statusText.setText(`JOINED ROOM ${data.roomId}! STARTING...`);
                this.statusText.setColor('#00FF00');
                break;
            }
            case 'GAME_START': {
                audioManager.playUIClick();
                this.scene.start('MultiplayerGame', {
                    ws: this.ws,
                    mode: data.mode,
                    target: data.target
                });
                break;
            }
            case 'ERROR': {
                this.statusText.setText(`ERROR: ${data.message}`);
                this.statusText.setColor('#FF3333');
                break;
            }
        }
    }

    createHostPanel(x, y, width, height) {
        const container = this.add.container(x, y);

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, 0, 0, width, height, {
            color: 0xC9A84C,
            lineWidth: 2,
            padding: 8,
            bgColor: 0x5C4033,
            bgAlpha: 0.9
        });

        container.add(graphics);

        // Host Title
        const title = this.add.text(width / 2, 40, 'HOST A GAME', {
            fontFamily: '"Cinzel", serif',
            fontSize: '26px',
            color: '#FFFFF0'
        }).setOrigin(0.5);
        container.add(title);

        // Divider
        const divGraphics = this.add.graphics();
        ScrollworkRenderer.drawDivider(divGraphics, 40, 65, width - 80);
        container.add(divGraphics);

        // Mode Selection Label
        const modeLabel = this.add.text(width / 2, 110, 'SELECT MATCH MODE:', {
            fontFamily: '"Cinzel", serif',
            fontSize: '18px',
            color: '#C9A84C'
        }).setOrigin(0.5);
        container.add(modeLabel);

        // Mode Button 1: First to X Goals
        this.btnFirstToX = this.createOptionButton(container, width / 2 - 110, 160, 'FIRST TO 3 GOALS', true, () => {
            this.selectedMode = 'firstToX';
            this.selectedTarget = 3;
            this.updateModeButtons();
        });

        // Mode Button 2: 30s Timed Match
        this.btnTimed = this.createOptionButton(container, width / 2 + 110, 160, '30S TIMED MATCH', false, () => {
            this.selectedMode = 'timed';
            this.selectedTarget = 30;
            this.updateModeButtons();
        });

        // Rules explanation
        this.rulesText = this.add.text(width / 2, 240, 'P1 (Red Top-Left) vs P2 (Blue Top-Right)\nFirst to 3 Goals wins!', {
            fontFamily: '"Cinzel", serif',
            fontSize: '16px',
            color: '#FFFFF0',
            align: 'center'
        }).setOrigin(0.5);
        container.add(this.rulesText);

        // Create Host Button
        this.createActionButton(container, width / 2, 380, 'CREATE ROOM', () => {
            if (this.ws && this.ws.readyState === 1) {
                audioManager.playUIClick();
                this.ws.send(JSON.stringify({
                    type: 'CREATE_ROOM',
                    mode: this.selectedMode,
                    target: this.selectedTarget
                }));
            }
        });
    }

    updateModeButtons() {
        const isFirst = this.selectedMode === 'firstToX';
        if (isFirst) {
            this.rulesText.setText('P1 (Red Top-Left) vs P2 (Blue Top-Right)\nFirst to 3 Goals wins!');
        } else {
            this.rulesText.setText('P1 (Red Top-Left) vs P2 (Blue Top-Right)\nHighest score in 30 Seconds wins!');
        }

        this.redrawOptionButton(this.btnFirstToX, 'FIRST TO 3 GOALS', isFirst);
        this.redrawOptionButton(this.btnTimed, '30S TIMED MATCH', !isFirst);
    }

    redrawOptionButton(btnContainer, text, isSelected) {
        if (!btnContainer || !btnContainer.list) return;
        const graphics = btnContainer.list[0];
        const btnText = btnContainer.list[1];
        if (graphics && btnText) {
            graphics.clear();
            const width = 180;
            const height = 45;
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

    createJoinPanel(x, y, width, height) {
        this.joinContainer = this.add.container(x, y);

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, 0, 0, width, height, {
            color: 0xC9A84C,
            lineWidth: 2,
            padding: 8,
            bgColor: 0x5C4033,
            bgAlpha: 0.9
        });
        this.joinContainer.add(graphics);

        // Join Title
        const title = this.add.text(width / 2, 40, 'JOIN A GAME', {
            fontFamily: '"Cinzel", serif',
            fontSize: '26px',
            color: '#FFFFF0'
        }).setOrigin(0.5);
        this.joinContainer.add(title);

        // Divider
        const divGraphics = this.add.graphics();
        ScrollworkRenderer.drawDivider(divGraphics, 40, 65, width - 80);
        this.joinContainer.add(divGraphics);

        // Room List Container
        this.roomListContainer = this.add.container(0, 80);
        this.joinContainer.add(this.roomListContainer);
    }

    updateRoomList(rooms) {
        if (!this.roomListContainer) return;
        this.roomListContainer.removeAll(true);

        if (rooms.length === 0) {
            const noRooms = this.add.text(250, 120, 'No open LAN games found.\nHost a game to start playing!', {
                fontFamily: '"Cinzel", serif',
                fontSize: '18px',
                color: '#888888',
                align: 'center'
            }).setOrigin(0.5);
            this.roomListContainer.add(noRooms);
            return;
        }

        rooms.forEach((room, index) => {
            const cardY = 50 + index * 80;
            const cardContainer = this.add.container(250, cardY);
            cardContainer.setSize(420, 65);
            cardContainer.setInteractive({ useHandCursor: true });

            const frame = this.add.graphics();
            ScrollworkRenderer.drawOrnateFrame(frame, -210, -32, 420, 65, {
                color: 0xC9A84C,
                lineWidth: 2,
                padding: 4,
                bgColor: 0x081C15,
                bgAlpha: 0.9
            });

            const modeLabel = room.mode === 'firstToX' ? `First to ${room.target}` : `${room.target}s Timed`;
            const infoText = this.add.text(-190, 0, `${room.name} (${modeLabel})`, {
                fontFamily: '"Cinzel", serif',
                fontSize: '18px',
                color: '#FFFFF0'
            }).setOrigin(0, 0.5);

            const joinBtnText = this.add.text(140, 0, 'JOIN ▶', {
                fontFamily: '"Cinzel", serif',
                fontSize: '18px',
                color: '#C9A84C'
            }).setOrigin(0.5);

            cardContainer.add([frame, infoText, joinBtnText]);

            cardContainer.on('pointerover', () => {
                audioManager.playUIHover();
                joinBtnText.setColor('#00FF00');
            });
            cardContainer.on('pointerout', () => {
                joinBtnText.setColor('#C9A84C');
            });
            cardContainer.on('pointerup', () => {
                if (this.ws && this.ws.readyState === 1) {
                    audioManager.playUIClick();
                    this.ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: room.id }));
                }
            });

            this.roomListContainer.add(cardContainer);
        });
    }

    createOptionButton(parent, x, y, text, isSelected, callback) {
        const width = 180;
        const height = 45;
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
            fontSize: '14px',
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
            bgAlpha: 0.95
        });

        const btnText = this.add.text(0, 0, text, {
            fontFamily: '"Cinzel", serif',
            fontSize: '22px',
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

    createBackButton(x, y) {
        const width = 150;
        const height = 45;
        const container = this.add.container(x, y);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
            color: 0xC9A84C,
            lineWidth: 2,
            padding: 4,
            bgColor: 0x5C4033,
            bgAlpha: 0.9
        });

        const text = this.add.text(0, 0, '◀ MAIN MENU', {
            fontFamily: '"Cinzel", serif',
            fontSize: '15px',
            color: '#FFFFF0'
        }).setOrigin(0.5);

        container.add([graphics, text]);

        container.on('pointerover', () => {
            audioManager.playUIHover();
            text.setColor('#00FF00');
            this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        container.on('pointerout', () => {
            text.setColor('#FFFFF0');
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
        });

        container.on('pointerdown', () => {
            this.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.95, duration: 80 });
        });

        container.on('pointerup', () => {
            audioManager.playUIClick();
            if (this.ws) this.ws.close();
            this.scene.start('MainMenu');
        });
    }
}

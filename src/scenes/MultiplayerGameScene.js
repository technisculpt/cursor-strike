import { CursorPhysics, CATEGORY_ENVIRONMENT, CATEGORY_BALL, CATEGORY_CURSOR } from '../physics/CursorPhysics.js';
import { ScrollworkRenderer } from '../ui/ScrollworkRenderer.js';
import { audioManager } from '../audio/AudioManager.js';

export default class MultiplayerGameScene extends Phaser.Scene {
    constructor() {
        super('MultiplayerGame');
    }

    create(data) {
        this.ws = data.ws;
        this.mode = data.mode || 'firstToX'; // 'firstToX' | 'timed'
        this.target = data.target || 3;
        this.role = this.ws ? (this.ws.role || 'P1') : 'P1';

        const { width, height } = this.scale;

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1B4332, 0x1B4332, 0x081C15, 0x081C15, 1);
        bg.fillRect(0, 0, width, height);

        // Scores
        this.scores = { p1: 0, p2: 0 };
        this.isMatchOver = false;

        // Physics Setup
        this.matter.world.setBounds(0, 0, width, height, 32, true, true, true, true);

        this.mapId = data.mapId || 1; // 1: Classic Defense, 2: Bumper Alley, 3: Quad Pillars

        // Solid Outer Borders
        this.createOuterBorders(width, height);

        // Map Specific Local Sensors & Physics Static Structures
        this.setupMapStructures();

        // P1 Goal (Red - Top Left Circular Golf Hole)
        this.p1GoalSensor = this.matter.add.circle(160, 115, 30, {
            isStatic: true,
            isSensor: true,
            label: 'p1_goal'
        });

        // P2 Goal (Blue - Top Right Circular Golf Hole)
        this.p2GoalSensor = this.matter.add.circle(1120, 115, 30, {
            isStatic: true,
            isSensor: true,
            label: 'p2_goal'
        });

        // Local Puck Physics
        this.myPuck = new CursorPhysics(this);

        // Opponent Puck Position
        this.oppPuckPos = { x: this.role === 'P1' ? 1120 : 160, y: 640, vx: 0, vy: 0 };

        // Graphics Layers
        this.terrainGraphics = this.add.graphics().setDepth(10);
        this.goalGraphics = this.add.graphics().setDepth(20);
        this.ballGraphics = this.add.graphics().setDepth(30);
        this.puckGraphics = this.add.graphics().setDepth(200);

        // Draw Arena Graphics
        this.drawArenaGraphics(width, height);

        // HUD Setup
        this.setupMultiplayerHUD(width);

        // Setup WebSocket message handlers
        this.setupWebSocketHandlers();

        // Timed match countdown
        if (this.mode === 'timed' && this.role === 'P1') {
            this.matchTimer = this.time.addEvent({
                delay: 1000,
                repeat: this.target - 1,
                callback: () => {
                    this.target--;
                    this.timerText.setText(`TIME: ${this.target}s`);
                    if (this.target <= 0) {
                        this.ws.send(JSON.stringify({ type: 'MATCH_TIME_EXPIRED' }));
                    }
                }
            });
        }
    }

    setupMapStructures() {
        if (this.mapId === 1) {
            // Classic Defense: Center Platform
            this.matter.add.rectangle(640, 460, 220, 30, {
                isStatic: true,
                collisionFilter: { category: CATEGORY_ENVIRONMENT, mask: CATEGORY_BALL },
                friction: 0.3,
                restitution: 0.5,
                label: 'center_platform'
            });
        } else if (this.mapId === 2) {
            // Pinball Bumper Alley: Center Diamond & Angled Bumpers
            this.matter.add.rectangle(640, 440, 120, 120, {
                isStatic: true,
                angle: Math.PI / 4,
                restitution: 0.8,
                label: 'diamond_bumper'
            });
            this.matter.add.rectangle(360, 480, 100, 20, {
                isStatic: true,
                angle: Math.PI / 6,
                restitution: 0.8,
                label: 'left_bumper'
            });
            this.matter.add.rectangle(920, 480, 100, 20, {
                isStatic: true,
                angle: -Math.PI / 6,
                restitution: 0.8,
                label: 'right_bumper'
            });
        } else if (this.mapId === 3) {
            // Quad Pillar Gauntlet: 4 Interior Pillars
            this.matter.add.rectangle(400, 320, 40, 40, { isStatic: true, restitution: 0.7, label: 'pillar1' });
            this.matter.add.rectangle(880, 320, 40, 40, { isStatic: true, restitution: 0.7, label: 'pillar2' });
            this.matter.add.rectangle(400, 520, 40, 40, { isStatic: true, restitution: 0.7, label: 'pillar3' });
            this.matter.add.rectangle(880, 520, 40, 40, { isStatic: true, restitution: 0.7, label: 'pillar4' });
            
            // Moving Central Barrier
            this.centralBarrierBody = this.matter.add.rectangle(640, 420, 150, 25, {
                isStatic: true,
                restitution: 0.6,
                label: 'central_barrier'
            });
        }
    }

    createOuterBorders(width, height) {
        const wallThickness = 40;
        this.matter.add.rectangle(width / 2, wallThickness / 2, width, wallThickness, { isStatic: true, label: 'border' });
        this.matter.add.rectangle(width / 2, height - wallThickness / 2, width, wallThickness, { isStatic: true, label: 'border' });
        this.matter.add.rectangle(wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, label: 'border' });
        this.matter.add.rectangle(width - wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, label: 'border' });
    }

    drawArenaGraphics(width, height) {
        this.terrainGraphics.clear();
        this.terrainGraphics.fillStyle(0x5C4033, 1);
        
        // Borders
        this.terrainGraphics.fillRect(0, 0, width, 20);
        this.terrainGraphics.fillRect(0, height - 20, width, 20);
        this.terrainGraphics.fillRect(0, 0, 20, height);
        this.terrainGraphics.fillRect(width - 20, 0, 20, height);

        if (this.mapId === 1) {
            // Center Platform
            this.terrainGraphics.fillRect(530, 445, 220, 30);
        } else if (this.mapId === 2) {
            // Diamond & Side Bumpers
            this.terrainGraphics.save();
            this.terrainGraphics.translateCanvas(640, 440);
            this.terrainGraphics.rotateCanvas(Math.PI / 4);
            this.terrainGraphics.fillRect(-60, -60, 120, 120);
            this.terrainGraphics.restore();

            this.terrainGraphics.save();
            this.terrainGraphics.translateCanvas(360, 480);
            this.terrainGraphics.rotateCanvas(Math.PI / 6);
            this.terrainGraphics.fillRect(-50, -10, 100, 20);
            this.terrainGraphics.restore();

            this.terrainGraphics.save();
            this.terrainGraphics.translateCanvas(920, 480);
            this.terrainGraphics.rotateCanvas(-Math.PI / 6);
            this.terrainGraphics.fillRect(-50, -10, 100, 20);
            this.terrainGraphics.restore();
        } else if (this.mapId === 3) {
            // Pillars & Center Barrier
            this.terrainGraphics.fillRect(380, 300, 40, 40);
            this.terrainGraphics.fillRect(860, 300, 40, 40);
            this.terrainGraphics.fillRect(380, 500, 40, 40);
            this.terrainGraphics.fillRect(860, 500, 40, 40);
            this.terrainGraphics.fillRect(565, 407, 150, 25);
        }

        // P1 Red Golf Hole Cup (Top Left: 160, 115) & P2 Blue Golf Hole Cup (Top Right: 1120, 115)
        this.goalGraphics.clear();
        ScrollworkRenderer.drawGolfHoleGoal(this.goalGraphics, 160, 115, 60, 40, {
            rimColor: 0xC9A84C,
            pennantColor: 0xFF3333,
            pulseAlpha: 0.9,
            hasFlag: true
        });
        ScrollworkRenderer.drawGolfHoleGoal(this.goalGraphics, 1120, 115, 60, 40, {
            rimColor: 0xC9A84C,
            pennantColor: 0x3388FF,
            pulseAlpha: 0.9,
            hasFlag: true
        });
    }

    setupMultiplayerHUD(width) {
        const hudContainer = this.add.container(0, 0).setDepth(100);

        // P1 Red Score Cartouche
        const p1Frame = this.add.graphics();
        ScrollworkRenderer.drawCartouche(p1Frame, 20, 20, 200, 50);
        this.p1ScoreText = this.add.text(120, 45, 'P1 RED: 0', {
            fontFamily: '"Cinzel", serif',
            fontSize: '18px',
            color: '#FF3333'
        }).setOrigin(0.5);

        // P2 Blue Score Cartouche
        const p2Frame = this.add.graphics();
        ScrollworkRenderer.drawCartouche(p2Frame, width - 220, 20, 200, 50);
        this.p2ScoreText = this.add.text(width - 120, 45, 'P2 BLUE: 0', {
            fontFamily: '"Cinzel", serif',
            fontSize: '18px',
            color: '#3388FF'
        }).setOrigin(0.5);

        // Center Info (Mode / Target)
        const centerFrame = this.add.graphics();
        ScrollworkRenderer.drawCartouche(centerFrame, width / 2 - 120, 20, 240, 50);
        const modeLabel = this.mode === 'firstToX' ? `FIRST TO ${this.target}` : `TIME: ${this.target}s`;
        this.timerText = this.add.text(width / 2, 45, modeLabel, {
            fontFamily: '"Cinzel", serif',
            fontSize: '16px',
            color: '#C9A84C'
        }).setOrigin(0.5);

        hudContainer.add([p1Frame, this.p1ScoreText, p2Frame, this.p2ScoreText, centerFrame, this.timerText]);
    }

    setupWebSocketHandlers() {
        if (!this.ws) return;

        this.serverBallState = { x: 640, y: 640, vx: 0, vy: 0, angle: 0, angularVelocity: 0 };
        this.serverP1Puck = { x: 160, y: 640 };
        this.serverP2Puck = { x: 1120, y: 640 };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'GAME_STATE': {
                        if (data.ball) {
                            this.serverBallState = data.ball;
                        }
                        if (data.p1Puck && data.p2Puck) {
                            this.serverP1Puck = data.p1Puck;
                            this.serverP2Puck = data.p2Puck;
                        }
                        if (data.scores) {
                            this.scores = data.scores;
                            this.p1ScoreText.setText(`P1 RED: ${this.scores.p1}`);
                            this.p2ScoreText.setText(`P2 BLUE: ${this.scores.p2}`);
                        }
                        if (typeof data.timerSeconds !== 'undefined' && data.timerSeconds !== null) {
                            this.timerText.setText(`TIME: ${data.timerSeconds}s`);
                        }
                        break;
                    }
                    case 'GOAL_SCORED': {
                        this.scores = data.scores;
                        this.p1ScoreText.setText(`P1 RED: ${this.scores.p1}`);
                        this.p2ScoreText.setText(`P2 BLUE: ${this.scores.p2}`);
                        audioManager.playGoalScored();
                        break;
                    }
                    case 'MATCH_OVER': {
                        this.handleMatchOver(data.winner, data.scores);
                        break;
                    }
                    case 'PLAYER_DISCONNECTED': {
                        this.handleMatchOver(this.role, this.scores, 'OPPONENT DISCONNECTED');
                        break;
                    }
                }
            } catch (e) {
                console.error('Multiplayer WS error:', e);
            }
        };
    }

    update(time, delta) {
        if (this.isMatchOver) return;

        // Update local puck tracking
        const struck = this.myPuck.update(this.input.activePointer, null);
        if (struck) {
            const speed = Math.sqrt(this.myPuck.vx**2 + this.myPuck.vy**2);
            audioManager.playImpact(Math.min(Math.max(speed / 20, 0.4), 1));
        }

        // Send local puck input to server
        if (this.ws && this.ws.readyState === 1) {
            const pos = this.myPuck.body.position;
            this.ws.send(JSON.stringify({
                type: 'SYNC_PUCK',
                x: pos.x,
                y: pos.y,
                vx: this.myPuck.vx,
                vy: this.myPuck.vy
            }));
        }

        // Draw Central White Ball (Radius 24px) from Server State
        const bx = this.serverBallState.x;
        const by = this.serverBallState.y;
        const angle = this.serverBallState.angle || 0;
        
        this.ballGraphics.clear();
        this.ballGraphics.fillStyle(0xFFFFFF, 1);
        this.ballGraphics.fillCircle(bx, by, 24);
        this.ballGraphics.lineStyle(2, 0xC9A84C, 1);
        this.ballGraphics.strokeCircle(bx, by, 24);

        // Rotation stripe line
        this.ballGraphics.lineStyle(2.5, 0xFFD700, 1);
        this.ballGraphics.beginPath();
        this.ballGraphics.moveTo(bx + Math.cos(angle) * 4, by + Math.sin(angle) * 4);
        this.ballGraphics.lineTo(bx + Math.cos(angle) * 18, by + Math.sin(angle) * 18);
        this.ballGraphics.strokePath();

        // Draw P1 (Red) and P2 (Blue) Pucks (12px radius)
        this.puckGraphics.clear();

        const localPos = this.myPuck.body.position;
        const p1X = this.role === 'P1' ? Math.max(12, Math.min(1268, localPos.x)) : Math.max(12, Math.min(1268, this.serverP1Puck.x));
        const p1Y = this.role === 'P1' ? Math.max(12, Math.min(708, localPos.y)) : Math.max(12, Math.min(708, this.serverP1Puck.y));

        const p2X = this.role === 'P2' ? Math.max(12, Math.min(1268, localPos.x)) : Math.max(12, Math.min(1268, this.serverP2Puck.x));
        const p2Y = this.role === 'P2' ? Math.max(12, Math.min(708, localPos.y)) : Math.max(12, Math.min(708, this.serverP2Puck.y));

        // Draw OPPONENT puck first (underneath own puck)
        if (this.role === 'P1') {
            // Draw P2 Blue (opponent) below
            this.puckGraphics.fillStyle(0x3388FF, 1);
            this.puckGraphics.fillCircle(p2X, p2Y, 12);
            this.puckGraphics.lineStyle(3, 0xFFFFFF, 1);
            this.puckGraphics.strokeCircle(p2X, p2Y, 12);
            // Draw P1 Red (own) on top
            this.puckGraphics.fillStyle(0xFF3333, 1);
            this.puckGraphics.fillCircle(p1X, p1Y, 12);
            this.puckGraphics.lineStyle(3, 0xFFD700, 1);
            this.puckGraphics.strokeCircle(p1X, p1Y, 12);
        } else {
            // Draw P1 Red (opponent) below
            this.puckGraphics.fillStyle(0xFF3333, 1);
            this.puckGraphics.fillCircle(p1X, p1Y, 12);
            this.puckGraphics.lineStyle(3, 0xFFFFFF, 1);
            this.puckGraphics.strokeCircle(p1X, p1Y, 12);
            // Draw P2 Blue (own) on top
            this.puckGraphics.fillStyle(0x3388FF, 1);
            this.puckGraphics.fillCircle(p2X, p2Y, 12);
            this.puckGraphics.lineStyle(3, 0xFFD700, 1);
            this.puckGraphics.strokeCircle(p2X, p2Y, 12);
        }

        // Labels inside pucks: always update text positions
        if (!this._puckLabelsCreated) {
            this._p1Label = this.add.text(0, 0, '1', { fontFamily: 'Arial', fontSize: '10px', color: '#FFFFFF', fontStyle: 'bold' }).setOrigin(0.5).setDepth(201);
            this._p2Label = this.add.text(0, 0, '2', { fontFamily: 'Arial', fontSize: '10px', color: '#FFFFFF', fontStyle: 'bold' }).setOrigin(0.5).setDepth(201);
            this._puckLabelsCreated = true;
        }
        this._p1Label.setPosition(p1X, p1Y);
        this._p2Label.setPosition(p2X, p2Y);
    }

    handleMatchOver(winner, scores, customSub = '') {
        this.isMatchOver = true;
        const { width, height } = this.scale;

        const overlay = this.add.container(width / 2, height / 2).setDepth(300);

        const graphics = this.add.graphics();
        ScrollworkRenderer.drawOrnateFrame(graphics, -250, -180, 500, 360, {
            color: 0xC9A84C,
            lineWidth: 4,
            padding: 12,
            bgColor: 0x081C15,
            bgAlpha: 0.95
        });
        overlay.add(graphics);

        let winTitle = 'DRAW MATCH!';
        let winColor = '#C9A84C';
        if (winner === 'P1') {
            winTitle = 'PLAYER 1 (RED) VICTORY!';
            winColor = '#FF3333';
        } else if (winner === 'P2') {
            winTitle = 'PLAYER 2 (BLUE) VICTORY!';
            winColor = '#3388FF';
        }

        const titleText = this.add.text(0, -110, winTitle, {
            fontFamily: '"Cinzel", serif',
            fontSize: '26px',
            color: winColor
        }).setOrigin(0.5);

        const scoreSub = customSub || `FINAL SCORE: RED ${scores.p1} - ${scores.p2} BLUE`;
        const subText = this.add.text(0, -50, scoreSub, {
            fontFamily: '"Cinzel", serif',
            fontSize: '20px',
            color: '#FFFFF0'
        }).setOrigin(0.5);

        overlay.add([titleText, subText]);

        // Lobby Button
        this.createOverlayButton(overlay, 0, 70, 'RETURN TO LOBBY', () => {
            if (this.ws) this.ws.close();
            this.scene.start('MultiplayerLobby');
        });
    }

    createOverlayButton(parent, x, y, text, callback) {
        const width = 240;
        const height = 50;
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

        const btnText = this.add.text(0, 0, text, {
            fontFamily: '"Cinzel", serif',
            fontSize: '18px',
            color: '#FFFFF0'
        }).setOrigin(0.5);

        container.add([graphics, btnText]);

        container.on('pointerup', () => {
            audioManager.playUIClick();
            callback();
        });

        parent.add(container);
    }
}

import { CursorPhysics } from '../physics/CursorPhysics.js';
import { applyMagnusEffect } from '../physics/BallPhysics.js';
import { ScrollworkRenderer } from '../ui/ScrollworkRenderer.js';
import { audioManager } from '../audio/AudioManager.js';

export default class P2PGameScene extends Phaser.Scene {
    constructor() {
        super('P2PGame');
    }

    create(data) {
        this.peer = data.peer;
        this.conn = data.conn;
        this.role = data.role || 'P1'; // 'P1' (Host) | 'P2' (Joiner)
        this.mode = data.mode || 'firstToX'; // 'firstToX' | 'timed'
        this.target = data.target || 3;

        const { width, height } = this.scale;

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1B4332, 0x1B4332, 0x081C15, 0x081C15, 1);
        bg.fillRect(0, 0, width, height);

        // Scores & Game State
        this.scores = { p1: 0, p2: 0 };
        this.isMatchOver = false;

        // Local Puck Tracking
        this.myPuck = new CursorPhysics(this);

        // Remote States
        this.serverBallState = { x: 640, y: 640, vx: 0, vy: 0, angle: 0 };
        this.p1PuckPos = { x: 160, y: 640, vx: 0, vy: 0 };
        this.p2PuckPos = { x: 1120, y: 640, vx: 0, vy: 0 };

        // Graphics Layers
        this.terrainGraphics = this.add.graphics().setDepth(10);
        this.goalGraphics = this.add.graphics().setDepth(20);
        this.ballGraphics = this.add.graphics().setDepth(30);
        this.puckGraphics = this.add.graphics().setDepth(200);

        // Draw Static Arena Graphics
        this.drawArenaGraphics(width, height);

        // Setup HUD
        this.setupHUD(width);

        // Host Runs Matter.js Physics Engine locally
        if (this.role === 'P1') {
            this.setupHostPhysics(width, height);
        }

        // Setup PeerJS DataChannel Handlers
        this.setupDataChannelHandlers();
    }

    setupHostPhysics(width, height) {
        this.matter.world.setBounds(0, 0, width, height, 32, true, true, true, true);

        // Solid Outer Borders (Bouncy like air hockey)
        const wallThickness = 40;
        this.matter.add.rectangle(width / 2, wallThickness / 2, width, wallThickness, { isStatic: true, restitution: 0.8, friction: 0 });
        this.matter.add.rectangle(width / 2, height - wallThickness / 2, width, wallThickness, { isStatic: true, restitution: 0.8, friction: 0 });
        this.matter.add.rectangle(wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, restitution: 0.8, friction: 0 });
        this.matter.add.rectangle(width - wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, restitution: 0.8, friction: 0 });

        // Center Platform
        this.centerPlatform = this.matter.add.rectangle(640, 460, 220, 30, {
            isStatic: true, restitution: 0.7, friction: 0.1
        });

        // Goals
        this.p1GoalSensor = this.matter.add.rectangle(160, 115, 120, 50, { isStatic: true, isSensor: true, label: 'p1_goal' });
        this.p2GoalSensor = this.matter.add.rectangle(1120, 115, 120, 50, { isStatic: true, isSensor: true, label: 'p2_goal' });

        // Central White Ball
        const BALL_RADIUS = 24;
        this.ball = this.matter.add.circle(640, 640, BALL_RADIUS, {
            restitution: 0.85,
            friction: 0.02,
            frictionAir: 0.002,
            density: 0.05
        });
        this.matter.body.setInertia(this.ball, 0.5 * this.ball.mass * BALL_RADIUS * BALL_RADIUS);

        // Goal Collision Event
        this.matter.world.on('collisionstart', (event) => {
            if (this.isMatchOver) return;
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                let scorer = null;
                if ((bodyA === this.p1GoalSensor && bodyB === this.ball) || (bodyB === this.p1GoalSensor && bodyA === this.ball)) scorer = 'P2';
                else if ((bodyA === this.p2GoalSensor && bodyB === this.ball) || (bodyB === this.p2GoalSensor && bodyA === this.ball)) scorer = 'P1';

                if (scorer) {
                    if (scorer === 'P1') this.scores.p1++;
                    else this.scores.p2++;

                    this.matter.body.setPosition(this.ball, { x: 640, y: 640 });
                    this.matter.body.setVelocity(this.ball, { x: 0, y: 0 });
                    this.matter.body.setAngularVelocity(this.ball, 0);

                    audioManager.playGoalScored();
                    this.p1ScoreText.setText(`P1 RED: ${this.scores.p1}`);
                    this.p2ScoreText.setText(`P2 BLUE: ${this.scores.p2}`);

                    if (this.conn) {
                        this.conn.send({ type: 'GOAL_SCORED', scorer, scores: this.scores });
                    }

                    if (this.mode === 'firstToX' && (this.scores.p1 >= this.target || this.scores.p2 >= this.target)) {
                        const winner = this.scores.p1 >= this.target ? 'P1' : 'P2';
                        this.handleMatchOver(winner, this.scores);
                        if (this.conn) this.conn.send({ type: 'MATCH_OVER', winner, scores: this.scores });
                    }
                }
            });
        });

        // Timed match countdown on Host
        if (this.mode === 'timed') {
            this.timerSeconds = this.target;
            this.matchTimer = this.time.addEvent({
                delay: 1000,
                repeat: this.target - 1,
                callback: () => {
                    if (this.isMatchOver) return;
                    this.timerSeconds--;
                    this.timerText.setText(`TIME: ${this.timerSeconds}s`);
                    if (this.timerSeconds <= 0) {
                        let winner = 'DRAW';
                        if (this.scores.p1 > this.scores.p2) winner = 'P1';
                        else if (this.scores.p2 > this.scores.p1) winner = 'P2';
                        this.handleMatchOver(winner, this.scores);
                        if (this.conn) this.conn.send({ type: 'MATCH_OVER', winner, scores: this.scores });
                    }
                }
            });
        }
    }

    applyImpulseToBall(puckPos, puckVel) {
        if (!this.ball) return;
        const PUCK_RADIUS = 12;
        const BALL_RADIUS = 24;
        const MIN_DIST = PUCK_RADIUS + BALL_RADIUS;

        const dx = this.ball.position.x - puckPos.x;
        const dy = this.ball.position.y - puckPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MIN_DIST && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = MIN_DIST - dist;

            // Push ball out of overlap
            this.matter.body.setPosition(this.ball, {
                x: this.ball.position.x + nx * overlap,
                y: this.ball.position.y + ny * overlap
            });

            const speed = Math.sqrt(puckVel.vx * puckVel.vx + puckVel.vy * puckVel.vy);

            if (speed < 2.0) {
                // Soft Trap / Cushion: absorb ball bounce when puck is still or moving slowly
                const trapDamping = 0.25;
                this.matter.body.setVelocity(this.ball, {
                    x: this.ball.velocity.x * trapDamping + puckVel.vx * 0.5,
                    y: this.ball.velocity.y * trapDamping + puckVel.vy * 0.5
                });
            } else {
                // Fast strike: powerful impulse kick + backspin torque
                const impulseVx = nx * (speed * 1.1) + puckVel.vx * 0.5;
                const impulseVy = ny * (speed * 1.1) + puckVel.vy * 0.5;

                this.matter.body.setVelocity(this.ball, {
                    x: this.ball.velocity.x * 0.15 + impulseVx * 0.85,
                    y: this.ball.velocity.y * 0.15 + impulseVy * 0.85
                });

                const torque = (puckVel.vx * ny - puckVel.vy * nx) * 0.12;
                this.matter.body.setAngularVelocity(this.ball, torque);
            }
        }
    }

    setupDataChannelHandlers() {
        if (!this.conn) return;

        this.conn.on('data', (data) => {
            try {
                switch (data.type) {
                    case 'SYNC_PUCK': {
                        if (data.role === 'P1') {
                            this.p1PuckPos = { x: data.x, y: data.y, vx: data.vx, vy: data.vy };
                        } else {
                            this.p2PuckPos = { x: data.x, y: data.y, vx: data.vx, vy: data.vy };
                        }
                        break;
                    }
                    case 'GAME_STATE': {
                        if (this.role === 'P2') {
                            this.serverBallState = data.ball;
                            this.p1PuckPos = data.p1Puck;
                            this.scores = data.scores;
                            this.p1ScoreText.setText(`P1 RED: ${this.scores.p1}`);
                            this.p2ScoreText.setText(`P2 BLUE: ${this.scores.p2}`);
                            if (typeof data.timerSeconds !== 'undefined') {
                                this.timerText.setText(`TIME: ${data.timerSeconds}s`);
                            }
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
                }
            } catch (e) {
                console.error('PeerJS data error:', e);
            }
        });

        this.conn.on('close', () => {
            this.handleMatchOver(this.role, this.scores, 'PEER DISCONNECTED');
        });
    }

    drawArenaGraphics(width, height) {
        this.terrainGraphics.clear();
        this.terrainGraphics.fillStyle(0x5C4033, 1);
        
        // Borders
        this.terrainGraphics.fillRect(0, 0, width, 20);
        this.terrainGraphics.fillRect(0, height - 20, width, 20);
        this.terrainGraphics.fillRect(0, 0, 20, height);
        this.terrainGraphics.fillRect(width - 20, 0, 20, height);

        // Center Platform
        this.terrainGraphics.fillRect(530, 445, 220, 30);

        // P1 Goal (Red - Top Left)
        this.goalGraphics.fillStyle(0xFF3333, 0.85);
        this.goalGraphics.fillRect(100, 90, 120, 50);
        this.goalGraphics.lineStyle(3, 0xFFD700, 1);
        this.goalGraphics.strokeRect(100, 90, 120, 50);

        // P2 Goal (Blue - Top Right)
        this.goalGraphics.fillStyle(0x3388FF, 0.85);
        this.goalGraphics.fillRect(1060, 90, 120, 50);
        this.goalGraphics.lineStyle(3, 0xFFD700, 1);
        this.goalGraphics.strokeRect(1060, 90, 120, 50);
    }

    setupHUD(width) {
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

        // Center Info
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

    update(time, delta) {
        if (this.isMatchOver) return;

        // Update local puck tracking
        const struck = this.myPuck.update(this.input.activePointer, null);
        if (struck) {
            const speed = Math.sqrt(this.myPuck.vx**2 + this.myPuck.vy**2);
            audioManager.playImpact(Math.min(Math.max(speed / 20, 0.4), 1));
        }

        const localPos = this.myPuck.body.position;
        const myPuckData = {
            x: localPos.x,
            y: localPos.y,
            vx: this.myPuck.vx,
            vy: this.myPuck.vy
        };

        // Send local puck data to peer over DataChannel
        if (this.conn && this.conn.open) {
            this.conn.send({
                type: 'SYNC_PUCK',
                role: this.role,
                ...myPuckData
            });
        }

        // Host Runs Physics & Broadcasts GAME_STATE to Joiner
        if (this.role === 'P1') {
            this.p1PuckPos = myPuckData;

            // Apply manual impulses for P1 and P2 pucks on host ball
            this.applyImpulseToBall(this.p1PuckPos, { vx: this.p1PuckPos.vx, vy: this.p1PuckPos.vy });
            this.applyImpulseToBall(this.p2PuckPos, { vx: this.p2PuckPos.vx, vy: this.p2PuckPos.vy });

            // Apply Magnus aerodynamic spin force (backspin lift & curve)
            applyMagnusEffect(this.ball, this.matter.body);

            if (this.ball) {
                this.serverBallState = {
                    x: this.ball.position.x,
                    y: this.ball.position.y,
                    vx: this.ball.velocity.x,
                    vy: this.ball.velocity.y,
                    angle: this.ball.angle
                };
            }

            // Stream GAME_STATE to P2 Joiner at 60 FPS
            if (this.conn && this.conn.open) {
                this.conn.send({
                    type: 'GAME_STATE',
                    ball: this.serverBallState,
                    p1Puck: { x: this.p1PuckPos.x, y: this.p1PuckPos.y },
                    p2Puck: { x: this.p2PuckPos.x, y: this.p2PuckPos.y },
                    scores: this.scores,
                    timerSeconds: this.timerSeconds
                });
            }
        }

        // Draw Central White Ball (Radius 24px)
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

        const p1X = this.role === 'P1' ? Math.max(12, Math.min(1268, localPos.x)) : Math.max(12, Math.min(1268, this.p1PuckPos.x));
        const p1Y = this.role === 'P1' ? Math.max(12, Math.min(708, localPos.y)) : Math.max(12, Math.min(708, this.p1PuckPos.y));

        const p2X = this.role === 'P2' ? Math.max(12, Math.min(1268, localPos.x)) : Math.max(12, Math.min(1268, this.p2PuckPos.x));
        const p2Y = this.role === 'P2' ? Math.max(12, Math.min(708, localPos.y)) : Math.max(12, Math.min(708, this.p2PuckPos.y));

        // Draw OPPONENT puck first (underneath own puck)
        if (this.role === 'P1') {
            this.puckGraphics.fillStyle(0x3388FF, 1);
            this.puckGraphics.fillCircle(p2X, p2Y, 12);
            this.puckGraphics.lineStyle(3, 0xFFFFFF, 1);
            this.puckGraphics.strokeCircle(p2X, p2Y, 12);

            this.puckGraphics.fillStyle(0xFF3333, 1);
            this.puckGraphics.fillCircle(p1X, p1Y, 12);
            this.puckGraphics.lineStyle(3, 0xFFD700, 1);
            this.puckGraphics.strokeCircle(p1X, p1Y, 12);
        } else {
            this.puckGraphics.fillStyle(0xFF3333, 1);
            this.puckGraphics.fillCircle(p1X, p1Y, 12);
            this.puckGraphics.lineStyle(3, 0xFFFFFF, 1);
            this.puckGraphics.strokeCircle(p1X, p1Y, 12);

            this.puckGraphics.fillStyle(0x3388FF, 1);
            this.puckGraphics.fillCircle(p2X, p2Y, 12);
            this.puckGraphics.lineStyle(3, 0xFFD700, 1);
            this.puckGraphics.strokeCircle(p2X, p2Y, 12);
        }

        // Labels inside pucks
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

        // Return Button
        this.createOverlayButton(overlay, 0, 70, 'RETURN TO P2P LOBBY', () => {
            if (this.conn) this.conn.close();
            if (this.peer) this.peer.destroy();
            this.scene.start('P2PMultiplayer');
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

import { CursorPhysics, CATEGORY_ENVIRONMENT, CATEGORY_BALL } from '../physics/CursorPhysics.js';
import { createBall } from '../physics/BallPhysics.js';
import { levels } from '../levels/index.js';
import { HUD } from '../ui/HUD.js';
import { audioManager } from '../audio/AudioManager.js';

export default class GamePlayScene extends Phaser.Scene {
    constructor() {
        super('GamePlay');
        this.currentLevelIndex = 0;
    }

    init(data) {
        if (data && typeof data.levelIndex !== 'undefined') {
            this.currentLevelIndex = data.levelIndex;
        }
    }

    create() {
        this.level = levels[this.currentLevelIndex] || levels[0];
        this.strikeCount = 0;
        this.isLevelCompleted = false;

        // Cleanup audio on shutdown
        this.events.once('shutdown', () => {
            audioManager.stopRolling();
            audioManager.stopTimerTick();
        });

        // HUD with bottom-right MENU button
        this.hud = new HUD(this, {
            levelName: this.level.name,
            strikes: 0,
            par: this.level.par,
            timeLimit: this.level.timeLimit,
            onMenu: () => {
                audioManager.stopRolling();
                audioManager.stopTimerTick();
                this.scene.start('LevelSelect');
            }
        });

        // Graphics setup with explicit depth ordering
        this.decorationGraphics = this.add.graphics().setDepth(1);
        this.terrainGraphics = this.add.graphics().setDepth(10);
        this.dynamicGraphics = this.add.graphics().setDepth(20);
        this.goalGraphics = this.add.graphics().setDepth(30);
        this.ballGraphics = this.add.graphics().setDepth(40);
        this.cursorGraphics = this.add.graphics().setDepth(200); // White striker puck rendered ON TOP of all platforms and obstacles!

        // Draw decorations
        if (this.level.decorations) {
            this.level.decorations.forEach(d => {
                if (d.type === 'flag') {
                    // Pole
                    this.decorationGraphics.lineStyle(3, 0xC9A84C, 1);
                    this.decorationGraphics.lineBetween(d.x, d.y, d.x, d.y - 40);
                    // Banner
                    this.decorationGraphics.fillStyle(0x8B0000, 1);
                    this.decorationGraphics.fillTriangle(d.x, d.y - 40, d.x + 25, d.y - 30, d.x, d.y - 20);
                } else if (d.type === 'cloud') {
                    this.decorationGraphics.fillStyle(0xFFFFFF, 0.4);
                    this.decorationGraphics.fillCircle(d.x, d.y, 25);
                    this.decorationGraphics.fillCircle(d.x + 20, d.y - 10, 30);
                    this.decorationGraphics.fillCircle(d.x + 40, d.y, 25);
                }
            });
        }

        // Draw static terrain once (seamless brown, no intersecting border strokes)
        this.terrainGraphics.lineStyle(0);
        this.terrainGraphics.fillStyle(0x5C4033, 1);
        
        // Terrain physics and static graphics
        this.level.terrain.forEach(t => {
            if (t.type === 'rectangle') {
                const angleRad = (t.angle || 0) * (Math.PI / 180);
                
                // Physics body
                this.matter.add.rectangle(t.x, t.y, t.width, t.height, {
                    isStatic: true,
                    angle: angleRad,
                    collisionFilter: { category: CATEGORY_ENVIRONMENT, mask: CATEGORY_BALL },
                    friction: 0.3,
                    restitution: 0.5,
                    label: t.label || 'terrain'
                });

                // Calculate rotated corners
                const cx = t.x;
                const cy = t.y;
                const hw = t.width / 2;
                const hh = t.height / 2;

                const corners = [
                    { x: -hw, y: -hh },
                    { x: hw, y: -hh },
                    { x: hw, y: hh },
                    { x: -hw, y: hh }
                ].map(p => ({
                    x: cx + p.x * Math.cos(angleRad) - p.y * Math.sin(angleRad),
                    y: cy + p.x * Math.sin(angleRad) + p.y * Math.cos(angleRad)
                }));

                this.terrainGraphics.beginPath();
                this.terrainGraphics.moveTo(corners[0].x, corners[0].y);
                this.terrainGraphics.lineTo(corners[1].x, corners[1].y);
                this.terrainGraphics.lineTo(corners[2].x, corners[2].y);
                this.terrainGraphics.lineTo(corners[3].x, corners[3].y);
                this.terrainGraphics.closePath();
                this.terrainGraphics.fillPath();
            } else if (t.type === 'polygon' && t.points && t.points.length >= 3) {
                const cx = t.points.reduce((s, p) => s + p.x, 0) / t.points.length;
                const cy = t.points.reduce((s, p) => s + p.y, 0) / t.points.length;
                const relPoints = t.points.map(p => ({ x: p.x - cx, y: p.y - cy }));

                this.matter.add.fromVertices(cx, cy, relPoints, {
                    isStatic: true,
                    collisionFilter: { category: CATEGORY_ENVIRONMENT, mask: CATEGORY_BALL },
                    friction: 0.3,
                    restitution: 0.5,
                    label: t.label || 'terrain'
                });

                this.terrainGraphics.beginPath();
                this.terrainGraphics.moveTo(t.points[0].x, t.points[0].y);
                for (let i = 1; i < t.points.length; i++) {
                    this.terrainGraphics.lineTo(t.points[i].x, t.points[i].y);
                }
                this.terrainGraphics.closePath();
                this.terrainGraphics.fillPath();
            }
        });

        // Moving platforms
        this.platformBodies = [];
        if (this.level.movingPlatforms) {
            this.level.movingPlatforms.forEach(p => {
                const body = this.matter.add.rectangle(p.x, p.y, p.width, p.height, {
                    isStatic: true,
                    collisionFilter: { category: CATEGORY_ENVIRONMENT, mask: CATEGORY_BALL },
                    friction: 0.5,
                    label: 'moving_platform'
                });
                this.platformBodies.push({ body, config: p, progress: 0, direction: 1 });
            });
        }

        // Hazards
        this.hazardBodies = [];
        if (this.level.hazards) {
            this.level.hazards.forEach(h => {
                const size = h.type === 'bird' ? 20 : (h.type === 'crusher' ? 40 : 30);
                const body = this.matter.add.rectangle(h.x, h.y, size, size, {
                    isStatic: true,
                    isSensor: true,
                    label: 'hazard'
                });
                this.hazardBodies.push({ body, config: h, progress: 0, direction: 1 });
            });
        }

        // Goal sensor
        this.goalSensor = this.matter.add.rectangle(
            this.level.goal.x, this.level.goal.y, 
            this.level.goal.width, this.level.goal.height,
            { isStatic: true, isSensor: true, label: 'goal' }
        );

        // Ball & Cursor Physics
        this.ball = createBall(this, this.level.ballSpawn.x, this.level.ballSpawn.y);
        this.cursorPhysics = new CursorPhysics(this);
        
        // Timer
        if (this.level.timeLimit > 0) {
            this.timeRemaining = this.level.timeLimit;
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.timeRemaining--;
                    if (this.hud) this.hud.updateTime(this.timeRemaining);
                    if (this.timeRemaining <= 10 && this.timeRemaining > 0) {
                        audioManager.startTimerTick(1 - (this.timeRemaining / 10));
                    }
                    if (this.timeRemaining <= 0) {
                        audioManager.stopTimerTick();
                        audioManager.stopRolling();
                        this.scene.restart({ levelIndex: this.currentLevelIndex });
                    }
                },
                loop: true
            });
        }

        // Click pointerdown listener: respawn ball at starting position
        this.input.on('pointerdown', (pointer) => {
            const menuLeft = this.scale.width - 140;
            const menuTop = this.scale.height - 70;
            if (pointer.x >= menuLeft && pointer.y >= menuTop) return;

            if (this.ball && this.level.ballSpawn && !this.isLevelCompleted) {
                this.matter.body.setPosition(this.ball, {
                    x: this.level.ballSpawn.x,
                    y: this.level.ballSpawn.y
                });
                this.matter.body.setVelocity(this.ball, { x: 0, y: 0 });
                this.matter.body.setAngularVelocity(this.ball, 0);
                audioManager.stopRolling();
            }
        });

        // Collisions
        this.matter.world.on('collisionstart', (event) => {
            if (this.isLevelCompleted) return;

            for (let i = 0; i < event.pairs.length; i++) {
                const { bodyA, bodyB } = event.pairs[i];
                
                // Ball hits terrain wall
                const isBallCollision = (bodyA === this.ball || bodyB === this.ball);
                const isNotCursorOrGoal = (bodyA !== this.cursorPhysics.body && bodyB !== this.cursorPhysics.body && bodyA !== this.goalSensor && bodyB !== this.goalSensor && bodyA.label !== 'hazard' && bodyB.label !== 'hazard');
                if (isBallCollision && isNotCursorOrGoal) {
                    const ballVel = Math.sqrt(this.ball.velocity.x**2 + this.ball.velocity.y**2);
                    if (ballVel > 1) {
                        audioManager.playWallHit(Math.min(ballVel / 15, 1));
                    }
                }

                // Ball hits goal
                if ((bodyA === this.goalSensor && bodyB === this.ball) ||
                    (bodyB === this.goalSensor && bodyA === this.ball)) {
                    audioManager.playGoalScored();
                    this.handleLevelComplete();
                    break;
                }

                // Ball hits hazard
                if ((bodyA.label === 'hazard' && bodyB === this.ball) ||
                    (bodyB.label === 'hazard' && bodyA === this.ball)) {
                    audioManager.stopRolling();
                    audioManager.stopTimerTick();
                    this.scene.restart({ levelIndex: this.currentLevelIndex });
                    break;
                }
            }
        });

        // Pulsing goal effect
        this.tweens.addCounter({
            from: 0.3,
            to: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            onUpdate: (tween) => {
                const alpha = tween.getValue();
                this.goalGraphics.clear();
                this.goalGraphics.fillStyle(0x00FF00, alpha);
                this.goalGraphics.fillRect(
                    this.level.goal.x - this.level.goal.width/2, 
                    this.level.goal.y - this.level.goal.height/2, 
                    this.level.goal.width, 
                    this.level.goal.height
                );
                this.goalGraphics.lineStyle(2, 0x00FF00, 1);
                this.goalGraphics.strokeRect(
                    this.level.goal.x - this.level.goal.width/2, 
                    this.level.goal.y - this.level.goal.height/2, 
                    this.level.goal.width, 
                    this.level.goal.height
                );
            }
        });
    }

    update(time, delta) {
        if (this.isLevelCompleted) return;

        if (this.cursorPhysics && this.input.activePointer) {
            const struck = this.cursorPhysics.update(this.input.activePointer, this.ball);
            if (struck) {
                this.strikeCount++;
                if (this.hud) this.hud.updateStrikes(this.strikeCount);
                const speed = Math.sqrt(this.cursorPhysics.vx**2 + this.cursorPhysics.vy**2);
                audioManager.playImpact(Math.min(Math.max(speed / 20, 0.4), 1));
            }
        }

        // Draw ball & rotation indicator (showing rotational physics spin I = 1/2 M r^2)
        const bx = this.ball.position.x;
        const by = this.ball.position.y;
        const angle = this.ball.angle;
        this.ballGraphics.clear();
        this.ballGraphics.fillStyle(0x8B4513, 1); // Rich brown cue ball
        this.ballGraphics.fillCircle(bx, by, 24);
        this.ballGraphics.lineStyle(2, 0xC9A84C, 0.9);
        this.ballGraphics.strokeCircle(bx, by, 24);
        
        // Rotation stripe line
        this.ballGraphics.lineStyle(2.5, 0xFFD700, 0.9);
        this.ballGraphics.beginPath();
        this.ballGraphics.moveTo(bx + Math.cos(angle) * 4, by + Math.sin(angle) * 4);
        this.ballGraphics.lineTo(bx + Math.cos(angle) * 18, by + Math.sin(angle) * 18);
        this.ballGraphics.strokePath();

        // Ball rolling sound update based on speed
        const ballSpeed = Math.sqrt(this.ball.velocity.x**2 + this.ball.velocity.y**2);
        if (ballSpeed > 0.5) {
            audioManager.startRolling(Math.min(ballSpeed / 12, 1));
        } else {
            audioManager.stopRolling();
        }

        // Draw cursor (white circle striker, half size of cue ball: 12px radius)
        const cx = this.cursorPhysics.body.position.x;
        const cy = this.cursorPhysics.body.position.y;

        // Clamp visual rendering to canvas edge [12, 1268] x [12, 708] so puck NEVER disappears when mouse is on background
        const drawX = Math.max(12, Math.min(1268, cx));
        const drawY = Math.max(12, Math.min(708, cy));

        this.cursorGraphics.clear();
        this.cursorGraphics.fillStyle(0xFFFFFF, 0.9); // Crisp white circle
        this.cursorGraphics.fillCircle(drawX, drawY, 12);
        this.cursorGraphics.lineStyle(2, 0xFFD700, 1); // Gold border
        this.cursorGraphics.strokeCircle(drawX, drawY, 12);

        // Dynamic Graphics (Platforms & Hazards)
        this.dynamicGraphics.clear();
        this.dynamicGraphics.lineStyle(0);
        this.dynamicGraphics.fillStyle(0x5C4033, 1);

        // Update moving platforms
        this.platformBodies.forEach(p => {
            const speed = p.config.speed || 2;
            p.progress += speed * 0.002 * p.direction * (delta / 16.66);
            if (p.progress >= 1 || p.progress <= 0) p.direction *= -1;
            p.progress = Math.max(0, Math.min(1, p.progress));
            const path = p.config.path;
            if (path && path.length >= 2) {
                const newX = path[0].x + (path[1].x - path[0].x) * p.progress;
                const newY = path[0].y + (path[1].y - path[0].y) * p.progress;
                this.matter.body.setPosition(p.body, { x: newX, y: newY });
            }
            
            // Draw platform
            const pos = p.body.position;
            this.dynamicGraphics.fillRect(pos.x - p.config.width / 2, pos.y - p.config.height / 2, p.config.width, p.config.height);
        });

        // Update moving hazards
        this.dynamicGraphics.fillStyle(0xFF0000, 0.8);
        this.dynamicGraphics.lineStyle(2, 0x8B0000, 1);
        this.hazardBodies.forEach(h => {
            if (h.config.patrolPath && h.config.patrolPath.length >= 2 && (h.config.speed || 0) > 0) {
                const speed = h.config.speed || 2;
                h.progress += speed * 0.002 * h.direction * (delta / 16.66);
                if (h.progress >= 1 || h.progress <= 0) h.direction *= -1;
                h.progress = Math.max(0, Math.min(1, h.progress));
                const path = h.config.patrolPath;
                const newX = path[0].x + (path[1].x - path[0].x) * h.progress;
                const newY = path[0].y + (path[1].y - path[0].y) * h.progress;
                this.matter.body.setPosition(h.body, { x: newX, y: newY });
            }

            const pos = h.body.position;
            const size = h.config.type === 'bird' ? 20 : (h.config.type === 'crusher' ? 40 : 30);
            this.dynamicGraphics.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
            this.dynamicGraphics.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);
        });

        if (this.ball.position.y > 800) {
            // Ball fell off screen
            audioManager.stopRolling();
            audioManager.stopTimerTick();
            this.scene.restart({ levelIndex: this.currentLevelIndex });
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    handleLevelComplete() {
        if (this.isLevelCompleted) return;
        this.isLevelCompleted = true;

        audioManager.stopRolling();
        audioManager.stopTimerTick();

        const starsEarned = this.strikeCount <= this.level.par ? 3 : 
                            this.strikeCount <= this.level.par + 2 ? 2 : 1;
        
        // Save level progress to localStorage
        try {
            const unlocked = parseInt(localStorage.getItem('cursorstrike_unlocked') || '1', 10);
            if (this.currentLevelIndex + 2 > unlocked) {
                localStorage.setItem('cursorstrike_unlocked', (this.currentLevelIndex + 2).toString());
            }
            const currentStars = parseInt(localStorage.getItem(`cursorstrike_stars_${this.currentLevelIndex}`) || '0', 10);
            if (starsEarned > currentStars) {
                localStorage.setItem(`cursorstrike_stars_${this.currentLevelIndex}`, starsEarned.toString());
            }
        } catch (e) {
            // LocalStorage might be restricted
        }

        this.scene.start('LevelComplete', { 
            levelIndex: this.currentLevelIndex,
            strikes: this.strikeCount,
            par: this.level.par,
            stars: starsEarned,
            time: this.level.timeLimit > 0 ? this.formatTime(this.level.timeLimit - this.timeRemaining) : '—'
        });
    }
}

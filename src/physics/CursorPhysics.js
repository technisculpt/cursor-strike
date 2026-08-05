export const CATEGORY_ENVIRONMENT = 0x0001;
export const CATEGORY_BALL = 0x0002;
export const CATEGORY_CURSOR = 0x0004;

export class CursorPhysics {
    constructor(scene) {
        this.scene = scene;
        this.radius = 12; // Half the size of cue ball (12px radius vs 24px ball radius)
        this.body = scene.matter.add.circle(0, 0, this.radius, {
            isStatic: false,
            isSensor: true,
            ignoreGravity: true,
            collisionFilter: {
                category: CATEGORY_CURSOR,
                mask: CATEGORY_BALL
            },
            frictionAir: 0,
            friction: 0
        });
        
        this.prevX = 0;
        this.prevY = 0;
        this.vx = 0;
        this.vy = 0;
        this.lastStrikeTime = 0;
        this.customPointer = null;

        // Global window listener: allows tracking mouse off-canvas on background
        this.onWindowPointerMove = (e) => {
            const canvas = this.scene.game ? this.scene.game.canvas : null;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const scaleX = 1280 / rect.width;
                const scaleY = 720 / rect.height;
                this.customPointer = {
                    x: (e.clientX - rect.left) * scaleX,
                    y: (e.clientY - rect.top) * scaleY
                };
            }
        };

        window.addEventListener('pointermove', this.onWindowPointerMove);
        window.addEventListener('mousemove', this.onWindowPointerMove);

        // Cleanup on scene shutdown or destroy
        const removeListeners = () => {
            window.removeEventListener('pointermove', this.onWindowPointerMove);
            window.removeEventListener('mousemove', this.onWindowPointerMove);
        };
        this.scene.events.once('shutdown', removeListeners);
        this.scene.events.once('destroy', removeListeners);
    }

    update(pointer, ballBody) {
        const activePointer = this.customPointer || pointer;
        if (!activePointer) return false;
        
        if (this.prevX === 0 && this.prevY === 0) {
            this.prevX = activePointer.x;
            this.prevY = activePointer.y;
        }

        this.vx = activePointer.x - this.prevX;
        this.vy = activePointer.y - this.prevY;
        
        this.scene.matter.body.setPosition(this.body, { x: activePointer.x, y: activePointer.y });

        this.prevX = activePointer.x;
        this.prevY = activePointer.y;

        let strikeOccurred = false;
        if (ballBody) {
            const ballRadius = ballBody.circleRadius || 24;
            const minDist = this.radius + ballRadius;
            const dx = ballBody.position.x - activePointer.x;
            const dy = ballBody.position.y - activePointer.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                // Calculate collision normal pointing away from cursor
                const nx = dist > 0.001 ? dx / dist : 1;
                const ny = dist > 0.001 ? dy / dist : 0;
                
                // Push ball out of overlap immediately (no clipping)
                const overlap = minDist - dist;
                this.scene.matter.body.setPosition(ballBody, {
                    x: ballBody.position.x + nx * overlap,
                    y: ballBody.position.y + ny * overlap
                });

                // Calculate strike speed and force transfer
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const now = this.scene.time ? this.scene.time.now : Date.now();

                // Impulse velocity transfer
                const targetVx = nx * Math.max(speed * 0.9, 6) + this.vx * 0.4;
                const targetVy = ny * Math.max(speed * 0.9, 6) + this.vy * 0.4;

                this.scene.matter.body.setVelocity(ballBody, {
                    x: ballBody.velocity.x * 0.2 + targetVx * 0.8,
                    y: ballBody.velocity.y * 0.2 + targetVy * 0.8
                });

                // Apply spin / torque
                const torque = (this.vx * ny - this.vy * nx) * 0.05;
                this.scene.matter.body.setAngularVelocity(ballBody, torque);

                if (now - this.lastStrikeTime > 200) {
                    this.lastStrikeTime = now;
                    strikeOccurred = true;
                }
            }
        }

        return strikeOccurred;
    }

    applyImpulse(ballBody) {
        // Maintained for direct collision event triggers
        const dx = ballBody.position.x - this.body.position.x;
        const dy = ballBody.position.y - this.body.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const targetVx = nx * Math.max(speed * 0.9, 6) + this.vx * 0.4;
        const targetVy = ny * Math.max(speed * 0.9, 6) + this.vy * 0.4;

        this.scene.matter.body.setVelocity(ballBody, {
            x: targetVx,
            y: targetVy
        });
    }
}

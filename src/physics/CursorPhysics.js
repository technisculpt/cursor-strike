export const CATEGORY_ENVIRONMENT = 0x0001;
export const CATEGORY_BALL = 0x0002;
export const CATEGORY_CURSOR = 0x0004;

export class CursorPhysics {
    constructor(scene) {
        this.scene = scene;
        this.radius = 20;
        this.body = scene.matter.add.circle(0, 0, this.radius, {
            isStatic: false,
            isSensor: true, // we detect collision manually but don't want physical push-back on cursor
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
    }

    update(pointer) {
        if (!pointer) return;
        
        if (this.prevX === 0 && this.prevY === 0) {
            this.prevX = pointer.x;
            this.prevY = pointer.y;
        }

        this.vx = pointer.x - this.prevX;
        this.vy = pointer.y - this.prevY;
        
        this.scene.matter.body.setPosition(this.body, { x: pointer.x, y: pointer.y });

        this.prevX = pointer.x;
        this.prevY = pointer.y;
    }

    applyImpulse(ballBody) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.5) { // Threshold for meaningful strike
            const forceMultiplier = 0.0012;
            const throwBiasX = this.vx * forceMultiplier;
            const throwBiasY = this.vy * forceMultiplier;

            // Apply force slightly offset from center to induce rotational spin I = 1/2 M r^2
            const contactOffset = {
                x: ballBody.position.x - (this.vx > 0 ? 5 : -5),
                y: ballBody.position.y - (this.vy > 0 ? 5 : -5)
            };
            this.scene.matter.body.applyForce(ballBody, contactOffset, { x: throwBiasX, y: throwBiasY });
        }
    }
}

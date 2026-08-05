import { CATEGORY_ENVIRONMENT, CATEGORY_BALL, CATEGORY_CURSOR } from './CursorPhysics.js';

export function createBall(scene, x, y) {
    const radius = 24; // Equal size with cursor striker circle (24px)
    const ball = scene.matter.add.circle(x, y, radius, {
        restitution: 0.6,
        friction: 0.05,
        frictionAir: 0.001,
        density: 0.05,
        collisionFilter: {
            category: CATEGORY_BALL,
            mask: CATEGORY_ENVIRONMENT | CATEGORY_CURSOR
        }
    });

    // I = 1/2 M r^2
    scene.matter.body.setInertia(ball, 0.5 * ball.mass * radius * radius);

    return ball;
}

export function applyMagnusEffect(ballBody, BodyModule) {
    if (!ballBody) return;
    const omega = ballBody.angularVelocity || 0;
    const vx = ballBody.velocity.x || 0;
    const vy = ballBody.velocity.y || 0;
    const speed = Math.sqrt(vx * vx + vy * vy);

    if (Math.abs(omega) > 0.005 && speed > 0.5) {
        // Magnus force coefficient for backspin aerodynamic lift & curve
        const kMagnus = 0.00035;

        // F_magnus_x = -k * omega * vy
        // F_magnus_y =  k * omega * vx
        const fx = -kMagnus * omega * vy;
        const fy = kMagnus * omega * vx;

        if (BodyModule && BodyModule.applyForce) {
            BodyModule.applyForce(ballBody, ballBody.position, { x: fx, y: fy });
        } else if (ballBody.force) {
            ballBody.force.x += fx;
            ballBody.force.y += fy;
        }
    }
}

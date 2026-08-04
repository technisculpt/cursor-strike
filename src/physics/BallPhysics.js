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

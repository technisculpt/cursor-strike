export const level1 = {
    id: 1,
    name: 'First Strike',
    description: 'Learn to strike the ball up the ramp.',
    difficulty: 1,
    ballSpawn: { x: 200, y: 550 },
    goal: { x: 1150, y: 240, width: 100, height: 60 },
    terrain: [
        { type: 'rectangle', x: 400, y: 600, width: 800, height: 50, angle: 0, label: 'ground' },
        { type: 'rectangle', x: 880, y: 437, width: 440, height: 40, angle: -36, label: 'ramp' },
        { type: 'rectangle', x: 1250, y: 300, width: 340, height: 50, angle: 0, label: 'top_platform' }
    ],
    movingPlatforms: [],
    hazards: [],
    decorations: [{ type: 'flag', x: 1150, y: 200 }],
    par: 2,
    timeLimit: 0
};

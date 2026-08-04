export const level2 = {
    id: 2,
    name: 'The Long Shot',
    description: 'A longer approach with a steeper climb.',
    difficulty: 2,
    ballSpawn: { x: 100, y: 550 },
    goal: { x: 1150, y: 150, width: 100, height: 60 },
    terrain: [
        { type: 'rectangle', x: 300, y: 600, width: 600, height: 50, angle: 0, label: 'ground' },
        { type: 'rectangle', x: 800, y: 400, width: 566, height: 50, angle: -45, label: 'ramp' },
        { type: 'rectangle', x: 1150, y: 200, width: 300, height: 50, angle: 0, label: 'top_platform' }
    ],
    movingPlatforms: [],
    hazards: [],
    decorations: [{ type: 'flag', x: 1150, y: 120 }],
    par: 2,
    timeLimit: 0
};

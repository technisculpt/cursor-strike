export const level2 = {
    id: 2,
    name: 'The Long Shot',
    description: 'A longer approach with a steeper climb.',
    difficulty: 2,
    ballSpawn: { x: 100, y: 540 },
    goal: { x: 1140, y: 120, width: 100, height: 60 },
    terrain: [
        { type: 'rectangle', x: 300, y: 600, width: 600, height: 50, angle: 0, label: 'ground' },
        { 
            type: 'polygon', 
            points: [
                { x: 600, y: 575 },
                { x: 1000, y: 175 },
                { x: 1000, y: 225 },
                { x: 600, y: 625 }
            ], 
            label: 'ramp' 
        },
        { type: 'rectangle', x: 1140, y: 200, width: 280, height: 50, angle: 0, label: 'top_platform' }
    ],
    movingPlatforms: [],
    hazards: [],
    decorations: [{ type: 'flag', x: 1140, y: 70 }],
    par: 2,
    timeLimit: 0
};

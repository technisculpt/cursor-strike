export const level1 = {
    id: 1,
    name: 'First Strike',
    description: 'Learn to strike the ball up the ramp.',
    difficulty: 1,
    ballSpawn: { x: 200, y: 540 },
    goal: { x: 1140, y: 275, radius: 28 },
    terrain: [
        { type: 'rectangle', x: 350, y: 600, width: 700, height: 50, angle: 0, label: 'ground' },
        { 
            type: 'polygon', 
            points: [
                { x: 700, y: 575 },
                { x: 1000, y: 275 },
                { x: 1000, y: 325 },
                { x: 700, y: 625 }
            ], 
            label: 'ramp' 
        },
        { type: 'rectangle', x: 1140, y: 300, width: 280, height: 50, angle: 0, label: 'top_platform' }
    ],
    movingPlatforms: [],
    hazards: [],
    decorations: [{ type: 'flag', x: 1140, y: 225 }],
    par: 2,
    timeLimit: 0
};

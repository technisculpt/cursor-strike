export const MULTIPLAYER_ARENAS = [
    {
        id: 'classic',
        name: '1. CLASSIC DEFENSE',
        ballSpawn: { x: 640, y: 640 },
        p1Goal: { x: 160, y: 140, radius: 30 },
        p2Goal: { x: 1120, y: 140, radius: 30 },
        platforms: [
            { x: 640, y: 460, width: 220, height: 30, restitution: 0.7 }
        ],
        bumpers: []
    },
    {
        id: 'bumper_alley',
        name: '2. PINBALL BUMPER ALLEY',
        ballSpawn: { x: 640, y: 640 },
        p1Goal: { x: 160, y: 140, radius: 30 },
        p2Goal: { x: 1120, y: 140, radius: 30 },
        platforms: [
            { x: 640, y: 300, width: 240, height: 30, restitution: 0.7 }
        ],
        bumpers: [
            { x: 420, y: 440, radius: 35, restitution: 1.2 },
            { x: 860, y: 440, radius: 35, restitution: 1.2 }
        ]
    },
    {
        id: 'quad_pillars',
        name: '3. QUAD PILLAR GAUNTLET',
        ballSpawn: { x: 640, y: 640 },
        p1Goal: { x: 160, y: 140, radius: 30 },
        p2Goal: { x: 1120, y: 140, radius: 30 },
        platforms: [
            { x: 640, y: 420, width: 140, height: 40, restitution: 0.7 },
            { x: 360, y: 520, width: 40, height: 120, restitution: 0.7 },
            { x: 920, y: 520, width: 40, height: 120, restitution: 0.7 },
            { x: 440, y: 260, width: 40, height: 120, restitution: 0.7 },
            { x: 840, y: 260, width: 40, height: 120, restitution: 0.7 }
        ],
        bumpers: []
    }
];

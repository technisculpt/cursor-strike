export const level14 = {
  id: 14,
  name: 'The Double Jump',
  description: 'Cross two synchronised moving ferries over a hazardous pit.',
  difficulty: 14,
  ballSpawn: { x: 100, y: 500 },
  goal: { x: 1150, y: 505, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 120, y: 550, width: 240, height: 40, angle: 0, label: 'start_pad' },
    { type: 'rectangle', x: 1150, y: 550, width: 240, height: 40, angle: 0, label: 'goal_platform' },
    { type: 'rectangle', x: 640, y: 750, width: 1280, height: 40, angle: 0, label: 'pit_floor' }
  ],
  movingPlatforms: [
    { x: 380, y: 550, width: 120, height: 20, path: [{x: 380, y: 550}, {x: 600, y: 550}], speed: 3, label: 'ferry1' },
    { x: 720, y: 550, width: 120, height: 20, path: [{x: 720, y: 550}, {x: 940, y: 550}], speed: 3, label: 'ferry2' }
  ],
  hazards: [
    { type: 'spike', x: 640, y: 720, patrolPath: [{x: 300, y: 720}, {x: 980, y: 720}], speed: 0 }
  ],
  decorations: [
    { type: 'flag', x: 1150, y: 480 }
  ],
  par: 3,
  timeLimit: 35
};

export const level13 = {
  id: 13,
  name: 'Crusher Canyon',
  description: 'Pass beneath heavy crushing blocks patrolling vertically.',
  difficulty: 13,
  ballSpawn: { x: 100, y: 640 },
  goal: { x: 1150, y: 615, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 640, y: 680, width: 1280, height: 40, angle: 0, label: 'floor' },
    { type: 'rectangle', x: 640, y: 350, width: 1280, height: 40, angle: 0, label: 'ceiling' }
  ],
  movingPlatforms: [],
  hazards: [
    { type: 'crusher', x: 400, y: 440, patrolPath: [{x: 400, y: 400}, {x: 400, y: 600}], speed: 4.5 },
    { type: 'crusher', x: 700, y: 560, patrolPath: [{x: 700, y: 600}, {x: 700, y: 400}], speed: 4.5 },
    { type: 'crusher', x: 950, y: 440, patrolPath: [{x: 950, y: 400}, {x: 950, y: 600}], speed: 4.5 }
  ],
  decorations: [
    { type: 'flag', x: 1150, y: 590 }
  ],
  par: 4,
  timeLimit: 40
};

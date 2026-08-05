export const level6 = {
  id: 6,
  name: 'The Gauntlet',
  description: 'Navigate a tight corridor filled with patrolling birds.',
  difficulty: 6,
  ballSpawn: { x: 100, y: 600 },
  goal: { x: 1150, y: 630, width: 80, height: 60 },
  terrain: [
    { type: 'rectangle', x: 640, y: 680, width: 1280, height: 40, angle: 0, label: 'floor' },
    { type: 'rectangle', x: 640, y: 450, width: 1280, height: 40, angle: 0, label: 'ceiling' }
  ],
  movingPlatforms: [],
  hazards: [
    { type: 'bird', x: 400, y: 500, patrolPath: [{x: 400, y: 500}, {x: 400, y: 640}], speed: 3 },
    { type: 'bird', x: 650, y: 640, patrolPath: [{x: 650, y: 640}, {x: 650, y: 500}], speed: 3 },
    { type: 'bird', x: 900, y: 500, patrolPath: [{x: 900, y: 500}, {x: 900, y: 640}], speed: 3 }
  ],
  decorations: [
    { type: 'flag', x: 1150, y: 600 }
  ],
  par: 4,
  timeLimit: 45
};

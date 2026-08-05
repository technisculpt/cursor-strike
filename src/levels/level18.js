export const level18 = {
  id: 18,
  name: 'Gauntlet II',
  description: 'Overcome dual bird patrols and vertical crushing blocks in a tight corridor.',
  difficulty: 18,
  ballSpawn: { x: 100, y: 600 },
  goal: { x: 1150, y: 605, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 640, y: 670, width: 1280, height: 40, angle: 0, label: 'floor' },
    { type: 'rectangle', x: 640, y: 400, width: 1280, height: 40, angle: 0, label: 'ceiling' }
  ],
  movingPlatforms: [],
  hazards: [
    { type: 'bird', x: 350, y: 530, patrolPath: [{x: 350, y: 450}, {x: 350, y: 610}], speed: 4.5 },
    { type: 'crusher', x: 640, y: 480, patrolPath: [{x: 640, y: 440}, {x: 640, y: 600}], speed: 5 },
    { type: 'bird', x: 900, y: 530, patrolPath: [{x: 900, y: 610}, {x: 900, y: 450}], speed: 4.5 }
  ],
  decorations: [
    { type: 'flag', x: 1150, y: 580 }
  ],
  par: 5,
  timeLimit: 40
};

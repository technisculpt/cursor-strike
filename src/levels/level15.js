export const level15 = {
  id: 15,
  name: 'Precision Strike',
  description: 'Control speed precisely to land on a narrow high platform.',
  difficulty: 15,
  ballSpawn: { x: 120, y: 640 },
  goal: { x: 1050, y: 160, width: 90, height: 50 },
  terrain: [
    { type: 'rectangle', x: 200, y: 700, width: 350, height: 40, angle: 0, label: 'ground' },
    { type: 'rectangle', x: 550, y: 550, width: 200, height: 20, angle: -30, label: 'launcher' },
    { type: 'rectangle', x: 1050, y: 200, width: 160, height: 30, angle: 0, label: 'goal_platform' },
    { type: 'rectangle', x: 1150, y: 350, width: 20, height: 400, angle: 0, label: 'backstop' }
  ],
  movingPlatforms: [],
  hazards: [
    { type: 'bird', x: 750, y: 350, patrolPath: [{x: 750, y: 450}, {x: 750, y: 250}], speed: 4 }
  ],
  decorations: [
    { type: 'flag', x: 1050, y: 135 }
  ],
  par: 3,
  timeLimit: 0
};

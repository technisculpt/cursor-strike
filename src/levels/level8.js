export const level8 = {
  id: 8,
  name: 'The Descent',
  description: 'Navigate a downward maze to reach the goal below.',
  difficulty: 8,
  ballSpawn: { x: 150, y: 100 },
  goal: { x: 640, y: 665, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 150, y: 150, width: 200, height: 20, angle: 10, label: 'start_slope' },
    { type: 'rectangle', x: 450, y: 250, width: 300, height: 20, angle: -15, label: 'slope2' },
    { type: 'rectangle', x: 850, y: 350, width: 300, height: 20, angle: 15, label: 'slope3' },
    { type: 'rectangle', x: 450, y: 450, width: 300, height: 20, angle: -15, label: 'slope4' },
    { type: 'rectangle', x: 640, y: 700, width: 300, height: 20, angle: 0, label: 'goal_floor' }
  ],
  movingPlatforms: [],
  hazards: [
    { type: 'spike', x: 450, y: 700, patrolPath: [{x: 450, y: 700}, {x: 450, y: 700}], speed: 0 },
    { type: 'spike', x: 830, y: 700, patrolPath: [{x: 830, y: 700}, {x: 830, y: 700}], speed: 0 }
  ],
  decorations: [
    { type: 'flag', x: 640, y: 640 }
  ],
  par: 4,
  timeLimit: 0
};

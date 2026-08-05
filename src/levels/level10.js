export const level10 = {
  id: 10,
  name: 'The Pendulum',
  description: 'Time your strike past swinging hazards to reach the central elevator.',
  difficulty: 10,
  ballSpawn: { x: 120, y: 640 },
  goal: { x: 1100, y: 200, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 150, y: 700, width: 300, height: 40, angle: 0, label: 'start_pad' },
    { type: 'rectangle', x: 1100, y: 240, width: 250, height: 30, angle: 0, label: 'goal_platform' }
  ],
  movingPlatforms: [
    { x: 550, y: 550, width: 120, height: 20, path: [{x: 550, y: 550}, {x: 550, y: 250}], speed: 2.5, label: 'elevator' }
  ],
  hazards: [
    { type: 'bird', x: 380, y: 400, patrolPath: [{x: 380, y: 300}, {x: 380, y: 600}], speed: 3.5 },
    { type: 'bird', x: 720, y: 350, patrolPath: [{x: 720, y: 250}, {x: 720, y: 550}], speed: 3.5 }
  ],
  decorations: [
    { type: 'flag', x: 1100, y: 175 }
  ],
  par: 3,
  timeLimit: 40
};

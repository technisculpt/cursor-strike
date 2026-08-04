export const level3 = {
  id: 3,
  name: 'The Bounce House',
  description: 'Ricochet the ball off angled walls to reach the goal.',
  difficulty: 3,
  ballSpawn: { x: 150, y: 600 },
  goal: { x: 1050, y: 150, width: 80, height: 80 },
  terrain: [
    { type: 'rectangle', x: 640, y: 700, width: 1280, height: 40, angle: 0, label: 'ground' },
    { type: 'rectangle', x: 400, y: 500, width: 200, height: 20, angle: -45, label: 'bounce_wall_1' },
    { type: 'rectangle', x: 700, y: 350, width: 200, height: 20, angle: 45, label: 'bounce_wall_2' },
    { type: 'rectangle', x: 950, y: 250, width: 150, height: 20, angle: 0, label: 'goal_platform' },
    { type: 'rectangle', x: 1150, y: 350, width: 20, height: 400, angle: 0, label: 'back_wall' }
  ],
  movingPlatforms: [],
  hazards: [],
  decorations: [
    { type: 'flag', x: 1050, y: 130 }
  ],
  par: 3,
  timeLimit: 0
};

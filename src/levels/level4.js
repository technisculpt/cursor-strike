export const level4 = {
  id: 4,
  name: 'Stairway',
  description: 'Strike the ball up a series of ascending platforms.',
  difficulty: 4,
  ballSpawn: { x: 100, y: 650 },
  goal: { x: 1100, y: 100, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 100, y: 700, width: 300, height: 40, angle: 0, label: 'ground' },
    { type: 'rectangle', x: 350, y: 580, width: 150, height: 20, angle: 0, label: 'step_1' },
    { type: 'rectangle', x: 600, y: 460, width: 150, height: 20, angle: 0, label: 'step_2' },
    { type: 'rectangle', x: 850, y: 340, width: 150, height: 20, angle: 0, label: 'step_3' },
    { type: 'rectangle', x: 1100, y: 220, width: 200, height: 20, angle: 0, label: 'goal_platform' },
    { type: 'rectangle', x: 1250, y: 360, width: 40, height: 720, angle: 0, label: 'right_wall' }
  ],
  movingPlatforms: [],
  hazards: [],
  decorations: [
    { type: 'cloud', x: 400, y: 200 },
    { type: 'cloud', x: 800, y: 150 }
  ],
  par: 5,
  timeLimit: 0
};

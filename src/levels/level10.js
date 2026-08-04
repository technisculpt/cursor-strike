export const level10 = {
  id: 10,
  name: 'Final Strike',
  description: 'The ultimate test. Moving platforms, hazards, tight corridors, and a moving goal.',
  difficulty: 10,
  ballSpawn: { x: 100, y: 650 },
  goal: { x: 1100, y: 180, width: 120, height: 60 },
  terrain: [
    { type: 'rectangle', x: 100, y: 700, width: 200, height: 20, angle: 0, label: 'start_pad' },
    { type: 'rectangle', x: 400, y: 500, width: 150, height: 20, angle: -30, label: 'ramp_up' },
    { type: 'rectangle', x: 750, y: 200, width: 20, height: 300, angle: 0, label: 'blocker_wall' },
    { type: 'rectangle', x: 1100, y: 240, width: 200, height: 20, angle: 0, label: 'goal_platform' },
    { type: 'rectangle', x: 1100, y: 700, width: 1280, height: 40, angle: 0, label: 'floor' }
  ],
  movingPlatforms: [
    { x: 600, y: 350, width: 80, height: 20, path: [{x: 600, y: 350}, {x: 600, y: 150}], speed: 2, label: 'lift' },
    { x: 900, y: 250, width: 120, height: 20, path: [{x: 850, y: 250}, {x: 1000, y: 250}], speed: 4, label: 'horizontal_ferry' }
  ],
  hazards: [
    { type: 'bird', x: 450, y: 400, patrolPath: [{x: 450, y: 400}, {x: 450, y: 200}], speed: 4 },
    { type: 'crusher', x: 900, y: 100, patrolPath: [{x: 900, y: 100}, {x: 900, y: 220}], speed: 5 }
  ],
  decorations: [
    { type: 'flag', x: 1100, y: 130 }
  ],
  par: 6,
  timeLimit: 90
};

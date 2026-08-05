export const level12 = {
  id: 12,
  name: 'Zig-Zag Alley',
  description: 'Navigate alternating ramp slopes with corner hazards.',
  difficulty: 12,
  ballSpawn: { x: 100, y: 650 },
  goal: { x: 150, y: 110, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 150, y: 700, width: 250, height: 30, angle: 0, label: 'ground' },
    { type: 'rectangle', x: 450, y: 550, width: 400, height: 25, angle: -15, label: 'ramp1' },
    { type: 'rectangle', x: 850, y: 400, width: 400, height: 25, angle: 15, label: 'ramp2' },
    { type: 'rectangle', x: 450, y: 250, width: 400, height: 25, angle: -15, label: 'ramp3' },
    { type: 'rectangle', x: 150, y: 150, width: 200, height: 30, angle: 0, label: 'goal_platform' }
  ],
  movingPlatforms: [],
  hazards: [
    { type: 'spike', x: 750, y: 480, patrolPath: [{x: 750, y: 480}, {x: 750, y: 480}], speed: 0 },
    { type: 'spike', x: 550, y: 330, patrolPath: [{x: 550, y: 330}, {x: 550, y: 330}], speed: 0 }
  ],
  decorations: [
    { type: 'flag', x: 150, y: 85 }
  ],
  par: 4,
  timeLimit: 0
};

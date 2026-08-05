export const level16 = {
  id: 16,
  name: 'Hazard Maze',
  description: 'Navigate multi-level platforms guarded by dual bird patrols.',
  difficulty: 16,
  ballSpawn: { x: 100, y: 640 },
  goal: { x: 1100, y: 135, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 150, y: 700, width: 300, height: 30, angle: 0, label: 'level1' },
    { type: 'rectangle', x: 600, y: 520, width: 400, height: 25, angle: 0, label: 'level2' },
    { type: 'rectangle', x: 200, y: 340, width: 350, height: 25, angle: 0, label: 'level3' },
    { type: 'rectangle', x: 1100, y: 170, width: 250, height: 25, angle: 0, label: 'goal_platform' }
  ],
  movingPlatforms: [
    { x: 950, y: 340, width: 100, height: 20, path: [{x: 950, y: 450}, {x: 950, y: 220}], speed: 3.5, label: 'lift' }
  ],
  hazards: [
    { type: 'bird', x: 400, y: 430, patrolPath: [{x: 300, y: 430}, {x: 500, y: 430}], speed: 4 },
    { type: 'bird', x: 600, y: 250, patrolPath: [{x: 500, y: 250}, {x: 700, y: 250}], speed: 4 }
  ],
  decorations: [
    { type: 'flag', x: 1100, y: 110 }
  ],
  par: 5,
  timeLimit: 50
};

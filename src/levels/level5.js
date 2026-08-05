export const level5 = {
  id: 5,
  name: 'Sky Bridge',
  description: 'Time your strike to land on the moving platform and cross the gap.',
  difficulty: 5,
  ballSpawn: { x: 150, y: 500 },
  goal: { x: 1100, y: 505, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 150, y: 550, width: 300, height: 40, angle: 0, label: 'start_platform' },
    { type: 'rectangle', x: 1100, y: 550, width: 300, height: 40, angle: 0, label: 'goal_platform' },
    { type: 'rectangle', x: 640, y: 750, width: 1280, height: 40, angle: 0, label: 'pit_floor' }
  ],
  movingPlatforms: [
    { x: 450, y: 550, width: 150, height: 20, path: [{x: 450, y: 550}, {x: 800, y: 550}], speed: 2, label: 'ferry' }
  ],
  hazards: [
    { type: 'spikes', x: 640, y: 720, patrolPath: [{x: 640, y: 720}, {x: 640, y: 720}], speed: 0 }
  ],
  decorations: [
    { type: 'flag', x: 1100, y: 480 }
  ],
  par: 2,
  timeLimit: 30
};

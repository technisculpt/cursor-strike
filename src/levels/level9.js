export const level9 = {
  id: 9,
  name: 'Clockwork',
  description: 'A pure timing puzzle with multiple moving platforms.',
  difficulty: 9,
  ballSpawn: { x: 100, y: 600 },
  goal: { x: 1150, y: 160, width: 80, height: 60 },
  terrain: [
    { type: 'rectangle', x: 100, y: 650, width: 200, height: 20, angle: 0, label: 'start_platform' },
    { type: 'rectangle', x: 1150, y: 200, width: 200, height: 20, angle: 0, label: 'goal_platform' },
    { type: 'rectangle', x: 640, y: 750, width: 1280, height: 20, angle: 0, label: 'death_pit' }
  ],
  movingPlatforms: [
    { x: 300, y: 550, width: 100, height: 20, path: [{x: 300, y: 550}, {x: 300, y: 200}], speed: 3, label: 'elevator1' },
    { x: 550, y: 200, width: 100, height: 20, path: [{x: 550, y: 200}, {x: 550, y: 550}], speed: 3, label: 'elevator2' },
    { x: 800, y: 550, width: 100, height: 20, path: [{x: 800, y: 550}, {x: 800, y: 200}], speed: 3, label: 'elevator3' }
  ],
  hazards: [
    { type: 'spike', x: 640, y: 730, patrolPath: [{x: 0, y: 730}, {x: 1280, y: 730}], speed: 0 }
  ],
  decorations: [
    { type: 'flag', x: 1150, y: 130 }
  ],
  par: 5,
  timeLimit: 60
};

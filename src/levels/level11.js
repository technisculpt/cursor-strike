export const level11 = {
  id: 11,
  name: 'The Windmill',
  description: 'Ascend the long slope while dodging patrolling aerial hazards.',
  difficulty: 11,
  ballSpawn: { x: 120, y: 620 },
  goal: { x: 1140, y: 150, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 250, y: 670, width: 400, height: 40, angle: 0, label: 'ground' },
    { 
      type: 'polygon', 
      points: [
        { x: 450, y: 650 },
        { x: 1000, y: 175 },
        { x: 1000, y: 225 },
        { x: 450, y: 700 }
      ], 
      label: 'long_ramp' 
    },
    { type: 'rectangle', x: 1140, y: 200, width: 280, height: 50, angle: 0, label: 'top_platform' }
  ],
  movingPlatforms: [],
  hazards: [
    { type: 'bird', x: 600, y: 400, patrolPath: [{x: 550, y: 450}, {x: 650, y: 350}], speed: 4 },
    { type: 'bird', x: 800, y: 280, patrolPath: [{x: 750, y: 330}, {x: 850, y: 230}], speed: 4 }
  ],
  decorations: [
    { type: 'flag', x: 1140, y: 125 }
  ],
  par: 3,
  timeLimit: 45
};

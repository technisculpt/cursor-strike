export const level19 = {
  id: 19,
  name: 'Apex Ramp',
  description: 'The penultimate climb. High speed ramp launch over a gap to the summit.',
  difficulty: 19,
  ballSpawn: { x: 100, y: 640 },
  goal: { x: 1150, y: 135, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 200, y: 700, width: 350, height: 40, angle: 0, label: 'ground' },
    { 
      type: 'polygon', 
      points: [
        { x: 350, y: 680 },
        { x: 750, y: 350 },
        { x: 750, y: 400 },
        { x: 350, y: 730 }
      ], 
      label: 'steep_ramp' 
    },
    { type: 'rectangle', x: 1150, y: 170, width: 220, height: 30, angle: 0, label: 'summit' }
  ],
  movingPlatforms: [
    { x: 880, y: 280, width: 100, height: 20, path: [{x: 830, y: 280}, {x: 950, y: 280}], speed: 3.5, label: 'gap_ferry' }
  ],
  hazards: [
    { type: 'bird', x: 600, y: 420, patrolPath: [{x: 550, y: 470}, {x: 650, y: 370}], speed: 4 },
    { type: 'crusher', x: 1150, y: 60, patrolPath: [{x: 1150, y: 60}, {x: 1150, y: 140}], speed: 4 }
  ],
  decorations: [
    { type: 'flag', x: 1150, y: 110 }
  ],
  par: 5,
  timeLimit: 50
};

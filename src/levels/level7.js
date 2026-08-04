export const level7 = {
  id: 7,
  name: 'Pinball Wizard',
  description: 'Chaotic bumpers and angled walls create a pinball machine layout.',
  difficulty: 7,
  ballSpawn: { x: 640, y: 650 },
  goal: { x: 640, y: 80, width: 120, height: 60 },
  terrain: [
    { type: 'rectangle', x: 640, y: 700, width: 1280, height: 40, angle: 0, label: 'ground' },
    { type: 'rectangle', x: 300, y: 500, width: 100, height: 20, angle: 30, label: 'bumper1' },
    { type: 'rectangle', x: 980, y: 500, width: 100, height: 20, angle: -30, label: 'bumper2' },
    { type: 'rectangle', x: 640, y: 400, width: 150, height: 150, angle: 45, label: 'diamond_bumper' },
    { type: 'rectangle', x: 400, y: 250, width: 120, height: 20, angle: -15, label: 'bumper3' },
    { type: 'rectangle', x: 880, y: 250, width: 120, height: 20, angle: 15, label: 'bumper4' },
    { type: 'rectangle', x: 200, y: 360, width: 20, height: 720, angle: 0, label: 'left_wall' },
    { type: 'rectangle', x: 1080, y: 360, width: 20, height: 720, angle: 0, label: 'right_wall' },
    { type: 'rectangle', x: 640, y: 150, width: 200, height: 20, angle: 0, label: 'goal_platform' }
  ],
  movingPlatforms: [],
  hazards: [],
  decorations: [
    { type: 'flag', x: 640, y: 60 }
  ],
  par: 5,
  timeLimit: 0
};

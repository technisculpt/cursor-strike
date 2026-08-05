export const level17 = {
  id: 17,
  name: 'The Slalom',
  description: 'Thread the needle between high-speed moving bumpers.',
  difficulty: 17,
  ballSpawn: { x: 100, y: 640 },
  goal: { x: 1150, y: 160, width: 100, height: 50 },
  terrain: [
    { type: 'rectangle', x: 150, y: 700, width: 300, height: 30, angle: 0, label: 'ground' },
    { type: 'rectangle', x: 500, y: 500, width: 200, height: 20, angle: 25, label: 'slope1' },
    { type: 'rectangle', x: 800, y: 350, width: 200, height: 20, angle: -25, label: 'slope2' },
    { type: 'rectangle', x: 1150, y: 200, width: 220, height: 30, angle: 0, label: 'goal_platform' }
  ],
  movingPlatforms: [
    { x: 400, y: 320, width: 80, height: 20, path: [{x: 350, y: 320}, {x: 450, y: 320}], speed: 4.5, label: 'bumper1' },
    { x: 900, y: 480, width: 80, height: 20, path: [{x: 850, y: 480}, {x: 950, y: 480}], speed: 4.5, label: 'bumper2' }
  ],
  hazards: [
    { type: 'bird', x: 650, y: 420, patrolPath: [{x: 650, y: 520}, {x: 650, y: 320}], speed: 4.5 }
  ],
  decorations: [
    { type: 'flag', x: 1150, y: 135 }
  ],
  par: 4,
  timeLimit: 45
};

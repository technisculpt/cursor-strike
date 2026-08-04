import { ScrollworkRenderer } from './ScrollworkRenderer.js';

export class HUD {
  constructor(scene, options = {}) {
    this.scene = scene;
    const { width } = scene.scale;
    
    this.levelName = options.levelName || 'Level 1';
    this.strikes = options.strikes || 0;
    this.par = options.par || 3;
    this.time = options.time || 0;
    this.hasTimer = options.timeLimit > 0;
    this.onPause = options.onPause || (() => {});

    // Create a container for HUD elements to manage depth
    this.container = scene.add.container(0, 0);
    this.container.setDepth(100);

    // Left: Level Name
    const leftGraphics = scene.add.graphics();
    ScrollworkRenderer.drawCartouche(leftGraphics, 20, 20, 250, 50);
    
    this.levelText = scene.add.text(145, 45, this.levelName, {
      fontFamily: '"Cinzel", serif',
      fontSize: '24px',
      color: '#C9A84C'
    }).setOrigin(0.5);

    // Right: Strikes
    const rightGraphics = scene.add.graphics();
    ScrollworkRenderer.drawCartouche(rightGraphics, width - 300, 20, 220, 50);
    
    this.strikesText = scene.add.text(width - 190, 45, `Strikes: ${this.strikes} / Par: ${this.par}`, {
      fontFamily: '"Cinzel", serif',
      fontSize: '20px',
      color: '#FFFFF0'
    }).setOrigin(0.5);

    // Top-Center: Timer
    if (this.hasTimer) {
      this.centerGraphics = scene.add.graphics();
      ScrollworkRenderer.drawCartouche(this.centerGraphics, width / 2 - 80, 20, 160, 50);
      
      this.timerText = scene.add.text(width / 2, 45, this.formatTime(this.time), {
        fontFamily: '"Cinzel", serif',
        fontSize: '24px',
        color: '#FFFFF0'
      }).setOrigin(0.5);
    }

    // Pause Button
    const pauseBtn = scene.add.container(width - 40, 45);
    pauseBtn.setSize(40, 40);
    pauseBtn.setInteractive({ useHandCursor: true });
    
    const pauseGraphics = scene.add.graphics();
    ScrollworkRenderer.drawOrnateFrame(pauseGraphics, -20, -20, 40, 40, {
      color: 0xC9A84C,
      lineWidth: 2,
      padding: 2,
      bgColor: 0x1B4332,
      bgAlpha: 1
    });
    
    const pauseIcon = scene.add.text(0, 0, '⏸', {
      fontSize: '20px',
      color: '#C9A84C'
    }).setOrigin(0.5);

    pauseBtn.add([pauseGraphics, pauseIcon]);
    pauseBtn.on('pointerup', this.onPause);

    // Add all elements to the container
    this.container.add([
      leftGraphics, this.levelText,
      rightGraphics, this.strikesText,
      pauseBtn
    ]);

    if (this.hasTimer) {
      this.container.add([this.centerGraphics, this.timerText]);
    }
  }

  updateStrikes(strikes) {
    this.strikes = strikes;
    this.strikesText.setText(`Strikes: ${this.strikes} / Par: ${this.par}`);
    if (this.strikes > this.par) {
      this.strikesText.setColor('#FF6B6B'); // Red if over par
    }
  }

  updateTime(time) {
    if (this.hasTimer) {
      this.time = time;
      this.timerText.setText(this.formatTime(this.time));
    }
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

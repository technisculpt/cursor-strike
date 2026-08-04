import { ScrollworkRenderer } from '../ui/ScrollworkRenderer.js';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelComplete');
  }

  create(data) {
    this.levelData = data;
    const { width, height } = this.scale;
    const starsEarned = data.stars || 3;
    const strikes = data.strikes || 2;
    const par = data.par || 3;
    const time = data.time || '0:45';

    // Dark overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    // Panel
    const panelWidth = 600;
    const panelHeight = 500;
    const panelX = width / 2;
    const panelY = height / 2;

    const panelContainer = this.add.container(panelX, panelY);
    panelContainer.alpha = 0; // For fade in

    const graphics = this.add.graphics();
    ScrollworkRenderer.drawOrnateFrame(graphics, -panelWidth/2, -panelHeight/2, panelWidth, panelHeight, {
      color: 0xC9A84C,
      lineWidth: 4,
      padding: 15,
      bgColor: 0x081C15,
      bgAlpha: 0.95
    });

    panelContainer.add(graphics);

    // Title
    panelContainer.add(this.add.text(0, -panelHeight/2 + 60, 'LEVEL COMPLETE!', {
      fontFamily: '"Cinzel", serif',
      fontSize: '48px',
      color: '#C9A84C',
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5));

    // Stars
    const starContainer = this.add.container(0, -60);
    panelContainer.add(starContainer);
    
    for (let i = 0; i < 3; i++) {
      const star = this.add.text((i - 1) * 100, 0, '★', {
        fontSize: '80px',
        color: i < starsEarned ? '#C9A84C' : '#333333'
      }).setOrigin(0.5);
      
      if (i < starsEarned) {
        star.setScale(0); // For animation
        this.tweens.add({
          targets: star,
          scaleX: 1,
          scaleY: 1,
          duration: 500,
          delay: 500 + (i * 300),
          ease: 'Back.easeOut'
        });
      }
      
      starContainer.add(star);
    }

    // Stats
    const divGraphics = this.add.graphics();
    ScrollworkRenderer.drawDivider(divGraphics, -150, 20, 300);
    panelContainer.add(divGraphics);

    panelContainer.add(this.add.text(0, 60, `Strikes: ${strikes} (Par: ${par})`, {
      fontFamily: '"Cinzel", serif',
      fontSize: '28px',
      color: '#FFFFF0'
    }).setOrigin(0.5));

    panelContainer.add(this.add.text(0, 100, `Time: ${time}`, {
      fontFamily: '"Cinzel", serif',
      fontSize: '24px',
      color: '#FFFFF0'
    }).setOrigin(0.5));

    // Buttons
    this.createButton(panelContainer, -180, 190, 'MENU', () => {
      this.scene.start('MainMenu');
    });
    
    this.createButton(panelContainer, 0, 190, 'REPLAY', () => {
      this.scene.start('GamePlay', { levelIndex: this.levelData.levelIndex });
    });
    
    this.createButton(panelContainer, 180, 190, 'NEXT', () => {
      this.scene.start('GamePlay', { levelIndex: (this.levelData.levelIndex || 0) + 1 });
    });

    // Fade in
    this.tweens.add({
      targets: panelContainer,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
  }

  createButton(parent, x, y, text, callback) {
    const width = 140;
    const height = 50;
    const btnContainer = this.add.container(x, y);
    btnContainer.setSize(width, height);
    btnContainer.setInteractive({ useHandCursor: true });

    const graphics = this.add.graphics();
    ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
      color: 0xC9A84C,
      lineWidth: 2,
      padding: 5,
      bgColor: 0x5C4033,
      bgAlpha: 1
    });

    const btnText = this.add.text(0, 0, text, {
      fontFamily: '"Cinzel", serif',
      fontSize: '20px',
      color: '#FFFFF0'
    }).setOrigin(0.5);

    btnContainer.add([graphics, btnText]);

    btnContainer.on('pointerover', () => {
      btnText.setTint(0xC9A84C);
    });
    btnContainer.on('pointerout', () => {
      btnText.clearTint();
    });
    btnContainer.on('pointerup', callback);

    parent.add(btnContainer);
  }
}

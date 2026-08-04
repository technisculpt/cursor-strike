import { ScrollworkRenderer } from '../ui/ScrollworkRenderer.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  create() {
    const { width, height } = this.scale;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1B4332, 0x1B4332, 0x081C15, 0x081C15, 1);
    bg.fillRect(0, 0, width, height);

    // Header
    const headerGraphics = this.add.graphics();
    ScrollworkRenderer.drawCartouche(headerGraphics, width / 2 - 250, 40, 500, 80);
    
    this.add.text(width / 2, 80, 'SELECT YOUR CHALLENGE', {
      fontFamily: '"Cinzel", serif',
      fontSize: '32px',
      color: '#C9A84C'
    }).setOrigin(0.5);

    // Grid config
    const rows = 2;
    const cols = 5;
    const cardWidth = 180;
    const cardHeight = 220;
    const startX = (width - (cols * cardWidth + (cols - 1) * 30)) / 2;
    const startY = 180;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const levelNum = r * cols + c + 1;
        const x = startX + c * (cardWidth + 30);
        const y = startY + r * (cardHeight + 40);
        
        // Mock data
        const isLocked = levelNum > 3;
        const stars = isLocked ? 0 : Math.floor(Math.random() * 4);
        const levelName = `Level ${levelNum}`;

        this.createLevelCard(x, y, cardWidth, cardHeight, levelNum, levelName, stars, isLocked);
      }
    }

    // Back Button
    this.createBackButton(80, height - 50);
  }

  createLevelCard(x, y, width, height, levelNum, name, stars, isLocked) {
    const container = this.add.container(x + width/2, y + height/2);
    container.setSize(width, height);
    
    const graphics = this.add.graphics();
    ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
      color: isLocked ? 0x888888 : 0xC9A84C,
      lineWidth: 2,
      padding: 8,
      bgColor: isLocked ? 0x333333 : 0x5C4033,
      bgAlpha: 0.9
    });

    const elements = [graphics];

    // Level Number
    elements.push(this.add.text(0, -height/2 + 30, `${levelNum}`, {
      fontFamily: '"Cinzel", serif',
      fontSize: '48px',
      color: isLocked ? '#888888' : '#FFFFF0'
    }).setOrigin(0.5));

    // Divider
    const divGraphics = this.add.graphics();
    if (!isLocked) {
      ScrollworkRenderer.drawDivider(divGraphics, -width/2 + 20, -10, width - 40);
      elements.push(divGraphics);
    }

    // Name
    elements.push(this.add.text(0, 20, name, {
      fontFamily: '"Cinzel", serif',
      fontSize: '18px',
      color: isLocked ? '#888888' : '#C9A84C'
    }).setOrigin(0.5));

    if (isLocked) {
      elements.push(this.add.text(0, 60, '🔒', { fontSize: '32px' }).setOrigin(0.5));
    } else {
      // Stars
      let starText = '';
      for (let i = 0; i < 3; i++) {
        starText += (i < stars) ? '★' : '☆';
      }
      elements.push(this.add.text(0, 60, starText, {
        fontSize: '28px',
        color: '#C9A84C'
      }).setOrigin(0.5));
      
      container.setInteractive({ useHandCursor: true });
      
      container.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          y: y + height/2 - 10,
          duration: 200,
          ease: 'Sine.easeOut'
        });
      });
      
      container.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          y: y + height/2,
          duration: 200,
          ease: 'Sine.easeIn'
        });
      });
      
      container.on('pointerup', () => {
        console.log(`Select level ${levelNum}`);
        this.scene.start('GamePlay', { levelIndex: levelNum - 1 });
      });
    }

    container.add(elements);
  }

  createBackButton(x, y) {
    const width = 120;
    const height = 50;
    const container = this.add.container(x, y);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    const graphics = this.add.graphics();
    ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
      color: 0xC9A84C,
      lineWidth: 2,
      padding: 4,
      bgColor: 0x5C4033,
      bgAlpha: 0.8
    });

    const text = this.add.text(0, 0, 'BACK', {
      fontFamily: '"Cinzel", serif',
      fontSize: '20px',
      color: '#FFFFF0'
    }).setOrigin(0.5);

    container.add([graphics, text]);

    container.on('pointerup', () => {
      this.scene.start('MainMenu');
    });
  }
}
